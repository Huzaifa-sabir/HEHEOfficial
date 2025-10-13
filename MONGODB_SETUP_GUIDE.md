# 🗄️ MongoDB Setup Guide for Hehe Aligners

## 📋 Quick Start

Your project needs MongoDB to store users, orders, products, and payments. Follow this guide to set it up.

---

## 🚀 Option 1: MongoDB Atlas (Cloud - Recommended)

### ✅ Advantages:
- ✓ Free tier available (512MB storage)
- ✓ No installation required
- ✓ Automatic backups
- ✓ Works from anywhere
- ✓ Easy to set up

### 📝 Step-by-Step Setup:

#### 1. Create MongoDB Atlas Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose the **FREE** tier (M0 Sandbox)

#### 2. Create a Cluster
1. After login, click **"Build a Database"**
2. Choose **FREE** (Shared cluster)
3. Select your preferred cloud provider (AWS recommended)
4. Choose a region closest to you
5. Keep cluster name as **Cluster0** (or customize)
6. Click **"Create Cluster"**

#### 3. Set Up Database User
1. Click **"Database Access"** in left sidebar
2. Click **"+ ADD NEW DATABASE USER"**
3. Authentication Method: **Password**
4. Username: `heheadmin` (or your choice)
5. Click **"Autogenerate Secure Password"** 
6. **📋 COPY AND SAVE THIS PASSWORD!** (you'll need it next)
7. Database User Privileges: **"Read and write to any database"**
8. Click **"Add User"**

#### 4. Configure Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"+ ADD IP ADDRESS"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (for development)
   - This adds `0.0.0.0/0` which is fine for development
   - For production, restrict to specific IPs
4. Click **"Confirm"**

#### 5. Get Your Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string that looks like:
   ```
   mongodb+srv://heheadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT:** Replace `<password>` with the password you copied in step 3
7. Add your database name before the `?` parameters:
   ```
   mongodb+srv://heheadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hehe-aligners?retryWrites=true&w=majority
   ```

#### 6. Save Your Connection String
You'll use this connection string in your `.env` file in the next section.

---

## 🖥️ Option 2: Local MongoDB (Windows)

### ✅ Advantages:
- ✓ Works offline
- ✓ Faster for local development
- ✓ Complete control

### 📝 Step-by-Step Setup:

#### 1. Download MongoDB Community Server
1. Visit: https://www.mongodb.com/try/download/community
2. Version: Latest stable (8.x or 7.x)
3. Platform: Windows
4. Package: MSI
5. Click **"Download"**

#### 2. Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **"Complete"** installation
3. **IMPORTANT:** Check **"Install MongoDB as a Service"**
4. Keep **"Run service as Network Service user"** selected
5. Check **"Install MongoDB Compass"** (optional GUI tool)
6. Click **"Next"** and **"Install"**
7. Wait for installation to complete

#### 3. Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```
You should see version information. If not, restart your computer.

#### 4. Your Connection String
For local MongoDB, use:
```
mongodb://localhost:27017/hehe-aligners
```

---

## ⚙️ Create Your .env File

Now that you have your MongoDB connection string, create the `.env` file:

### Windows PowerShell Command:
```powershell
cd C:\Users\HP\Downloads\hehe\hehe-website-main

@"
# 🔐 Environment Variables for Hehe Aligners App

# ==========================================
# 📊 DATABASE
# ==========================================
# REPLACE with your actual MongoDB connection string:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hehe-aligners

# For Local MongoDB use this instead:
# MONGODB_URI=mongodb://localhost:27017/hehe-aligners

# ==========================================
# 🔑 AUTHENTICATION
# ==========================================
JWT_SECRET=hehe_secret_key_change_this_to_something_random_and_secure_min_32_characters

# ==========================================
# 💳 PAYPAL (Get from developer.paypal.com)
# ==========================================
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_SECRET=YOUR_PAYPAL_SECRET
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_MODE=sandbox

# ==========================================
# 💳 STRIPE (Optional)
# ==========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# ==========================================
# 📧 EMAIL (Optional)
# ==========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ==========================================
# 🌐 APP CONFIGURATION
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

### 📝 Manual Method:
1. Create a file named `.env` in the `hehe-website-main` folder
2. Copy the content from the PowerShell command above
3. **IMPORTANT:** Replace the `MONGODB_URI` value with your actual connection string!

---

## 🔧 Configure Your Environment

### 1. Edit the .env file
Open the `.env` file and update:

```env
# Replace this line with your actual MongoDB connection string:
MONGODB_URI=mongodb+srv://heheadmin:your_actual_password@cluster0.xxxxx.mongodb.net/hehe-aligners
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://heheadmin:MyPassword123@cluster0.abc123.mongodb.net/hehe-aligners?retryWrites=true&w=majority
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/hehe-aligners
```

### 2. Generate a Secure JWT Secret
Replace the JWT_SECRET with something random and secure:

**Option A - PowerShell:**
```powershell
# Generate random 64-character string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option B - Use this:**
```env
JWT_SECRET=hehe_production_secret_key_2024_change_this_to_something_very_random_and_secure
```

---

## 🧪 Test Your Setup

### 1. Install Dependencies (if not already done)
```powershell
cd C:\Users\HP\Downloads\hehe\hehe-website-main
npm install
```

### 2. Start the Development Server
```powershell
npm run dev
```

### 3. Check for Success
You should see in the terminal:
```
✅ MongoDB connected
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

### 4. If You See Errors:

#### ❌ "MongoDB connection failed"
- **Check:** Your `MONGODB_URI` in `.env` is correct
- **Check:** Password has no special characters (or URL encode them)
- **Check:** For Atlas: IP whitelist is set to `0.0.0.0/0`
- **Check:** For Local: MongoDB service is running

#### ❌ "Authentication failed"
- **Check:** Username and password in connection string are correct
- **Check:** Database user was created in Atlas

#### ❌ "Network timeout"
- **Check:** Your internet connection (for Atlas)
- **Check:** Network Access whitelist in Atlas includes your IP

---

## 🔐 Security Notes

### For Development:
- ✓ Use the provided JWT_SECRET
- ✓ Allow access from anywhere (`0.0.0.0/0`)
- ✓ Use PayPal sandbox mode

### For Production:
- ⚠️ Generate a strong, random JWT_SECRET
- ⚠️ Restrict MongoDB Network Access to specific IPs
- ⚠️ Use environment-specific connection strings
- ⚠️ Never commit `.env` to version control
- ⚠️ Use PayPal production credentials

---

## 📊 MongoDB Compass (Optional GUI)

If you want a visual interface for your database:

### For MongoDB Atlas:
1. Open MongoDB Compass
2. Click **"New Connection"**
3. Paste your connection string
4. Click **"Connect"**

### For Local MongoDB:
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click **"Connect"**

You can now visually browse your database, collections, and documents!

---

## 🎯 Next Steps After MongoDB Setup

1. ✅ Verify `.env` file exists with correct `MONGODB_URI`
2. ✅ Start server: `npm run dev`
3. ✅ Check terminal for "MongoDB connected" message
4. ✅ Test API endpoints
5. ✅ Set up PayPal credentials (see PAYPAL_SETUP_GUIDE.md)

---

## 🆘 Troubleshooting

### Problem: "Cannot find .env file"
**Solution:** Make sure `.env` is in the root of `hehe-website-main` folder (same level as `package.json`)

### Problem: "MONGODB_URI is not defined"
**Solution:** 
1. Check `.env` file has `MONGODB_URI=` line
2. Restart the dev server
3. Make sure no spaces around `=` sign

### Problem: "Connection string is invalid"
**Solution:**
- Check for typos in username/password
- Make sure password doesn't have `<` or `>` brackets
- URL encode special characters in password:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - etc.

### Problem: Local MongoDB won't start
**Solution:**
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB*

# If not running, start it:
Start-Service -Name MongoDB

# Or restart it:
Restart-Service -Name MongoDB
```

---

## ✨ Success!

When everything is working, you should see:

```bash
✅ MongoDB connected
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

🎉 **You're ready to build!**

Next: Check out PAYPAL_SETUP_GUIDE.md to set up payments.


