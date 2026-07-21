'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'  
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stats } from '@/data'
import { Button } from '../ui/Button'

// Register ScrollTrigger utility for smooth intersection tracking
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GlobalPresence() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Fade-in animation for text elements
      gsap.fromTo(
        '.presence-fade',
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )

      // 2. Animate stats numbers with ScrollTrigger
      stats.forEach((stat, index) => {
        const obj = { val: 0 }
        const targetElement = document.getElementById(`counter-${index}`)
        
        if (targetElement) {
          //  Set initial value to 0
          targetElement.innerText = '0'
          
          gsap.to(obj, {
            val: stat.value,
            duration: 2.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none none"
            },
            onUpdate: () => {
              targetElement.innerText = Math.floor(obj.val).toString()
            },
            onComplete: () => {
              //  Ensure final value is exact
              targetElement.innerText = stat.value.toString()
            }
          })
        }
      })

      // 3. Animate stat labels (slide in from bottom)
      gsap.fromTo(
        '.stat-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-black text-white py-24 md:py-32 overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-360 mx-auto px-5 md:px-16 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-end">
          
          {/* Left Block: Core Heading & Text Descriptions */}
          <div className="md:col-span-7 max-w-xl">
            <h3 className="presence-fade text-3xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1] mb-6">
              A Global Network of<br />Performance.
            </h3>
            
            <p className="presence-fade text-xs md:text-sm text-gray-400 max-w-md leading-relaxed font-normal mb-8">
              Operating in 12 major financial hubs across three continents, providing consistency for the global professional.
            </p>
            
            <div className="presence-fade flex gap-4">
              <Link href="/contact">
                <Button className="bg-white text-black text-xs font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors transform hover:scale-105 duration-300">
                  Explore Locations
                </Button>
              </Link>
            </div>
          </div>

          {/*  Right Block: Statistics Numbers Matrix */}
          <div ref={statsRef} className="md:col-span-5 grid grid-cols-2 gap-4 md:gap-8 w-full max-w-xs md:max-w-none md:justify-items-end">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item flex flex-col justify-end opacity-0">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-none">
                  <span id={`counter-${index}`}>0</span>
                  {stat.suffix || ''}
                </div>
                <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase whitespace-nowrap mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}