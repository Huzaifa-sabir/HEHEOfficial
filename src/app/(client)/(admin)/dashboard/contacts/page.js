// app/admin/contacts/page.js
"use client";
import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Trash2,
  Reply,
  Eye,
  EyeOff,
  Send,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Toast, ConfirmationModal } from "@components/ui";
import useIsAdmin from "../hooks/useIsAdmin";
import { useRouter } from "next/navigation";

const AdminContactsPage = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    messageId: null,
  });
  const { isAdmin, adminLoading, adminError, refreshAdminStatus } =
    useIsAdmin();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contact");
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({
      isOpen: true,
      messageId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/contact/${confirmModal.messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts(
          contacts.filter((contact) => contact._id !== confirmModal.messageId)
        );
        if (selectedContact?._id === confirmModal.messageId) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setConfirmModal({ isOpen: false, planId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, messageId: null });
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "read" }),
      });

      if (response.ok) {
        setContacts(
          contacts.map((contact) =>
            contact._id === id ? { ...contact, status: "read" } : contact
          )
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedContact) return;

    setIsReplying(true);
    try {
      const response = await fetch(
        `/api/contact/${selectedContact._id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyMessage }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContacts(
          contacts.map((contact) =>
            contact._id === selectedContact._id ? data.contact : contact
          )
        );
        setSelectedContact(data.contact);
        setReplyMessage("");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "unread":
        return <AlertCircle className="text-red-500" size={16} />;
      case "read":
        return <Eye className="text-blue-500" size={16} />;
      case "replied":
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <MessageSquare className="text-neutral-500" size={16} />;
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesFilter = filter === "all" || contact.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusCounts = () => {
    const searchFiltered = contacts.filter((contact) => {
      const matchesSearch =
        searchTerm === "" ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return {
      all: searchFiltered.length,
      unread: searchFiltered.filter((c) => c.status === "unread").length,
      read: searchFiltered.filter((c) => c.status === "read").length,
      replied: searchFiltered.filter((c) => c.status === "replied").length,
    };
  };

  const statusCounts = getStatusCounts();

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading contacts...</div>
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#8abcb9] hover:text-[#a4cbc8] mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <div className="flex gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === status
                    ? "bg-[#8abcb9] text-white"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email, name, or message..."
              className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-neutral-400 mt-2">
              Found {filteredContacts.length} result
              {filteredContacts.length !== 1 ? "s" : ""} for &quot;{searchTerm}&quot;
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 bg-neutral-800 rounded-lg text-center">
                <MessageSquare
                  size={32}
                  className="text-neutral-500 mx-auto mb-3"
                />
                <p className="text-neutral-400">
                  {searchTerm
                    ? "No contacts found matching your search"
                    : "No contacts available"}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className={`p-4 bg-neutral-800 rounded-lg cursor-pointer border transition-all ${
                    selectedContact?._id === contact._id
                      ? "border-[#8abcb9] bg-neutral-700"
                      : "border-neutral-700 hover:border-neutral-600"
                  }`}
                  onClick={() => {
                    setSelectedContact(contact);
                    if (contact.status === "unread") {
                      markAsRead(contact._id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(contact.status)}
                      <h3 className="font-medium truncate">
                        {contact.fullName}
                      </h3>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mb-2">
                    {contact.email}
                  </p>
                  <p className="text-sm text-neutral-300 line-clamp-2">
                    {contact.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white/95">
                        {selectedContact.fullName}
                      </h2>
                      {getStatusIcon(selectedContact.status)}
                      <span className="text-sm bg-white/5 border border-white/10 px-2 py-1 rounded capitalize text-white/85">
                        {selectedContact.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-white/85">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{selectedContact.email}</span>
                      </div>
                      {selectedContact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{selectedContact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(selectedContact._id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Original Message */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-white/95">
                      Original Message
                    </h3>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                      <p className="text-white/85 leading-relaxed">
                        {selectedContact.message}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-white/85">
                        <Clock size={14} />
                        <span>
                          Received:{" "}
                          {new Date(selectedContact.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Replies */}
                  {selectedContact.replies &&
                    selectedContact.replies.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 text-white/95">
                          Previous Replies
                        </h3>
                        <div className="space-y-3">
                          {selectedContact.replies.map((reply, index) => (
                            <div
                              key={index}
                              className="bg-[#8abcb9]/10 border-l-4 border-[#8abcb9] p-4 rounded-r-lg"
                            >
                              <p className="text-white/85 mb-2">
                                {reply.message}
                              </p>
                              <div className="text-sm text-white/85">
                                Sent: {new Date(reply.sentAt).toLocaleString()}{" "}
                                by {reply.sentBy}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Reply Form */}
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-white/95">
                      Send Reply
                    </h3>
                    <div className="space-y-4">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/95 placeholder-white/85 focus:outline-none focus:ring-2 focus:ring-[#8abcb9] focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={sendReply}
                          disabled={!replyMessage.trim() || isReplying}
                          className="flex items-center gap-2 bg-[#8abcb9] text-white/95 px-6 py-2 rounded-lg hover:bg-[#a4cbc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                          {isReplying ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                <MessageSquare
                  size={48}
                  className="text-white/85 mx-auto mb-4"
                />
                <h3 className="text-xl font-medium text-white/95 mb-2">
                  No Contact Selected
                </h3>
                <p className="text-white/85">
                  Select a contact from the list to view details and send
                  replies
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Delete Installment Plan"
        message="Are you sure you want to delete this installment plan? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default AdminContactsPage;
