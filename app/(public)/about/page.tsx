// app/(public)/about/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import SectionHeader from '@/components/ui/SectionHeader'
import StatsDisplay from '@/components/ui/StatsDisplay'
import FeatureList from '@/components/ui/FeatureList'
import BrandCard from '@/components/ui/BrandCard'
import CTASection from '@/components/sections/CTASection'
import AboutSectionHeader from '@/components/ui/AboutSectionHeader'

//  Import aboutData
import { aboutData } from '@/data/about'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AboutPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const standardRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  //  Destructure data
  const { story, brandCards, wheel, cta } = aboutData

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ===== STORY SECTION ANIMATION =====
      gsap.fromTo(
        '.story-content',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      gsap.fromTo(
        '.story-image',
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      gsap.fromTo(
        '.story-stats',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

      // ===== BRAND CARDS ANIMATION =====
      gsap.fromTo(
        '.brand-card',
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: standardRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      // ===== BRAND CARDS HOVER =====
      document.querySelectorAll('.brand-card').forEach((card) => {
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
            boxShadow: 'none',
            duration: 0.3,
            ease: "power2.in"
          })
        })
      })

      // ===== WHEEL SECTION ANIMATION =====
      gsap.fromTo(
        '.wheel-content',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wheelRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

      gsap.fromTo(
        '.wheel-image',
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wheelRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      )

      gsap.fromTo(
        '.wheel-features',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wheelRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={sectionRef} className="pt-20">
      
      {/* ===== HERO SECTION ===== */}
      <AboutSectionHeader />

      {/* ===== STORY SECTION ===== */}
      <section ref={storyRef} className="py-32 bg-surface overflow-hidden">
        <div className="max-w-360 mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          <div className="story-image relative aspect-square overflow-hidden shadow-[0px_10px_40px_rgba(0,0,0,0.04)] rounded-lg group">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${story.image}')`
              }}
            />
            <div className="absolute inset-0 border border-border pointer-events-none" />
          </div>

          <div className="story-content space-y-8">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-8">
              {story.title}
            </h2>
            <div className="space-y-6 font-body-lg text-body-lg text-text-secondary leading-relaxed">
              {story.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="story-stats">
              <StatsDisplay stats={story.stats} className="pt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE STANDARD SECTION ===== */}
      <section ref={standardRef} className="py-32 px-5 md:px-16 max-w-360 mx-auto">
        <SectionHeader
          label="The Standard"
          title="Foundations of the Brand"
          align="center"
          className="mb-24"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brandCards.map((card, index) => (
            <BrandCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              className="brand-card"
            />
          ))}
        </div>
      </section>

      {/* ===== BEHIND THE WHEEL SECTION ===== */}
      <section ref={wheelRef} className="py-32 bg-primary dark:bg-white overflow-hidden">
        <div className="max-w-360 mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          <div className="wheel-content order-2 lg:order-1 space-y-8">
            <span className="text-label-sm text-label-sm uppercase tracking-[0.3em] text-primary-fixed-dim dark:text-text-secondary">
              {wheel.label}
            </span>
            <h2 className="font-display-lg text-headline-lg text-white dark:text-black">
              {wheel.title}
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim dark:text-text-secondary leading-relaxed">
              {wheel.description}
            </p>
            <div className="wheel-features">
              <FeatureList 
                features={wheel.features} 
                iconColor="text-accent-success"
              />
            </div>
          </div>

          <div className="wheel-image order-1 lg:order-2 relative group">
            <div className="absolute -inset-4 border border-white/10 dark:border-black/10 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
            <div 
              className="w-full h-auto rounded-lg shadow-[0px_10px_40px_rgba(0,0,0,0.04)] grayscale hover:grayscale-0 transition-all duration-700 aspect-4/3 bg-cover bg-center"
              style={{
                backgroundImage: `url('${wheel.image}')`
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <CTASection
        title={cta.title}
        subtitle={cta.subtitle}
        primaryButton={cta.primaryButton}
        secondaryButton={cta.secondaryButton}
      />
    </main>
  )
}