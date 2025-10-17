# Stripe Integration - Quick Start Guide

**5-Minute Setup** to test Stripe payments locally

## Prerequisites

- ✅ Node.js installed
- ✅ Server dependencies installed (`npm install`)
- ✅ Stripe account (free to create)

## Step 1: Get Stripe Keys (2 minutes)

1. Go to https://stripe.com and create account (or login)
2. Go to https://dashboard.stripe.com/test/apikeys
3. Copy your keys:

```bash
# Click "Reveal test key" for Secret key
sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Publishable key (already visible)
pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 2: Configure Environment (1 minute)

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Stripe keys:
```bash
# Find these lines and replace with your keys:
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"
```

**Note:** You'll add the webhook secret in Step 4

## Step 3: Start the Server (30 seconds)

```bash
npm start
```

Server should start on http://localhost:3001

## Step 4: Setup Webhook (2 minutes)

In a **new terminal window**:

1. Install Stripe CLI (macOS):
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks:
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

4. Copy the webhook secret from the output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

5. Add to `.env`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
```

6. Restart server (in first terminal):
```bash
# Press Ctrl+C to stop, then:
npm start
```

**Keep the Stripe CLI running in the second terminal!**

## Step 5: Test the Integration (1 minute)

1. Open browser: http://localhost:3001/premium.html

2. If not logged in, create account:
   - Click "Sign Up" or go to http://localhost:3001/signup.html
   - Email: test@example.com
   - Password: testpass123

3. Go back to http://localhost:3001/premium.html

4. Click **"Start 7-Day Free Trial"**

5. You'll be redirected to Stripe Checkout

6. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34` (any future date)
   - CVC: `123` (any 3 digits)
   - ZIP: `12345` (any 5 digits)
   - Name: Your name

7. Click "Subscribe"

8. You should be redirected back with success message!

9. Check your terminal with Stripe CLI - you should see webhook events:
```
checkout.session.completed
customer.subscription.created
invoice.payment_succeeded
```

## Verify Premium Status

1. Go back to http://localhost:3001/premium.html

2. The button should now show **"Current Plan ✓"** in green

3. Click it to see your trial end date

## Test API Endpoint

```bash
# Get your auth token from browser localStorage or cookies
# Then make request:

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

## Troubleshooting

### "Stripe not configured" error
- Make sure `.env` has Stripe keys
- Restart server after adding keys
- Check keys don't have quotes or spaces

### "Webhook signature verification failed"
- Make sure Stripe CLI is running
- Copy webhook secret exactly from CLI output
- Restart server after adding webhook secret

### "Not authenticated" error
- Make sure you're logged in
- Create account at /signup.html
- Check localStorage has `access_token`

### Can't complete checkout
- Make sure using test card: 4242 4242 4242 4242
- Check any future expiry date works
- Any CVC and ZIP code work

### Webhook not received
- Check Stripe CLI is running in terminal
- Should see "Ready! Forwarding webhooks..."
- Check server logs for webhook events

## Next Steps

### Test Different Scenarios

**Successful Payment:**
- Card: 4242 4242 4242 4242
- Should grant premium access

**Declined Payment:**
- Card: 4000 0000 0000 0002
- Should show error, no premium granted

**3D Secure Required:**
- Card: 4000 0027 6000 3184
- Should show additional verification step

**Check All Endpoints:**

```bash
# Premium status
curl http://localhost:3001/api/premium/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create checkout (returns URL)
curl -X POST http://localhost:3001/api/create-checkout-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Cancel subscription
curl -X POST http://localhost:3001/api/premium/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Run Automated Tests

```bash
# Run Playwright tests
npm run test:playwright tests/stripe-integration.spec.js

# Or specific test
npx playwright test tests/stripe-integration.spec.js --headed
```

## Production Deployment

When ready to go live:

1. Get **live API keys** from https://dashboard.stripe.com/apikeys
2. Update production `.env` with live keys
3. Configure **production webhook** in Stripe Dashboard
4. Add endpoint: `https://your-domain.com/api/stripe-webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.*`
6. Replace in-memory storage with database
7. Test thoroughly before launch!

## Support

- **Full Guide:** See STRIPE_INTEGRATION_GUIDE.md
- **Implementation Details:** See STRIPE_IMPLEMENTATION_SUMMARY.md
- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing

## Common Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0027 6000 3184 | 3D Secure |
| 4000 0000 0000 9995 | Insufficient funds |

All test cards:
- Use any future expiry (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

---

**Total Setup Time:** ~5 minutes
**Ready to test!** 🚀
