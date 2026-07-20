// components/fleet/FleetCarCard.tsx
'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { FleetCar } from '@/types/fleet'
import { cn } from '@/lib/utils'
import { useCars } from '@/context/CarContext'

interface FleetCarCardProps {
  car: FleetCar
  className?: string
}

export default function FleetCarCard({ car, className = '' }: FleetCarCardProps) {
  const { toggleFavorite, isFavorite } = useCars()
  const isFav = isFavorite(car.id)
  
  // ✅ CONSOLE LOG 1: Check if car data is received
  console.log('🚗 FleetCarCard received car:', {
    id: car.id,
    name: car.name,
    brand: car.brand,
    price: car.price,
    image: car.image,
    category: car.category,
    status: car.status,
    specs: car.specs
  })

  // ✅ CONSOLE LOG 2: Check if car has all required fields
  useEffect(() => {
    if (!car) {
      console.error('❌ FleetCarCard: No car data received!')
      return
    }

    const requiredFields = ['id', 'name', 'brand', 'price', 'image', 'category', 'status', 'specs']
    const missingFields = requiredFields.filter(field => !car[field as keyof FleetCar])
    
    if (missingFields.length > 0) {
      console.warn('⚠️ FleetCarCard: Missing fields:', missingFields, car)
    } else {
      console.log('✅ FleetCarCard: All required fields present')
    }
  }, [car])
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('❤️ Toggle favorite for car:', car.id, car.name)
    toggleFavorite(car.id)
  }

  const statusColors: Record<string, string> = {
    'available': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'reserved': 'bg-amber-50 text-amber-700 border-amber-100',
    'new-arrival': 'bg-violet-50 text-violet-700 border-violet-100'
  }

  const statusLabels: Record<string, string> = {
    'available': 'Available',
    'reserved': 'Reserved',
    'new-arrival': 'New Style'
  }

  // ✅ CONSOLE LOG 3: Check status
  console.log('🏷️ Car status:', car.status, '→', statusLabels[car.status] || 'Unknown')

  return (
    <Link 
      href={`/cars/${car.id}`}
      className="block group"
    >
      <article className={cn(
        'bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm',
        'transition-all duration-300 hover:shadow-xl hover:border-gray-200/80',
        'relative flex flex-col h-full bg-gradient-to-b from-white to-gray-50/30',
        className
      )}>
        {/* Status Badge & Wishlist button */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
          <span className={cn(
            'px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md shadow-sm',
            statusColors[car.status] || statusColors['available']
          )}>
            {statusLabels[car.status] || statusLabels['available']}
          </span>
          
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'pointer-events-auto p-2 rounded-xl transition-all duration-200 shadow-sm border',
              isFav 
                ? 'text-rose-500 bg-white border-rose-100 hover:bg-rose-50' 
                : 'text-gray-400 bg-white border-gray-100 hover:text-rose-500 hover:border-rose-100'
            )}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="material-symbols-outlined text-[22px] block select-none">
              {isFav ? 'favorite' : 'favorite_border'}
            </span>
          </button>
        </div>

        {/* Hero Image Block */}
        <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
          <div 
            className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${car.image}')` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
        </div>

        {/* Info Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-4">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 block">
              {car.category}
            </span>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
              {car.name}
            </h2>
            <p className="text-sm text-gray-500 font-medium">{car.brand}</p>
          </div>

          {/* Metric Spec Pill Badges in 2-2 Pair Layout */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="flex items-center gap-2 bg-gray-100/70 border border-gray-200/40 rounded-lg px-2.5 py-2">
              <span className="material-symbols-outlined text-gray-500 text-lg">
                speed
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Power</span>
                <span className="text-xs font-semibold text-gray-700">
                  {car.specs?.power || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100/70 border border-gray-200/40 rounded-lg px-2.5 py-2">
              <span className="material-symbols-outlined text-gray-500 text-lg">
                settings_input_component
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Type</span>
                <span className="text-xs font-semibold text-gray-700">
                  {car.specs?.transmission || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Action Bottom Footer Bar */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Daily Rate
              </span>
              <div className="flex items-baseline">
                <span className="text-xl font-extrabold text-gray-900">
                  ${car.price || 0}
                </span>
                <span className="text-xs text-gray-500 ml-0.5 font-medium">/day</span>
              </div>
            </div>
            
            <div className={cn(
              'inline-flex items-center justify-center font-semibold text-sm rounded-xl px-4 py-2 transition-all duration-200',
              'bg-gray-900 text-white group-hover:bg-blue-600 shadow-sm'
            )}>
              Rent Now
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}