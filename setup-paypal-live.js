#!/usr/bin/env node

/**
 * PayPal Live Environment Setup Script
 * 
 * This script helps you securely configure PayPal Live credentials
 * Run: node setup-paypal-live.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔐 PayPal Live Environment Setup');
  console.log('='.repeat(70) + '\n');

  console.log('⚠️  SECURITY WARNING:');
  console.log('   - Never share your PayPal Secret Key');
  console.log('   - Never commit .env.local to version control');
  console.log('   - Keep credentials in a secure password manager\n');

  // Check if .env.local already exists
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('\n✅ Setup cancelled. Your existing .env.local is safe.\n');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide your PayPal Live credentials:');
  console.log('   (Get these from: https://developer.paypal.com/dashboard/applications/live)\n');

  const clientId = await question('Enter PayPal Live Client ID: ');
  const secret = await question('Enter PayPal Live Secret: ');

  if (!clientId || !secret) {
    console.log('\n❌ Error: Client ID and Secret are required!\n');
    rl.close();
    return;
  }

  // Validate format (basic check)
  if (clientId.length < 50 || secret.length < 50) {
    console.log('\n⚠️  Warning: Credentials seem too short. Make sure you copied them correctly.\n');
    const proceed = await question('Continue anyway? (yes/no): ');
    if (proceed.toLowerCase() !== 'yes') {
      console.log('\n✅ Setup cancelled.\n');
      rl.close();
      return;
    }
  }

  console.log('\n📋 Additional configuration:\n');
  
  const mongoUri = await question('Enter MongoDB URI (press Enter to skip): ');
  const jwtSecret = await question('Enter JWT Secret (press Enter for default): ');
  const emailUser = await question('Enter Email User (press Enter to skip): ');
  const emailPass = await question('Enter Email Password (press Enter to skip): ');

  // Create .env.local content
  const envContent = `# ============================================================
# PAYPAL CONFIGURATION - LIVE ENVIRONMENT
# ============================================================
# ⚠️ SECURITY WARNING: NEVER commit this file to version control!
# ⚠️ Keep these credentials SECRET and SECURE!
# ============================================================
# Generated: ${new Date().toISOString()}
# ============================================================

# PayPal Mode: 'sandbox' for testing, 'live' for production
PAYPAL_MODE=live

# PayPal Live Credentials (Backend Only - NEVER expose these!)
PAYPAL_CLIENT_ID=${clientId}
PAYPAL_SECRET=${secret}

# PayPal Client ID for Frontend (Safe to expose - used for PayPal button rendering)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=${clientId}

# Optional: PayPal Product ID (if using subscription products)
PAYPAL_PRODUCT_ID=

# ============================================================
# DATABASE CONFIGURATION
# ============================================================
${mongoUri ? `MONGODB_URI=${mongoUri}` : '# MONGODB_URI=your_mongodb_connection_string'}

# ============================================================
# AUTHENTICATION
# ============================================================
JWT_SECRET=${jwtSecret || 'hehealigners_CHANGE_THIS_IN_PRODUCTION_' + Math.random().toString(36).substring(7)}

# ============================================================
# EMAIL CONFIGURATION (for OTP and notifications)
# ============================================================
${emailUser ? `EMAIL_USER=${emailUser}` : '# EMAIL_USER=your-email@gmail.com'}
${emailPass ? `EMAIL_PASS=${emailPass}` : '# EMAIL_PASS=your-app-password'}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# ============================================================
# STRIPE CONFIGURATION (Optional - if you want to keep Stripe as backup)
# ============================================================
# STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================================
# API CONFIGURATION
# ============================================================
# API_BASE_URL=https://yourdomain.com/api
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# ============================================================
# ENVIRONMENT
# ============================================================
NODE_ENV=production

# ============================================================
# IMPORTANT SECURITY NOTES:
# ============================================================
# 1. NEVER commit this file to Git (already in .gitignore)
# 2. NEVER share these credentials publicly
# 3. NEVER use NEXT_PUBLIC_ prefix for secrets (only for client ID)
# 4. Rotate credentials regularly (every 90 days recommended)
# 5. Use different credentials for development/staging/production
# 6. Monitor PayPal dashboard for suspicious activity
# 7. Enable 2FA on your PayPal business account
# 8. Keep backups of credentials in secure password manager
# ============================================================
`;

  // Write to .env.local
  try {
    fs.writeFileSync(envPath, envContent, { mode: 0o600 }); // Restrict file permissions
    console.log('\n✅ Successfully created .env.local\n');
    
    console.log('📋 Next Steps:\n');
    console.log('1. Verify your .env.local file was created');
    console.log('2. Make sure .env.local is in your .gitignore');
    console.log('3. Restart your development server: npm run dev');
    console.log('4. Test with small transactions first ($0.01)');
    console.log('5. Monitor PayPal dashboard for transactions\n');
    
    console.log('⚠️  IMPORTANT REMINDERS:\n');
    console.log('- You are now in LIVE mode - real money will be charged!');
    console.log('- Test thoroughly before accepting customer payments');
    console.log('- Keep your PayPal credentials secure');
    console.log('- Never share your .env.local file\n');
    
    console.log('🔗 Useful Links:\n');
    console.log('- PayPal Dashboard: https://www.paypal.com/businessmanage/');
    console.log('- Developer Dashboard: https://developer.paypal.com/dashboard/');
    console.log('- Transaction History: https://www.paypal.com/activity/\n');
    
  } catch (error) {
    console.error('\n❌ Error writing .env.local:', error.message);
    console.log('\nPlease create .env.local manually with the following content:\n');
    console.log(envContent);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});

