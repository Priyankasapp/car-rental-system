"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactForm } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const floatingCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Form Left Side Animation
      gsap.fromTo(
        '.form-content',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      // Image Animation
      gsap.fromTo(
        '.form-image',
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      // Floating Card Animation
      gsap.fromTo(
        '.floating-card',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      // Form Fields Stagger
      const formFields = document.querySelectorAll('.form-field');
      gsap.fromTo(
        formFields,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      // Submit Button Animation
      gsap.fromTo(
        '.form-submit',
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.6,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      // Floating Card Pulse Animation
      gsap.to('.floating-card', {
        scale: 1.03,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-gray-50 py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        
        {/* ===== LEFT SIDE ===== */}
        <div ref={formRef} className="form-content">
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
                className="form-field rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />

              <input
                type="text"
                placeholder="Last Name"
                className="form-field rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <input
                type="email"
                placeholder="Email Address"
                className="form-field rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="form-field rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
              />
            </div>

            <select className="form-field w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black">
              <option>Select Service</option>

              {contactForm.services.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>

            <textarea
              rows={6}
              placeholder="Tell us about your journey..."
              className="form-field w-full resize-none rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="form-submit group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800"
            >
              Send Request
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* ===== RIGHT SIDE ===== */}
        <div ref={imageRef} className="relative">
          {/* Image */}
          <div className="form-image overflow-hidden rounded-3xl">
            <Image
              src={contactForm.image}
              alt={contactForm.title}
              width={700}
              height={800}
              className="h-175 w-full object-cover"
            />
          </div>

          {/*  Floating Card with Animation */}
          <div ref={floatingCardRef} className="floating-card absolute bottom-8 left-8 rounded-3xl bg-white p-6 shadow-2xl">
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