/* eslint-disable react-hooks/set-state-in-effect */
// components/fleet/FleetSidebar.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { FleetFilterOption } from '@/types/fleet'

// Export filter state interface for parent components
export interface FleetFiltersState {
  priceMin?: number
  priceMax?: number
  vehicleTypes?: string[]
  brand?: string
  transmission?: string
  searchQuery?: string
}

// Sidebar component props
interface FleetSidebarProps {
  priceRange: {
    min: number
    max: number
  }
  vehicleTypes: FleetFilterOption[]
  brands: FleetFilterOption[]
  transmissions: FleetFilterOption[]
  onFilterChange: (filters: FleetFiltersState) => void
  loading: boolean
}

export default function FleetSidebar({
  priceRange,
  vehicleTypes,
  brands,
  transmissions,
  onFilterChange,
  loading,
}: FleetSidebarProps) {
  // State for internal filter values
  const [selectedPriceMin, setSelectedPriceMin] = useState<number>(priceRange.min)
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(priceRange.max)
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedTransmission, setSelectedTransmission] = useState<string>('')

  // Keep state updated when parent dynamically updates price bounds
  useEffect(() => {
    if (priceRange.min !== undefined && priceRange.max !== undefined) {
      setSelectedPriceMin((prev) => (prev < priceRange.min ? priceRange.min : prev))
      setSelectedPriceMax((prev) => (prev > priceRange.max || prev === 0 ? priceRange.max : prev))
    }
  }, [priceRange.min, priceRange.max])

  // Handle price range inputs
  const handlePriceChange = useCallback((min: number, max: number) => {
    setSelectedPriceMin(min)
    setSelectedPriceMax(max)
  }, [])

  // Handle vehicle type toggling (checkbox list)
  const handleVehicleTypeToggle = useCallback((typeValue: string) => {
    setSelectedVehicleTypes((prev) =>
      prev.includes(typeValue)
        ? prev.filter((t) => t !== typeValue)
        : [...prev, typeValue]
    )
  }, [])

  // Handle brand selection
  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand)
  }, [])

  // Handle transmission selection
  const handleTransmissionChange = useCallback((transmission: string) => {
    setSelectedTransmission(transmission)
  }, [])

  // Apply filters to parent callback
  const handleApplyFilters = useCallback(() => {
    const filters: FleetFiltersState = {
      priceMin: selectedPriceMin,
      priceMax: selectedPriceMax,
      vehicleTypes: selectedVehicleTypes.length > 0 ? selectedVehicleTypes : undefined,
      brand: selectedBrand || undefined,
      transmission: selectedTransmission || undefined,
    }
    onFilterChange(filters)
  }, [
    selectedPriceMin,
    selectedPriceMax,
    selectedVehicleTypes,
    selectedBrand,
    selectedTransmission,
    onFilterChange,
  ])

  // Reset all filters to default state
  const handleResetFilters = useCallback(() => {
    setSelectedPriceMin(priceRange.min)
    setSelectedPriceMax(priceRange.max)
    setSelectedVehicleTypes([])
    setSelectedBrand('')
    setSelectedTransmission('')
    onFilterChange({})
  }, [priceRange.min, priceRange.max, onFilterChange])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Filter Vehicles</h3>
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition hover:underline"
          disabled={loading}
        >
          Reset All
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Daily Rate Price
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              $
            </span>
            <input
              type="number"
              value={selectedPriceMin}
              onChange={(e) =>
                handlePriceChange(Number(e.target.value), selectedPriceMax)
              }
              className="w-full pl-6 pr-2 py-1.5 text-xs font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              min={priceRange.min}
              max={priceRange.max}
              disabled={loading}
            />
          </div>
          <span className="text-gray-300 text-xs">—</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              $
            </span>
            <input
              type="number"
              value={selectedPriceMax}
              onChange={(e) =>
                handlePriceChange(selectedPriceMin, Number(e.target.value))
              }
              className="w-full pl-6 pr-2 py-1.5 text-xs font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              min={priceRange.min}
              max={priceRange.max}
              disabled={loading}
            />
          </div>
        </div>

        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={selectedPriceMax}
          onChange={(e) =>
            handlePriceChange(selectedPriceMin, Number(e.target.value))
          }
          className="w-full accent-black cursor-pointer"
          disabled={loading}
        />
        <div className="flex justify-between text-[11px] text-gray-400 font-medium mt-1">
          <span>Min: ${priceRange.min}</span>
          <span>Max: ${priceRange.max}</span>
        </div>
      </div>

      {/* Vehicle Category Types */}
      {vehicleTypes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Category
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {vehicleTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-gray-900 select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedVehicleTypes.includes(type.value)}
                  onChange={() => handleVehicleTypeToggle(type.value)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                  disabled={loading}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands Select */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Manufacturer / Brand
          </h4>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none bg-white"
            disabled={loading}
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Transmission Select */}
      {transmissions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Transmission
          </h4>
          <select
            value={selectedTransmission}
            onChange={(e) => handleTransmissionChange(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:outline-none bg-white"
            disabled={loading}
          >
            <option value="">All Transmissions</option>
            {transmissions.map((trans) => (
              <option key={trans.id} value={trans.value}>
                {trans.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Apply Button */}
      <button
        type="button"
        onClick={handleApplyFilters}
        className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Filtering...' : 'Apply Filters'}
      </button>
    </div>
  )
}