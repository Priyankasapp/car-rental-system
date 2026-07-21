"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { contactHero } from "@/data/contact";

export default function ContactHero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={contactHero.image}
          alt={contactHero.title}
          fill
          priority
          className="object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-200 backdrop-blur-sm">
            {contactHero.badge}
          </span>

          {/* Heading */}
          <h1 className="mt-8 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            {contactHero.title}
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-300">
            {contactHero.description}
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gray-200"
            >
              {contactHero.primaryButton}

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              <Phone size={18} />
              {contactHero.secondaryButton}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
