# 🚀 Startup Checklist & Troubleshooting

## ✅ Pre-Flight Checklist

### 1. Environment File (.env)
```bash
# Check if .env exists
ls -la .env

# If not, copy from example
cp .example.env .env
```

**Verify these variables are set:**
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `PAYPAL_CLIENT_ID`
- ✅ `PAYPAL_SECRET`
- ✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- ✅ `EMAIL_USER` (optional for now)
- ✅ `EMAIL_PASS` (optional for now)

---

### 2. MongoDB
```bash
# Local MongoDB
mongod --version

# If using local, start it:
mongod

# Or update .env for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

### 3. Node Modules
```bash
# Install dependencies
npm install

# Or clean install
rm -rf node_modules package-lock.json
npm install
```

---

### 4. Clean Build
```bash
# Remove .next folder
rm -rf .next

# Clear cache (if needed)
npm cache clean --force
```

---

## 🔧 Fix the Client Context Error

The error you're seeing is because PayPal SDK needs to run client-side only.

### ✅ Already Fixed!

We created `src/providers/PayPalProvider.jsx` which wraps the PayPal SDK in a client component.

**Verify the fix is applied:**

1. Check `src/providers/PayPalProvider.jsx` exists
2. Check `src/app/layout.js` imports `PayPalProvider` (not `PayPalScriptProvider`)

**Your layout.js should look like this:**
```javascript
import { PayPalProvider } from "providers/PayPalProvider";  // ✅ Correct
// NOT this:
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";  // ❌ Wrong
```

---

## 🚀 Start the Server

### Method 1: Normal Start
```bash
npm run dev
```

### Method 2: Kill Port First
```bash
# Windows
npx kill-port 3000

# Then start
npm run dev
```

### Method 3: Use Different Port
```bash
# In package.json, change to:
"dev": "next dev -p 3001"
```

---

## ✅ Success Indicators

When server starts successfully, you should see:

```
✓ Ready in 3.5s
○ Local:        http://localhost:3000
○ Network:      http://192.168.x.x:3000
```

**NO errors like:**
- ❌ `createContext is not a function`
- ❌ `MongoDB connection failed`
- ❌ `JWT_SECRET not defined`

---

## 🧪 Quick Tests

### Test 1: Homepage Loads
```bash
# Open browser
http://localhost:3000

# Should see: Homepage loads without errors
```

### Test 2: Check MongoDB Connection
```bash
# In terminal, you should see:
✅ MongoDB connected successfully

# NOT:
❌ MongoDB connection failed
```

### Test 3: API Products Endpoint
```bash
curl http://localhost:3000/api/products

# Should return JSON (even if empty array)
# NOT 500 error
```

---

## 🐛 Common Errors & Fixes

### Error 1: "createContext is not a function"

**Cause:** PayPal SDK imported in server component

**Fix:**
1. ✅ Verify `src/providers/PayPalProvider.jsx` exists
2. ✅ Check it has `"use client"` at top
3. ✅ Update `src/app/layout.js` to import `PayPalProvider`
4. ✅ Restart server: `Ctrl+C` then `npm run dev`

**After restart, error should be GONE!**

---

### Error 2: "MongoDB connection failed"

**Cause:** `MONGODB_URI` not set or incorrect

**Fix:**
```bash
# Edit .env
MONGODB_URI=mongodb://localhost:27017/hehe-aligners

# Or for Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hehe

# Restart server
```

---

### Error 3: "JWT_SECRET not defined"

**Cause:** `.env` file missing

**Fix:**
```bash
# Create .env from example
cp .example.env .env

# Or create manually with:
JWT_SECRET=your_secret_here_change_in_production

# Restart server
```

---

### Error 4: Port 3000 Already in Use

**Cause:** Another process using port 3000

**Fix:**
```bash
# Kill the port
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

---

### Error 5: "Cannot find module"

**Cause:** Missing dependencies

**Fix:**
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

---

## 📊 Verification Steps

After server starts, verify these work:

### ✅ Step 1: Homepage
- Visit: `http://localhost:3000`
- Should: Load without errors
- Check: Browser console has no errors

### ✅ Step 2: API Health
```bash
# Test products endpoint
curl http://localhost:3000/api/products

# Should return JSON (even if empty)
```

### ✅ Step 3: PayPal Script Loads
- Visit homepage
- Open DevTools → Network tab
- Look for: `paypal.com` script loading
- Should: See PayPal SDK loaded

### ✅ Step 4: No Console Errors
- Browser console should be clean
- Terminal should show no errors
- MongoDB should connect successfully

---

## 🎯 If Server Starts Successfully

You should see in terminal:
```
✓ Ready in 3.5s
○ Local:   http://localhost:3000
✅ MongoDB connected successfully
```

And NO errors about:
- createContext
- MongoDB connection
- JWT_SECRET
- Environment variables

---

## 🚀 Next Steps After Successful Startup

1. **Add PayPal Credentials:**
   - Get from developer.paypal.com
   - Update `.env` file
   - Replace `test` values

2. **Create Test Data:**
   - Add products via admin
   - Create installment plans
   - Create test user

3. **Test Payment Flow:**
   - Follow [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
   - Use Postman or cURL
   - Verify in MongoDB

4. **Test Frontend:**
   - Go to `/checkout`
   - Try adding PayPal account
   - Test payment flow

---

## 📞 Still Having Issues?

### Check These Files Exist:
```bash
ls -la .env
ls -la src/providers/PayPalProvider.jsx
ls -la src/components/payments/PayPalPaymentForm.jsx
ls -la src/components/payments/AddPayPalMethodModal.jsx
```

### Check Server Logs:
```bash
# Look for these messages in terminal:
✅ "MongoDB connected successfully"
✅ "Ready in X.Xs"
✅ "compiled client and server successfully"

# NOT these:
❌ "MongoDB connection failed"
❌ "createContext is not a function"
❌ "Cannot find module"
```

### Restart Everything:
```bash
# 1. Stop server: Ctrl+C
# 2. Clear .next folder
rm -rf .next

# 3. Restart
npm run dev
```

---

## ✨ Success!

If you see:
```
✓ Ready in 3.5s
○ Local:   http://localhost:3000
✅ MongoDB connected successfully
```

**You're ready to start testing! 🎉**

Proceed to [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for testing instructions.
