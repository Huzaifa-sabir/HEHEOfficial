"use client";

import { ConfirmationModal, Toast } from "@components/ui";
import AdminAPI from "@lib/adminApi";
import {
  ArrowDownNarrowWide,
  Check,
  Eye,
  EyeOff,
  Filter,
  User,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Shield,
  Users,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  UserMinus,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import useIsAdmin from "../hooks/useIsAdmin";
import { useRouter } from "next/navigation";

// Toast Container
const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={onDismiss}
        />
      ))}
    </div>
  );
};

export default function AdminUserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    isVerified: "",
    isAdmin: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [adminApi, setAdminApi] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });
  const { isAdmin, adminLoading, adminError, refreshAdminStatus } =
    useIsAdmin();

  // Toast functions
  const addToast = (message, type = "info") => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Initialize API on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        setAdminApi(new AdminAPI(token));
      } else {
        setError("No admin token found. Please log in.");
      }
    }
  }, []);

  const fetchUsers = async () => {
    if (!adminApi) return;

    try {
      setLoading(true);
      setError("");

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      const response = await adminApi.getAllUsers(cleanFilters);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to fetch users: " + error.message);
      setUsers([]);
      addToast("Failed to fetch users: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    if (!adminApi) return;

    try {
      setError("");
      await adminApi.updateUser(userId, userData);
      setEditingUser(null);
      await fetchUsers();
      addToast("User updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update user:", error);
      setError("Failed to update user: " + error.message);
      addToast("Failed to update user: " + error.message, "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!adminApi) return;

    setConfirmModal({
      isOpen: true,
      type: "danger",
      data: { action: "delete", userId },
      title: "Delete User",
      message:
        "Are you sure you want to delete this user? This action cannot be undone.",
      confirmText: "Delete User",
    });
  };

  const handleBulkAction = async (action) => {
    if (!adminApi) return;

    if (selectedUsers.length === 0) {
      setError("Please select users first");
      addToast("Please select users first", "warning");
      return;
    }

    const actionTitles = {
      verify: "Verify Users",
      unverify: "Unverify Users",
      promote: "Promote Users",
      demote: "Demote Users",
      delete: "Delete Users",
    };

    const actionMessages = {
      verify: `verify ${selectedUsers.length} selected users`,
      unverify: `unverify ${selectedUsers.length} selected users`,
      promote: `promote ${selectedUsers.length} selected users to admin`,
      demote: `demote ${selectedUsers.length} selected users from admin`,
      delete: `delete ${selectedUsers.length} selected users`,
    };

    setConfirmModal({
      isOpen: true,
      type: action === "delete" ? "danger" : "warning",
      data: { action: "bulk", bulkAction: action },
      title: actionTitles[action],
      message: `Are you sure you want to ${actionMessages[action]}?`,
      confirmText: actionTitles[action],
    });
  };

  const handleConfirmAction = async () => {
    const { action, userId, bulkAction } = confirmModal.data;

    try {
      setError("");

      if (action === "delete") {
        await adminApi.deleteUser(userId);
        addToast("User deleted successfully!", "success");
      } else if (action === "bulk") {
        await adminApi.bulkAction(bulkAction, selectedUsers);
        setSelectedUsers([]);
        addToast(`Bulk ${bulkAction} completed successfully!`, "success");
      }

      await fetchUsers();
    } catch (error) {
      console.error("Action failed:", error);
      const message =
        action === "bulk"
          ? `Bulk action failed: ${error.message}`
          : `Failed to delete user: ${error.message}`;
      setError(message);
      addToast(message, "error");
    } finally {
      setConfirmModal({ isOpen: false, type: "", data: null });
    }
  };

  useEffect(() => {
    if (adminApi) {
      fetchUsers();
    }
  }, [adminApi, filters]);

  if (error && !adminApi) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-neutral-900 rounded-2xl shadow-xl p-8 text-center border border-neutral-800">
            <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#fafafa] mb-2">
              Access Denied
            </h2>
            <p className="text-neutral-400 mb-4">{error}</p>
            <p className="text-sm text-neutral-500">
              Please ensure you are logged in as an admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onCancel={() =>
          setConfirmModal({ isOpen: false, type: "", data: null })
        }
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        actionText={confirmModal.confirmText}
        type={confirmModal.type}
      />

      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#8abcb9] to-[#a4cbc8] rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-[#0a0a0a]" size={14} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#8abcb9] to-[#a4cbc8] bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-sm text-neutral-400 hidden sm:block">
                  Manage and monitor user accounts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-600 rounded-xl p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-400">
                  Total Users
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#fafafa]">
                  {pagination.totalUsers || 0}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#8abcb9]/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-[#8abcb9]" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-400">
                  Current Page
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#fafafa]">
                  {pagination.currentPage || 1}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <ArrowDownNarrowWide className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-400">
                  Selected
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#fafafa]">
                  {selectedUsers.length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Check className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-neutral-400">
                  Total Pages
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#fafafa]">
                  {pagination.totalPages || 1}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl border border-neutral-800 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search users by name, email, or contact..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-full pl-4 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-[#fafafa] placeholder-neutral-500 focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9] transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filters.isVerified}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isVerified: e.target.value,
                    page: 1,
                  })
                }
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-[#fafafa] focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9]"
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>

              <select
                value={filters.isAdmin}
                onChange={(e) =>
                  setFilters({ ...filters, isAdmin: e.target.value, page: 1 })
                }
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-[#fafafa] focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9]"
              >
                <option value="">All Types</option>
                <option value="true">Admins</option>
                <option value="false">Users</option>
              </select>

              <button
                onClick={() => fetchUsers()}
                disabled={loading}
                className="px-4 sm:px-6 py-3 bg-[#8abcb9] text-[#0a0a0a] rounded-xl hover:bg-[#a4cbc8] focus:ring-2 focus:ring-[#8abcb9] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-105 font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {loading ? "Loading..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3 p-4 bg-neutral-800 rounded-xl border border-[#8abcb9]/30">
              <span className="text-xs sm:text-sm font-medium text-neutral-300 flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
                {selectedUsers.length} users selected:
              </span>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleBulkAction("verify")}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium transition-all transform hover:scale-105 flex items-center space-x-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleBulkAction("unverify")}
                  className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xs sm:text-sm font-medium transition-all transform hover:scale-105 flex items-center space-x-1"
                >
                  <UserX className="w-4 h-4" />
                  <span>Unverify</span>
                </button>
                <button
                  onClick={() => handleBulkAction("promote")}
                  className="px-3 sm:px-4 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] text-xs sm:text-sm font-medium transition-all transform hover:scale-105 flex items-center space-x-1"
                >
                  <Crown className="w-4 h-4" />
                  <span>Promote</span>
                </button>
                <button
                  onClick={() => handleBulkAction("demote")}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs sm:text-sm font-medium transition-all transform hover:scale-105 flex items-center space-x-1"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Demote</span>
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm font-medium transition-all transform hover:scale-105 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8abcb9]"></div>
            <p className="mt-2 text-neutral-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            No users found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {users.map((user) => (
                <div key={user._id} className="border-b border-neutral-800 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user._id)
                            );
                          }
                        }}
                        className="rounded bg-neutral-700 border-neutral-600 text-[#8abcb9] focus:ring-[#8abcb9]"
                      />
                      <div>
                        <h3 className="font-semibold text-[#fafafa]">
                          {user.fullName}
                        </h3>
                        <p className="text-sm text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] px-3 py-1 rounded-lg text-sm font-medium transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Contact:</span>
                      <span className="text-neutral-300">
                        {user.contactNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Status:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isVerified
                            ? "bg-green-900/50 text-green-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        {user.isVerified ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Unverified
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Role:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isAdmin
                            ? "bg-[#8abcb9]/20 text-[#8abcb9]"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {user.isAdmin ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            User
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Created:</span>
                      <span className="text-neutral-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="min-w-full hidden sm:table">
              <thead>
                <tr className="bg-neutral-800">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map((u) => u._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded bg-neutral-700 border-neutral-600 text-[#8abcb9] focus:ring-[#8abcb9]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user._id)
                            );
                          }
                        }}
                        className="rounded bg-neutral-700 border-neutral-600 text-[#8abcb9] focus:ring-[#8abcb9]"
                      />
                    </td>
                    <td className="px-6 py-4 text-[#fafafa] font-medium">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-neutral-300">{user.email}</td>
                    <td className="px-6 py-4 text-neutral-300">
                      {user.contactNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isVerified
                            ? "bg-green-900/50 text-green-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        {user.isVerified ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Yes
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            No
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isAdmin
                            ? "bg-[#8abcb9]/20 text-[#8abcb9]"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {user.isAdmin ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Yes
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            No
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-all"
            >
              Previous
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
              <span className="text-sm text-neutral-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <span className="text-sm text-neutral-500">
                ({pagination.totalUsers} total users)
              </span>
            </div>

            <button
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6 text-[#fafafa]">
                Edit User
              </h3>
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      defaultValue={editingUser.fullName}
                      placeholder="Full Name"
                      className="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingUser.email}
                      placeholder="Email"
                      className="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      name="contactNumber"
                      defaultValue={editingUser.contactNumber}
                      placeholder="Contact Number"
                      className="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password (leave blank to keep current)"
                        className="w-full bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:ring-2 focus:ring-[#8abcb9] focus:border-[#8abcb9] pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-[#fafafa] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
                    <label className="flex items-center text-neutral-300">
                      <input
                        name="isVerified"
                        type="checkbox"
                        defaultChecked={editingUser.isVerified}
                        className="mr-3 rounded bg-neutral-700 border-neutral-600 text-[#8abcb9] focus:ring-[#8abcb9]"
                      />
                      <UserCheck className="w-4 h-4 mr-2" />
                      Verified User
                    </label>
                    <label className="flex items-center text-neutral-300">
                      <input
                        name="isAdmin"
                        type="checkbox"
                        defaultChecked={editingUser.isAdmin}
                        className="mr-3 rounded bg-neutral-700 border-neutral-600 text-[#8abcb9] focus:ring-[#8abcb9]"
                      />
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Access
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="w-full sm:w-auto px-6 py-2 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fullName = document.querySelector(
                        'input[name="fullName"]'
                      ).value;
                      const email = document.querySelector(
                        'input[name="email"]'
                      ).value;
                      const contactNumber = document.querySelector(
                        'input[name="contactNumber"]'
                      ).value;
                      const password = document.querySelector(
                        'input[name="password"]'
                      ).value;
                      const isVerified = document.querySelector(
                        'input[name="isVerified"]'
                      ).checked;
                      const isAdmin = document.querySelector(
                        'input[name="isAdmin"]'
                      ).checked;

                      const userData = {
                        fullName,
                        email,
                        contactNumber,
                        isVerified,
                        isAdmin,
                      };

                      if (password) {
                        userData.password = password;
                      }

                      handleUpdateUser(editingUser._id, userData);
                    }}
                    className="w-full sm:w-auto px-6 py-2 bg-[#8abcb9] text-[#0a0a0a] rounded-lg hover:bg-[#a4cbc8] transition-all transform hover:scale-105 font-medium"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
