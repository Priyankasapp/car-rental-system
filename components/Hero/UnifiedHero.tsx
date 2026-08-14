'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

import Icon from '@/components/ui/Icon'
import GlassCard from '@/components/ui/GlassCard'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Safe ScrollTrigger Registration
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export type HeroVariant = 'home' | 'contact' | 'about'

interface UnifiedHeroProps {
  variant?: HeroVariant
  badge?: string
  estYear?: string
  title: string
  subtitle: string
  imageSrc: string
  primaryButtonText?: string
  primaryButtonHref?: string
  onPrimaryClick?: () => void
}

export default function UnifiedHero({
  variant = 'home',
  badge,
  estYear,
  title,
  subtitle,
  imageSrc,
  primaryButtonText,
  primaryButtonHref,
  onPrimaryClick,
}: UnifiedHeroProps) {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  // Search State for 'home' variant
  const [location, setLocation] = useState('')
  const [dates, setDates] = useState('')

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. Background Entrance & Parallax Zoom
      gsap.fromTo(
        bgRef.current,
        { scale: 1.15 },
        {
          scale: 1,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )

      // 2. Badge / Tag Entrance
      if (document.querySelector('.hero-badge')) {
        tl.fromTo(
          '.hero-badge',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          0.2
        )
      }

      // 3. Staggered Character/Word Title Reveal
      const titleChars = document.querySelectorAll('.hero-title-char')
      if (titleChars.length > 0) {
        tl.fromTo(
          titleChars,
          { opacity: 0, y: 30, rotateX: 60 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.02,
            ease: 'back.out(1.5)',
          },
          '-=0.4'
        )
      }

      // 4. Subtitle Entrance
      tl.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.4'
      )

      // 5. Action Controls / Search Box Reveal
      tl.fromTo(
        '.hero-interactive-element',
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.5'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (dates) params.append('dates', dates)
    router.push(`/fleet?${params.toString()}`)
  }

  // Split title into animated character nodes
  const titleCharacters = title.split('').map((char, index) => (
    <span key={index} className="hero-title-char inline-block will-change-transform">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ))

  return (
    <section
      ref={sectionRef}
      className={`relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden ${
        variant === 'about' ? 'bg-white' : 'bg-black'
      }`}
    >
      {/* ===== BACKGROUND IMAGE LAYER ===== */}
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority
          className="object-cover"
        />

        {/* Dynamic Overlays depending on Hero Style */}
        {variant === 'about' ? (
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 via-35% to-transparent pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/20" />
        )}

        {variant === 'contact' && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white to-transparent" />
        )}
      </div>

      {/* ===== CONTENT LAYER ===== */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-2xl">
          
          {/* Badge / Est Year Header */}
          {badge && (
            <span className="hero-badge inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm shadow-lg mb-6">
              {badge}
            </span>
          )}
          {estYear && (
            <span className="hero-badge block text-xs md:text-sm font-semibold tracking-[0.25em] text-gray-500 uppercase mb-4">
              {estYear}
            </span>
          )}

          {/* Animated Headline */}
          <h1
            className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 ${
              variant === 'about' ? 'text-gray-900' : 'text-white'
            }`}
          >
            {titleCharacters}
          </h1>

          {/* Subtitle */}
          <p
            className={`hero-subtitle text-base md:text-lg leading-relaxed mb-8 max-w-lg ${
              variant === 'about' ? 'text-gray-600' : 'text-gray-200'
            }`}
          >
            {subtitle}
          </p>

          {/* Dynamic Interactive Element (Form vs CTA Buttons) */}
          <div className="hero-interactive-element">
            {variant === 'home' ? (
              /* Search Form Component */
              <form onSubmit={handleSearch}>
                <GlassCard className="p-2 flex flex-col md:flex-row items-center gap-2 max-w-3xl bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
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
                    className="w-full md:w-auto bg-white text-black font-semibold px-10 py-4 rounded-lg hover:bg-white/90 active:scale-95 transition-all duration-200"
                  >
                    Search
                  </Button>
                </GlassCard>
              </form>
            ) : variant === 'about' ? (
              /* About CTA Button */
              <button
                onClick={onPrimaryClick}
                className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-[0.2em] px-8 py-4 transition-all duration-300 ease-in-out uppercase hover:scale-105 active:scale-95 shadow-xl"
              >
                {primaryButtonText || 'EXPLORE EXCELLENCE'}
              </button>
            ) : (
              /* Contact CTA Link Button */
              <Link
                href={primaryButtonHref || '/fleet'}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-gray-100 shadow-xl hover:scale-105 active:scale-95"
              >
                {primaryButtonText || 'OUR FLEET'}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110"
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {variant !== 'about' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 pointer-events-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      )}
    </section>
  )
}