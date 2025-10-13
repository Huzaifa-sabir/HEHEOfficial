/**
 * Environment Variable Validation
 * 
 * This module validates that all required environment variables are properly configured
 * and provides helpful error messages if something is missing or misconfigured.
 * 
 * Security Features:
 * - Validates that secrets are not accidentally exposed with NEXT_PUBLIC_ prefix
 * - Checks for proper PayPal mode configuration
 * - Ensures credentials are present and have reasonable length
 * - Prevents common configuration mistakes
 */

const ENV_ERRORS = [];
const ENV_WARNINGS = [];

/**
 * Validate a required environment variable
 */
function validateRequired(varName, minLength = 10) {
  const value = process.env[varName];
  
  if (!value) {
    ENV_ERRORS.push(`❌ ${varName} is not set`);
    return false;
  }
  
  if (value.length < minLength) {
    ENV_WARNINGS.push(`⚠️  ${varName} seems too short (${value.length} chars). Expected at least ${minLength} chars.`);
  }
  
  return true;
}

/**
 * Validate PayPal configuration
 */
function validatePayPal() {
  console.log('\n🔍 Validating PayPal Configuration...\n');
  
  // Check PayPal mode
  const mode = process.env.PAYPAL_MODE;
  if (!mode) {
    ENV_ERRORS.push('❌ PAYPAL_MODE is not set (should be "sandbox" or "live")');
  } else if (mode !== 'sandbox' && mode !== 'live') {
    ENV_ERRORS.push(`❌ PAYPAL_MODE is "${mode}" but should be "sandbox" or "live"`);
  } else {
    console.log(`✅ PayPal Mode: ${mode.toUpperCase()}`);
    if (mode === 'live') {
      console.log('   ⚠️  WARNING: You are in LIVE mode - real money will be charged!');
    }
  }
  
  // Validate backend credentials (MUST NOT have NEXT_PUBLIC_ prefix)
  validateRequired('PAYPAL_CLIENT_ID', 60);
  validateRequired('PAYPAL_SECRET', 60);
  
  // Validate frontend client ID (MUST have NEXT_PUBLIC_ prefix)
  validateRequired('NEXT_PUBLIC_PAYPAL_CLIENT_ID', 60);
  
  // Security check: Ensure secret is not exposed to frontend
  if (process.env.NEXT_PUBLIC_PAYPAL_SECRET) {
    ENV_ERRORS.push('🚨 CRITICAL SECURITY ERROR: NEXT_PUBLIC_PAYPAL_SECRET is set!');
    ENV_ERRORS.push('   PayPal Secret should NEVER be exposed to the frontend!');
    ENV_ERRORS.push('   Remove NEXT_PUBLIC_PAYPAL_SECRET from your .env file immediately!');
  }
  
  // Verify client IDs match
  if (process.env.PAYPAL_CLIENT_ID && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    if (process.env.PAYPAL_CLIENT_ID !== process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      ENV_WARNINGS.push('⚠️  PAYPAL_CLIENT_ID and NEXT_PUBLIC_PAYPAL_CLIENT_ID do not match');
      ENV_WARNINGS.push('   They should be the same value');
    }
  }
  
  // Check for sandbox credentials in live mode
  if (mode === 'live') {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    if (clientId.includes('sandbox') || clientId.includes('test')) {
      ENV_WARNINGS.push('⚠️  Client ID appears to be a sandbox credential, but mode is "live"');
    }
  }
}

/**
 * Validate MongoDB configuration
 */
function validateDatabase() {
  console.log('\n🔍 Validating Database Configuration...\n');
  
  if (!validateRequired('MONGODB_URI', 20)) {
    ENV_WARNINGS.push('   Database connection will fail without MONGODB_URI');
  } else {
    console.log('✅ MongoDB URI configured');
  }
}

/**
 * Validate JWT configuration
 */
function validateAuth() {
  console.log('\n🔍 Validating Authentication Configuration...\n');
  
  if (!validateRequired('JWT_SECRET', 16)) {
    ENV_WARNINGS.push('   Authentication will fail without JWT_SECRET');
  } else {
    console.log('✅ JWT Secret configured');
    
    // Check if using default/weak secret
    const secret = process.env.JWT_SECRET || '';
    if (secret.includes('hehealigners') || secret.includes('secret') || secret.includes('password')) {
      ENV_WARNINGS.push('⚠️  JWT_SECRET appears to be a default/weak value');
      ENV_WARNINGS.push('   Consider using a strong random string in production');
    }
  }
}

/**
 * Validate Email configuration
 */
function validateEmail() {
  console.log('\n🔍 Validating Email Configuration...\n');
  
  const hasEmailUser = process.env.EMAIL_USER;
  const hasEmailPass = process.env.EMAIL_PASS;
  
  if (!hasEmailUser || !hasEmailPass) {
    ENV_WARNINGS.push('⚠️  Email configuration incomplete (EMAIL_USER or EMAIL_PASS missing)');
    ENV_WARNINGS.push('   Email notifications (OTP, receipts) will not work');
  } else {
    console.log('✅ Email configuration complete');
  }
}

/**
 * Main validation function
 */
function validateEnvironment() {
  console.log('\n' + '='.repeat(70));
  console.log('🔐 Environment Variable Validation');
  console.log('='.repeat(70));
  
  // Run all validations
  validatePayPal();
  validateDatabase();
  validateAuth();
  validateEmail();
  
  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('📊 Validation Results');
  console.log('='.repeat(70) + '\n');
  
  if (ENV_ERRORS.length === 0 && ENV_WARNINGS.length === 0) {
    console.log('✅ All environment variables are properly configured!\n');
    return true;
  }
  
  // Display errors
  if (ENV_ERRORS.length > 0) {
    console.log('🚨 ERRORS (must be fixed):\n');
    ENV_ERRORS.forEach(error => console.log('   ' + error));
    console.log('');
  }
  
  // Display warnings
  if (ENV_WARNINGS.length > 0) {
    console.log('⚠️  WARNINGS (recommended to fix):\n');
    ENV_WARNINGS.forEach(warning => console.log('   ' + warning));
    console.log('');
  }
  
  // If there are errors, provide guidance
  if (ENV_ERRORS.length > 0) {
    console.log('📝 How to fix:\n');
    console.log('   1. Create/update your .env.local file in the project root');
    console.log('   2. Add the missing environment variables');
    console.log('   3. Run: node setup-paypal-live.js (for guided setup)');
    console.log('   4. Restart your development server\n');
    console.log('='.repeat(70) + '\n');
    
    throw new Error('Environment validation failed. Please fix the errors above.');
  }
  
  console.log('='.repeat(70) + '\n');
  return true;
}

// Export validation function
module.exports = { validateEnvironment };

// If run directly, perform validation
if (require.main === module) {
  try {
    require('dotenv').config({ path: '.env.local' });
    validateEnvironment();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }
}

