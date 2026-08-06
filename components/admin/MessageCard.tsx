"use client";

import { useRouter } from "next/navigation";
import { getRelativeTime } from "@/lib/formatTime";
import { MessageSquare, Clock } from "lucide-react";

export interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM" | "ARCHIVED";
  createdAt: string;
  service?: {
    name: string;
  } | null;
}

const statusBadgeStyles: Record<ContactItem["status"], string> = {
  NEW: "bg-green-100 text-green-700 border-green-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
  RESOLVED: "bg-blue-100 text-blue-700 border-blue-200",
  SPAM: "bg-red-100 text-red-700 border-red-200",
  ARCHIVED: "bg-gray-100 text-gray-700 border-gray-200",
};

interface MessageCardProps {
  contact: ContactItem;
  onViewClick?: (id: string) => void;
}

export default function MessageCard({ contact, onViewClick }: MessageCardProps) {
  const router = useRouter();
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const badgeClass = statusBadgeStyles[contact.status] || statusBadgeStyles.NEW;

  const handleView = () => {
    if (onViewClick) {
      onViewClick(contact.id);
    } else {
      router.push(`/admin/messages/${contact.id}`);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-700" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{fullName}</h3>
              {contact.service?.name && (
                <span className="text-xs text-gray-400">
                  • {contact.service.name}
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {contact.message}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${badgeClass}`}
        >
          {contact.status.replace("_", " ").toLowerCase()}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {getRelativeTime(contact.createdAt)}
        </div>

        <button
          onClick={handleView}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          View Message
        </button>
      </div>
    </div>
  );
}