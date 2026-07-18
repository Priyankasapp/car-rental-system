'use client'

import { useState } from 'react'

import FleetHero from '@/components/sections/FleetHero'
import FleetSidebar, { FleetFiltersState } from '@/components/fleet/FleetSidebar'
import FleetGrid from '@/components/fleet/FleetGrid'
import { fleetData } from '@/data/fleet'

export default function FleetPage() {
  const { hero, filters, cars } = fleetData
  const [filteredCars, setFilteredCars] = useState(cars)

  // Explicitly type-bound `newFilters` to our state interface
  const handleFilterChange = (newFilters: FleetFiltersState) => {
    let filtered = [...cars]

    // Filter by price
    if (newFilters.priceMin !== undefined) {
      filtered = filtered.filter(car => car.price >= newFilters.priceMin)
    }
    if (newFilters.priceMax !== undefined) {
      filtered = filtered.filter(car => car.price <= newFilters.priceMax)
    }

    // Filter by vehicle types
    if (newFilters.vehicleTypes && newFilters.vehicleTypes.length > 0) {
      filtered = filtered.filter(car => 
        newFilters.vehicleTypes.some((type: string) => 
          car.category.toLowerCase().includes(type.toLowerCase())
        )
      )
    }

    // Filter by brand
    if (newFilters.brand) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase() === newFilters.brand.toLowerCase()
      )
    }

    // Filter by transmission
    if (newFilters.transmission) {
      filtered = filtered.filter(car => 
        car.specs.transmission.toLowerCase() === newFilters.transmission.toLowerCase()
      )
    }

    setFilteredCars(filtered)
  }

  return (
    <main className="mt-20 px-10 md:px-20 py-10 md:py-32 max-w-[1100px] mx-auto">
      <FleetHero
        label={hero.label}
        title={hero.title}
        description={hero.description}
        totalVehicles={hero.totalVehicles}
      />

      <div className="flex gap-12">
        <FleetSidebar
          priceRange={filters.priceRange}
          vehicleTypes={filters.vehicleTypes}
          brands={filters.brands}
          transmissions={filters.transmission}
          onFilterChange={handleFilterChange}
        />

        <FleetGrid
          cars={filteredCars}
          totalVehicles={hero.totalVehicles}
          onLoadMore={() => console.log('Load more clicked')}
        />
      </div>
    </main>
  )
}