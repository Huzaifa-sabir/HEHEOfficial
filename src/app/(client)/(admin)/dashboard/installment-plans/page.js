"use client";

import { useState, useEffect } from "react";
import useIsAdmin from "../hooks/useIsAdmin";
import { Toast , ConfirmationModal } from "@components/ui";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdminInstallmentPlansPage() {
    const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    frequency: "instant",
    num_installments: "",
    description: "",
  });
  const [auth, setAuth] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    planId: null,
  });
  const { isAdmin, adminLoading, adminError, refreshAdminStatus } = useIsAdmin();

  useEffect(() => {
    fetchPlans();
  },[]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/installment-plans");
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        showToast("Failed to fetch installment plans", "error");
        return;
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      showToast("Network error while fetching plans", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.num_installments || !formData.description.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const url = editingPlan
        ? `/api/installment-plans/${editingPlan._id}`
        : "/api/installment-plans";
      const method = editingPlan ? "PUT" : "POST";
      const token = localStorage.getItem("authToken");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          frequency: formData.frequency,
          num_installments: parseInt(formData.num_installments),
          description: formData.description,
        }),
      });

      if (response.ok) {
        const action = editingPlan ? "updated" : "created";
        showToast(`Installment plan ${action} successfully!`, "success");

        setShowForm(false);
        setEditingPlan(null);
        setFormData({
          frequency: "instant",
          num_installments: "",
          description: "",
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to save installment plan",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      showToast("Network error while saving plan", "error");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFormData({
      frequency: plan.frequency,
      num_installments: plan.num_installments.toString(),
      description: plan.description,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({
      isOpen: true,
      planId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/installment-plans/${confirmModal.planId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        showToast("Installment plan deleted successfully!", "success");
        fetchPlans();
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to delete installment plan",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to delete plan:", error);
      showToast("Network error while deleting plan", "error");
    } finally {
      setConfirmModal({ isOpen: false, planId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, planId: null });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      frequency: "instant",
      num_installments: "",
      description: "",
    });
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Checking admin permissions...</span>
      </div>
    );
  }

  // Show adminError state
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

  // Show access denied for non-admin users
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8 text-white/95">
              <button
                onClick={() => router.back()}
                className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white/95">
            Manage Installment Plans
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] font-medium rounded transition-colors duration-200"
          >
            Add Plan
          </button>
        </div>

        {showForm && (
          <div className="border border-white/10 bg-white/5 rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white/95">
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Number Of Installments"
                    value={formData.num_installments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        num_installments: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-neutral-900 border border-white/10 rounded text-white/95 placeholder-white/40 focus:border-[#a4cbc8] focus:outline-none"
                    required
                    min="1"
                  />
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="w-full p-2 bg-neutral-900 border border-white/10 rounded text-white/95 focus:border-[#a4cbc8] focus:outline-none"
                  >
                    <option value="instant">Instant</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 bg-neutral-900 border border-white/10 rounded text-white/95 placeholder-white/40 focus:border-[#a4cbc8] focus:outline-none"
                  rows="3"
                  required
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#8abcb9] hover:bg-[#a4cbc8] text-neutral-800 font-medium rounded transition-colors duration-200"
                  >
                    {editingPlan ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white/5 border border-white/10 rounded"
            >
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white/95">
                  Frequency:{" "}
                  {plan.frequency.charAt(0).toUpperCase() +
                    plan.frequency.slice(1)}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-white/85 opacity-80">
                    Number of Installments: {plan.num_installments}
                  </p>
                  <p className="text-sm text-white/85 opacity-80">
                    Description: {plan.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white/95 font-medium rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(plan._id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white/95 font-medium rounded transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/85 text-lg">No installment plans found.</p>
            <p className="text-white/65 text-sm mt-2">
              Click &quot;Add Plan&quot; to create your first installment plan.
            </p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Delete Installment Plan"
        message="Are you sure you want to delete this installment plan? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}