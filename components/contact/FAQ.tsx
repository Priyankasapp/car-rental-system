"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqSection } from "@/data/contact";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            {faqSection.badge}
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {faqSection.title}
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-5">
          {faqSection.faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between px-8 py-6 text-left transition hover:bg-gray-50"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>

                <ChevronDown
                  size={22}
                  className={`transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-8 pb-6 text-gray-600 leading-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
