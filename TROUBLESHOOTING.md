# PayPal Integration Troubleshooting Guide

## Current Issue: PayPal SDK Not Loading (400 Error)

### Error Message
```
Failed to load the PayPal JS SDK script. Error: The script
"https://www.paypal.com/sdk/js?client-id=..." failed to load.
Check the HTTP status code and response body in DevTools.
```

## What I Just Fixed

### 1. Simplified PayPal SDK Options ✅
**Problem**: Too many SDK options causing 400 error from PayPal

**Fixed in**: [src/providers/PayPalProvider.jsx](src/providers/PayPalProvider.jsx)

**Removed these problematic options**:
- `"merchant-id": "*"` - Invalid value
- `"buyer-country": "US"` - Not needed
- `"locale": "en_US"` - Not needed
- `"debug": false` - Not needed
- `"enable-3ds": false` - Not needed
- `"enable-funding": "venmo"` - Not needed
- `"disable-funding": ""` - Not needed
- `"data-sdk-integration-source"` - Not needed

**Kept only essential options**:
```javascript
{
  "client-id": "AXStFuY7MPA4...",
  currency: "USD",
  intent: "capture",
  vault: true,
  components: "buttons,funding-eligibility"
}
```

## NEXT STEPS - Follow These In Order

### Step 1: Test PayPal SDK in Isolation
Open this test page in your browser:
```
http://localhost:3001/test-paypal-sdk.html
```

This will tell you if the problem is:
- ✅ **Browser-side issue** (extensions, firewall, network)
- ✅ **PayPal account issue** (credentials, permissions)
- ✅ **Network issue** (DNS, ISP blocking)

### Step 2: Check Browser DevTools
1. Open your browser
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Reload the page
5. Look for requests to `www.paypal.com`
6. Check the **Status** column

**What to look for:**
- **200 OK** = PayPal SDK loaded successfully ✅
- **400 Bad Request** = Invalid SDK parameters ❌
- **403 Forbidden** = PayPal blocking your request ❌
- **Failed** = Network/DNS issue ❌
- **Blocked** = Browser extension blocking ❌

### Step 3: Try These Solutions

#### Solution A: Disable Browser Extensions
Browser extensions (especially ad blockers) often block PayPal:

1. **Disable ALL extensions**:
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
   - Edge: `edge://extensions`

2. **Common blockers**:
   - AdBlock, uBlock Origin
   - Privacy Badger
   - Ghostery
   - NoScript
   - Any VPN extensions

3. **Reload the page** after disabling

#### Solution B: Use Incognito/Private Mode
This bypasses most extensions:

1. **Chrome**: Ctrl+Shift+N
2. **Firefox**: Ctrl+Shift+P
3. **Edge**: Ctrl+Shift+N
4. **Navigate to**: http://localhost:3001

#### Solution C: Check Antivirus/Firewall
Some antivirus programs block PayPal domains:

1. **Temporarily disable antivirus**
2. **Add exception for**:
   - `www.paypal.com`
   - `*.paypal.com`
   - `*.paypalobjects.com`

3. **Windows Firewall**:
   - Search "Windows Defender Firewall"
   - Click "Allow an app through firewall"
   - Find your browser (Chrome, Firefox, Edge)
   - Ensure both "Private" and "Public" are checked

#### Solution D: Try Different Browser
Test in multiple browsers to isolate the issue:

- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Brave (disable shields)

#### Solution E: Check VPN/Proxy
VPNs can interfere with PayPal:

1. **Disable VPN** if active
2. **Disable proxy** settings
3. **Test connection** again

#### Solution F: DNS Flush
Clear DNS cache:

**Windows**:
```bash
ipconfig /flushdns
ipconfig /registerdns
```

**Then test**:
```bash
ping www.paypal.com
```

Expected: Should get replies from PayPal servers

#### Solution G: Test in Mobile Hotspot
If your ISP is blocking PayPal:

1. **Enable mobile hotspot** on your phone
2. **Connect your PC** to the hotspot
3. **Test the website** again

### Step 4: Verify Environment Variables

Check that `.env.local` has:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXStFuY7MPA4weDeG5IbpoMQVFAhrNiA0tLRxfRTOhxh5m_dab-1twoVCt_WLfYfyd8VWuux1IgY2CAC
PAYPAL_CLIENT_ID=AXStFuY7MPA4weDeG5IbpoMQVFAhrNiA0tLRxfRTOhxh5m_dab-1twoVCt_WLfYfyd8VWuux1IgY2CAC
PAYPAL_SECRET=EDaokRWMKc2hLKcF14pW9wxN-44hJn_L6jAGxup5dtpvZcBeN6JpO9YKJbKDUMre1VyNbClA41VmLCWP
PAYPAL_MODE=sandbox
```

**IMPORTANT**: `NEXT_PUBLIC_` prefix is needed for browser access!

### Step 5: Clear Next.js Cache

```bash
# Stop the dev server (Ctrl+C)
# Delete .next folder
rm -rf .next

# Or on Windows:
rmdir /s /q .next

# Restart
npm run dev
```

### Step 6: Hard Refresh Browser

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Or reload in incognito mode**

## Diagnostic Checklist

Run through this checklist:

- [ ] Can curl reach PayPal SDK? `curl -I "https://www.paypal.com/sdk/js?client-id=test"`
- [ ] Does test page work? http://localhost:3001/test-paypal-sdk.html
- [ ] Are browser extensions disabled?
- [ ] Tried incognito mode?
- [ ] Tried different browser?
- [ ] Is antivirus disabled/configured?
- [ ] Is VPN disabled?
- [ ] DNS flushed?
- [ ] .env.local has NEXT_PUBLIC_PAYPAL_CLIENT_ID?
- [ ] .next folder deleted and server restarted?
- [ ] Hard browser refresh done?

## Understanding the Error

### What the 400 Error Means

**400 Bad Request** from PayPal SDK URL means:
- PayPal rejected the SDK request
- Usually caused by invalid URL parameters
- We fixed this by simplifying the options

### What "Failed to load" Means

If you see "Failed to load" instead of 400:
- **Browser can't reach www.paypal.com**
- Network/DNS issue
- Firewall/antivirus blocking
- ISP/VPN interference

## If Nothing Works

### Last Resort Options

#### Option 1: Use PayPal Checkout (No Vault)
If vault setup keeps failing, use direct checkout:

1. Skip "Save PayPal account" feature
2. Use one-time PayPal payments only
3. User logs in each time

#### Option 2: Alternative DNS
Try Google DNS or Cloudflare DNS:

**Windows**:
1. Open "Network Connections"
2. Right-click your network → Properties
3. Select IPv4 → Properties
4. Use these DNS servers:
   - Preferred: `8.8.8.8` (Google)
   - Alternate: `1.1.1.1` (Cloudflare)

#### Option 3: Contact ISP
Some ISPs block PayPal domains:
- Call your internet provider
- Ask if they block www.paypal.com
- Request they whitelist PayPal domains

## Success Indicators

You'll know it's working when you see:

**Browser Console**:
```
✅ PayPal SDK Client ID: AXStFuY7MPA4weDeG5Ib...
```

**Network Tab**:
```
Status: 200 OK
Request URL: https://www.paypal.com/sdk/js?client-id=...
```

**On Page**:
- PayPal button appears
- Gold "PayPal" button is visible
- Clicking it opens PayPal login

## Get More Help

### Check Logs

**Server logs**:
```bash
# Look for this in terminal running npm run dev
✅ PayPal SDK Client ID: AXStFuY7MPA4...
```

**Browser console**:
```javascript
// Open DevTools (F12) → Console tab
// Look for errors or success messages
```

### Test Backend Separately

The backend IS working (we tested this):
```bash
node test-paypal-with-retry.js
# Should show: ✅ SUCCESS!
```

### Test Frontend Separately

Use the test page:
```
http://localhost:3001/test-paypal-sdk.html
```

This isolates frontend issues from backend issues.

## Common Patterns

### Pattern 1: Works on Backend, Fails on Frontend
**Cause**: Browser blocking PayPal
**Solution**: Disable extensions, try incognito

### Pattern 2: Works in Incognito, Fails Normally
**Cause**: Browser extension or cache
**Solution**: Clear cache, disable extensions

### Pattern 3: Works on Different Network
**Cause**: ISP/firewall blocking
**Solution**: Change DNS, contact ISP, use VPN

### Pattern 4: Works in Different Browser
**Cause**: Browser-specific issue
**Solution**: Use working browser, reset problematic one

---

## Current Status

- ✅ **Backend**: Working (retry logic implemented)
- ✅ **Credentials**: Valid (tested successfully)
- ✅ **Server**: Running on http://localhost:3001
- ⚠️ **Frontend**: PayPal SDK loading issue (400 error)
- ✅ **Fix Applied**: Simplified SDK options

**Next**: Follow steps above to diagnose and fix the frontend issue!
