"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { contactForm } from "@/data/contact";

export default function ContactForm() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        {/* Left Side */}
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Contact Form
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {contactForm.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {contactForm.subtitle}
          </p>

          <form className="mt-10 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First Name"
                className="rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />

              <input
                type="text"
                placeholder="Last Name"
                className="rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <input
                type="email"
                placeholder="Email Address"
                className="rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <select className="w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black">
              <option>Select Service</option>

              {contactForm.services.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>

            <textarea
              rows={6}
              placeholder="Tell us about your journey..."
              className="w-full resize-none rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800"
            >
              Send Request
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Right Side */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <Image
              src={contactForm.image}
              alt={contactForm.title}
              width={700}
              height={800}
              className="h-[700px] w-full object-cover"
            />
          </div>

          {/* Floating Card */}
          <div className="absolute bottom-8 left-8 rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Average Response
            </p>

            <h3 className="mt-2 text-3xl font-bold text-black">&lt; 30 min</h3>

            <p className="mt-2 text-gray-600">
              Our concierge team typically replies within half an hour.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
