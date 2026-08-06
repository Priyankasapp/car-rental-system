// app/admin/messages/[id]/page.tsx

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
} from "lucide-react";

export default function MessageDetailsPage() {
  // Replace with API data later
  const message = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+91 98765 43210",
    subject: "Luxury Car Booking Inquiry",
    status: "New",
    createdAt: "06 Aug 2026 • 10:30 AM",
    message: `Hello UrbanDrive Team,

I would like to rent a Mercedes S-Class from August 12 to August 15.

Could you please let me know if it is available? Also, what documents are required to complete the booking?

Looking forward to your response.

Thank you,
Sarah Johnson`,
  };

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

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            {message.status}
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
                <p className="font-semibold">{message.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Mail className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{message.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Phone className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{message.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <Calendar className="h-5 w-5 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">Received</p>
                <p>{message.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Subject</h2>
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            {message.subject}
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
          <h2 className="mb-4 text-lg font-semibold">Internal Notes</h2>

          <textarea
            rows={5}
            placeholder="Add internal notes..."
            className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-black"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-100">
            <CheckCircle className="h-5 w-5" />
            Mark as Read
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800">
            <Reply className="h-5 w-5" />
            Reply
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700">
            <Trash2 className="h-5 w-5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}