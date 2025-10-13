"use client";

import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { X, AlertCircle, CheckCircle, Lock, Loader2 } from 'lucide-react';

function PayPalVaultForm({ onSuccess, onError, onClose, userId }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  // Create a simple authorization order for PayPal account verification
  const createAuthorizationOrder = async () => {
    try {
      setError(null);
      console.log('🔄 Creating PayPal authorization for user:', userId);

      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_authorization',
          user_id: userId,
          amount: 0.01, // $0.01 authorization (not charged)
        }),
      });

      console.log('📡 PayPal Authorization Response Status:', response.status);

      const result = await response.json();
      console.log('📦 PayPal Authorization Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create PayPal authorization');
      }

      console.log('✅ PayPal authorization created:', result.order_id);
      return result.order_id;
    } catch (err) {
      console.error('❌ createAuthorizationOrder error:', err);
      setError(err.message);
      onError && onError(err.message);
      throw err;
    }
  };

  const onApprove = async (data) => {
    try {
      setProcessing(true);
      console.log('🎉 PayPal authorization approval received:', data);

      // Get order details to extract PayPal account information
      const orderDetailsResponse = await fetch('/api/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_order_details',
          order_id: data.orderID,
        }),
      });

      if (!orderDetailsResponse.ok) {
        throw new Error('Failed to get PayPal order details');
      }

      const orderDetailsResult = await orderDetailsResponse.json();
      console.log('📦 PayPal order details:', orderDetailsResult);

      if (!orderDetailsResult.success) {
        throw new Error(orderDetailsResult.error || 'Failed to get order details');
      }

      const orderDetails = orderDetailsResult.data;

      // Save the PayPal payment method using the order ID as a reference
      // This is a simplified approach that works without vault permissions
      const saveResponse = await fetch(`/api/user/${userId}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'paypal',
          token: data.orderID, // Use order ID as reference
          is_default: isDefault,
          payer_id: orderDetails.payer?.payer_id || data.payerID || 'unknown',
          email: orderDetails.payer?.email_address || 'Not provided',
          name: orderDetails.payer?.name
            ? `${orderDetails.payer.name.given_name || ''} ${orderDetails.payer.name.surname || ''}`.trim()
            : 'PayPal User',
          // Store additional details for future reference
          details: {
            email: orderDetails.payer?.email_address,
            payer_id: orderDetails.payer?.payer_id,
            name: orderDetails.payer?.name,
            authorization_id: data.orderID,
          }
        }),
      });

      console.log('📡 Payment method save response status:', saveResponse.status);
      const result = await saveResponse.json();
      console.log('📦 Payment method save result:', result);

      if (result.success) {
        console.log('✅ Payment method saved successfully');
        onSuccess(result.data);
      } else {
        throw new Error(result.error || 'Failed to save payment method');
      }
    } catch (err) {
      console.error('❌ onApprove error:', err);
      setError(err.message);
      onError && onError(err.message);
      setProcessing(false);
    }
  };

  const onErrorHandler = (err) => {
    console.error('❌ PayPal Vault Error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    
    let errorMessage = 'Failed to connect PayPal account. Please try again.';
    
    if (err?.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    setError(errorMessage);
    onError && onError(errorMessage);
  };

  return (
    <div className="max-w-md w-full bg-neutral-900 border border-white/20 text-white/95 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#00457C">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.755-4.461z"/>
          </svg>
          <h2 className="text-xl font-semibold">Add PayPal Account</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-white/70 mb-4">
          Connect your PayPal account to save it as a payment method for future purchases.
        </p>

        {/* Information Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-400 mb-2">What happens next?</h4>
          <ul className="text-xs text-white/70 space-y-1">
            <li>• You'll be redirected to PayPal to log in</li>
            <li>• Approve a $0.01 authorization (not charged)</li>
            <li>• Your PayPal account will be saved securely</li>
            <li>• Use your saved account for future purchases</li>
          </ul>
        </div>

        {/* Set as Default Checkbox */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="setDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-[#8abcb9] focus:ring-[#8abcb9] border-white/20 rounded bg-neutral-800"
          />
          <label
            htmlFor="setDefault"
            className="ml-2 block text-sm text-white/80"
          >
            Set as default payment method
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* PayPal Buttons */}
        <div className="mb-4">
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#8abcb9]" />
              <span className="ml-3 text-white/70">Loading PayPal...</span>
            </div>
          ) : (
            <PayPalButtons
              createOrder={createAuthorizationOrder}
              onApprove={onApprove}
              onError={onErrorHandler}
              disabled={processing}
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 48,
                tagline: false,
              }}
              fundingSource="paypal"
              forceReRender={[processing]}
            />
          )}
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-md">
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-400 mr-2" />
              <p className="text-sm text-white/90">
                Saving your PayPal account...
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center text-sm text-white/70 border border-white/20 p-3 rounded-md bg-neutral-800/50">
          <Lock className="w-4 h-4 mr-2 text-[#8abcb9] flex-shrink-0" />
          <span>Your PayPal account is secure and encrypted</span>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-4 border border-white/20 rounded-md text-sm font-medium text-white/80 hover:bg-neutral-800 transition-colors"
          disabled={processing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AddPayPalMethodModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  userId,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <PayPalVaultForm
        onSuccess={onSuccess}
        onError={onError}
        onClose={onClose}
        userId={userId}
      />
    </div>
  );
}
