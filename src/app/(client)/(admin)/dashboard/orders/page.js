"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Database,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";
import useIsAdmin from "../hooks/useIsAdmin";
import { useOrders } from "./useOrders";
import { OrdersTable } from "./OrdersTable";
import { useRouter } from "next/navigation";

// Enhanced Button component
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon: Icon,
  loading = false,
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-[#8abcb9] text-[#0a0a0a] hover:bg-[#a4cbc8] focus:ring-[#8abcb9]",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-white/85 hover:bg-white/5 focus:ring-white/20",
    sync: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    action: null,
    title: "",
    message: "",
    actionText: "",
  });

  const { isAdmin, adminLoading, adminError, refreshAdminStatus } =
    useIsAdmin();
  const {
    orders,
    loading,
    error,
    updating,
    syncing,
    pagination,
    fetchOrders,
    updateOrderStatus,
    updateOrderNotes,
    syncSubscription,
    syncPayments,
    syncAllSubscriptions,
  } = useOrders();

  // Toast functions
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Filter and search orders
  useEffect(() => {
    let filtered = orders;

    if (filter !== "all") {
      filtered = filtered.filter((order) => order.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_id?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user_id?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filter, searchTerm]);

  // Load orders when filter changes (for server-side filtering)
  useEffect(() => {
    fetchOrders(1, 10, filter);
  }, [filter, fetchOrders]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle page changes
  const handlePageChange = (page) => {
    fetchOrders(page, pagination.limit || 10, filter);
  };

  // Handle order status update with toast messages
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);

      if (status === "subscription_active") {
        showToast(
          "Subscription activated! Customer will be charged according to their plan.",
          "success"
        );
      } else if (status === "cancelled") {
        showToast("Order has been cancelled successfully.", "success");
      } else {
        showToast(
          `Order status updated to ${status.replace("_", " ")}`,
          "success"
        );
      }
    } catch (error) {
      showToast(`Failed to update order: ${error.message}`, "error");
    }
  };

  // Handle subscription sync with toast messages
  const handleSyncSubscription = async (orderId) => {
    try {
      await syncSubscription(orderId);
      showToast("Subscription synced successfully", "success");
    } catch (error) {
      showToast(`Failed to sync subscription: ${error.message}`, "error");
    }
  };

  // Handle payments sync with toast messages
  const handleSyncPayments = async (orderId) => {
    try {
      const result = await syncPayments(orderId);
      showToast(
        `Payments synced - ${result.data.updated_payments} payments updated`,
        "success"
      );
    } catch (error) {
      showToast(`Failed to sync payments: ${error.message}`, "error");
    }
  };

  // Handle sync all subscriptions with toast messages
  const handleSyncAllSubscriptions = async () => {
    try {
      const result = await syncAllSubscriptions();
      showToast(
        `Sync completed - ${result.data.successful} successful, ${result.data.failed} failed`,
        result.data.failed > 0 ? "warning" : "success"
      );
    } catch (error) {
      showToast(`Failed to sync all subscriptions: ${error.message}`, "error");
    }
  };

  const handleUpdateOrderNotes = async (orderId, notes) => {
    try {
      await updateOrderNotes(orderId, notes);
      showToast("Notes updated successfully", "success");
    } catch (error) {
      showToast(`Failed to update notes: ${error.message}`, "error");
    }
  };

  // Handle confirmation modal
  const handleConfirmAction = (orderId, action, title, message, actionText) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      action,
      title,
      message,
      actionText,
    });
  };

  const handleConfirmConfirm = () => {
    const { orderId, action } = confirmModal;

    switch (action) {
      case "cancel":
        handleUpdateOrderStatus(orderId, "cancelled");
        break;
      case "sync_all":
        handleSyncAllSubscriptions();
        break;
      default:
        break;
    }

    setConfirmModal({
      isOpen: false,
      orderId: null,
      action: null,
      title: "",
      message: "",
      actionText: "",
    });
  };

  const handleConfirmCancel = () => {
    setConfirmModal({
      isOpen: false,
      orderId: null,
      action: null,
      title: "",
      message: "",
      actionText: "",
    });
  };

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length;
  };

  // Admin permission checks
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Checking admin permissions...</span>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {adminError}
        <button
          onClick={refreshAdminStatus}
          className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You don&apos;t have admin permissions to access this panel.</p>
        <button
          onClick={refreshAdminStatus}
          className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Refresh Permissions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/95 mb-2">
              Order Management
            </h1>
            <p className="text-sm sm:text-base text-white/85">
              Manage and track all customer orders
            </p>
            {error && (
              <div className="mt-3 p-3 bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg text-xs sm:text-sm">
                <strong>Error:</strong> {error}
                <Button
                  onClick={() =>
                    fetchOrders(pagination.page, pagination.limit, filter)
                  }
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-xs"
                  icon={RefreshCw}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4">
            <Button
              onClick={() =>
                handleConfirmAction(
                  null,
                  "sync_all",
                  "Sync All Subscriptions",
                  "This will sync all active subscriptions with Stripe. This may take a few minutes.",
                  "Yes, Sync All"
                )
              }
              variant="sync"
              disabled={syncing.all}
              loading={syncing.all}
              icon={Database}
              className="w-full sm:w-auto text-sm"
            >
              Sync All with Stripe
            </Button>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                size={16}
              />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 lg:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/95 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent text-sm"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                size={16}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white/95 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent appearance-none cursor-pointer text-sm"
              >
                <option value="all">
                  All Orders ({pagination.total || 0})
                </option>
                <option value="pending">
                  Pending ({getStatusCount("pending")})
                </option>
                <option value="kit_paid">
                  Kit Paid ({getStatusCount("kit_paid")})
                </option>
                <option value="full_paid">
                  Kit Paid ({getStatusCount("full_paid")})
                </option>
                <option value="kit_received">
                  Kit Received ({getStatusCount("kit_received")})
                </option>
                <option value="aligner_ready">
                  Aligner Ready ({getStatusCount("aligner_ready")})
                </option>
                <option value="subscription_active">
                  Subscription Active ({getStatusCount("subscription_active")})
                </option>
                <option value="completed">
                  Completed ({getStatusCount("completed")})
                </option>
                <option value="cancelled">
                  Cancelled ({getStatusCount("cancelled")})
                </option>
                <option value="past_due">
                  Past Due ({getStatusCount("past_due")})
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-2 border-[#8abcb9] border-t-transparent mb-4"></div>
            <p className="text-white/85 text-sm sm:text-base">
              Loading orders...
            </p>
          </div>
        ) : (
          <OrdersTable
            orders={searchTerm ? filteredOrders : orders}
            updating={updating}
            syncing={syncing}
            pagination={pagination}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrderNotes={handleUpdateOrderNotes}
            onSyncSubscription={handleSyncSubscription}
            onSyncPayments={handleSyncPayments}
            onConfirmAction={handleConfirmAction}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmConfirm}
        onCancel={handleConfirmCancel}
        actionText={confirmModal.actionText}
      />
    </div>
  );
}
