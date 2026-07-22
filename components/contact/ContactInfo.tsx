"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactInfo } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactInfo() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Badge Animation
      gsap.fromTo(
        '.info-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )

      // Title Animation (Word by Word)
      const titleWords = document.querySelectorAll('.info-title-word');
      gsap.fromTo(
        titleWords,
        { opacity: 0, y: 30, rotateX: 45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      // Subtitle Animation
      gsap.fromTo(
        '.info-subtitle',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      // Cards Stagger Animation
      const cards = document.querySelectorAll('.info-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      // Card Hover Animation
      cards.forEach((card) => {
        const element = card as HTMLElement
        
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            y: -8,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            y: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

      // Icon Bounce on Hover (Optional)
      cards.forEach((card) => {
        const icon = card.querySelector('.info-icon') as HTMLElement
        if (!icon) return
        
        card.addEventListener('mouseenter', () => {
          gsap.to(icon, {
            scale: 1.15,
            rotate: 5,
            duration: 0.4,
            ease: "back.out(1.7)"
          })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(icon, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  //  Split title into words
  const titleWords = contactInfo.title.split(' ').map((word, index) => (
    <span key={index} className="info-title-word inline-block mr-1">
      {word}
    </span>
  ))

  return (
    <section ref={sectionRef} className="bg-white py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* ===== HEADING ===== */}
        <div ref={headingRef} className="mx-auto mb-16 max-w-3xl text-center">
          <span className="info-badge text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Contact Information
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {titleWords}
          </h2>

          <p className="info-subtitle mt-6 text-lg leading-8 text-gray-600">
            {contactInfo.subtitle}
          </p>
        </div>

        {/* ===== CARDS ===== */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {contactInfo.cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="info-card group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300"
              >
                {/* Icon */}
                <div className="info-icon flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white transition-transform duration-300">
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