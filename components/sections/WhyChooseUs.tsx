'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { features } from '@/data'
import GlobalCard from '../ui/GlobalCard'

//  Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      //  1. Fade in heading elements
      gsap.fromTo(
        '.heading-fade',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )

      //  2. Stagger animation for feature cards
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      //  3. Hover animation for cards (optional - using gsap)
      document.querySelectorAll('.feature-card').forEach((card) => {
        const element = card as HTMLElement
        
        // Hover enter
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            y: -8,
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        // Hover leave
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            y: 0,
            boxShadow: 'none',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-360 mx-auto px-5 md:px-16">
        
        {/*  Heading Section with Animation */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h3 className="heading-fade text-xl md:text-2xl font-bold tracking-tight text-black leading-tight mb-4">
            The UrbanDrive Advantage
          </h3>
          
          <p className="heading-fade text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
            We redefine car rental through a white-glove service model built on transparency and speed.
          </p>
        </div>

        {/*  Feature Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {features.map((feature) => (
            <GlobalCard
              key={feature.id} 
              feature={feature} 
              className="feature-card"
            />
          ))}
        </div>
      </div>
    </section>
  )
}