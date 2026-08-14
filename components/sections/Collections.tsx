'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import SectionHeader from '@/components/ui/SectionHeader'
import CollectionCard from '@/components/ui/CollectionCard'

type Category = {
  name: string
}

export default function Collections() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch active categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const result = await response.json()

        setCategories(result.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // GSAP animation
  useEffect(() => {
    if (isLoading || categories.length === 0) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.collection-card')

      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.2,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [isLoading, categories])

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-360 px-5 py-16 md:px-16 md:py-24"
    >
      <SectionHeader
        label="Curated selection"
        title="Collections"
      />

      <div className="mt-8 grid grid-cols-2 gap-4 md:mt-12 md:grid-cols-4 md:gap-6">
        {/* Loading skeleton */}
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl bg-neutral-200"
            />
          ))}

        {/* Dynamic categories */}
        {!isLoading &&
          categories.map((category, index) => (
            <CollectionCard
              key={`${category.name}-${index}`}
              collection={{
                id: category.name,
                name: category.name,
              }}
              className="collection-card"
            />
          ))}

        {/* Empty state */}
        {!isLoading && categories.length === 0 && (
          <p className="col-span-full text-center text-neutral-500">
            No collections available.
          </p>
        )}
      </div>
    </section>
  )
}