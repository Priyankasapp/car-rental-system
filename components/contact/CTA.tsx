"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Phone } from "lucide-react";
import { contactCTA } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ContactCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Background Blurs Animation (Pulse)
      gsap.to('.blur-1', {
        scale: 1.2,
        opacity: 0.6,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      })

      gsap.to('.blur-2', {
        scale: 1.3,
        opacity: 0.7,
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1
      })

      //  Title Split Animation (Word by Word)
      const titleWords = document.querySelectorAll('.cta-word');
      gsap.fromTo(
        titleWords,
        { opacity: 0, y: 40, rotateX: 45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      // Subtitle Fade In
      gsap.fromTo(
        '.cta-subtitle',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      // Buttons Stagger
      gsap.fromTo(
        '.cta-button',
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.8,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      // Button Hover Effects
      document.querySelectorAll('.cta-button').forEach((btn) => {
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

      //  Arrow Hover Animation
      document.querySelectorAll('.cta-arrow').forEach((arrow) => {
        const element = arrow as HTMLElement
        
        element.parentElement?.addEventListener('mouseenter', () => {
          gsap.to(element, {
            x: 5,
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        element.parentElement?.addEventListener('mouseleave', () => {
          gsap.to(element, {
            x: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  //  Split title into words
  const titleWords = contactCTA.title.split(' ').map((word, index) => (
    <span key={index} className="cta-word inline-block mr-2">
      {word}
    </span>
  ))

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-24 lg:py-32">
      
      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-950" />

      {/* Decorative Blurs */}
      <div className="blur-1 absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="blur-2 absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      {/* ===== CONTENT ===== */}
      <div ref={contentRef} className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        
        {/* Heading */}
        <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          {titleWords}
        </h2>

        {/* Subtitle */}
        <p className="cta-subtitle mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          {contactCTA.subtitle}
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/cars"
            className="cta-button group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gray-100 shadow-xl hover:shadow-2xl"
          >
            {contactCTA.primaryButton}

            <ArrowRight
              size={18}
              className="cta-arrow transition-transform duration-300"
            />
          </Link>

          <Link
            href="/contact"
            className="cta-button inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:shadow-xl backdrop-blur-sm"
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