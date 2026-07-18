'use client'

import { useState } from 'react'
import PriceRangeFilter from './PriceRangeFilter'
import VehicleTypeFilter from './VehicleTypeFilter'
import BrandFilter from './BrandFilter'
import TransmissionFilter from './TransmissionFilter'
import { FleetFilterOption } from '@/types/fleet'

// 1. Define the structural shape of your active filters
export interface FleetFiltersState {
  priceMin: number
  priceMax: number
  vehicleTypes: string[]
  brand: string
  transmission: string
}

interface FleetSidebarProps {
  priceRange: {
    min: number
    max: number
    currentMin: number
    currentMax: number
  }
  vehicleTypes: FleetFilterOption[]
  brands: FleetFilterOption[]
  transmissions: FleetFilterOption[]
  // 2. Replace 'any' with the concrete type definition
  onFilterChange?: (filters: FleetFiltersState) => void
}

export default function FleetSidebar({
  priceRange,
  vehicleTypes,
  brands,
  transmissions,
  onFilterChange
}: FleetSidebarProps) {
  // 3. Strongly type the useState hook
  const [filters, setFilters] = useState<FleetFiltersState>({
    priceMin: priceRange.currentMin,
    priceMax: priceRange.currentMax,
    vehicleTypes: vehicleTypes.filter(t => t.checked).map(t => t.value),
    brand: brands.find(b => b.checked)?.value || '',
    transmission: ''
  })

  // 4. Use keyof to dynamically reference valid object keys safely instead of string/any
  const updateFilters = <K extends keyof FleetFiltersState>(
    key: K, 
    value: FleetFiltersState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-28 flex flex-col gap-07">
        <PriceRangeFilter
          min={priceRange.min}
          max={priceRange.max}
          currentMin={filters.priceMin}
          currentMax={filters.priceMax}
          // Note: you probably want to handle both min and max changes here eventually!
          onChange={(min, max) => {
            const newFilters = { ...filters, priceMin: min, priceMax: max }
            setFilters(newFilters)
            onFilterChange?.(newFilters)
          }}
        />

        <VehicleTypeFilter
          types={vehicleTypes}
          onChange={(selected) => updateFilters('vehicleTypes', selected)}
        />

        <BrandFilter
          brands={brands}
          onChange={(selected) => updateFilters('brand', selected)}
        />

        <TransmissionFilter
          transmissions={transmissions}
          onChange={(selected) => updateFilters('transmission', selected)}
        />
      </div>
    </aside>
  )
}