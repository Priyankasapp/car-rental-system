"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { contactHero } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      //  1. Image Scale Animation (Parallax)
      gsap.to('.contact-image', {
        scale: 1.05,
        duration: 8,
        ease: "power1.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      })

      //  2. Badge Fade In
      gsap.fromTo(
        '.contact-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out"
        }
      )

      //  3. Title Stagger Animation (Letter by Letter effect)
      const titleChars = document.querySelectorAll('.title-char');
      gsap.fromTo(
        titleChars,
        { opacity: 0, y: 30, rotateX: 90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.03,
          delay: 0.4,
          ease: "back.out(1.7)"
        }
      )

      //  4. Description Fade In
      gsap.fromTo(
        '.contact-description',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.8,
          ease: "power2.out"
        }
      )

      //  5. Buttons Stagger
      gsap.fromTo(
        '.contact-button',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          delay: 1,
          ease: "back.out(1.4)"
        }
      )

      //  6. Shimmer Effect on Buttons
      document.querySelectorAll('.contact-button').forEach((btn) => {
        const element = btn as HTMLElement
        
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            scale: 1.05,
            boxShadow: '0 20px 60px rgba(255,255,255,0.15)',
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            scale: 1,
            boxShadow: 'none',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Split title into characters for animation
  const titleChars = contactHero.title.split('').map((char, index) => (
    <span key={index} className="title-char inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  return (
    <section ref={sectionRef} className="relative flex min-h-[90vh] items-center overflow-hidden">
      
      {/* ===== BACKGROUND IMAGE ===== */}
      <div className="absolute inset-0">
        <Image
          src={contactHero.image}
          alt={contactHero.title}
          fill
          priority
          className="contact-image object-cover scale-105"
        />

        {/*  Contrast */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/20" />
        
        {/*  Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent" />
      </div>

      {/* ===== CONTENT ===== */}
      <div ref={contentRef} className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          
          {/* Badge */}
          <span className="contact-badge inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm shadow-lg">
            {contactHero.badge}
          </span>

          {/* Heading with Character Animation */}
          <h1 className="mt-8 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            {titleChars}
          </h1>

          {/* Description */}
          <p className="contact-description mt-8 max-w-2xl text-lg leading-8 text-gray-200">
            {contactHero.description}
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/fleet"
              className="contact-button group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gray-100 shadow-xl hover:shadow-2xl"
            >
              {contactHero.primaryButton}

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110"
              />
            </Link>

           
          </div>
        </div>
      </div>

      {/*  Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}