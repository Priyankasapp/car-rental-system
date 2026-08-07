"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Reply,
  CheckCircle,
  Trash2,
  Save,
  Send,
  X,
  Check,
} from "lucide-react";

interface ServiceInfo {
  id: string;
  name: string;
}

interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM" | "ARCHIVED";
  adminNotes?: string | null;
  createdAt: string;
  service?: ServiceInfo | null;
}

export default function MessageDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();

  const [message, setMessage] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes state
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Reply Modal states
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch inquiry data from API
  useEffect(() => {
    async function fetchMessage() {
      if (!id) {
        setError("Invalid message ID");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/contacts/${id}`);
        const data = await res.json();
        if (res.ok && data.contact) {
          setMessage(data.contact);
          setAdminNotes(data.contact.adminNotes || "");
        } else {
          setError(data?.error || data?.message || "Failed to load message details");
        }
      } catch (err) {
        console.error("Failed to load message:", err);
        setError("Failed to load message details");
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [id]);

  // Update Status Handler
  const handleUpdateStatus = async (newStatus: ContactDetail["status"]) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.contact);
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  // Save Internal Notes Handler
  const handleSaveNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    setNotesSavedSuccess(false);

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.contact);
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 3000);
      } else {
        alert("Failed to save notes.");
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  // Delete Inquiry Handler
  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/messages");
      } else {
        alert("Failed to delete message.");
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message.");
    }
  };

  // Send Reply Email Handler
  const handleSendReply = async () => {
    if (!id || !replyText.trim() || !message) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/contacts/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: message.email,
          firstName: message.firstName,
          replyMessage: replyText,
          subject: `Re: ${message.service?.name || "Rental Inquiry"} - UrbanDrive`,
        }),
      });

      if (res.ok) {
        setIsReplyOpen(false);
        setReplyText("");
        await handleUpdateStatus("RESOLVED");
        alert("Reply sent successfully!");
      } else {
        const data = await res.json();
        alert(data?.error || "Failed to send reply.");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading message details...
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p className="mb-4 text-lg">{error || "Message not found."}</p>
        <Link href="/admin/messages" className="font-semibold text-black underline">
          Back to Messages
        </Link>
      </div>
    );
  }

  const fullName = `${message.firstName} ${message.lastName}`.trim();
  const formattedDate = new Date(message.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/messages"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Messages
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Message Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View customer inquiry and respond.
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              message.status === "RESOLVED"
                ? "bg-blue-100 text-blue-700"
                : message.status === "IN_PROGRESS"
                ? "bg-amber-100 text-amber-700"
                : message.status === "SPAM"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.status.replace("_", " ").toLowerCase()}
          </span>
        </div>

        {/* Customer Info */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Customer Information</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <User className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Mail className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{message.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Phone className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{message.phone || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Calendar className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Received</p>
                <p className="text-gray-900">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Subject / Service</h2>
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            {message.service?.name || "General Rental Inquiry"}
          </h3>
        </div>

        {/* Message */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Message</h2>

          <div className="whitespace-pre-line rounded-xl bg-gray-50 p-5 leading-7 text-gray-700">
            {message.message}
          </div>
        </div>

        {/* Internal Notes */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Internal Notes</h2>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {notesSavedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </>
              )}
            </button>
          </div>

          <textarea
            rows={5}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes..."
            className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-black"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            onClick={() =>
              handleUpdateStatus(
                message.status === "RESOLVED" ? "IN_PROGRESS" : "RESOLVED"
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-100"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            {message.status === "RESOLVED"
              ? "Mark as Pending"
              : "Mark as Resolved"}
          </button>

          <button
            onClick={() => setIsReplyOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            <Reply className="h-5 w-5" />
            Reply
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-5 w-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Reply Modal */}
      {isReplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                Reply to {fullName}
              </h3>
              <button
                onClick={() => setIsReplyOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  TO
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${fullName} <${message.email}>`}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm font-medium text-gray-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  REPLY MESSAGE
                </label>
                <textarea
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setIsReplyOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sendingReply ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}