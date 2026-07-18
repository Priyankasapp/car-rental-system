'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { features } from '@/data'

import GlobalCard from '../ui/GlobalCard'


export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-white">
      {/* Fixed layout spacing bounds here */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          
          {/* Main big headline sizing correction */}
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-primary leading-tight mb-4">
            The UrbanDrive Advantage
          </h3>
          
         <p className="text-xs text-text-secondary max-w-lg mx-auto leading-relaxed">
  We redefine car rental through a white-glove service model built on transparency and speed.
</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
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