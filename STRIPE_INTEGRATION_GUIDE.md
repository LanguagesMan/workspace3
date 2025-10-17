# Stripe Payment Integration - Implementation Guide

## Overview

This document provides complete instructions for setting up and testing the Stripe payment integration for Langflix Premium subscriptions ($4.99/month with 7-day free trial).

## What's Been Implemented

### Backend (server.js)

1. **Stripe Initialization**
   - Stripe SDK loaded and initialized with environment variable
   - Graceful handling when Stripe keys are not configured

2. **Payment Endpoints**
   - `POST /api/create-checkout-session` - Creates Stripe Checkout session
   - `POST /api/stripe-webhook` - Handles subscription lifecycle events
   - `GET /api/premium/status` - Check user's premium status
   - `POST /api/premium/cancel` - Cancel subscription (at period end)

3. **Middleware**
   - `requirePremium` - Protects premium-only endpoints
   - Validates premium status server-side

4. **Subscription Management**
   - In-memory storage (Map) for premium users
   - Tracks: status, subscriptionId, trialEnd, cancelAtPeriodEnd
   - **Note:** Replace with database in production

### Frontend (premium.html)

1. **Stripe.js Integration**
   - Loads Stripe.js library from CDN
   - Redirects to Stripe Checkout on upgrade

2. **Authentication Check**
   - Requires user to be logged in before checkout
   - Redirects to login if needed

3. **Status Display**
   - Fetches premium status from backend
   - Updates UI to show "Current Plan ✓" for premium users
   - Displays trial end date and cancellation status

4. **Success/Cancel Handling**
   - Shows welcome message on successful checkout
   - Handles cancellation gracefully

## Setup Instructions

### 1. Create Stripe Account

1. Go to https://stripe.com and sign up
2. Verify your email address
3. Complete business information (can skip for test mode)

### 2. Get API Keys

#### Test Mode Keys (for development)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

#### Add to .env file:

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your keys:
STRIPE_SECRET_KEY="sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Configure Webhook

#### For Local Testing (using Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe-webhook
   ```

4. Copy the webhook signing secret from the output:
   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

5. Add to .env:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
   ```

#### For Production Deployment

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your production URL: `https://your-domain.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to production environment variables

### 4. Start the Server

```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start

# Server will run on http://localhost:3001
```

### 5. Test the Integration

#### Test with Stripe Test Cards

1. Go to http://localhost:3001/premium.html
2. Make sure you're logged in (create account at /signup.html if needed)
3. Click **Start 7-Day Free Trial**
4. You'll be redirected to Stripe Checkout
5. Use test card details:

**Successful Payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Other Test Cards:**
- Declined: `4000 0000 0000 0002`
- 3D Secure required: `4000 0027 6000 3184`
- Insufficient funds: `4000 0000 0000 9995`

6. Complete the checkout
7. You should be redirected back to `/tiktok-video-feed.html?premium=success`
8. Check your webhook logs to see the events

## Testing Checklist

### Manual Testing Steps

- [ ] **Authentication Required**
  - Open premium.html without being logged in
  - Click "Start 7-Day Free Trial"
  - Should prompt to login

- [ ] **Checkout Flow**
  - Login to the app
  - Go to premium.html
  - Click "Start 7-Day Free Trial"
  - Should redirect to Stripe Checkout
  - Form should show: $4.99/month with 7-day trial

- [ ] **Successful Payment**
  - Complete checkout with test card 4242 4242 4242 4242
  - Should redirect to feed page with success message
  - Check webhook logs for `checkout.session.completed` event

- [ ] **Premium Status Check**
  - After successful checkout, go back to premium.html
  - Button should show "Current Plan ✓" in green
  - Clicking it should show trial end date

- [ ] **API Status Endpoint**
  - Make authenticated request to `/api/premium/status`
  - Should return `{"success": true, "isPremium": true, "status": "trialing"}`

- [ ] **Webhook Events**
  - Monitor webhook logs during checkout
  - Should see events:
    1. `checkout.session.completed`
    2. `customer.subscription.created`
    3. `invoice.payment_succeeded`

- [ ] **Failed Payment**
  - Try checkout with declined card: 4000 0000 0000 0002
  - Should show error message
  - Premium should NOT be granted

- [ ] **Cancellation Flow** (requires subscription to be active)
  - Make POST request to `/api/premium/cancel` with auth token
  - Should return success with period end date
  - Premium access should continue until period end

### Automated Testing (Playwright)

```javascript
// tests/premium-stripe.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Stripe Payment Integration', () => {
  test('should redirect to Stripe Checkout', async ({ page }) => {
    await page.goto('http://localhost:3001/premium.html');

    // Login first
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Go to premium page
    await page.goto('http://localhost:3001/premium.html');
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Should redirect to Stripe
    await page.waitForURL(/checkout.stripe.com/);
    expect(page.url()).toContain('checkout.stripe.com');
  });
});
```

## Troubleshooting

### Issue: "Stripe not configured" error

**Solution:** Make sure `STRIPE_SECRET_KEY` is set in your .env file and the server has been restarted.

```bash
# Check if key is loaded
echo $STRIPE_SECRET_KEY

# Restart server
npm start
```

### Issue: Webhook signature verification failed

**Possible causes:**
1. `STRIPE_WEBHOOK_SECRET` is incorrect
2. Webhook endpoint is not receiving raw body

**Solution:**
- Check that webhook secret matches Stripe CLI output
- The webhook endpoint MUST use `express.raw()` middleware (already configured in server.js)
- Don't use `express.json()` middleware before webhook route

### Issue: User not authenticated error

**Solution:** User must be logged in before accessing checkout
- Check that `access_token` exists in localStorage or cookies
- Redirect to `/login.html` if not authenticated

### Issue: Premium status not updating after payment

**Solution:**
1. Check webhook is receiving events (Stripe CLI should show logs)
2. Check server console for event processing logs
3. Verify `userId` is being passed in metadata
4. Check `premiumUsers` Map in server (add console.log)

### Issue: Checkout button shows "Loading..." indefinitely

**Possible causes:**
1. Network error
2. Server not responding
3. Invalid auth token

**Solution:**
- Check browser console for errors
- Check server logs for API errors
- Verify auth token is valid

## API Reference

### POST /api/create-checkout-session

Creates a Stripe Checkout session for Premium subscription.

**Authentication:** Required (Bearer token)

**Request:**
```http
POST /api/create-checkout-session
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_xxxxxxxxxxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxxxxxxxxxx"
}
```

**Errors:**
- `401` - Not authenticated
- `500` - Stripe not configured or error creating session

### POST /api/stripe-webhook

Handles Stripe webhook events.

**Authentication:** None (verified by signature)

**Request:**
```http
POST /api/stripe-webhook
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=xxxxxxxxxxxxxxxxxxxxx

{
  "id": "evt_xxxxxxxxxxxxxxxxxxxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": { ... }
  }
}
```

**Response:**
```json
{
  "received": true
}
```

**Errors:**
- `400` - Invalid signature
- `500` - Webhook secret not configured

### GET /api/premium/status

Get current user's premium status.

**Authentication:** Required (Bearer token)

**Request:**
```http
GET /api/premium/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "isPremium": true,
  "status": "trialing",
  "trialEnd": 1729386754987,
  "cancelAtPeriodEnd": false
}
```

**Status values:**
- `free` - No subscription
- `trialing` - In trial period
- `active` - Paid subscription active
- `past_due` - Payment failed
- `canceled` - Subscription cancelled
- `trial_expired` - Trial period ended

### POST /api/premium/cancel

Cancel user's subscription (at period end).

**Authentication:** Required (Bearer token)

**Request:**
```http
POST /api/premium/cancel
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the billing period",
  "periodEnd": 1732062754987
}
```

**Errors:**
- `401` - Not authenticated
- `404` - No active subscription found
- `500` - Error cancelling subscription

## Production Deployment Checklist

Before deploying to production:

- [ ] Switch to **live mode** in Stripe Dashboard
- [ ] Get live API keys (pk_live_* and sk_live_*)
- [ ] Update production environment variables
- [ ] Configure production webhook endpoint
- [ ] Test webhook endpoint is accessible (use Stripe Dashboard)
- [ ] Update database instead of in-memory Map
- [ ] Enable HTTPS (required for Stripe Checkout)
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for subscription events
- [ ] Add customer portal for subscription management
- [ ] Test cancellation and reactivation flows
- [ ] Set up retry logic for failed webhooks
- [ ] Configure tax collection (if required)
- [ ] Add refund handling logic
- [ ] Implement grace period for failed payments
- [ ] Set up analytics tracking for conversions

## Pricing Configuration

Current pricing in the code:

**Location:** `server.js` line ~333

```javascript
unit_amount: 499, // $4.99 in cents
recurring: {
  interval: 'month',
},
```

**Trial period:** `server.js` line ~341

```javascript
subscription_data: {
  trial_period_days: 7,
  metadata: { userId }
},
```

To change pricing:
1. Update `unit_amount` in server.js (amount in cents)
2. Update UI text in premium.html (display price)
3. Consider creating a Stripe Price in Dashboard for better management

## Database Schema (For Production)

Replace in-memory Map with database table:

```sql
CREATE TABLE premium_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  trial_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  INDEX(stripe_customer_id),
  INDEX(stripe_subscription_id),
  INDEX(status)
);
```

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/cli
- **Webhook Events:** https://stripe.com/docs/api/events
- **Checkout:** https://stripe.com/docs/payments/checkout

## Questions?

For issues or questions about this integration:
1. Check server logs for errors
2. Check Stripe Dashboard for events
3. Review webhook event logs
4. Test with Stripe CLI locally
5. Contact support if needed

---

**Last Updated:** 2025-10-17
**Implementation Status:** Complete ✅
**Ready for Testing:** Yes ✅
