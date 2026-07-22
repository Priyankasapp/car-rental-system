"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faqSection } from "@/data/contact";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      //  Badge Animation
      gsap.fromTo(
        '.faq-badge',
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

      //  Title Animation (Split into words)
      const titleWords = document.querySelectorAll('.faq-title-word');
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

      //  FAQ Items Stagger
      const faqItems = faqRefs.current.filter(el => el !== null);
      gsap.fromTo(
        faqItems,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      // FAQ Item Hover Animation
      faqItems.forEach((item) => {
        if (!item) return
        
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Split title into words
  const titleWords = faqSection.title.split(' ').map((word, index) => (
    <span key={index} className="faq-title-word inline-block mr-1">
      {word}
    </span>
  ))

  return (
    <section ref={sectionRef} className="bg-gray-50 py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        
        {/* ===== HEADING ===== */}
        <div ref={headingRef} className="mb-16 text-center">
          <span className="faq-badge text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            {faqSection.badge}
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {titleWords}
          </h2>
        </div>

        {/* ===== FAQ LIST ===== */}
        <div className="space-y-5">
          {faqSection.faqs.map((faq, index) => (
            <div
              key={index}
              ref={(el) => { faqRefs.current[index] = el }}
              className="faq-item overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300"
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
                  className={`transition-all duration-300 ${
                    openIndex === index ? "rotate-180 text-black" : "text-gray-400"
                  }`}
                />
              </button>

              {/*  Animated Answer */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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