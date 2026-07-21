"use client";

import { officeLocation } from "@/data/contact";
import { MapPin, Phone, Mail } from "lucide-react";

export default function OfficeLocation() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-8">
        {/* Left */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            {officeLocation.badge}
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {officeLocation.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {officeLocation.subtitle}
          </p>

          <div className="mt-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-black p-3 text-white">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>

                <p className="mt-2 whitespace-pre-line text-gray-600">
                  {officeLocation.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-black p-3 text-white">
                <Phone size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>

                <p className="mt-2 text-gray-600">{officeLocation.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-black p-3 text-white">
                <Mail size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>

                <p className="mt-2 text-gray-600">{officeLocation.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-lg">
          <iframe
            src={officeLocation.mapEmbedUrl}
            width="100%"
            height="600"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0"
          />
        </div>
      </div>
    </section>
  );
}
