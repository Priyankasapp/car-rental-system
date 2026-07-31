/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { FleetCar } from '@/types/fleet'
import FleetCarCard from './FleetCarCard'

interface FleetGridProps {
  cars?: any[] 
  totalVehicles?: number
  isLoading?: boolean
  onLoadMore?: () => void
  onToggleFavorite?: (carId: string) => void
}

export default function FleetGrid({
  cars = [],
  isLoading = false,
  onToggleFavorite,
}: FleetGridProps) {
  // Show loading skeleton state
  if (isLoading) {
    return (
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-48 md:h-56 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-9 w-28 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show empty state
  if (cars.length === 0) {
    return (
      <div className="flex-1 w-full text-center py-16 bg-white border border-gray-200 rounded-2xl p-8">
        <p className="text-5xl mb-4">🔍</p>
        <h3 className="text-xl font-semibold text-gray-900">No Cars Found</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          We could not find any cars matching your criteria. Try adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {cars.map((carItem) => {
          // Normalize car data to match FleetCar props
          const formattedCar: FleetCar = {
            id: carItem.id,
            name: carItem.name || `${carItem.manufacturer || ''} ${carItem.model || ''}`.trim() || 'Vehicle',
            brand: carItem.brand || carItem.manufacturer,
            category: typeof carItem.category === 'object' ? carItem.category?.name : carItem.category,
            type: typeof carItem.category === 'object' ? carItem.category?.name : carItem.category,
            year: carItem.year,
            price: carItem.price || carItem.pricePerDay || 0,
            image: carItem.image || carItem.imageMain || carItem.imageGallery?.[0] || '',
            images: carItem.images || carItem.imageGallery || [],
            status: carItem.status,
            specs: {
              transmission: typeof carItem.transmission === 'object' ? carItem.transmission?.name : carItem.transmission,
              fuelType: typeof carItem.fuelType === 'object' ? carItem.fuelType?.name : carItem.fuelType,
              seats: carItem.seats,
              location: carItem.locationCity || carItem.locationAddress || 'Main Depot',
              ...carItem.specs,
            },
            features: carItem.features || [],
            model: '',
            fuelType: ''
          }

          return (
            <FleetCarCard
              key={formattedCar.id}
              car={formattedCar}
              onToggleFavorite={onToggleFavorite}
            />
          )
        })}
      </div>
    </div>
  )
}