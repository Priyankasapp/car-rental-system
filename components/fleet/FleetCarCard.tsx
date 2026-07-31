/* eslint-disable @next/next/no-img-element */
// components/fleet/FleetCarCard.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { FleetCar } from '@/types/fleet'
import { cn } from '@/lib/utils'
import {
  Gauge,
  Fuel,
  Users,
  MapPin,
  ArrowUpRight,
  Car as CarIcon,
  Heart,
} from 'lucide-react'

interface FleetCarCardProps {
  car: FleetCar
  className?: string
  onToggleFavorite?: (carId: string) => void
}

// Safe helper to extract string representation from objects or strings
function extractString(val: unknown, fallback: string = ''): string {
  if (!val) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>
    return String(obj.name || obj.label || obj.title || obj.id || fallback)
  }
  return fallback
}

export default function FleetCarCard({
  car,
  className = '',
  onToggleFavorite,
}: FleetCarCardProps) {
  const statusColors: Record<string, string> = {
    available: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    AVAILABLE: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    reserved: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    RESERVED: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    maintenance: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
    MAINTENANCE: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
  }

  const statusLabels: Record<string, string> = {
    available: 'Available',
    AVAILABLE: 'Available',
    reserved: 'Reserved',
    RESERVED: 'Reserved',
    maintenance: 'Maintenance',
    MAINTENANCE: 'Maintenance',
  }

  const statusKey = car.status || 'available'
  const carTitle = car.name || `${car.brand || ''} Vehicle`.trim()

  const categoryName = extractString(car.category, 'Vehicle')
  const transmissionName = extractString(
    car.transmission || car.specs?.transmission,
    'Auto'
  )
  const fuelTypeName = extractString(car.fuelType, 'Petrol')

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(car.id)
    }
  }

  return (
    <Link
      href={`/cars/${car.id}`}
      className="block group h-full focus:outline-none"
    >
      <article
        className={cn(
          'group bg-white border border-gray-200/80 rounded-2xl overflow-hidden',
          'hover:border-gray-300 hover:shadow-md transition-all duration-200',
          'flex flex-col h-full relative cursor-pointer',
          className
        )}
      >
        {/* ================= VEHICLE IMAGE ================= */}
        <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
          {car.image ? (
            <img
              src={car.image}
              alt={carTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <CarIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Category */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider text-white uppercase">
            {categoryName}
          </div>

          {/* Status & Favorite */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                'rounded-full border backdrop-blur-md shadow-xs',
                statusColors[statusKey] ||
                  'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
              )}
            >
              {statusLabels[statusKey] || 'Available'}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={cn(
                  'p-1.5 rounded-full backdrop-blur-md transition-colors',
                  car.favorite
                    ? 'bg-rose-500 text-white'
                    : 'bg-black/40 text-white hover:bg-black/60'
                )}
                aria-label="Favorite vehicle"
              >
                <Heart
                  className={cn(
                    'w-3.5 h-3.5',
                    car.favorite ? 'fill-current' : ''
                  )}
                />
              </button>
            )}
          </div>
        </div>

        {/* ================= CARD CONTENT ================= */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-white">
          {/* Title & Brand */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                {carTitle}
              </h3>

              {car.brand && (
                <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[11px] font-semibold rounded border border-gray-200">
                  {car.brand}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-0.5">
              {car.year ? `Year ${car.year}` : categoryName}
            </p>
          </div>

          {/* ================= SPECIFICATIONS ================= */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            {/* Transmission */}
            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{transmissionName}</span>
            </div>

            {/* Fuel Type */}
            <div className="flex items-center gap-1.5 truncate">
              <Fuel className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{fuelTypeName}</span>
            </div>

            {/* Seats */}
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{car.seats ? `${car.seats} Seats` : '5 Seats'}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{car.location || 'Main Depot'}</span>
            </div>
          </div>

          {/* ================= PRICING & CTA ================= */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">
                Rate
              </span>

              <p className="text-base font-extrabold text-gray-900">
                ₹{car.price?.toLocaleString() || 0}
                <span className="text-xs font-normal text-gray-500">
                  {' '}
                  / day
                </span>
              </p>
            </div>

            <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              <span>Rent Now</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}