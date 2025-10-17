# 🚀 Live Payment Checklist - Production Launch Guide

## Overview

This checklist guides you through switching from Stripe **TEST MODE** to **LIVE MODE** for accepting real payments in production.

**Target:** Week 4, Days 25-28  
**Prerequisites:** All test mode testing complete  
**Status:** Ready to use

---

## ⚠️ Pre-Launch Warning

**CRITICAL:** Do not switch to live mode until:
- ✅ All test mode tests passing (100%)
- ✅ Database persistence implemented
- ✅ HTTPS enabled on production domain
- ✅ Error tracking configured
- ✅ Monitoring dashboards set up
- ✅ Backup systems in place

**Switching to live mode means real money!**

---

## 📋 Phase 1: Stripe Account Verification (Day 25)

### Step 1: Complete Business Verification

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Complete business verification:
   - **Business type:** (LLC, Sole Proprietor, Corporation, etc.)
   - **Business address:** Full address
   - **Tax ID:** EIN or SSN
   - **Website:** https://langflix.app
   - **Product description:** Language learning platform
   - **Bank account:** For receiving payouts

3. Submit identity verification:
   - Upload government ID
   - Provide proof of address (if required)
   - Verify email and phone

4. **Wait for approval** (usually 1-3 business days)

**Status Check:**
```
Dashboard → Settings → Account Details
Should show "Verified ✓"
```

---

## 📋 Phase 2: Get Live API Keys (Day 25)

### Step 2: Switch to Live Mode

1. In Stripe Dashboard, toggle from **"Test mode"** to **"Live mode"**
2. Go to https://dashboard.stripe.com/apikeys
3. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Step 3: Update Production Environment Variables

Update your production `.env` file:

```bash
# ==========================================
# 💳 STRIPE PAYMENT INTEGRATION (LIVE MODE)
# ==========================================

# LIVE MODE KEYS - KEEP THESE SECRET!
STRIPE_SECRET_KEY="sk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Webhook secret (get this in Phase 3)
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
```

**Security Checklist:**
- ❌ Never commit live keys to version control
- ✅ Use environment variables only
- ✅ Rotate keys if compromised
- ✅ Use different keys for staging/production
- ✅ Restrict key permissions if possible

### Step 4: Update Frontend (if using publishable key)

If your frontend uses the publishable key directly:

```javascript
// production config
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_...';
```

---

## 📋 Phase 3: Production Webhook Setup (Day 26)

### Step 5: Create Production Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks (make sure you're in **Live mode**)
2. Click **"Add endpoint"**
3. Enter your **production URL**: `https://langflix.app/api/stripe-webhook`
4. Select events to listen for:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ customer.subscription.trial_will_end (optional)
   ✅ invoice.upcoming (optional)
   ```
5. API version: **Use latest** (2023-10-16 or newer)
6. Click **"Add endpoint"**

### Step 6: Copy Webhook Signing Secret

1. Click on the webhook you just created
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_`)
4. Add to production environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
   ```

### Step 7: Test Production Webhook

1. In Stripe Dashboard, go to your webhook
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Click **"Send test webhook"**
5. Verify you get a **200 OK** response

**Check server logs:**
```
✅ Webhook received: checkout.session.completed
✅ Signature verified
✅ Event processed successfully
```

---

## 📋 Phase 4: Configure Tax (Optional, Day 26)

### Step 8: Enable Stripe Tax (if required)

1. Go to https://dashboard.stripe.com/tax
2. Click **"Get started"**
3. Configure:
   - Countries where you collect tax
   - Tax registration numbers
   - Product tax code: `txcd_10000000` (Software as a Service)

4. Update checkout session code:
```javascript
const session = await stripe.checkout.sessions.create({
  // ... existing config ...
  automatic_tax: {
    enabled: true,
  },
});
```

**Note:** Stripe Tax charges 0.5% per transaction. Consider if you need it for your launch.

---

## 📋 Phase 5: Create Production Products & Prices (Day 26)

### Step 9: Create Products in Stripe Dashboard

Instead of creating products dynamically, create them in the dashboard for better control.

#### Create Monthly Plan

1. Go to https://dashboard.stripe.com/products (Live mode)
2. Click **"Add product"**
3. Fill in details:
   - **Name:** Langflix Premium
   - **Description:** Unlimited videos, AI personalization, audio articles, and more!
   - **Upload image:** Your logo/product image

4. Add pricing:
   - **Price:** $4.99
   - **Billing period:** Monthly
   - **Currency:** USD
   - **Free trial:** 7 days

5. Click **"Save"**
6. Copy the **Price ID** (starts with `price_`)

#### Create Annual Plan

1. Add another pricing option to the same product:
   - **Price:** $49.99
   - **Billing period:** Yearly
   - **Currency:** USD
   - **Free trial:** 7 days

2. Copy the **Price ID** for annual plan

### Step 10: Update Code to Use Price IDs

Update `server.js` to use fixed price IDs:

```javascript
// At top of file
const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1xxxxxxxxxxxxx';
const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1xxxxxxxxxxxxx';

// In checkout session creation
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{
    price: MONTHLY_PRICE_ID,
    quantity: 1,
  }],
  // ... rest of config ...
});
```

Add to `.env`:
```bash
STRIPE_MONTHLY_PRICE_ID="price_1xxxxxxxxxxxxx"
STRIPE_ANNUAL_PRICE_ID="price_1xxxxxxxxxxxxx"
```

---

## 📋 Phase 6: Database Implementation (Day 27)

### Step 11: Replace In-Memory Storage

**CRITICAL:** In-memory Map will lose all data on server restart!

#### Create Database Table

```sql
CREATE TABLE premium_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  trial_end TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  INDEX idx_stripe_customer (stripe_customer_id),
  INDEX idx_stripe_subscription (stripe_subscription_id),
  INDEX idx_status (status)
);
```

#### Update Webhook Handler

Replace `premiumUsers.set()` with database queries:

```javascript
case 'checkout.session.completed': {
  const session = event.data.object;
  const userId = session.metadata.userId;
  
  await db.query(`
    INSERT INTO premium_subscriptions (
      user_id, 
      stripe_customer_id, 
      stripe_subscription_id, 
      status
    ) VALUES ($1, $2, $3, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      status = 'active',
      updated_at = NOW()
  `, [userId, session.customer, session.subscription]);
  
  break;
}
```

#### Update Premium Check Middleware

```javascript
const requirePremium = async (req, res, next) => {
  const userId = req.user?.sub || req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const result = await db.query(
    'SELECT status FROM premium_subscriptions WHERE user_id = $1',
    [userId]
  );
  
  if (!result.rows[0] || result.rows[0].status !== 'active') {
    return res.status(403).json({
      error: 'Premium subscription required',
      upgradeUrl: '/premium.html'
    });
  }
  
  next();
};
```

---

## 📋 Phase 7: First Real Transaction Test (Day 27)

### Step 12: Make Real Purchase with Your Own Card

**Use your own credit card for the first test!**

1. Go to your production site: `https://langflix.app/premium.html`
2. Click **"Start 7-Day Free Trial"**
3. Enter **your own real credit card**
4. Complete checkout
5. **Verify:**
   - ✅ Redirected to success page
   - ✅ Premium access granted
   - ✅ Webhook received and processed
   - ✅ Database updated correctly
   - ✅ Subscription visible in Stripe Dashboard

6. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/customers
   - Find your customer
   - Verify subscription shows correctly

### Step 13: Test Cancellation

1. Cancel the subscription:
   ```bash
   curl -X POST https://langflix.app/api/premium/cancel \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Verify:**
   - ✅ Subscription marked as `cancel_at_period_end = true`
   - ✅ Access continues until period end
   - ✅ Webhook received

### Step 14: Test Reactivation

1. Reactivate:
   ```bash
   curl -X POST https://langflix.app/api/premium/reactivate \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Verify:**
   - ✅ Cancellation removed
   - ✅ Subscription continues normally

---

## 📋 Phase 8: Monitoring & Error Tracking (Day 28)

### Step 15: Set Up Error Tracking

#### Install Sentry (Recommended)

```bash
npm install @sentry/node
```

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

#### Track Payment Errors

```javascript
case 'invoice.payment_failed': {
  const invoice = event.data.object;
  
  Sentry.captureMessage('Payment failed', {
    level: 'warning',
    extra: {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_due
    }
  });
  
  break;
}
```

### Step 16: Set Up Stripe Webhook Monitoring

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your production webhook
3. Monitor:
   - **Success rate** (should be >99%)
   - **Average response time** (<500ms)
   - **Failed events** (should be 0)

### Step 17: Set Up Alerts

Configure alerts for:
- Payment failures >5 per hour
- Webhook success rate <95%
- Webhook response time >1 second
- Refund requests
- Dispute notifications

---

## 📋 Phase 9: Customer Communication (Day 28)

### Step 18: Email Templates

Create email templates for:

1. **Welcome Email** (after successful signup)
   ```
   Subject: Welcome to Langflix Premium! 🎉
   
   Hi [Name],
   
   Your 7-day free trial has started!
   
   You now have unlimited access to:
   - Unlimited videos
   - AI-personalized content
   - Audio articles
   - No ads
   
   Your trial ends on [Date]. We'll remind you 3 days before.
   
   Happy learning!
   ```

2. **Trial Ending Soon** (3 days before trial ends)
   ```
   Subject: Your free trial ends in 3 days
   
   Hi [Name],
   
   Just a reminder: Your Langflix Premium trial ends in 3 days.
   
   After that, you'll be charged $4.99/month.
   
   Want to cancel? No problem: [Cancel Link]
   ```

3. **Payment Succeeded**
   ```
   Subject: Payment received - Thank you!
   
   Hi [Name],
   
   We've successfully processed your payment of $4.99.
   
   View your receipt: [Receipt Link]
   
   Thanks for supporting Langflix!
   ```

4. **Payment Failed**
   ```
   Subject: Payment failed - Please update your card
   
   Hi [Name],
   
   We couldn't process your payment.
   
   Please update your payment method to keep your premium access:
   [Update Payment Link]
   
   We'll retry in 3 days.
   ```

5. **Subscription Cancelled**
   ```
   Subject: Sorry to see you go!
   
   Hi [Name],
   
   Your subscription has been cancelled.
   
   We'd love to know why: [Feedback Form]
   
   Come back anytime! We'll offer you 50% off your first month.
   ```

---

## 📋 Phase 10: Legal & Compliance (Day 28)

### Step 19: Terms of Service Update

Add payment terms:
- Subscription auto-renewal
- Cancellation policy
- Refund policy (30-day money-back guarantee)
- Pricing changes notification
- Trial terms

### Step 20: Privacy Policy Update

Add payment data handling:
- Stripe processes payments
- No credit card numbers stored on our servers
- Data shared with Stripe (name, email)
- GDPR compliance

### Step 21: Refund Policy

Display refund policy clearly:
```
30-Day Money-Back Guarantee

Not satisfied? Cancel within 30 days for a full refund.
No questions asked.

Contact: support@langflix.app
```

---

## 📋 Phase 11: Launch Checklist (Final)

### Pre-Launch Verification ✅

#### Infrastructure
- ✅ HTTPS enabled on production domain
- ✅ SSL certificate valid and not expiring soon
- ✅ Database backups configured (daily)
- ✅ Server monitoring active (uptime, CPU, memory)
- ✅ CDN configured (if using)
- ✅ Load balancer configured (if needed)

#### Stripe Configuration
- ✅ Live mode API keys set
- ✅ Webhook endpoint created and tested
- ✅ Products and prices created
- ✅ Tax configured (if required)
- ✅ Business verified
- ✅ Bank account connected

#### Code
- ✅ Database persistence implemented
- ✅ All webhooks handling database operations
- ✅ Error tracking configured
- ✅ Logging configured
- ✅ Email notifications implemented
- ✅ Premium feature gates in place

#### Testing
- ✅ Real purchase test completed
- ✅ Cancellation flow tested
- ✅ Reactivation flow tested
- ✅ Payment update tested
- ✅ Failed payment handling tested
- ✅ Refund process tested

#### Monitoring
- ✅ Stripe webhook dashboard monitoring
- ✅ Error tracking active (Sentry)
- ✅ Server logging configured
- ✅ Analytics tracking payments
- ✅ Alert system configured

#### Legal
- ✅ Terms of Service updated
- ✅ Privacy Policy updated
- ✅ Refund policy published
- ✅ Contact information visible

---

## 🎉 Launch Day Checklist

### Go Live Steps

1. ✅ Deploy latest code to production
2. ✅ Verify all environment variables are set
3. ✅ Restart server
4. ✅ Test webhook endpoint is accessible
5. ✅ Make final test purchase with your own card
6. ✅ Announce launch to beta users
7. ✅ Monitor dashboard for first 24 hours

### First 24 Hours Monitoring

Watch for:
- Successful checkout completion rate
- Webhook processing success rate
- Server errors
- Payment failures
- Customer support requests

### First Week Goals

- **Target:** 10 paying customers
- **Conversion rate:** Track trial-to-paid
- **Churn rate:** Monitor cancellations
- **Customer feedback:** Collect early feedback

---

## 📊 Success Metrics

### Week 1 Targets
- ✅ First paying customer
- ✅ 10 active subscriptions
- ✅ 0% failed payments
- ✅ 100% webhook success rate
- ✅ <500ms webhook response time

### Month 1 Targets
- ✅ 100 active subscriptions
- ✅ $500 MRR (Monthly Recurring Revenue)
- ✅ <5% churn rate
- ✅ 40%+ trial conversion rate
- ✅ <1% dispute rate

### Analytics to Track

```javascript
{
  "trial_started": 100,
  "trial_converted": 45,
  "conversion_rate": "45%",
  "mrr": "$224.55",
  "active_subscribers": 45,
  "churned_this_month": 2,
  "churn_rate": "4.4%"
}
```

---

## 🚨 Emergency Contacts

### Stripe Support
- Dashboard: https://dashboard.stripe.com/support
- Phone: 1-888-926-2289 (US)
- Email: support@stripe.com
- Response time: Usually <4 hours

### Critical Issues

If you encounter critical payment issues:

1. **Payments not processing:**
   - Check Stripe Dashboard status
   - Verify API keys are correct
   - Check server logs for errors

2. **Webhooks not received:**
   - Verify webhook endpoint is accessible
   - Check webhook secret is correct
   - Test with Stripe CLI

3. **Database issues:**
   - Check database connection
   - Verify queries are working
   - Check for migration errors

---

## 📝 Post-Launch Tasks

### Week 2
- ✅ Analyze conversion funnel
- ✅ Collect customer feedback
- ✅ Fix any reported bugs
- ✅ Optimize checkout flow

### Week 3-4
- ✅ Implement email automation
- ✅ Add customer portal for self-service
- ✅ Set up dunning management
- ✅ Create win-back campaigns for cancelled users

### Month 2+
- ✅ A/B test pricing
- ✅ Add annual plan upsells
- ✅ Implement referral program
- ✅ Launch affiliate program

---

## ✅ Final Verification

Before going live, confirm:

```
✅ I have tested with my own real credit card
✅ Database persistence is implemented and tested
✅ All webhooks are working in production
✅ HTTPS is enabled and working
✅ Error tracking is configured
✅ Monitoring dashboards are set up
✅ Email notifications are configured
✅ Terms of Service and Privacy Policy are updated
✅ I understand this will process real payments
✅ I have a plan for customer support
✅ I'm ready to launch!
```

---

**Congratulations! You're ready to accept real payments!** 🎉

Remember:
- Start small (beta users first)
- Monitor closely (first 24 hours)
- Respond quickly to issues
- Collect feedback
- Iterate and improve

**Good luck with your launch!** 🚀

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Complete and Ready  
**Estimated Time:** 4 days (Week 4, Days 25-28)

