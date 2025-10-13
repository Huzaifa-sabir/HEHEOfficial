"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Eye,
  MoreVertical,
  RefreshCw,
  X,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statistics, setStatistics] = useState({});

  // Toast and Modal states
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    orderId: null,
    title: "",
    message: "",
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // Sync user data with Stripe
  const syncUserData = async (showNotification = false) => {
    const token = getAuthToken();
    if (!token) return;

    setSyncing(true);

    try {
      const response = await fetch("/api/stripe/sync/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sync_all_user_data",
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (showNotification) {
          showToast(
            `Sync completed! ${result.data.synced_subscriptions} subscriptions and ${result.data.synced_payments} payments updated.`,
            "success"
          );
        }
      } else {
        if (showNotification) {
          showToast(result.error || "Failed to sync data", "error");
        }
      }
    } catch (err) {
      console.error("Error syncing user data:", err);
      if (showNotification) {
        showToast("Failed to sync data with Stripe", "error");
      }
    }

    setSyncing(false);
  };

  // Check if user is authenticated and sync data
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Auto sync data when page loads
    syncUserData();

    // Then load orders
    loadOrders();
  }, [pagination.currentPage, statusFilter, dateFilter]);

  const loadOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to view your orders");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/user/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
        setStatistics(result.data.statistics || {});
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders");
      showToast("Failed to load orders", "error");
    }

    setLoading(false);
  };

  const handleManualSync = async () => {
    await syncUserData(true);
    // Reload orders after sync
    await loadOrders();
  };

  const handleCancelOrder = (orderId) => {
    setConfirmModal({
      show: true,
      orderId,
      title: "Cancel Order",
      message:
        "Are you sure you want to cancel this order? This action cannot be undone.",
    });
  };

  const confirmCancelOrder = async () => {
    const token = getAuthToken();
    if (!token) return;

    const { orderId } = confirmModal;

    try {
      const response = await fetch(`/api/user/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        showToast("Order cancelled successfully", "success");
        loadOrders();
      } else {
        showToast(result.error || "Failed to cancel order", "error");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast("Failed to cancel order", "error");
    }

    setConfirmModal({ show: false, orderId: null, title: "", message: "" });
  };

  const cancelConfirmModal = () => {
    setConfirmModal({ show: false, orderId: null, title: "", message: "" });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      kit_paid: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      full_paid: "bg-green-600/20 text-green-400 border-green-600/30",
      kit_received: "bg-purple-600/20 text-purple-400 border-purple-600/30",
      aligner_ready: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
      subscription_active: "bg-green-600/20 text-green-400 border-green-600/30",
      completed: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
      cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
    };
    return colors[status] || "bg-white/10 text-white/70 border-white/20";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      kit_paid: "Kit Paid",
      full_paid: "full Paid",
      kit_received: "Kit Received",
      aligner_ready: "Aligner Ready",
      subscription_active: "Active Subscription",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return texts[status] || status;
  };

  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.impression_kit_product_id?.name
          ?.toLowerCase()
          .includes(searchLower) ||
        order.aligner_product_id?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8abcb9] mx-auto mb-4"></div>
          <p className="text-white/70">
            {syncing
              ? "Syncing your data with Stripe..."
              : "Loading your orders..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white/95">My Orders</h1>
              <p className="text-white/85 mt-2">
                Track your orders and manage your aligners
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sync Button */}
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 disabled:opacity-50 transition-colors duration-200 font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Syncing..." : "Sync Data"}
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadOrders}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] disabled:opacity-50 transition-colors duration-200 font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Sync Status Indicator */}
          {syncing && (
            <div className="mt-3 flex items-center text-sm text-purple-400">
              <div className="animate-pulse w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              Syncing your subscription and payment data with Stripe...
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Orders",
              value: pagination.totalOrders,
              color: "[#8abcb9]",
              icon: Package,
            },
            {
              label: "Active Subscriptions",
              value: statistics.subscription_active?.count || 0,
              color: "green-400",
              icon: CreditCard,
            },
            {
              label: "Pending Orders",
              value: statistics.pending?.count || 0,
              color: "yellow-400",
              icon: Calendar,
            },
            {
              label: "Completed Orders",
              value: statistics.completed?.count || 0,
              color: "emerald-400",
              icon: Package,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/85">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-white/95">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg mb-6 backdrop-blur-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/95 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/95 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all" className="bg-[#1a1a1a] text-white/95">
                    All Status
                  </option>
                  <option
                    value="pending"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Pending
                  </option>
                  <option
                    value="kit_paid"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Kit Paid
                  </option>
                  <option
                    value="full_paid"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    full Paid
                  </option>
                  <option
                    value="kit_received"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Kit Received
                  </option>
                  <option
                    value="aligner_ready"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Aligner Ready
                  </option>
                  <option
                    value="subscription_active"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Active Subscription
                  </option>
                  <option
                    value="completed"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Completed
                  </option>
                  <option
                    value="cancelled"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    Cancelled
                  </option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/95 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent appearance-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all" className="bg-[#1a1a1a] text-white/95">
                    All Time
                  </option>
                  <option value="today" className="bg-[#1a1a1a] text-white/95">
                    Today
                  </option>
                  <option value="week" className="bg-[#1a1a1a] text-white/95">
                    This Week
                  </option>
                  <option value="month" className="bg-[#1a1a1a] text-white/95">
                    This Month
                  </option>
                  <option
                    value="quarter"
                    className="bg-[#1a1a1a] text-white/95"
                  >
                    This Quarter
                  </option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center">
                <span className="text-sm text-white/85">
                  Showing {filteredOrders.length} of {pagination.totalOrders}{" "}
                  orders
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center justify-between backdrop-blur-sm">
            <span className="text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="overflow-x-auto overflow-y-clip">
            <table className="min-w-full  divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Payment Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/85 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/85 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                    onClick={() => router.push(`/orders/${order._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-white/70 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white/95">
                            #{order._id.slice(-8)}
                          </div>
                          <div className="text-sm text-white/70">
                            Order ID: {order._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white/95">
                          {order.impression_kit_product_id?.name ||
                            "Impression Kit"}
                        </div>
                        <div className="text-sm text-white/70">
                          {order.aligner_product_id?.name || "Custom Aligner"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {order?.total_amount !== order?.initial_payment_amount ? (
                        <>
                          <div className="text-sm text-white/95">
                            {order.installment_plan_id?.num_installments}x{" "}
                            {order.installment_plan_id?.frequency}
                          </div>
                          <div className="text-sm text-white/70">
                            $
                            {(
                              (order.aligner_product_id?.price || 0) /
                              (order.installment_plan_id?.num_installments || 1)
                            ).toFixed(2)}{" "}
                            each
                          </div>{" "}
                        </>
                      ) : (
                        <div className="bg-green-600/20 text-green-400 border-green-600/30 inline-flex px-3 py-1 text-xs font-medium rounded-lg border">
                          Instant Paid
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white/95">
                        ${order.total_amount?.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/70">
                        ${order.initial_payment_amount?.toFixed(2)} paid
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/95">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/orders/${order._id}`)}
                          className="text-[#8abcb9] hover:text-[#a4cbc8] transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <div className="relative group">
                          <button className="text-white/70 hover:text-white/95 transition-colors duration-200">
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <div className="absolute right-0 z-20 mt-2 w-48 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-sm">
                            <div className="py-1">
                              <button
                                onClick={() =>
                                  router.push(`/orders/${order._id}`)
                                }
                                className="block px-4 py-2 text-sm text-white/95 hover:bg-white/10 w-full text-left transition-colors duration-200"
                              >
                                View Details
                              </button>
                              {order.status !== "cancelled" &&
                                order.status !== "completed" && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="block px-4 py-2 text-sm text-red-400 hover:bg-red-600/10 w-full text-left transition-colors duration-200"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/95 mb-2">
                No orders found
              </h3>
              <p className="text-white/70 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't placed any orders yet"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => router.push("/products")}
                  className="inline-flex items-center px-4 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] transition-colors duration-200 font-medium"
                >
                  Browse Products
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white/5 px-6 py-4 border-t border-white/10 z-10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/85">
                  Showing page {pagination.currentPage} of{" "}
                  {pagination.totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage - 1,
                      }))
                    }
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 bg-white/10 border border-white/20 text-white/95 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1 bg-[#8abcb9] text-[#0a0a0a] rounded text-sm font-medium">
                    {pagination.currentPage}
                  </span>

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage + 1,
                      }))
                    }
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 bg-white/10 border border-white/20 text-white/95 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
        onConfirm={confirmCancelOrder}
        onCancel={cancelConfirmModal}
        actionText="Cancel Order"
        type="danger"
      />
    </div>
  );
}
