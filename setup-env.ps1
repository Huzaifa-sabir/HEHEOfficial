# MongoDB Setup Script for Hehe Aligners
Write-Host "🚀 Setting up environment variables..." -ForegroundColor Cyan

$envContent = @"
# ==========================================
# 📊 DATABASE CONFIGURATION
# ==========================================
# IMPORTANT: Replace with your actual MongoDB connection string!
# For MongoDB Atlas (Cloud):
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hehe-aligners

# For Local MongoDB (uncomment if using local):
# MONGODB_URI=mongodb://localhost:27017/hehe-aligners

# ==========================================
# 🔑 AUTHENTICATION
# ==========================================
# Generate a secure random string for production!
JWT_SECRET=hehe_secret_key_change_this_to_something_random_and_secure_min_32_characters

# ==========================================
# 💳 PAYPAL CONFIGURATION
# ==========================================
# Get these from: https://developer.paypal.com/dashboard/applications
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
PAYPAL_SECRET=YOUR_PAYPAL_SECRET_HERE
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE
PAYPAL_MODE=sandbox

# ==========================================
# 💳 STRIPE CONFIGURATION (Optional)
# ==========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# ==========================================
# 📧 EMAIL CONFIGURATION (Optional)
# ==========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# ==========================================
# 🌐 APPLICATION SETTINGS
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
"@

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Open the .env file and replace MONGODB_URI with your actual connection string" -ForegroundColor White
Write-Host "2. Follow the MONGODB_SETUP_GUIDE.md for detailed MongoDB setup instructions" -ForegroundColor White
Write-Host "3. Run: npm install (if you haven't already)" -ForegroundColor White
Write-Host "4. Run: npm run dev (to start the development server)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Need help? Read MONGODB_SETUP_GUIDE.md for complete instructions!" -ForegroundColor Cyan


