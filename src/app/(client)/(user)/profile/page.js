// pages/profile/ProfilePageRedux.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Trash2,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";
import { useAuth } from "@hooks/useAuth";

export default function ProfilePageRedux() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    actionText: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteData, setDeleteData] = useState({
    password: "",
    confirmText: "",
  });

  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    authStatus,
    loadingStates,
    error,
    successMessage,
    auth,
    getProfile,
    updateProfile,
    updatePassword,
    removeAccount,
    logout,
    clearAllMessages,
  } = useAuth();

  // Fixed useEffect logic
  useEffect(() => {
    // Wait for auth to be initialized
    if (!auth.isInitialized) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated but no user data, fetch profile
    if (isAuthenticated && !user && !loadingStates.profileLoading) {
      getProfile();
      return;
    }

    // If user is loaded but email not verified, redirect to verification
    if (isAuthenticated && user && !isEmailVerified) {
      router.push("/verifyemailpage");
      return;
    }
  }, [
    auth.isInitialized,
    isAuthenticated,
    isEmailVerified,
    user,
    loadingStates.profileLoading,
    router,
    getProfile,
  ]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    if (passwordData.newPassword.length < 6) {
      return;
    }

    try {
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      ).unwrap();
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (err) {
      console.error("Password change failed:", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteData.confirmText !== "DELETE" || !deleteData.password.trim()) {
      return;
    }

    try {
      await removeAccount(deleteData.password).unwrap();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Account deletion failed:", err);
    } finally {
      setShowDeleteModal(false);
      setDeleteData({ password: "", confirmText: "" });
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: "Logout",
      message: "Are you sure you want to logout?",
      onConfirm: () => {
        logout();
        router.push("/login");
        setConfirmModal({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
      actionText: "Logout",
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleDeleteInputChange = (e) => {
    setDeleteData({ ...deleteData, [e.target.name]: e.target.value });
  };

  // Show loading while initializing or loading profile
  if (!auth.isInitialized || loadingStates.profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show user not found only after everything is loaded
  if (auth.isInitialized && isAuthenticated && isEmailVerified && !user && !loadingStates.profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-800 flex items-center justify-center">
        <div className="text-neutral-50 text-xl">User not found</div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-red-500/50 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-600/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-50">
                Delete Account
              </h2>
            </div>

            <div className="mb-6">
              <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-200 text-sm font-medium mb-2">
                  ⚠️ Warning: This action is irreversible!
                </p>
                <p className="text-red-100 text-sm">
                  All your data will be permanently deleted and cannot be
                  recovered.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={deleteData.password}
                    onChange={handleDeleteInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Type &quot;DELETE&quot; to confirm (case sensitive)
                  </label>
                  <input
                    type="text"
                    name="confirmText"
                    value={deleteData.confirmText}
                    onChange={handleDeleteInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Type DELETE here"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteData.confirmText !== "DELETE" ||
                    !deleteData.password.trim() ||
                    loadingStates.deleteAccountLoading
                  }
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-neutral-50 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.deleteAccountLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteData({ password: "", confirmText: "" });
                  }}
                  disabled={loadingStates.deleteAccountLoading}
                  className="flex-1 px-6 py-3 bg-neutral-600 text-neutral-50 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-neutral-50">Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-neutral-50 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-neutral-50">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-neutral-50 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loadingStates.profileUpdateLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-neutral-50 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {loadingStates.profileUpdateLoading
                            ? "Saving..."
                            : "Save"}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            fullName: user?.fullName || "",
                            email: user?.email || "",
                            contactNumber: user?.contactNumber || "",
                          });
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-neutral-600 text-neutral-50 rounded-lg hover:bg-neutral-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-200 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-200 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-neutral-50">
                    Security
                  </h2>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-neutral-50 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="space-y-4">
                    {/* Current Password - Fixed */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={handlePasswordChange}
                        disabled={loadingStates.passwordChangeLoading}
                        className="px-6 py-3 bg-green-600 text-neutral-50 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loadingStates.passwordChangeLoading
                          ? "Changing..."
                          : "Change Password"}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="px-6 py-3 bg-neutral-600 text-neutral-50 rounded-lg hover:bg-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-neutral-50 mb-4">
                  Account Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Email Verified</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isEmailVerified
                          ? "bg-green-600 text-green-100"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {isEmailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Account Type</span>
                    <div className="flex items-center space-x-2">
                      <Shield
                        className={`w-4 h-4 ${
                          user?.isAdmin ? "text-yellow-400" : "text-blue-400"
                        }`}
                      />
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user?.isAdmin
                            ? "bg-yellow-600 text-yellow-100"
                            : "bg-blue-600 text-blue-100"
                        }`}
                      >
                        {user?.isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-neutral-50 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-blue-600 text-neutral-50 rounded-lg hover:bg-blue-700 transition-colors" onClick={()=>router.push('/orders')}>
                    My Orders
                  </button>
                  <button className="w-full px-4 py-3 bg-yellow-600 text-neutral-50 rounded-lg hover:bg-yellow-700 transition-colors" onClick={()=>router.push('/profile/paymentmethods')}>
                    My Payment Methods
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-neutral-50 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {error && (
        <Toast message={error} type="error" onClose={clearAllMessages} />
      )}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={clearAllMessages}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        actionText={confirmModal.actionText}
      />
    </>
  );
}