import { useState, useEffect, useCallback } from "react";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [syncing, setSyncing] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 10,
  });

  // Fetch orders from API with pagination
  const fetchOrders = useCallback(
    async (page = 1, limit = 10, status = null) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status && status !== "all") {
          params.append("status", status);
        }

        const response = await fetch(`/api/admin/orders?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setOrders(data.data || []);
          setPagination(data.pagination || { total: 0, page: 1, pages: 0 });
        } else {
          throw new Error(data.error || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError(error.message);
        setOrders([]);
        setPagination({ total: 0, page: 1, pages: 0 });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Handle subscription creation
  const createSubscription = async (orderId) => {
    try {
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_subscription",
          order_id: orderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create subscription");
      }

      return data.data;
    } catch (error) {
      console.error("Failed to create subscription:", error);
      throw error;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating((prev) => ({ ...prev, [orderId]: true }));

      if (status === "subscription_active") {
        try {
          await createSubscription(orderId);
        } catch (subscriptionError) {
          throw new Error(
            `Failed to create subscription: ${subscriptionError.message}`
          );
        }
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          )
        );
        return { success: true, status };
      } else {
        throw new Error(data.error || "Failed to update order");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error;
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const updateOrderNotes = async (orderId, notes) => {
    try {
      setUpdating((prev) => ({ ...prev, [`${orderId}_notes`]: true }));

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, notes, updated_at: new Date().toISOString() }
              : order
          )
        );
        return { success: true };
      } else {
        throw new Error(data.error || "Failed to update notes");
      }
    } catch (error) {
      console.error("Failed to update notes:", error);
      throw error;
    } finally {
      setUpdating((prev) => ({ ...prev, [`${orderId}_notes`]: false }));
    }
  };

  // Sync subscription with Stripe
  const syncSubscription = async (orderId) => {
    try {
      setSyncing((prev) => ({ ...prev, [orderId]: true }));

      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_subscription",
          order_id: orderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchOrders(pagination.page, pagination.limit);
        return { success: true };
      } else {
        throw new Error(data.error || "Failed to sync");
      }
    } catch (error) {
      console.error("Failed to sync subscription:", error);
      throw error;
    } finally {
      setSyncing((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Sync payments for an order
  const syncPayments = async (orderId) => {
    try {
      setSyncing((prev) => ({ ...prev, [`${orderId}_payments`]: true }));

      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_payments",
          order_id: orderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchOrders(pagination.page, pagination.limit);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || "Failed to sync payments");
      }
    } catch (error) {
      console.error("Failed to sync payments:", error);
      throw error;
    } finally {
      setSyncing((prev) => ({ ...prev, [`${orderId}_payments`]: false }));
    }
  };

  // Sync all subscriptions
  const syncAllSubscriptions = async () => {
    try {
      setSyncing((prev) => ({ ...prev, all: true }));

      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_all_subscriptions",
          limit: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchOrders(pagination.page, pagination.limit);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || "Failed to sync all subscriptions");
      }
    } catch (error) {
      console.error("Failed to sync all subscriptions:", error);
      throw error;
    } finally {
      setSyncing((prev) => ({ ...prev, all: false }));
    }
  };

  return {
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
  };
};
