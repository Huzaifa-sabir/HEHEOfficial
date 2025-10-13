# 🚀 PayPal Live Environment Setup Guide

This guide will help you safely transition from PayPal Sandbox to Live (Production) mode.

---

## ⚠️ CRITICAL SECURITY WARNING

**BEFORE YOU START:**
- The credentials you shared publicly have been compromised
- **IMMEDIATELY REVOKE** those credentials in your PayPal dashboard
- **GENERATE NEW** credentials before proceeding
- **NEVER** share credentials in chat, forums, or public places
- Store credentials in a secure password manager

---

## 📋 Prerequisites

Before going live, ensure you have:

- ✅ PayPal Business Account (fully verified)
- ✅ Bank account linked to PayPal
- ✅ Business documentation submitted (if required)
- ✅ Tested thoroughly in Sandbox environment
- ✅ Database backup completed
- ✅ Error monitoring set up (Sentry, LogRocket, etc.)
- ✅ Customer support ready
- ✅ Legal documents updated (Privacy Policy, Terms of Service)

---

## 🔐 Step 1: Revoke Compromised Credentials

1. Go to: https://developer.paypal.com/dashboard/
2. Navigate to **"My Apps & Credentials"**
3. Select your **Live** app
4. Click **"Show"** next to Secret Key
5. Click **"Revoke"** or **"Delete"** the exposed credentials
6. Confirm the revocation

---

## 🆕 Step 2: Generate New Live Credentials

1. In PayPal Developer Dashboard, go to **"My Apps & Credentials"**
2. Switch to **"Live"** tab (top of page)
3. Create a new app or select existing app
4. Click **"Show"** to reveal:
   - **Client ID** (starts with 'A' and is ~80 characters)
   - **Secret** (also ~80 characters)
5. **Copy both values** to a secure password manager
6. **DO NOT** share these anywhere

---

## 🛠️ Step 3: Configure Environment Variables

### Option A: Automated Setup (Recommended)

Run the interactive setup script:

```bash
node setup-paypal-live.js
```

Follow the prompts to securely configure your environment.

### Option B: Manual Setup

1. Create `.env.local` file in project root (if it doesn't exist)
2. Add the following variables:

```env
# PayPal Mode
PAYPAL_MODE=live

# Backend Credentials (NEVER expose these!)
PAYPAL_CLIENT_ID=your_new_live_client_id
PAYPAL_SECRET=your_new_live_secret

# Frontend Client ID (same as above)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_new_live_client_id
```

3. **Important:** Replace `your_new_live_client_id` and `your_new_live_secret` with your actual NEW credentials

---

## ✅ Step 4: Verify Configuration

Run the validation script:

```bash
node src/lib/validateEnv.js
```

This will check:
- ✅ All required variables are set
- ✅ Credentials have proper length
- ✅ Mode is correctly configured
- ✅ No secrets exposed to frontend
- ✅ Client IDs match

Fix any errors before proceeding.

---

## 🔄 Step 5: Restart Your Application

**Important:** Next.js only reads environment variables at startup.

```bash
# Stop the server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart the server
npm run dev
```

---

## 🧪 Step 6: Test with Small Transactions

**DO NOT** test with large amounts immediately!

### Testing Strategy:

1. **$0.01 Test Transaction**
   - Use your own PayPal account
   - Complete full payment flow
   - Verify money actually transferred
   - Check database records created

2. **$1.00 Test Transaction**
   - Test with a trusted friend/colleague
   - Verify email notifications work
   - Test refund process

3. **Gradually Increase**
   - Only after successful small tests
   - Monitor each transaction closely

### What to Verify:

- ✅ Payment button renders correctly
- ✅ PayPal popup opens (not sandbox)
- ✅ Payment completes successfully
- ✅ Money appears in your PayPal account
- ✅ Database payment record created
- ✅ Customer receives confirmation email
- ✅ Order status updates correctly

---

## 🔍 Step 7: Monitor Transactions

### PayPal Dashboard

- **Live Transactions:** https://www.paypal.com/activity/
- **Developer Dashboard:** https://developer.paypal.com/dashboard/
- **Business Manager:** https://www.paypal.com/businessmanage/

### What to Monitor:

1. **Transaction Success Rate** (should be >95%)
2. **Processing Time** (should be <5 seconds)
3. **Error Rates** (should be <1%)
4. **Customer Complaints**
5. **Refund Requests**

### Server Logs

Check your server logs for:
```
✅ PayPal SDK Initialized
   Client ID: Acym3CzCVAoyUc1z...
   Intent: authorize
   Currency: USD

🔐 PayPal Service Initialized
Mode: LIVE
API: https://api-m.paypal.com
⚠️  WARNING: LIVE MODE - Real money transactions enabled!
```

---

## 🚨 Troubleshooting

### Issue: "Invalid credentials" error

**Solution:**
- Verify you're using LIVE credentials (not sandbox)
- Check for typos in .env.local
- Ensure no extra spaces in credentials
- Restart server after changing .env.local

### Issue: "Account not verified" error

**Solution:**
- Complete PayPal business account verification
- Submit required business documents
- Wait 1-3 business days for approval
- Contact PayPal support if delayed

### Issue: Transactions fail silently

**Solution:**
- Check PayPal account limits (new accounts have limits)
- Verify receiving account can accept payments
- Check for country/currency restrictions
- Review PayPal activity log for details

### Issue: Still seeing sandbox in logs

**Solution:**
- Verify `PAYPAL_MODE=live` in .env.local
- Delete `.next` folder
- Restart server completely
- Clear browser cache

---

## 🔄 Rollback Plan

If something goes wrong:

### 1. Immediate Rollback

```bash
# Edit .env.local
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id

# Restart server
rm -rf .next && npm run dev
```

### 2. Notify Customers

- If any transactions failed
- Offer alternative payment methods
- Provide support contact

### 3. Debug

- Check server logs
- Check PayPal activity log
- Test in sandbox again
- Fix issues before retrying live

---

## 📊 Production Checklist

Before accepting customer payments:

### Security
- [ ] Compromised credentials revoked
- [ ] New credentials generated
- [ ] .env.local not in version control
- [ ] .gitignore includes .env.local
- [ ] HTTPS enabled on production domain
- [ ] Secrets not exposed to frontend
- [ ] Error messages don't leak sensitive info

### PayPal Configuration
- [ ] Business account fully verified
- [ ] Bank account linked
- [ ] Live app created and approved
- [ ] Webhooks configured (if using)
- [ ] 2FA enabled on PayPal account

### Application
- [ ] Environment validation passes
- [ ] Server shows "LIVE MODE" in logs
- [ ] API calls go to api-m.paypal.com
- [ ] Test transactions successful
- [ ] Money actually transferred
- [ ] Database records correct
- [ ] Email notifications work

### Legal & Compliance
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Refund policy documented
- [ ] Customer support ready
- [ ] Tax obligations understood

### Monitoring
- [ ] Error tracking configured
- [ ] Transaction logging enabled
- [ ] Alert system set up
- [ ] Backup system verified

---

## 💰 Important Considerations

### Transaction Fees

PayPal charges fees for live transactions:
- **Standard rate:** 2.9% + $0.30 per transaction
- **International:** Additional 1.5% for currency conversion
- **Micropayments:** Different rate structure for <$10 transactions

Factor these into your pricing!

### Rate Limits

- Don't spam the PayPal API
- Implement proper retry logic
- Use exponential backoff
- Monitor rate limit headers

### Compliance

- **PCI DSS:** Mostly handled by PayPal
- **GDPR:** If serving EU customers
- **Local regulations:** Check your jurisdiction
- **Tax reporting:** Keep transaction records

---

## 📞 Support Resources

### PayPal Support
- **Technical Support:** https://developer.paypal.com/support/
- **Business Support:** https://www.paypal.com/businesshelp/
- **Phone:** Check PayPal website for your region

### Documentation
- **PayPal Developer Docs:** https://developer.paypal.com/docs/
- **API Reference:** https://developer.paypal.com/api/rest/
- **Webhooks Guide:** https://developer.paypal.com/api/rest/webhooks/

---

## 🎯 Quick Reference

### Environment Variables

| Variable | Purpose | Exposed to Browser? |
|----------|---------|-------------------|
| `PAYPAL_MODE` | Set to 'live' | No |
| `PAYPAL_CLIENT_ID` | Backend auth | No |
| `PAYPAL_SECRET` | Backend auth | **NEVER** |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Frontend button | Yes (safe) |

### API Endpoints

| Mode | API URL |
|------|---------|
| Sandbox | `https://api-m.sandbox.paypal.com` |
| Live | `https://api-m.paypal.com` |

### Files Modified

- ✅ `.env.local` - Environment variables
- ✅ `src/lib/paypal.js` - Auto-detects mode
- ✅ `src/providers/PayPalProvider.jsx` - Uses env var
- ✅ No code changes needed!

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Revoke compromised credentials in PayPal dashboard

# 2. Generate new live credentials

# 3. Run setup script
node setup-paypal-live.js

# 4. Validate configuration
node src/lib/validateEnv.js

# 5. Restart server
rm -rf .next && npm run dev

# 6. Test with $0.01 transaction

# 7. Monitor closely!
```

---

## 🔒 Security Best Practices

1. **Rotate credentials every 90 days**
2. **Use different credentials for dev/staging/prod**
3. **Enable 2FA on PayPal account**
4. **Monitor for suspicious activity**
5. **Keep credentials in password manager**
6. **Never log full credentials**
7. **Use HTTPS only in production**
8. **Validate all amounts on backend**
9. **Implement rate limiting**
10. **Regular security audits**

---

## 📝 Notes

- This setup maintains backward compatibility
- You can switch back to sandbox anytime
- All security checks are built-in
- No code changes required after setup
- Environment variables control everything

---

## ✅ You're Ready!

Once you've completed all steps and verified everything works:

🎉 **Congratulations!** Your PayPal Live integration is ready for production!

Remember:
- Start with small transactions
- Monitor closely
- Have support ready
- Keep credentials secure
- Document everything

---

**Last Updated:** $(date)
**Version:** 1.0.0

