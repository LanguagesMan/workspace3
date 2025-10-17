# Stripe Test Card Guide

## Test Card: 4242 4242 4242 4242

This is Stripe's standard test card for successful payments.

## How to Use

### Step 1: Start Checkout Flow

1. Go to http://localhost:3001/premium.html
2. Make sure you're logged in
3. Click **"Start 7-Day Free Trial"**
4. You'll be redirected to Stripe Checkout

### Step 2: Enter Test Card Details

On the Stripe Checkout page, enter:

```
Card Number:  4242 4242 4242 4242
Expiry Date:  12/34  (any future date)
CVC:          123    (any 3 digits)
ZIP Code:     12345  (any 5 digits)
Cardholder:   Test User (any name)
```

### Step 3: Complete Payment

1. Click **"Subscribe"** or **"Start Trial"**
2. Wait for processing
3. You'll be redirected back to your app

### Expected Results

✅ **Success Page:**
- URL: `http://localhost:3001/tiktok-video-feed.html?premium=success`
- Alert: "Welcome to Premium! Your 7-day free trial has started."

✅ **Webhook Events (in Stripe CLI terminal):**
```
checkout.session.completed
customer.subscription.created
invoice.payment_succeeded
```

✅ **Server Logs:**
```
✅ Premium granted to user abc123 via checkout cs_test_xxxxx
📝 Subscription created for user abc123: sub_xxxxx
💰 Payment succeeded for invoice in_xxxxx
```

✅ **Premium Status Active:**
- Go back to `/premium.html`
- Button shows "Current Plan ✓" in green
- API returns `isPremium: true`

### Step 4: Verify Premium Access

#### Check UI:
```bash
# Open browser
http://localhost:3001/premium.html

# Button should be green and say "Current Plan ✓"
```

#### Check API:
```bash
curl http://localhost:3001/api/premium/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "isPremium": true,
  "status": "trialing",
  "trialEnd": 1729386754987,
  "cancelAtPeriodEnd": false
}
```

## Other Test Cards

### Declined Payment
```
Card:    4000 0000 0000 0002
Result:  Generic decline
```

### 3D Secure Authentication
```
Card:    4000 0027 6000 3184
Result:  Requires 3D Secure verification
```

### Insufficient Funds
```
Card:    4000 0000 0000 9995
Result:  Insufficient funds error
```

### Expired Card
```
Card:    4000 0000 0000 0069
Result:  Expired card error
```

### Processing Error
```
Card:    4000 0000 0000 0119
Result:  Processing error
```

## Testing Different Scenarios

### Scenario 1: Successful Trial Start

1. Use card: **4242 4242 4242 4242**
2. Complete checkout
3. Verify premium status = "trialing"
4. Verify trial ends in 7 days

### Scenario 2: Payment Declined

1. Use card: **4000 0000 0000 0002**
2. Try to checkout
3. Should see error message
4. Premium should NOT be granted
5. User stays on Free plan

### Scenario 3: 3D Secure Required

1. Use card: **4000 0027 6000 3184**
2. Start checkout
3. Should see 3D Secure verification step
4. Complete verification
5. Premium should be granted

### Scenario 4: Trial Converts to Paid

1. Use successful test card
2. Wait 7 days (or simulate in code)
3. Stripe will attempt to charge card
4. If successful, status changes to "active"
5. If failed, status changes to "past_due"

### Scenario 5: Subscription Cancellation

1. Get premium subscription
2. Call cancel endpoint:
```bash
curl -X POST http://localhost:3001/api/premium/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```
3. Subscription marked for cancellation
4. User keeps access until period end
5. After period end, premium revoked

## Webhook Events to Watch

### checkout.session.completed
```json
{
  "id": "evt_xxxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxxxx",
      "customer": "cus_xxxxx",
      "subscription": "sub_xxxxx",
      "metadata": {
        "userId": "user123"
      }
    }
  }
}
```

**Action:** Grant premium access to user

### customer.subscription.created
```json
{
  "id": "evt_xxxxx",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "status": "trialing",
      "trial_end": 1729386754,
      "metadata": {
        "userId": "user123"
      }
    }
  }
}
```

**Action:** Set trial end date

### customer.subscription.updated
```json
{
  "id": "evt_xxxxx",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "status": "active",
      "cancel_at_period_end": false
    }
  }
}
```

**Action:** Update subscription status

### customer.subscription.deleted
```json
{
  "id": "evt_xxxxx",
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "metadata": {
        "userId": "user123"
      }
    }
  }
}
```

**Action:** Revoke premium access

### invoice.payment_succeeded
```json
{
  "id": "evt_xxxxx",
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_xxxxx",
      "amount_paid": 499,
      "subscription": "sub_xxxxx"
    }
  }
}
```

**Action:** Log successful payment, keep premium active

### invoice.payment_failed
```json
{
  "id": "evt_xxxxx",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_xxxxx",
      "subscription": "sub_xxxxx"
    }
  }
}
```

**Action:** Log failed payment, update status to "past_due"

## Common Issues & Solutions

### Issue: "Not authenticated" error

**Solution:**
```bash
# 1. Make sure you're logged in
# 2. Check localStorage has access_token:
localStorage.getItem('access_token')

# 3. Or check cookies:
document.cookie
```

### Issue: Checkout page shows wrong price

**Solution:**
- Check server.js line ~333: `unit_amount: 499` (should be 499 for $4.99)
- Restart server after changes

### Issue: Webhook not received

**Solution:**
```bash
# 1. Check Stripe CLI is running
stripe listen --forward-to localhost:3001/api/stripe-webhook

# 2. Check server logs for webhook attempts
# 3. Verify webhook secret in .env matches CLI output
```

### Issue: Trial not showing correct end date

**Solution:**
- Check webhook event `customer.subscription.created`
- Verify `trial_end` timestamp is being stored
- Check `trial_period_days: 7` in server.js line ~341

### Issue: Button still says "Start Trial" after payment

**Solution:**
```bash
# 1. Check API status:
curl http://localhost:3001/api/premium/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Check server logs for webhook events
# 3. Refresh page to trigger checkPremiumStatus()
```

## Manual Testing Checklist

- [ ] Start checkout flow (logged in)
- [ ] Complete with successful card (4242...)
- [ ] Verify redirect to success page
- [ ] Check webhook events received
- [ ] Verify premium status API returns true
- [ ] Check UI shows "Current Plan ✓"
- [ ] Try accessing premium features
- [ ] Test declined card (0002)
- [ ] Verify no premium granted on decline
- [ ] Test cancellation endpoint
- [ ] Verify mobile responsiveness
- [ ] Check loading states
- [ ] Verify error messages

## Automated Test

```bash
# Run full test suite
npm run test:playwright tests/stripe-integration.spec.js

# Or specific test
npx playwright test tests/stripe-integration.spec.js \
  --grep "successful checkout"
```

## Quick Test Script

```bash
#!/bin/bash

echo "🧪 Testing Stripe Integration..."

# 1. Check server is running
echo "1. Checking server..."
curl -s http://localhost:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not running. Start with: npm start"
    exit 1
fi

# 2. Check Stripe is configured
echo "2. Checking Stripe configuration..."
if grep -q "sk_test_" .env; then
    echo "   ✅ Stripe keys found in .env"
else
    echo "   ⚠️  Stripe keys not found in .env"
fi

# 3. Check webhook secret
if grep -q "whsec_" .env; then
    echo "   ✅ Webhook secret found"
else
    echo "   ⚠️  Webhook secret not found"
    echo "   Run: stripe listen --forward-to localhost:3001/api/stripe-webhook"
fi

echo ""
echo "🎯 Ready to test!"
echo "Go to: http://localhost:3001/premium.html"
echo "Use card: 4242 4242 4242 4242"
```

Save as `test-stripe.sh` and run:
```bash
chmod +x test-stripe.sh
./test-stripe.sh
```

## Success Criteria

Your integration is working correctly if:

✅ Checkout redirects to Stripe
✅ Test card 4242... completes successfully
✅ Webhook events are received
✅ Premium status API returns true
✅ UI updates to show "Current Plan ✓"
✅ Trial end date is 7 days in future
✅ Declined card (0002) shows error
✅ No premium granted on failed payment
✅ Cancel endpoint works
✅ Premium status persists on page reload

## Support

If tests are failing:

1. Check server logs for errors
2. Check Stripe CLI logs for webhook events
3. Review STRIPE_INTEGRATION_GUIDE.md
4. Check Stripe Dashboard for events
5. Verify API keys are correct

---

**Test Card:** 4242 4242 4242 4242
**Always Works:** Yes ✅
**Charges Real Money:** No (test mode only)
**Safe to Use:** Yes (test mode only)
