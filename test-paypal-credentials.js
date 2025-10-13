// Test PayPal Credentials
// Run this: node test-paypal-credentials.js

require('dotenv').config();

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_API = MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

console.log('='.repeat(60));
console.log('🧪 Testing PayPal Credentials');
console.log('='.repeat(60));
console.log('Mode:', MODE);
console.log('API URL:', PAYPAL_API);
console.log('Client ID:', CLIENT_ID ? CLIENT_ID.substring(0, 20) + '...' : 'MISSING');
console.log('Secret:', SECRET ? SECRET.substring(0, 20) + '...' : 'MISSING');
console.log('='.repeat(60));

if (!CLIENT_ID || !SECRET) {
  console.error('❌ ERROR: Missing credentials in .env file');
  process.exit(1);
}

async function testAuth() {
  try {
    console.log('\n🔄 Attempting authentication...\n');

    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ AUTHENTICATION FAILED\n');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      console.error('\n📝 Possible issues:');
      console.error('  1. Client ID and Secret are from different apps');
      console.error('  2. Using Live credentials in Sandbox mode (or vice versa)');
      console.error('  3. App doesn\'t have necessary permissions');
      console.error('  4. Credentials were copied incorrectly');
      console.error('\n💡 Solution:');
      console.error('  Go to: https://developer.paypal.com/dashboard/applications/sandbox');
      console.error('  Create a NEW app and copy BOTH credentials from the SAME page');
      process.exit(1);
    }

    console.log('✅ AUTHENTICATION SUCCESSFUL!\n');
    console.log('Access Token:', data.access_token.substring(0, 30) + '...');
    console.log('Expires In:', data.expires_in, 'seconds');
    console.log('Token Type:', data.token_type);
    console.log('\n🎉 Your PayPal credentials are working correctly!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testAuth();
