"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { contactCTA } from "@/data/contact";

const ContactCTA = () => {
  return (
    <section className="relative overflow-hidden bg-black py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />

      {/* Decorative Blurs */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        {/* Heading */}
        <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          {contactCTA.title}
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          {contactCTA.subtitle}
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/cars"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gray-200"
          >
            {contactCTA.primaryButton}

            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
          >
            <Phone size={18} />
            {contactCTA.secondaryButton}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
