// app/(public)/fleet/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCars } from '@/context/CarContext'

import FleetHero from '@/components/sections/FleetHero'
import FleetSidebar, { FleetFiltersState } from '@/components/fleet/FleetSidebar'
import FleetGrid from '@/components/fleet/FleetGrid'
import { fleetData } from '@/data/fleet'
import { FleetFilterOption } from '@/types/fleet'

//  Define filter type
interface FilterParams {
  category?: string
  city?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}

export default function FleetPage() {
  const searchParams = useSearchParams()
  
  //  Use CarContext
  const { 
    filteredCars, 
    isLoading, 
    error, 
    fetchCars, 
    applyFilters,
    typeOptions,
    priceRange
  } = useCars()
  
  const { hero } = fleetData
  const [isFiltering, setIsFiltering] = useState(false)

  //  Load cars on mount with URL filters
  useEffect(() => {
    const filters: FilterParams = {}
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    
    if (category) filters.category = category
    if (city) filters.city = city
    if (search) filters.search = search
    if (minPrice) filters.minPrice = parseInt(minPrice)
    if (maxPrice) filters.maxPrice = parseInt(maxPrice)
    
    fetchCars(filters)
  }, [fetchCars, searchParams])

  //  Handle filter changes from sidebar
  const handleFilterChange = useCallback((newFilters: FleetFiltersState) => {
    setIsFiltering(true)
    
    const carFilters: FilterParams = {}
    
    if (newFilters.priceMin !== undefined) {
      carFilters.minPrice = newFilters.priceMin
    }
    if (newFilters.priceMax !== undefined) {
      carFilters.maxPrice = newFilters.priceMax
    }
    if (newFilters.vehicleTypes && newFilters.vehicleTypes.length > 0) {
      carFilters.category = newFilters.vehicleTypes[0]
    }
    if (newFilters.brand) {
      carFilters.search = newFilters.brand
    }
    
    applyFilters(carFilters)
    setIsFiltering(false)
  }, [applyFilters])

  //  Convert typeOptions to FleetFilterOption[] format
  const vehicleTypes: FleetFilterOption[] = typeOptions.map(opt => ({
    id: opt.id,
    label: opt.label,
    value: opt.value,
    checked: opt.checked || false
  }))

  //  Get unique brands from cars
  const brands: FleetFilterOption[] = [...new Set(filteredCars.map(car => car.brand))].map(brand => ({
    id: brand.toLowerCase().replace(/\s+/g, '-'),
    label: brand,
    value: brand,
    checked: false
  }))

  //  Get unique transmissions
  const transmissions: FleetFilterOption[] = [...new Set(filteredCars.map(car => car.specs.transmission))].map(trans => ({
    id: trans.toLowerCase().replace(/\s+/g, '-'),
    label: trans,
    value: trans,
    checked: false
  }))

  //  totalVehicles as number
  const totalVehicles = filteredCars.length

  return (
    <main className="mt-20 px-10 md:px-20 py-10 md:py-32 max-w-7xl mx-auto">
      <FleetHero
        label={hero.label}
        title={hero.title}
        description={hero.description}
        totalVehicles={totalVehicles}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
           {error}
        </div>
      )}

      <div className="flex gap-12">
        <FleetSidebar
          priceRange={priceRange}
          vehicleTypes={vehicleTypes}
          brands={brands}
          transmissions={transmissions}
          onFilterChange={handleFilterChange}
          // loading={isLoading || isFiltering}
        />

        <FleetGrid
          cars={filteredCars}
          totalVehicles={filteredCars.length}
          onLoadMore={() => console.log('Load more clicked')}
        />
      </div>
    </main>
  )
}