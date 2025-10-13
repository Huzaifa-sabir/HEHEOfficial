# ⚡ Quick Start Guide - MongoDB Setup

## 🎯 What You Need to Do

You need to set up MongoDB and create a `.env` file for your application to work.

---

## 🚀 Fast Setup (3 Steps)

### Step 1: Create .env File

**Option A - Run PowerShell Script:**
```powershell
cd C:\Users\HP\Downloads\hehe\hehe-website-main
.\setup-env.ps1
```

**Option B - Manual Creation:**
1. Create a new file named `.env` in the `hehe-website-main` folder
2. Copy and paste the content from the template below

**`.env` Template:**
```env
# DATABASE - Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hehe-aligners

# Or use local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/hehe-aligners

# AUTHENTICATION
JWT_SECRET=hehe_secret_key_change_this_to_something_random_and_secure_min_32_characters

# PAYPAL
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
PAYPAL_SECRET=YOUR_PAYPAL_SECRET_HERE
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
PAYPAL_MODE=sandbox

# STRIPE (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# EMAIL (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# APP CONFIG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 2: Set Up MongoDB

**Choose ONE option:**

#### 🌐 Option A: MongoDB Atlas (Cloud - Easiest)

1. **Sign up:** Go to https://www.mongodb.com/cloud/atlas/register
2. **Create FREE cluster** (M0 Sandbox)
3. **Create database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `heheadmin`
   - Click "Autogenerate Secure Password" and **SAVE IT!**
   - Grant "Read and write to any database"
4. **Configure network access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
5. **Get connection string:**
   - Go to "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add `/hehe-aligners` before the `?` parameters

**Example connection string:**
```
mongodb+srv://heheadmin:MyPassword123@cluster0.abc123.mongodb.net/hehe-aligners?retryWrites=true&w=majority
```

#### 💻 Option B: Local MongoDB (Windows)

1. **Download:** https://www.mongodb.com/try/download/community
2. **Install:** Run the MSI file, choose "Complete" installation
3. **Check "Install MongoDB as a Service"**
4. **Use this connection string:**
   ```
   mongodb://localhost:27017/hehe-aligners
   ```

### Step 3: Update .env File

1. Open the `.env` file you created
2. Replace this line:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hehe-aligners
   ```
3. With your actual connection string from Step 2

---

## 🧪 Test Your Setup

### 1. Install dependencies (if not done):
```powershell
cd C:\Users\HP\Downloads\hehe\hehe-website-main
npm install
```

### 2. Start the development server:
```powershell
npm run dev
```

### 3. Check for success:
You should see:
```
✅ MongoDB connected
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

### 4. Open your browser:
Visit: http://localhost:3000

---

## ❌ Troubleshooting

### Error: "MongoDB connection failed"
- ✅ Check your `MONGODB_URI` in `.env` is correct
- ✅ For Atlas: Verify password is correct (no `<` or `>` brackets)
- ✅ For Atlas: Check IP whitelist includes `0.0.0.0/0`
- ✅ For Local: Check MongoDB service is running

### Error: "Cannot find module"
```powershell
npm install
```

### Error: "Port 3000 already in use"
```powershell
npx kill-port 3000
npm run dev
```

### Error: ".env file not found"
- Check the `.env` file is in the `hehe-website-main` folder (same level as `package.json`)
- Make sure it's named `.env` (not `.env.txt`)

---

## 📚 Need More Help?

- **MongoDB Setup:** Read `MONGODB_SETUP_GUIDE.md` for detailed instructions
- **PayPal Setup:** Read `PAYPAL_SETUP_GUIDE.md` 
- **API Testing:** Read `API_TESTING_GUIDE.md`
- **Full Checklist:** Read `STARTUP_CHECKLIST.md`

---

## ✨ Summary

1. ✅ Create `.env` file (run `.\setup-env.ps1` or create manually)
2. ✅ Set up MongoDB (Atlas cloud or Local)
3. ✅ Update `MONGODB_URI` in `.env` file
4. ✅ Run `npm install`
5. ✅ Run `npm run dev`
6. ✅ Visit `http://localhost:3000`

**You're all set! 🎉**


