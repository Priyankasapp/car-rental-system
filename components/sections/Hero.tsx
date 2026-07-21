'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import Icon from '@/components/ui/Icon'
import GlassCard from '@/components/ui/GlassCard'
import Input from '@/components/ui/Input'
import { Button } from '../ui/Button'
import Image from 'next/image' 
export default function Hero() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  
  //  State for search
  const [location, setLocation] = useState('')
  const [dates, setDates] = useState('')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  //  Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query params
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (dates) params.append('dates', dates)
    
    //  Redirect to fleet page with filters
    router.push(`/fleet?${params.toString()}`)
  }

  return (
    <section ref={heroRef} className="relative h-screen min-h-190 flex items-center justify-center overflow-hidden">
      
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        
        
          <Image
          src="/images/car3.jpeg"
          alt="Luxury car hero background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-360 px-5 md:px-16 text-center md:text-left">
        <div ref={textRef} className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl lg:text-[72px] font-bold tracking-tighter text-black mb-6 leading-[1.1]">
            Elite Drive.<br />Urban Soul.
          </h2>
          <p className="text-base md:text-lg text-text-secondary mb-12 max-w-lg">
            Experience the pinnacle of automotive engineering with our curated fleet of ultra-luxury vehicles. Designed for those who demand precision and prestige.
          </p>

          {/*  Search Form */}
          <form onSubmit={handleSearch}>
            <GlassCard className="p-2 flex flex-col md:flex-row items-center gap-2 max-w-3xl bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
              <div className="flex-1 w-full px-4 py-2 flex items-center gap-3 border-b md:border-b-0 md:border-r border-white/20">
                <Icon name="location_on" className="text-white/70" />
                <Input 
                  placeholder="Pickup Location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-none bg-transparent text-white placeholder:text-white/50 focus:ring-0 w-full outline-none"
                />
              </div>
              <div className="flex-1 w-full px-4 py-2 flex items-center gap-3">
                <Icon name="calendar_today" className="text-white/70" />
                <Input 
                  placeholder="Dates" 
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="border-none bg-transparent text-white placeholder:text-white/50 focus:ring-0 w-full outline-none"
                />
              </div>
              <Button 
                type="submit"
                className="w-full md:w-auto bg-white text-black font-semibold px-10 py-4 rounded-lg hover:bg-white/90 transition-colors"
              >
                Search
              </Button>
            </GlassCard>
          </form>
        </div>
      </div>
    </section>
  )
}