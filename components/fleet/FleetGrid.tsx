// components/fleet/FleetGrid.tsx
'use client'

import { FleetCar } from '@/types/fleet'
import FleetCarCard from './FleetCarCard'
import { useCars } from '@/context/CarContext'

interface FleetGridProps {
  cars?: FleetCar[]          
  totalVehicles?: number      
  onLoadMore?: () => void
}

export default function FleetGrid({
  cars: propCars}: FleetGridProps) {
  //  Use CarContext if no props provided
  const { filteredCars, isLoading } = useCars()
  
  //  Use props if provided, otherwise use context
  const cars = propCars || filteredCars
  

  //  Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="h-48 md:h-56 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  //  Show empty state
  if (cars.length === 0) {
    return (
      <div className="flex-1 w-full text-center py-16">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {cars.map((car) => (
          <FleetCarCard key={car.id} car={car} />
        ))}
        
        {/* Load More Card - Uncomment when pagination is ready */}
        {/* {hasMore && onLoadMore && (
          <LoadMoreCard
            title="Unlock More"
            description={`View the complete collection of over ${totalVehicles} exclusive vehicles.`}
            onClick={onLoadMore}
          />
        )} */}
      </div>
    </div>
  )
}