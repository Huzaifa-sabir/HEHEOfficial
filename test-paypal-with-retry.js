// Test PayPal connection WITH retry logic
require('dotenv').config({ path: '.env.local' });

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Retry helper function with exponential backoff
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log(`✅ Attempt ${attempt} succeeded!`);
      return response;
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

async function testPayPalCredentials() {
  console.log('🔐 Testing PayPal Credentials WITH Retry Logic...\n');

  console.log('Environment:');
  console.log('  PAYPAL_MODE:', process.env.PAYPAL_MODE || 'sandbox (default)');
  console.log('  API URL:', PAYPAL_API);
  console.log('  Client ID:', process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.substring(0, 20) + '...' : '❌ MISSING');
  console.log('  Secret:', process.env.PAYPAL_SECRET ? process.env.PAYPAL_SECRET.substring(0, 20) + '...' : '❌ MISSING');
  console.log();

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
    console.error('❌ PAYPAL_CLIENT_ID or PAYPAL_SECRET is missing in .env.local');
    process.exit(1);
  }

  try {
    console.log('🔄 Attempting to authenticate with PayPal...\n');

    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

    const response = await fetchWithRetry(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Authentication Failed!');
      console.error('Status:', response.status);
      console.error('Response:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    console.log('\n✅ SUCCESS! PayPal credentials are valid!\n');
    console.log('Access Token (first 40 chars):', data.access_token.substring(0, 40) + '...');
    console.log('Token Type:', data.token_type);
    console.log('Expires In:', data.expires_in, 'seconds');
    console.log('App ID:', data.app_id);
    console.log();
    console.log('🎉 Your PayPal integration is ready to use!');

  } catch (error) {
    console.error('\n❌ FAILED after all retries!');
    console.error('Error:', error.message);

    if (error.message.includes('EAI_AGAIN') || error.message.includes('ENOTFOUND')) {
      console.error('\n💡 This is a network/DNS issue. Suggestions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Try disabling VPN if you have one');
      console.error('   3. Flush DNS: ipconfig /flushdns');
      console.error('   4. Try again in a few minutes');
    } else if (error.message.includes('aborted')) {
      console.error('\n💡 Request timed out after 10 seconds. Network might be slow.');
    }

    process.exit(1);
  }
}

testPayPalCredentials();
