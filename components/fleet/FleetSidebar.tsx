// components/fleet/FleetSidebar.tsx
'use client'

import { useState, useCallback } from 'react'
import { FleetFilterOption } from '@/types/fleet'

//  Export this type so it can be imported in page.tsx
export interface FleetFiltersState {
  priceMin?: number
  priceMax?: number
  vehicleTypes?: string[]
  brand?: string
  transmission?: string
  searchQuery?: string
}

//  Define the props interface
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
  onFilterChange: (filters: FleetFiltersState) => void
  loading: boolean
}

export default function FleetSidebar({
  priceRange,
  vehicleTypes,
  brands,
  transmissions,
  onFilterChange,
  loading
}: FleetSidebarProps) {
  // State for filter values
  const [selectedPriceMin, setSelectedPriceMin] = useState<number>(priceRange.currentMin)
  const [selectedPriceMax, setSelectedPriceMax] = useState<number>(priceRange.currentMax)
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedTransmission, setSelectedTransmission] = useState<string>('')

  // Handle price range change
  const handlePriceChange = useCallback((min: number, max: number) => {
    setSelectedPriceMin(min)
    setSelectedPriceMax(max)
  }, [])

  // Handle vehicle type toggle
  const handleVehicleTypeToggle = useCallback((type: string) => {
    setSelectedVehicleTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
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

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    const filters: FleetFiltersState = {
      priceMin: selectedPriceMin,
      priceMax: selectedPriceMax,
      vehicleTypes: selectedVehicleTypes.length > 0 ? selectedVehicleTypes : undefined,
      brand: selectedBrand || undefined,
      transmission: selectedTransmission || undefined
    }
    onFilterChange(filters)
  }, [selectedPriceMin, selectedPriceMax, selectedVehicleTypes, selectedBrand, selectedTransmission, onFilterChange])

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedPriceMin(priceRange.min)
    setSelectedPriceMax(priceRange.max)
    setSelectedVehicleTypes([])
    setSelectedBrand('')
    setSelectedTransmission('')
    onFilterChange({})
  }, [priceRange, onFilterChange])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleResetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          disabled={loading}
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={selectedPriceMin}
            onChange={(e) => handlePriceChange(Number(e.target.value), selectedPriceMax)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={priceRange.min}
            max={priceRange.max}
            disabled={loading}
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            value={selectedPriceMax}
            onChange={(e) => handlePriceChange(selectedPriceMin, Number(e.target.value))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={priceRange.min}
            max={priceRange.max}
            disabled={loading}
          />
        </div>
        <div className="mt-2">
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={selectedPriceMin}
            onChange={(e) => handlePriceChange(Number(e.target.value), selectedPriceMax)}
            className="w-full"
            disabled={loading}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>₹{priceRange.min}</span>
            <span>₹{priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Types */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Vehicle Type</h4>
        <div className="space-y-2">
          {vehicleTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedVehicleTypes.includes(type.value)}
                onChange={() => handleVehicleTypeToggle(type.value)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brand</h4>
        <select
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Transmissions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Transmission</h4>
        <select
          value={selectedTransmission}
          onChange={(e) => handleTransmissionChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Apply Button */}
      <button
        onClick={handleApplyFilters}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Applying...' : 'Apply Filters'}
      </button>
    </div>
  )
}