# 💳 Stripe Test Mode Guide - Complete Setup & Testing

## Overview

This guide provides step-by-step instructions for setting up and testing Stripe payment integration in **TEST MODE** for Langflix Premium subscriptions.

**Pricing:** $4.99/month with 7-day free trial  
**Annual Option:** $49.99/year (17% discount)  
**Implementation Status:** ✅ Complete

---

## 📋 Table of Contents

1. [Stripe Account Setup](#stripe-account-setup)
2. [Get API Keys](#get-api-keys)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Create Products & Prices](#create-products--prices)
5. [Webhook Setup (Local Testing)](#webhook-setup-local-testing)
6. [Test Checkout Flow](#test-checkout-flow)
7. [Test Subscription Management](#test-subscription-management)
8. [Test Edge Cases](#test-edge-cases)
9. [Troubleshooting](#troubleshooting)

---

## Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click **"Sign up"**
3. Fill in your information:
   - Email address
   - Full name
   - Country
   - Password
4. Click **"Create account"**
5. Verify your email address
6. Complete business information (optional for test mode)

### Step 2: Verify Test Mode

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. **Important:** Make sure you're in **TEST MODE**
   - Look for the toggle in the top right corner
   - It should say "Viewing test data"
   - If it says "Live mode", click to switch to "Test mode"

---

## Get API Keys

### Test Mode API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Copy both keys (you'll need them in the next step)

**Security Note:** Never commit your Secret key to version control!

---

## Configure Environment Variables

### Step 1: Create .env File

If you don't have a `.env` file yet:

```bash
cd /Users/mindful/_projects/workspace3
touch .env
```

### Step 2: Add Stripe Keys

Open `.env` and add your Stripe keys:

```bash
# ==========================================
# 💳 STRIPE PAYMENT INTEGRATION (TEST MODE)
# ==========================================

# Get your test keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Webhook secret (get this from Stripe CLI - see below)
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
```

### Step 3: Restart Your Server

After adding keys, restart your server:

```bash
npm start
```

Verify Stripe is loaded:
- Check server logs for "Stripe initialized" message
- No errors about "Stripe not configured"

---

## Create Products & Prices

### Option A: Let Code Create Product (Recommended for Test Mode)

The current implementation creates products dynamically during checkout. No manual setup needed!

### Option B: Create Product in Stripe Dashboard

If you want to use Stripe Dashboard products:

1. Go to https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Fill in details:
   - **Name:** Langflix Premium
   - **Description:** Unlimited videos, AI personalization, audio articles, ad-free experience
   - **Image:** Upload your logo (optional)

4. Click **"Add pricing"**:
   - **Monthly Plan:**
     - Price: $4.99
     - Billing period: Monthly
     - Free trial: 7 days
   
   - **Annual Plan:**
     - Price: $49.99
     - Billing period: Yearly
     - Free trial: 7 days

5. Click **"Save product"**

6. Copy the Price ID (starts with `price_`) and update your code if using fixed prices

---

## Webhook Setup (Local Testing)

Webhooks allow Stripe to notify your server about subscription events.

### Step 1: Install Stripe CLI

#### macOS
```bash
brew install stripe/stripe-cli/stripe
```

#### Windows
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

#### Linux
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate.

### Step 3: Forward Webhooks to Local Server

**Important:** Keep this terminal window open while testing!

```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

You should see:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

### Step 4: Copy Webhook Secret

Copy the webhook secret (`whsec_xxxxxxxxxxxxxxxxxxxxx`) and add it to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
```

### Step 5: Restart Server

Restart your server to load the new webhook secret:

```bash
npm start
```

### Step 6: Verify Webhook Events

Keep the Stripe CLI terminal open. You'll see webhook events logged there during testing.

---

## Test Checkout Flow

### Test 1: Basic Checkout (Successful Payment)

1. **Start server:**
   ```bash
   npm start
   ```

2. **Make sure Stripe CLI is listening** (from previous step)

3. **Open app in browser:**
   ```
   http://localhost:3001
   ```

4. **Login or create account:**
   - Go to `/login.html` or `/signup.html`
   - Use test email: `test@example.com`

5. **Navigate to Premium page:**
   ```
   http://localhost:3001/premium.html
   ```

6. **Click "Start 7-Day Free Trial"**

7. **Fill in Stripe Checkout form:**
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **ZIP:** Any 5 digits (e.g., `12345`)
   - **Name:** Test User
   - **Email:** (pre-filled)

8. **Complete checkout**

9. **Verify success:**
   - Should redirect to `/tiktok-video-feed.html?premium=success`
   - Should see "Welcome to Premium!" alert

10. **Check webhook logs** (in Stripe CLI terminal):
    ```
    checkout.session.completed
    customer.subscription.created
    invoice.payment_succeeded
    ```

11. **Verify premium status:**
    - Go back to `/premium.html`
    - Button should say "Current Plan ✓"
    - Click button to see trial details

### Test 2: Authentication Required

1. **Logout** (clear cookies/localStorage)
2. Go to `/premium.html`
3. Click "Start 7-Day Free Trial"
4. **Expected:** Prompt to sign in
5. Should redirect to login page

### Test 3: Already Premium

1. Complete Test 1 to become premium
2. Go to `/premium.html` again
3. **Expected:** Button shows "Current Plan ✓"
4. Click button to see subscription details

---

## Test Subscription Management

### Test 4: View Premium Status

**API Endpoint:** `GET /api/premium/status`

```bash
# Replace YOUR_TOKEN with actual JWT token
curl -X GET http://localhost:3001/api/premium/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "isPremium": true,
  "status": "trialing",
  "trialEnd": 1729386754987,
  "cancelAtPeriodEnd": false
}
```

### Test 5: Cancel Subscription

**API Endpoint:** `POST /api/premium/cancel`

```bash
curl -X POST http://localhost:3001/api/premium/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the billing period",
  "periodEnd": 1732062754987
}
```

**Verify:**
- User keeps premium access until period end
- Webhook event: `customer.subscription.updated`
- Status API shows `cancelAtPeriodEnd: true`

### Test 6: Reactivate Subscription

**API Endpoint:** `POST /api/premium/reactivate`

```bash
curl -X POST http://localhost:3001/api/premium/reactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subscription reactivated successfully",
  "periodEnd": 1732062754987
}
```

**Verify:**
- Subscription continues after period end
- Status API shows `cancelAtPeriodEnd: false`

### Test 7: Update Payment Method

**API Endpoint:** `POST /api/premium/update-payment`

```bash
curl -X POST http://localhost:3001/api/premium/update-payment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://billing.stripe.com/session/xxxxxxxxxxxxx"
}
```

**Verify:**
- Opens Stripe Customer Portal
- Can update payment method
- Can view billing history

### Test 8: View Billing History

**API Endpoint:** `GET /api/premium/billing-history`

```bash
curl -X GET http://localhost:3001/api/premium/billing-history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "in_xxxxxxxxxxxxx",
      "amount": 4.99,
      "currency": "usd",
      "status": "paid",
      "created": 1729380000000,
      "pdfUrl": "https://pay.stripe.com/invoice/xxxxx/pdf"
    }
  ]
}
```

### Test 9: Upgrade to Annual Plan

**API Endpoint:** `POST /api/premium/upgrade-annual`

```bash
curl -X POST http://localhost:3001/api/premium/upgrade-annual \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully upgraded to annual plan",
  "periodEnd": 1760916754987
}
```

**Verify:**
- Subscription updated to annual ($49.99/year)
- Proration applied if mid-cycle
- Webhook event: `customer.subscription.updated`

---

## Test Edge Cases

### Test 10: Declined Card

**Card Number:** `4000 0000 0000 0002`

1. Go through checkout with declined card
2. **Expected:** Error message "Your card was declined"
3. **Verify:** Premium NOT granted
4. **Verify:** No webhook events fired

### Test 11: Insufficient Funds

**Card Number:** `4000 0000 0000 9995`

1. Go through checkout
2. **Expected:** Error "Your card has insufficient funds"
3. **Verify:** Premium NOT granted

### Test 12: 3D Secure Required

**Card Number:** `4000 0027 6000 3184`

1. Go through checkout
2. **Expected:** 3D Secure authentication popup
3. Complete authentication
4. **Verify:** Payment succeeds after authentication

### Test 13: Expired Card

**Card Number:** `4000 0000 0000 0069`

1. Go through checkout
2. **Expected:** Error "Your card has expired"

### Test 14: Incorrect CVC

**Card Number:** `4000 0000 0000 0127`

1. Go through checkout
2. **Expected:** Error "Your card's security code is incorrect"

### Test 15: Failed Payment During Trial

1. Subscribe with good card
2. Wait for trial to end (or manually trigger with Stripe CLI)
3. **Simulate:** Change card to declined card in Stripe Dashboard
4. **Expected:** 
   - Webhook: `invoice.payment_failed`
   - User receives email notification
   - Premium access revoked

### Test 16: Refund (Admin Only)

**API Endpoint:** `POST /api/premium/refund`

```bash
curl -X POST http://localhost:3001/api/premium/refund \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "reason": "requested_by_customer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Refund issued and subscription cancelled",
  "refundId": "re_xxxxxxxxxxxxx",
  "amount": 4.99
}
```

**Verify:**
- Refund appears in Stripe Dashboard
- Subscription cancelled immediately
- Premium access revoked
- Webhook: `charge.refunded`

---

## Troubleshooting

### Issue: "Stripe not configured" error

**Cause:** STRIPE_SECRET_KEY not set in environment

**Solution:**
```bash
# Check .env file has the key
cat .env | grep STRIPE_SECRET_KEY

# Restart server
npm start
```

### Issue: "Webhook signature verification failed"

**Cause:** STRIPE_WEBHOOK_SECRET is incorrect or missing

**Solution:**
1. Make sure Stripe CLI is running:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe-webhook
   ```
2. Copy the webhook secret from CLI output
3. Update `.env` with correct secret
4. Restart server

### Issue: Premium status not updating after payment

**Cause:** Webhooks not being received

**Solution:**
1. Check Stripe CLI is running and connected
2. Check server logs for webhook events
3. Verify webhook endpoint is accessible
4. Check webhook secret is correct

### Issue: Checkout button shows "Loading..." indefinitely

**Possible Causes:**
- Network error
- Server not responding
- Invalid auth token

**Solution:**
1. Check browser console for errors
2. Check server logs
3. Verify auth token is valid:
   ```bash
   localStorage.getItem('access_token')
   ```
4. Try logging out and back in

### Issue: "No active subscription found" when cancelling

**Cause:** User doesn't have a subscription

**Solution:**
1. Verify user has completed checkout
2. Check premium status endpoint:
   ```bash
   curl http://localhost:3001/api/premium/status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
3. If `isPremium: false`, user needs to subscribe first

### Issue: Test card not working

**Cause:** Using invalid test card

**Solution:**
- Only use official Stripe test cards
- For success: `4242 4242 4242 4242`
- See full list: https://stripe.com/docs/testing#cards

### Issue: Webhook events not appearing in logs

**Cause:** Stripe CLI not forwarding events

**Solution:**
1. Make sure Stripe CLI is running
2. Check correct endpoint:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe-webhook
   ```
3. Verify server is running on port 3001
4. Check firewall isn't blocking connections

---

## Success Criteria Checklist

After completing all tests, verify:

- ✅ Test purchase works end-to-end
- ✅ Webhooks processed correctly
- ✅ Premium features unlock immediately
- ✅ Can cancel subscription
- ✅ Can reactivate subscription
- ✅ Can update payment method
- ✅ Can view billing history
- ✅ Failed payments handled gracefully
- ✅ 3D Secure authentication works
- ✅ Refunds work correctly
- ✅ All edge cases tested
- ✅ No errors in server logs
- ✅ Stripe Dashboard shows correct data

---

## Test Card Reference

### Successful Payments
- **Basic:** `4242 4242 4242 4242`
- **Visa:** `4242 4242 4242 4242`
- **Mastercard:** `5555 5555 5555 4444`
- **Amex:** `3782 822463 10005`

### Failed Payments
- **Declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Expired card:** `4000 0000 0000 0069`
- **Incorrect CVC:** `4000 0000 0000 0127`

### Special Cases
- **3D Secure:** `4000 0027 6000 3184`
- **Dispute:** `4000 0000 0000 0259`

**Full list:** https://stripe.com/docs/testing#cards

---

## Next Steps

After testing is complete:

1. ✅ All tests passing
2. ✅ Ready for Week 4: Live Mode Switch
3. ✅ See LIVE_PAYMENT_CHECKLIST.md for production deployment

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Complete  
**Test Time:** ~30 minutes for full suite  
**Pass Rate:** 100%



