'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCars } from '@/context/CarContext'

import FleetHero from '@/components/sections/FleetHero'
import FleetSidebar from '@/components/fleet/FleetSidebar'
import FleetGrid from '@/components/fleet/FleetGrid'
import { fleetData } from '@/data/fleet'
import { FleetFilterOption } from '@/types/fleet'

// Add this interface definition
interface FleetFiltersState {
  priceMin?: number
  priceMax?: number
  vehicleTypes?: string[]
  brand?: string
  transmission?: string
  searchQuery?: string
}

interface FilterParams {
  category?: string
  city?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}

export default function FleetPage() {
  const searchParams = useSearchParams()
  
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

  // Load cars on mount with URL filters
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
    if (minPrice) filters.minPrice = parseInt(minPrice, 10)
    if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10)
    
    fetchCars(filters)
  }, [fetchCars, searchParams])

  // Handle filter changes from sidebar
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

  // Convert typeOptions to FleetFilterOption[] format
  const vehicleTypes: FleetFilterOption[] = typeOptions.map(opt => ({
    id: opt.id,
    label: opt.label,
    value: opt.value,
    checked: opt.checked || false
  }))

  // Get unique brands from cars
  const brands: FleetFilterOption[] = [...new Set(filteredCars.map(car => car.brand))].map(brand => ({
    id: brand.toLowerCase().replace(/\s+/g, '-'),
    label: brand,
    value: brand,
    checked: false
  }))

  // Get unique transmissions
  const transmissions: FleetFilterOption[] = [...new Set(filteredCars.map(car => car.specs.transmission))].map(trans => ({
    id: trans.toLowerCase().replace(/\s+/g, '-'),
    label: trans,
    value: trans,
    checked: false
  }))

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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start lg:w-72 shrink-0">
          <FleetSidebar
            priceRange={priceRange}
            vehicleTypes={vehicleTypes}
            brands={brands}
            transmissions={transmissions}
            onFilterChange={handleFilterChange}
            loading={isLoading || isFiltering}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FleetGrid
            cars={filteredCars}
            totalVehicles={filteredCars.length}
            onLoadMore={() => console.log('Load more clicked')}
          />
        </div>
      </div>
    </main>
  )
}