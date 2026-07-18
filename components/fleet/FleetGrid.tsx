// components/fleet/FleetGrid.tsx
'use client'

import { FleetCar } from '@/types/fleet'
import FleetCarCard from './FleetCarCard'
import LoadMoreCard from './LoadMoreCard'

interface FleetGridProps {
  cars: FleetCar[]
  totalVehicles: number
  onLoadMore?: () => void
}

export default function FleetGrid({
  cars,
  totalVehicles,
  onLoadMore
}: FleetGridProps) {
  // Check if there are more vehicles available in the database to fetch
  const hasMore = cars.length < totalVehicles

  return (
    <div className="flex-1 w-full">
      {/* 
        Responsive layout matches perfectly with standard display ratios.
        Changes xl:grid-cols-3 to 3-column max grids to perfectly preserve the 2-2 spec pill geometry inside the cards.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {cars.map((car) => (
          <FleetCarCard key={car.id} car={car} />
        ))}
        
        {/* Only renders the action card if pagination data indicates there are items remaining */}
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