# PayPal Setup Guide - Quick Reference

## 🔑 Getting PayPal Credentials

### Step 1: Create PayPal Developer Account
1. Go to https://developer.paypal.com/
2. Sign in or create a developer account
3. Go to Dashboard

### Step 2: Create App
1. Navigate to "My Apps & Credentials"
2. Click "Create App"
3. Choose "Merchant" as app type
4. Name your app (e.g., "HeHe Aligners")
5. Click "Create App"

### Step 3: Get Credentials
After creating the app, you'll see:

**Sandbox (Testing):**
- Client ID: `AXXXxxxxxx...`
- Secret: `EXXXxxxxxx...`

**Live (Production):**
- Client ID: `AXXXxxxxxx...`
- Secret: `EXXXxxxxxx...`

### Step 4: Update .env File
```env
# For Testing (Sandbox)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SECRET=your_sandbox_secret_here
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# For Production (Live)
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_SECRET=your_live_secret_here
PAYPAL_MODE=live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id_here
```

---

## 🧪 PayPal Sandbox Testing

### Create Test Accounts
1. In PayPal Developer Dashboard
2. Go to "Sandbox" → "Accounts"
3. You'll see default test accounts or create new ones:
   - **Business Account** (Merchant - receives money)
   - **Personal Account** (Customer - pays money)

### Test Account Credentials
- Email: something@business.example.com
- Password: Shown in dashboard (click "..." → "View/Edit Account")

### Test Credit Cards
PayPal provides these for testing:
- Visa: 4032039847861016
- Mastercard: 5426064281104580
- Amex: 371449635398431
- Any future expiry date
- Any 3-digit CVV

---

## 🏗️ Create PayPal Product (For Subscriptions)

For installment plans, you need a PayPal Product ID:

1. Go to PayPal Dashboard → Products & Services
2. Click "Create Product"
3. Fill in:
   - **Name:** "Dental Aligners"
   - **Type:** "Service"
   - **Category:** "Healthcare"
4. Save and copy the Product ID
5. Add to .env:
```env
PAYPAL_PRODUCT_ID=PROD-XXXXXXXXXXXX
```

---

## 🔔 Webhook Setup (For Backend)

Webhooks notify your backend when payments occur:

1. In PayPal Developer Dashboard
2. Go to your app settings
3. Scroll to "Webhooks"
4. Click "Add Webhook"
5. Enter URL: `https://yourdomain.com/api/paypal/webhook`
6. Select events:
   - ✅ Payment capture completed
   - ✅ Payment capture denied
   - ✅ Billing subscription activated
   - ✅ Billing subscription payment completed
   - ✅ Billing subscription cancelled
7. Save webhook

---

## 🎯 Environment Variables - Complete List

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_secret_key_here

# PayPal Configuration
PAYPAL_CLIENT_ID=AXXXxxxxx_your_client_id
PAYPAL_SECRET=EXXXxxxxx_your_secret
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXXXxxxxx_your_client_id
PAYPAL_PRODUCT_ID=PROD-XXXXXXXXXXXX

# API Configuration
API_BASE_URL=http://localhost:3000/api
```

---

## ✅ Verification Checklist

Before testing:

- [ ] PayPal Developer Account created
- [ ] App created in PayPal Dashboard
- [ ] Client ID and Secret copied
- [ ] Environment variables set in .env file
- [ ] NEXT_PUBLIC_PAYPAL_CLIENT_ID is set (required for frontend)
- [ ] PayPal Product created (for subscriptions)
- [ ] Sandbox test accounts created
- [ ] Restart Next.js dev server after adding env variables

---

## 🚀 Quick Start Command

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Your app will be at:
# http://localhost:3000
```

---

## 🧪 Testing Flow

1. **Go to payment plans page**
   - Select a payment plan
   - Click "Start My Treatment"

2. **At checkout**
   - Click "Add PayPal Account"
   - PayPal button appears
   - Click PayPal button
   - Login with sandbox test account
   - Authorize payment

3. **Complete payment**
   - PayPal account now saved
   - Select saved PayPal account
   - Click "Create Order & Pay"
   - Payment processes automatically

---

## 🐛 Common Issues & Solutions

### Issue: "PayPal SDK failed to load"
**Solution:**
- Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Restart dev server after adding env vars
- Check browser console for errors

### Issue: "Invalid client ID"
**Solution:**
- Verify Client ID is correct in .env
- Make sure using sandbox ID for testing
- Check no extra spaces in .env file

### Issue: PayPal buttons don't appear
**Solution:**
- Check internet connection
- Verify PayPal SDK loaded (check Network tab)
- Check console for errors
- Verify PayPalScriptProvider is wrapping app

### Issue: "Cannot create order"
**Solution:**
- Backend API not implemented yet
- Check `/api/paypal` endpoint exists
- Verify endpoint returns correct format

---

## 📚 Useful Links

- PayPal Developer Docs: https://developer.paypal.com/docs/
- PayPal React SDK: https://paypal.github.io/react-paypal-js/
- Sandbox Dashboard: https://developer.paypal.com/dashboard/
- Test Credit Cards: https://developer.paypal.com/tools/sandbox/card-testing/

---

## 💡 Pro Tips

1. **Always test in sandbox first** before going live
2. **Use test accounts** for all sandbox testing
3. **Check webhook logs** in PayPal Dashboard
4. **Monitor console** for errors during development
5. **Verify env variables** are loaded: `console.log(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)`

---

## 🎉 You're All Set!

Frontend is ready. Once you add the backend implementation, you'll have a fully functional PayPal payment system!

Happy coding! 🚀
