# ⚡ Quick PayPal Live Setup

**5-Minute Guide to Go Live**

---

## 🚨 URGENT: Security First!

The credentials you shared are **COMPROMISED**. Do this NOW:

1. Go to: https://developer.paypal.com/dashboard/
2. Navigate to **Live** → Your App
3. **REVOKE** the exposed credentials
4. **GENERATE NEW** credentials
5. **NEVER** share them again

---

## 🚀 Setup Steps

### 1. Run Setup Script

```bash
node setup-paypal-live.js
```

Enter your **NEW** credentials when prompted.

### 2. Verify Configuration

```bash
node src/lib/validateEnv.js
```

Fix any errors shown.

### 3. Restart Server

```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

### 4. Verify Live Mode

Check console output for:
```
🔐 PayPal Service Initialized
Mode: LIVE
⚠️  WARNING: LIVE MODE - Real money transactions enabled!
```

### 5. Test Transaction

- Use **$0.01** for first test
- Use your own PayPal account
- Verify money actually transfers

---

## ✅ What Changed

### Files Updated:
- ✅ `.env.local` - Contains your live credentials
- ✅ `src/providers/PayPalProvider.jsx` - Removed hardcoded sandbox credentials
- ✅ `src/lib/paypal.js` - Added security validation

### Security Features Added:
- ✅ No hardcoded credentials
- ✅ Validates env vars on startup
- ✅ Prevents secret exposure to frontend
- ✅ Logs show masked credentials only
- ✅ Throws error if misconfigured

---

## 🔐 Security Guarantees

### ✅ What's SAFE:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` - Exposed to browser (by design)
- Client ID is public - used for PayPal button rendering

### ❌ What's NEVER Exposed:
- `PAYPAL_SECRET` - Always server-side only
- Never has `NEXT_PUBLIC_` prefix
- Never sent to browser
- Never in console logs (only masked)

### 🛡️ Built-in Protection:
- Validates on server startup
- Throws error if secret exposed
- Prevents accidental leaks
- Safe logging (first 10 chars only)

---

## 📋 Environment Variables

Your `.env.local` should have:

```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_new_live_client_id
PAYPAL_SECRET=your_new_live_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_new_live_client_id
```

**Note:** `PAYPAL_CLIENT_ID` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID` are the SAME value.

---

## 🧪 Testing Checklist

Before accepting customer payments:

- [ ] Credentials revoked and regenerated
- [ ] Setup script completed successfully
- [ ] Validation passes
- [ ] Server shows "LIVE MODE"
- [ ] $0.01 test transaction successful
- [ ] Money appeared in PayPal account
- [ ] Database record created
- [ ] Can switch back to sandbox if needed

---

## 🔄 Switch Back to Sandbox

If you need to go back:

```env
# In .env.local
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

Then restart server.

---

## 📞 Need Help?

- **Full Guide:** See `PAYPAL_LIVE_SETUP.md`
- **PayPal Support:** https://developer.paypal.com/support/
- **Validation Tool:** `node src/lib/validateEnv.js`

---

## ⚠️ Important Reminders

1. **Real Money:** Live mode charges actual money
2. **Test First:** Always test with small amounts
3. **Monitor:** Watch transactions closely
4. **Support:** Have customer support ready
5. **Backup:** Keep credentials in password manager

---

## 🎯 What You Get

### Before (Sandbox):
- Hardcoded credentials in code
- Test transactions only
- Fake money

### After (Live):
- Secure env-based config
- Real transactions
- Actual money transfers
- Production-ready
- Easy to switch modes

---

**You're all set!** 🎉

Just run the setup script and you'll be live in minutes.

Remember: **Test with $0.01 first!**

