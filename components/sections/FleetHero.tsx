'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface FleetHeroProps {
  label: string
  title: string
  description: string
  totalVehicles: number
}

export default function FleetHero({ 
  label, 
  title, 
  description, 
  totalVehicles 
}: FleetHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ['.animate-hero-label', '.animate-hero-title', '.animate-hero-desc'],
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="mb-16">
      <div className="flex flex-col gap-2">
        {/* Tiny Label */}
        <span className="animate-hero-label text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
          {label}
        </span>
        
        {/* Main Title */}
       <h1 className="animate-hero-title text-5xl md:text-3xl lg:text-5xl font-black tracking-tight text-primary leading-[1.05] my-4">
  {title}
</h1>
        
        {/* Description & Vehicle Counter */}
        <p className="animate-hero-desc text-[15px] text-text-secondary">
          {description} {totalVehicles} vehicles currently available in your region.
        </p>
      </div>
    </section>
  )
}