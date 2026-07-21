'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'  // ✅ Add Link import
import gsap from 'gsap'
import SectionHeader from '@/components/ui/SectionHeader'

const fleetData = [
  {
    id: '1',
    name: 'Porsche Taycan Turbo S',
    tag: 'ELECTRIC',
    tagline: 'Excellence in Motion',
    price: 499,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
    specs: { transmission: 'Auto', power: '750 HP', metric: '2.6s', metricLabel: '0-60 MPH' }
  },
  {
    id: '2',
    name: 'Range Rover Autobiography',
    tag: 'LUXURY SUV',
    tagline: 'Unmatched Comfort',
    price: 350,
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=600',  // ✅ Fixed URL
    specs: { transmission: 'Auto', power: '523 HP', metric: '5', metricLabel: 'PASSENGERS' }
  }
]

export default function FeaturedFleet() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.fleet-card',
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power3.out',
          delay: 0.2
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24 max-w-[1440px] mx-auto px-5 md:px-16">
      
      <SectionHeader
        title="Featured Fleet"
        description="Precision performance meet executive luxury."
      />

      {/* Centered grid container */}
      <div className="flex justify-center w-full mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {fleetData.map((car) => (
            // ✅ Wrap with Link to make it clickable
            <Link 
              key={car.id} 
              href={`/cars/${car.id}`} 
              className="group block"
            >
              <div className="fleet-card bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-md flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-full">
                    {car.tag}
                  </span>
                  
                  <Image 
                    src={car.image} 
                    alt={car.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={Number(car.id) <= 2}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-black tracking-tight line-clamp-1">
                        {car.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 font-normal">
                        {car.tagline}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg md:text-xl font-bold text-black">${car.price}</span>
                      <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase"> / DAY</span>
                    </div>
                  </div>

                  <hr className="border-gray-100 my-4" />

                  {/* Specs Layout */}
                  <div className="grid grid-cols-3 gap-1 mt-auto">
                    <div>
                      <span className="block text-[8px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
                        TRANS
                      </span>
                      <span className="text-xs font-semibold text-black">
                        {car.specs.transmission}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
                        POWER
                      </span>
                      <span className="text-xs font-semibold text-black">
                        {car.specs.power}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
                        {car.specs.metricLabel.split(' ')[0]}
                      </span>
                      <span className="text-xs font-semibold text-black">
                        {car.specs.metric}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}