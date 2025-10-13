"use client";
import React from "react";
import Link from "next/link";
import { Package, Users, ClipboardList, CreditCard, MessageSquare } from "lucide-react";
import useIsAdmin from "./hooks/useIsAdmin";

function Dashboard() {
  const { isAdmin, adminLoading, adminError, refreshAdminStatus } =
    useIsAdmin();

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
    <div className="min-h-screen p-8" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white/95">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/products">
            <div
              className="rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/5 border border-white/10 hover:border-opacity-20"
              style={{ "--hover-accent": "#8abcb9" }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#8abcb9")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8abcb9" }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2 text-white/95">
                Products
              </h2>
              <p className="text-center text-white/85">
                Manage your product inventory
              </p>
            </div>
          </Link>

          <Link href="/dashboard/users">
            <div
              className="rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/5 border border-white/10 hover:border-opacity-20"
              style={{ "--hover-accent": "#8abcb9" }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#8abcb9")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8abcb9" }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2 text-white/95">
                Users
              </h2>
              <p className="text-center text-white/85">Manage user accounts</p>
            </div>
          </Link>

          <Link href="/dashboard/orders">
            <div
              className="rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/5 border border-white/10 hover:border-opacity-20"
              style={{ "--hover-accent": "#8abcb9" }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#8abcb9")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8abcb9" }}
                >
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2 text-white/95">
                Orders
              </h2>
              <p className="text-center text-white/85">
                Track and manage orders
              </p>
            </div>
          </Link>

          <Link href="/dashboard/installment-plans">
            <div
              className="rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/5 border border-white/10 hover:border-opacity-20"
              style={{ "--hover-accent": "#8abcb9" }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#8abcb9")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8abcb9" }}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2 text-white/95">
                Installment Plans
              </h2>
              <p className="text-center text-white/85">Manage payment plans</p>
            </div>
          </Link>

          <Link href="/dashboard/contacts">
            <div
              className="rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/5 border border-white/10 hover:border-opacity-20"
              style={{ "--hover-accent": "#8abcb9" }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#8abcb9")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")
              }
            >
              <div className="flex items-center justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#8abcb9" }}
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-center mb-2 text-white/95">
                Contacts and replies
              </h2>
              <p className="text-center text-white/85">Manage contact messages</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;