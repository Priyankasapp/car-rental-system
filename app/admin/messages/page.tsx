import { MessageSquare, Clock } from "lucide-react";

export default function MessageCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-6 w-6 text-gray-700" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Sarah Johnson
            </h3>

            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              Hi, I would like to know if the Mercedes S-Class is
              available for next weekend. Please let me know the pricing.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          New
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          5 minutes ago
        </div>

        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
          View Message
        </button>
      </div>
    </div>
  );
}