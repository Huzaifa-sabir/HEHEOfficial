import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@hooks/useAuth";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Stripe supported countries
const STRIPE_COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "LV", name: "Latvia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ffffff", // White text for dark theme
      backgroundColor: "#1a1a1a", // Dark background
      "::placeholder": {
        color: "#737373", // Gray placeholder text
      },
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSmoothing: "antialiased",
    },
    invalid: {
      color: "#ef4444", // Red for errors (more vibrant for dark theme)
    },
    complete: {
      color: "#8abcb9", // Green for completed fields
    },
  },
  hidePostalCode: false,
};

function PaymentMethodForm({
  onSuccess,
  onError,
  onClose,
  userId,
  defaultValue = false,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [isDefault, setIsDefault] = useState(defaultValue);
  const { getProfile } = useAuth();
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
  });

  const fetchDataFromProfile = async () => {
    try {
      const result = await getProfile();
      if (result.payload.fullName && result.payload.email) {
        const profile = result.payload;
        setBillingDetails(prev => ({
          ...prev,
          name: profile.fullName || "",
          email: profile.email || "",
        }));
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchDataFromProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || processing) {
      return;
    }

    if (!cardComplete) {
      setError("Please complete your card information.");
      return;
    }

    if (!billingDetails.name || !billingDetails.email) {
      setError("Please fill in your name and email.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Generate idempotency key to prevent duplicates
      const idempotencyKey = `pm_${userId}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create customer first if needed (with idempotency)
      const customerResponse = await fetch("/api/stripe/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `customer_${userId}_${billingDetails.email.replace(
            "@",
            "_"
          )}`,
        },
        body: JSON.stringify({
          user_id: userId,
          email: billingDetails.email,
          name: billingDetails.name,
        }),
      });

      const customerResult = await customerResponse.json();
      if (!customerResult.success) {
        throw new Error(customerResult.error);
      }

      const customerId = customerResult.data.customer_id;

      // Create payment method with idempotency
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: billingDetails,
        });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        return;
      }

      // Attach payment method with idempotency
      const attachResponse = await fetch("/api/stripe/attach-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: customerId,
        }),
      });

      const attachResult = await attachResponse.json();
      if (!attachResult.success) {
        throw new Error(attachResult.error);
      }
      // Save to user's profile with duplicate check
      const saveResponse = await fetch(`/api/user/${userId}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          provider: "stripe",
          token: paymentMethod.id,
          customer_id: customerId,
          address: billingDetails.address,
          last_four: paymentMethod.card.last4,
          is_default: isDefault,
          idempotency_key: idempotencyKey, // Include for duplicate prevention
        }),
      });

      const saveResult = await saveResponse.json();
      if (saveResult.success) {
        onSuccess(saveResult.data);
      } else {
        setError(saveResult.error);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      onError && onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setError(event.error ? event.error.message : null);
  };

  return (
    <div className="max-w-md w-full bg-neutral-900 border border-white/20 text-white/95 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 text-[#8abcb9] mr-2" />
          <h2 className="text-xl font-semibold ">Add Payment Method</h2>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-200 hover:text-neutral-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Billing Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              placeholder="John Doe"
              value={billingDetails.name}
              onChange={(e) =>
                setBillingDetails({ ...billingDetails, name: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              placeholder="john@example.com"
              value={billingDetails.email}
              onChange={(e) =>
                setBillingDetails({ ...billingDetails, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-neutral-200 mb-1">
            Card Information *
          </label>
          <div className="border border-white/20 rounded-md px-3 py-3 focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] bg-neutral-800">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-neutral-200 mb-1"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
            placeholder="123 Main St"
            value={billingDetails.address.line1}
            onChange={(e) =>
              setBillingDetails({
                ...billingDetails,
                address: { ...billingDetails.address, line1: e.target.value },
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              placeholder="San Francisco"
              value={billingDetails.address.city}
              onChange={(e) =>
                setBillingDetails({
                  ...billingDetails,
                  address: { ...billingDetails.address, city: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              State/Province
            </label>
            <input
              type="text"
              id="state"
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              placeholder="CA"
              value={billingDetails.address.state}
              onChange={(e) =>
                setBillingDetails({
                  ...billingDetails,
                  address: { ...billingDetails.address, state: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="postal_code"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              ZIP/Postal Code
            </label>
            <input
              type="text"
              id="postal_code"
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              placeholder="94105"
              value={billingDetails.address.postal_code}
              onChange={(e) =>
                setBillingDetails({
                  ...billingDetails,
                  address: {
                    ...billingDetails.address,
                    postal_code: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-neutral-200 mb-1"
            >
              Country *
            </label>
            <select
              id="country"
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#8abcb9] focus:border-[#8abcb9] text-white"
              value={billingDetails.address.country}
              onChange={(e) =>
                setBillingDetails({
                  ...billingDetails,
                  address: {
                    ...billingDetails.address,
                    country: e.target.value,
                  },
                })
              }
            >
              {STRIPE_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Set as Default */}
        <div className="flex items-center">
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
          <div className="flex items-center p-3 bg-red-900/20 border border-red-600/20 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center text-sm text-white/70 border border-white/20 p-3 rounded-md bg-neutral-800/50">
          <Lock className="w-4 h-4 mr-2 text-[#8abcb9]" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-white/20 rounded-md text-sm font-medium text-neutral-200 hover:bg-neutral-800"
            disabled={processing}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-black/90 transition-colors ${
              processing || !cardComplete
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-[#8abcb9] hover:bg-[#7ba8a5] focus:outline-none focus:ring focus:ring-[#8abcb9]"
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              "Add Payment Method"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Elements stripe={stripePromise}>
        <PaymentMethodForm
          onSuccess={onSuccess}
          onClose={onClose}
          userId={userId}
        />
      </Elements>
    </div>
  );
}