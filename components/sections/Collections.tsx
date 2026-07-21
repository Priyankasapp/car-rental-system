'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { collections } from '@/data'
import SectionHeader from '@/components/ui/SectionHeader'
import CollectionCard from '@/components/ui/CollectionCard'

export default function Collections() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      //  Get all collection cards
      const cards = gsap.utils.toArray('.collection-card')
      
      //  Set initial state
      gsap.set(cards, {
        opacity: 0,
        y: 40
      })
      
      // ✅ Animate with stagger
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.3
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef} 
      className="py-16 md:py-24 max-w-[1440px] mx-auto px-5 md:px-16"
    >
      <SectionHeader
        label="Curated selection"
        title="Collections"
        action={{
          label: 'VIEW ALL',
          href: '/collections'
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
        {collections.map((collection) => (
          <CollectionCard 
            key={collection.id} 
            collection={collection} 
            className="collection-card"
          />
        ))}
      </div>
    </section>
  )
}