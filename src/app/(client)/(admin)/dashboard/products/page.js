"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import useIsAdmin from "../hooks/useIsAdmin";
import { Toast, ConfirmationModal } from "@components/ui";
import { useRouter } from "next/navigation";

// Product Form Modal Component
function ProductFormModal({ isOpen, onClose, editingProduct, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    type: "impression-kit",
    isActive: true,
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price.toString(),
        discountPrice: editingProduct.discountPrice.toString(),
        type: editingProduct.type,
        isActive: editingProduct.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        type: "impression-kit",
        isActive: true,
      });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#fafafa]">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/85" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#fafafa] mb-1">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:border-[#8abcb9] focus:ring-1 focus:ring-[#8abcb9] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#fafafa] mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:border-[#8abcb9] focus:ring-1 focus:ring-[#8abcb9] transition-colors resize-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#fafafa] mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:border-[#8abcb9] focus:ring-1 focus:ring-[#8abcb9] transition-colors"
              required
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#fafafa] mb-1">
              Discount %age
            </label>
            <input
              type="number"
              step="1"
              placeholder="% off for instant payment"
              value={formData.discountPrice}
              onChange={(e) =>
                setFormData({ ...formData, discountPrice: e.target.value })
              }
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-lg text-[#fafafa] placeholder-neutral-500 focus:border-[#8abcb9] focus:ring-1 focus:ring-[#8abcb9] transition-colors "
              required
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#fafafa] mb-1">
              Product Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-lg text-[#fafafa] focus:border-[#8abcb9] focus:ring-1 focus:ring-[#8abcb9] transition-colors"
            >
              <option value="impression-kit">Impression Kit</option>
              <option value="aligners">Aligners</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only"
              />
              <label
                htmlFor="isActive"
                className={`flex items-center cursor-pointer p-1 rounded-lg transition-colors ${
                  formData.isActive ? "bg-[#8abcb9]" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded transform transition-transform ${
                    formData.isActive
                      ? "translate-x-0 bg-white"
                      : "translate-x-0 bg-neutral-400"
                  }`}
                />
              </label>
            </div>
            <span className="text-sm font-medium text-[#fafafa]">
              Active Product
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-600 text-neutral-300 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] font-medium rounded-lg transition-colors"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    actionText: "",
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin, adminLoading, adminError, refreshAdminStatus } =
    useIsAdmin();

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const token = localStorage.getItem("authToken");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
        showToast(
          editingProduct
            ? "Product updated successfully!"
            : "Product created successfully!",
          "success"
        );
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      showToast("Failed to save product", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (product) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(product._id),
    });
  };

  const confirmDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProducts();
        showToast("Product deleted successfully!", "success");
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast("Failed to delete product", "error");
    }
    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  const handleToggleStatusClick = (product) => {
    const action = product.isActive ? "deactivate" : "activate";
    setConfirmModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Product`,
      message: `Are you sure you want to ${action} "${product.name}"?`,
      onConfirm: () => confirmToggleStatus(product),
      actionText: action.charAt(0).toUpperCase() + action.slice(1),
    });
  };

  const confirmToggleStatus = async (product) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
        }),
      });

      if (response.ok) {
        fetchProducts();
        showToast(
          `Product ${
            product.isActive ? "deactivated" : "activated"
          } successfully!`,
          "success"
        );
      } else {
        throw new Error("Failed to update product status");
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
      showToast("Failed to update product status", "error");
    }
    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
  };

  const handleCancelAction = () => {
    setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8abcb9] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/85">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white/95">
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Management</h1>
            <p className="text-white/85">
              Manage your dental products and services
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Package className="w-5 h-5 text-[#8abcb9]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#fafafa]">
                  {products.length}
                </p>
                <p className="text-sm text-white/85">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Eye className="w-5 h-5 text-[#8abcb9]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#fafafa]">
                  {products.filter((p) => p.isActive).length}
                </p>
                <p className="text-sm text-white/85">Active Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <EyeOff className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#fafafa]">
                  {products.filter((p) => !p.isActive).length}
                </p>
                <p className="text-sm text-white/85">Inactive Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className={`bg-white/5 border border-white/10 rounded-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                  !product.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white/95 mb-1">
                        {product.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-white/5 text-emerald-600"
                            : "bg-red-600/20 text-red-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <span className="bg-white/5 text-white/95 px-3 py-1 rounded-full text-xs font-medium">
                      {product.type.replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-white/85 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[#fafafa]">
                      ${product.price}
                    </span>
                  </div>
                  {product.discountPrice != 0 && (
                    <div className="mb-4">
                      <span className="text-md  text-[#fafafa]">
                        {product.discountPrice}% off For Instant Payment
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-neutral-500 mb-4 space-y-1">
                    <div>
                      Created:{" "}
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                    {product.updatedAt !== product.createdAt && (
                      <div>
                        Updated:{" "}
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#8abcb9]  text-neutral-800 hover:bg-[#a4cbc8] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatusClick(product)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-white/95 text-sm rounded-lg transition-colors ${
                        product.isActive
                          ? " bg-yellow-600 hover:bg-yellow-700"
                          : " bg-neutral-700 hover:bg-neutral-800"
                      }`}
                    >
                      {product.isActive ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-600 text-white/95 hover:bg-red-700 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-700 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#fafafa] mb-2">
              No products found
            </h3>
            <p className="text-white/85 mb-6">
              Get started by adding your first product
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8abcb9] hover:bg-[#a4cbc8] text-[#0a0a0a] font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        actionText={confirmModal.actionText}
      />
    </div>
  );
}
