"use client";

import { useEffect, useRef } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { officeLocation } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OfficeLocation() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const infoCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Badge Animation
      gsap.fromTo(
        '.location-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )

      // Title Animation (Word by Word)
      const titleWords = document.querySelectorAll('.location-title-word');
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
            trigger: contentRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      //  Subtitle Animation
      gsap.fromTo(
        '.location-subtitle',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      //  Info Cards Stagger Animation
      const infoCards = infoCardsRef.current.filter(el => el !== null);
      gsap.fromTo(
        infoCards,
        { opacity: 0, x: -30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      //Info Cards Hover Animation
      infoCards.forEach((card) => {
        if (!card) return
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            x: 5,
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            x: 0,
            boxShadow: 'none',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, []) //  Empty dependency array

  // Split title into words
  const titleWords = officeLocation.title.split(' ').map((word, index) => (
    <span key={index} className="location-title-word inline-block mr-1">
      {word}
    </span>
  ))

  return (
    <section ref={sectionRef} className="bg-white py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-8">
        
        {/* ===== LEFT CONTENT ===== */}
        <div ref={contentRef}>
          {/* Badge */}
          <span className="location-badge text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            {officeLocation.badge}
          </span>

          {/* Title */}
          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {titleWords}
          </h2>

          {/* Subtitle */}
          <p className="location-subtitle mt-6 text-lg leading-8 text-gray-600">
            {officeLocation.subtitle}
          </p>

          {/* Info Cards */}
          <div className="mt-10 space-y-8">
            {/* Address Card */}
            <div 
              ref={(el) => { infoCardsRef.current[0] = el }}
              className="info-card flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50"
            >
              <div className="rounded-2xl bg-black p-3 text-white transition-transform duration-300 hover:scale-105">
                <MapPin size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="mt-2 whitespace-pre-line text-gray-600">
                  {officeLocation.address}
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div 
              ref={(el) => { infoCardsRef.current[1] = el }}
              className="info-card flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50"
            >
              <div className="rounded-2xl bg-black p-3 text-white transition-transform duration-300 hover:scale-105">
                <Phone size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="mt-2 text-gray-600">{officeLocation.phone}</p>
              </div>
            </div>

            {/* Email Card */}
            <div 
              ref={(el) => { infoCardsRef.current[2] = el }}
              className="info-card flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50"
            >
              <div className="rounded-2xl bg-black p-3 text-white transition-transform duration-300 hover:scale-105">
                <Mail size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="mt-2 text-gray-600">{officeLocation.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT MAP ===== */}
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