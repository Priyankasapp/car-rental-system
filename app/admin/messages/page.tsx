"use client";

import { useEffect, useState } from "react";
import MessageCard, { ContactItem } from "@/components/admin/MessageCard";
import { useRouter } from "next/navigation";

export default function AdminMessagesPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/admin/contacts");
        const data = await response.json();
        if (response.ok) {
          setContacts(data.contacts);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No inquiries found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Inquiries
      </h1>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <MessageCard
            key={contact.id}
            contact={contact}
            onViewClick={(id) => router.push(`/admin/messages/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}