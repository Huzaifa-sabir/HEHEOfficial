"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// ============================================================
// PayPal Client-Side Configuration
// ============================================================
// ⚠️ SECURITY NOTE: Only NEXT_PUBLIC_PAYPAL_CLIENT_ID is exposed to the browser
// The PayPal Secret is NEVER sent to the client - it stays server-side only
// ============================================================

// Validate that client ID is configured
if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
  console.error('❌ NEXT_PUBLIC_PAYPAL_CLIENT_ID is not configured!');
  console.error('Please add it to your .env.local file');
  throw new Error('PayPal Client ID is required. Check your environment variables.');
}

const paypalOptions = {
  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "authorize",  // Must match backend order creation intent
  components: "buttons,funding-eligibility",
  "enable-funding": "card,venmo",  // Enable card and other funding options
  "disable-funding": "paylater,credit",  // Disable paylater and credit if not needed
};

// Log configuration (safe - only shows first 20 chars of client ID)
console.log('✅ PayPal SDK Initialized');
console.log('   Client ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID.substring(0, 20) + '...');
console.log('   Intent:', paypalOptions.intent);
console.log('   Currency:', paypalOptions.currency);

export function PayPalProvider({ children }) {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
