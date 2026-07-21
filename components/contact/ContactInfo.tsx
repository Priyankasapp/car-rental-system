"use client";

import { contactInfo } from "@/data/contact";

export default function ContactInfo() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Contact Information
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {contactInfo.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {contactInfo.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {contactInfo.cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-black hover:shadow-xl"
              >
                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white transition-transform duration-300 group-hover:scale-110">
                  <Icon size={28} />
                </div>

                {/* Title */}
                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  {card.title}
                </h3>

                {/* Main Value */}
                <p className="mt-3 text-lg font-medium text-black">
                  {card.value}
                </p>

                {/* Description */}
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
