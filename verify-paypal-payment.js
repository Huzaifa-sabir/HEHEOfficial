#!/usr/bin/env node

/**
 * PayPal Payment Verification Script
 * 
 * This script helps you verify PayPal payments in sandbox mode.
 * It checks your PayPal developer dashboard for recent transactions.
 */

const https = require('https');

// PayPal Sandbox API Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

console.log('🔍 PayPal Payment Verification Tool');
console.log('=====================================');

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
  console.error('❌ Error: PayPal credentials not found in environment variables');
  console.log('Make sure PAYPAL_CLIENT_ID and PAYPAL_SECRET are set in your .env file');
  process.exit(1);
}

console.log('✅ PayPal credentials found');
console.log(`📋 Client ID: ${PAYPAL_CLIENT_ID.substring(0, 10)}...`);
console.log(`🔐 Secret: ${PAYPAL_SECRET.substring(0, 10)}...`);
console.log('');

// Get access token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.access_token) {
            console.log('✅ PayPal access token obtained');
            resolve(result.access_token);
          } else {
            reject(new Error('Failed to get access token: ' + JSON.stringify(result)));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write('grant_type=client_credentials');
    req.end();
  });
}

// Get recent orders
async function getRecentOrders(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-m.sandbox.paypal.com',
      port: 443,
      path: '/v2/checkout/orders?page_size=10&sort_order=desc',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main verification function
async function verifyPayments() {
  try {
    console.log('🔄 Getting PayPal access token...');
    const accessToken = await getAccessToken();
    
    console.log('🔄 Fetching recent orders...');
    const orders = await getRecentOrders(accessToken);
    
    console.log('');
    console.log('📊 Recent PayPal Orders:');
    console.log('========================');
    
    if (orders.orders && orders.orders.length > 0) {
      orders.orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Intent: ${order.intent}`);
        console.log(`   Created: ${new Date(order.create_time).toLocaleString()}`);
        
        if (order.purchase_units && order.purchase_units.length > 0) {
          const unit = order.purchase_units[0];
          console.log(`   Amount: ${unit.amount.currency_code} ${unit.amount.value}`);
          console.log(`   Description: ${unit.description || 'N/A'}`);
        }
        
        if (order.payer) {
          console.log(`   Payer Email: ${order.payer.email_address || 'N/A'}`);
        }
      });
    } else {
      console.log('No orders found');
    }
    
    console.log('');
    console.log('💡 How to verify payments:');
    console.log('1. Check the order status above');
    console.log('2. Visit PayPal Developer Dashboard: https://developer.paypal.com/');
    console.log('3. Go to your sandbox account transactions');
    console.log('4. Look for orders with status "COMPLETED" or "APPROVED"');
    
  } catch (error) {
    console.error('❌ Error verifying payments:', error.message);
  }
}

// Run verification
verifyPayments();
