"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  ArrowLeft,
  Star,
  MoreVertical,
  X,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";
import AddPaymentMethodModalNew from "@components/payments/AddPaymentMethodModalNew";

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  // Toast and Modal states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
    actionText: "",
    type: "warning",
  });

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return null;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.isVerified === false) {
          router.push("/verifyemailpage");
          return null;
        }
        setUserProfile(userData);
        return userData;
      } else if (response.status === 401) {
        localStorage.removeItem("authToken");
        router.push("/login");
        return null;
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Network error while fetching profile");
      return null;
    }
  };

  // Load payment methods
  const loadPaymentMethods = async (userId = null) => {
    try {
      const finalUserId = userId || userProfile?._id;
      if (!finalUserId) {
        console.warn("No user ID available for loading payment methods");
        return;
      }

      const response = await fetch(`/api/user/${finalUserId}/payment-methods`);
      if (!response.ok) {
        throw new Error("Failed to load payment methods");
      }

      const result = await response.json();

      if (result.success) {
        setPaymentMethods(result.data || []);
      } else {
        throw new Error(result.error || "Failed to load payment methods");
      }
    } catch (err) {
      console.error("Failed to load payment methods:", err);
      setError(err.message || "Failed to load payment methods");
      showToast("Failed to load payment methods", "error");
    }
  };

  // Initialize page data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUserProfile();
        if (userData) {
          await loadPaymentMethods(userData._id);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize page");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle adding new payment method
  const handleAddPaymentMethod = (paymentMethodData) => {
    setPaymentMethods((prev) => [...prev, paymentMethodData]);
    setShowAddModal(false);
    showToast("Payment method added successfully", "success");
  };

  // Set default payment method
  const handleSetDefault = async (methodId) => {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `/api/user/${userProfile._id}/payment-methods/${methodId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setPaymentMethods((prev) =>
          prev.map((method) => ({
            ...method,
            is_default: method._id === methodId,
          }))
        );
        showToast("Default payment method updated", "success");
      } else {
        throw new Error(result.error || "Failed to set default payment method");
      }
    } catch (err) {
      console.error("Set default error:", err);
      showToast(err.message || "Failed to set default payment method", "error");
    } finally {
      setProcessing(false);
      setShowActionsMenu(null);
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (methodId) => {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await fetch(
        `/api/user/${userProfile._id}/payment-methods/${methodId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local state
        setPaymentMethods((prev) =>
          prev.filter((method) => method._id !== methodId)
        );
        showToast("Payment method deleted successfully", "success");
      } else {
        throw new Error(result.error || "Failed to delete payment method");
      }

    } catch (err) {
      showToast(err.message || "Failed to delete payment method", "error");
    } finally {
      setProcessing(false);
      setShowActionsMenu(null);
      setConfirmModal({ show: false, title: "", message: "", action: null });
    }
  };

  // Show delete confirmation
  const confirmDelete = (method) => {
    setConfirmModal({
      show: true,
      title: "Delete Payment Method",
      message: `Are you sure you want to delete this payment method (${method.provider} •••• ${method.last_four})? This action cannot be undone.`,
      action: () => handleDeletePaymentMethod(method._id),
      actionText: "Delete",
      type: "danger",
    });
  };

  // Get card brand icon
  const getCardBrandIcon = (provider) => {
    return <CreditCard className="w-6 h-6" />;
  };

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionsMenu(null);
    };

    if (showActionsMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showActionsMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8abcb9]"></div>
          <span className="ml-4 text-white">Loading payment methods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white/95">
                Payment Methods
              </h1>
              <p className="text-white/70 mt-2">
                Manage your saved payment methods for quick and secure checkout
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              disabled={processing}
              className="bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center backdrop-blur-sm">
              <CreditCard className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/95 mb-2">
                No Payment Methods Added
              </h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Add a payment method to make checkout faster and more convenient
                for future orders.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </button>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method._id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                      {getCardBrandIcon(method.provider)}
                    </div>

                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-white/95 capitalize">
                          {method.provider}
                        </h3>
                        <span className="text-white/70 ml-2">
                          •••• {method.last_four}
                        </span>
                        {method.is_default && (
                          <div className="ml-3 flex items-center px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start text-sm text-white/60 mt-1">
                        <span>Line1 : {method.address.line1} </span>
                        <span>City : {method.address.city} </span>
                        <span>Country : {method.address.country} </span>
                        <span>State : {method.address.state} </span>
                        <span>Postal Code : {method.address.postal_code} </span>
                      </div>
                      <div className="flex items-center text-sm text-white/60 mt-1">
                        <span className="flex border">
                          Added{" "}
                          {new Date(method.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionsMenu(
                          showActionsMenu === method._id ? null : method._id
                        );
                      }}
                      disabled={processing}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoreVertical className="w-4 h-4 text-white/70" />
                    </button>

                    {showActionsMenu === method._id && (
                      <div className="absolute right-0 top-10 bg-white/10 border border-white/20 rounded-lg shadow-lg backdrop-blur-sm z-10 min-w-48">
                        {!method.is_default && (
                          <button
                            onClick={() => handleSetDefault(method._id)}
                            disabled={processing}
                            className="w-full px-4 py-2 text-left text-white/85 hover:bg-white/10 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Set as Default
                          </button>
                        )}

                        <button
                          onClick={() => confirmDelete(method)}
                          disabled={processing}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-600/20 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method Details */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center text-white/60">
                    <span>Status: </span>
                    <span className="ml-1 text-green-400 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-400 mb-1">
                Security & Privacy
              </h4>
              <p className="text-sm text-white/70">
                Your payment information is encrypted and securely stored. We
                never store your full card numbers and use industry-standard
                security measures to protect your data.
              </p>
            </div>
          </div>
        </div>

        {/* Add Payment Method Modal */}
        <AddPaymentMethodModalNew
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddPaymentMethod}
          userId={userProfile?._id}
        />
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() =>
          setConfirmModal({ show: false, title: "", message: "", action: null })
        }
        actionText={confirmModal.actionText}
        type={confirmModal.type}
      />
    </div>
  );
}
