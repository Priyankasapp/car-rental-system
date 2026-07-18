'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import SectionHeader from '@/components/ui/SectionHeader'
import StatsDisplay from '@/components/ui/StatsDisplay'
import FeatureList from '@/components/ui/FeatureList'
import BrandCard from '@/components/ui/BrandCard'
import CTASection from '@/components/sections/CTASection'
import AboutSectionHeader from '@/components/ui/AboutSectionHeader'


export default function AboutPage() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.brand-card',
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.5
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const stats = [
    { value: '50+', label: 'Handpicked Models' },
    { value: '12', label: 'Global Hubs' }
  ]

  const brandCards = [
    {
      icon: 'verified',
      title: 'Curated Excellence',
      description: 'Every vehicle undergoes a 120-point diagnostic before it enters your service.'
    },
    {
      icon: 'visibility_off',
      title: 'Absolute Discretion',
      description: 'Seamless logistics and anonymous delivery for the discerning executive.'
    },
    {
      icon: 'speed',
      title: 'Unrivaled Performance',
      description: 'Experience high-fidelity engineering in its purest, most visceral form.'
    }
  ]

  const features = [
    { icon: 'check_circle', text: 'Bespoke Audio Landscapes' },
    { icon: 'check_circle', text: 'Intelligent Driving Assistance' },
    { icon: 'check_circle', text: 'Ventilated Nappa Leather Seating' }
  ]

  return (
    <main className="pt-20">
      {/* Hero Section */}
      
    <AboutSectionHeader/>
      {/* Our Story Section */}
      <section className="py-32 bg-surface">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-square overflow-hidden shadow-[0px_10px_40px_rgba(0,0,0,0.04)] rounded-lg group">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida/AP1WRLsnGUQkJqcMt2ze0HcFClQVg4s1-JDIUFJSJD0Es_7W8uaSCt-yVi1VeynkIk9Y8tayXAUvr9fWObLf6r0nfUo4PNlNnbMvOd77OjZm-H7AjLyMaAk9XKtBsWLqAqIDnfcjulanhSeVuttjYpZIfVp3yFIdHDYluWVpRlZ_9-SZCjz63gcUMDq2LHKRTZBBddu2OCZE37gjXNXk3d-6Q755kks8fxgOG8U6d8KpmwlVxsxDSFSyu1vY7t1C')`
              }}
            />
            <div className="absolute inset-0 border border-border pointer-events-none" />
          </div>

          <div className="space-y-8">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-8">
              A Heritage of Curation
            </h2>
            <div className="space-y-6 font-body-lg text-body-lg text-text-secondary leading-relaxed">
              <p>
                UrbanDrive began as a private collective of automotive enthusiasts dedicated to the preservation and performance of high-end machinery. What started as a shared passion for precision became the blueprint for a global mobility platform.
              </p>
              <p>
                Every vehicle in our fleet is hand-selected. We do not just look for specifications; we look for character, heritage, and the tactile sensations that define a premium driving experience. From the grain of the leather to the response of the throttle, excellence is our only metric.
              </p>
            </div>
            <StatsDisplay stats={stats} className="pt-8" />
          </div>
        </div>
      </section>

      {/* The Standard Section */}
      <section ref={sectionRef} className="py-32 px-5 md:px-16 max-w-[1440px] mx-auto">
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
              {...card}
              className="brand-card"
            />
          ))}
        </div>
      </section>

      {/* Behind the Wheel Section */}
      <section className="py-32 bg-primary dark:bg-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <span className="text-label-sm text-label-sm uppercase tracking-[0.3em] text-primary-fixed-dim dark:text-text-secondary">
              Command Center
            </span>
            <h2 className="font-display-lg text-headline-lg text-white dark:text-black">
              Behind the Wheel
            </h2>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim dark:text-text-secondary leading-relaxed">
              The interior of our vehicles is an extension of your workspace. We prioritize ergonomic perfection, intuitive technology, and silent cabins that allow for focus in a moving world.
            </p>
            <FeatureList 
              features={features} 
              iconColor="text-accent-success"
            />
          </div>

          <div className="order-1 lg:order-2 relative group">
            <div className="absolute -inset-4 border border-white/10 dark:border-black/10 translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
            <div 
              className="w-full h-auto rounded-lg shadow-[0px_10px_40px_rgba(0,0,0,0.04)] grayscale hover:grayscale-0 transition-all duration-700 aspect-[4/3] bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida/AP1WRLu9lCKJL812VUJ9RmlbCTRUqLLaypM48geNV9l8Ios0Rc3TTBjdZAiKa3OIpAk6Xl2ybcJPZLXkC-MtdbpZdI56cLXGX5Iuo2FEpUad-FVrpCtUGZvFh6KLl3XtkmqUBvRWzrBn69o5LcnYC_wGnKnEdG1c0fEQmih-dK1920_DuRDctVLrSCN3jqtC89mowglE4a8ZyxvYOyJorMmFKK42hH4N_W_JdmDJVj6gVQX-2HUElus3CgkainH7')`
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Define Your Journey."
        subtitle='"Luxury is not an option; it is our base state."'
        primaryButton={{
          label: 'Experience the Fleet',
          href: '/fleet'
        }}
        secondaryButton={{
          label: 'Contact Concierge',
          href: '/contact'
        }}
      />
    </main>
  )
}