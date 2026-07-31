/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import FleetHero from '@/components/sections/FleetHero'
import FleetSidebar from '@/components/fleet/FleetSidebar'
import FleetGrid from '@/components/fleet/FleetGrid'
import { fleetData } from '@/data/fleet'
import { FleetFilterOption } from '@/types/fleet'

interface FleetFiltersState {
  priceMin?: number
  priceMax?: number
  vehicleTypes?: string[]
  brand?: string
  transmission?: string
  searchQuery?: string
}

interface FilterParams {
  categoryId?: string
  fuelTypeId?: string
  transmissionId?: string
  search?: string
}

function FleetContent() {
  const searchParams = useSearchParams()

  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { hero } = fleetData

  // Fetch cars from public API
  const fetchCarsFromApi = useCallback(async (filters: FilterParams = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()

      if (filters.categoryId) query.append('categoryId', filters.categoryId)
      if (filters.fuelTypeId) query.append('fuelTypeId', filters.fuelTypeId)
      if (filters.transmissionId) query.append('transmissionId', filters.transmissionId)
      if (filters.search) query.append('search', filters.search)

      const queryString = query.toString()

      const response = await fetch(`/api/cars${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load cars')
      }

      setCars(json.data || [])
    } catch (err: any) {
      console.error('Error fetching public cars:', err)
      setError(err?.message || 'Failed to fetch vehicles')
      setCars([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sync API calls with search params
  useEffect(() => {
    const filters: FilterParams = {}

    const categoryId = searchParams.get('categoryId')
    const fuelTypeId = searchParams.get('fuelTypeId')
    const transmissionId = searchParams.get('transmissionId')
    const search = searchParams.get('search')

    if (categoryId) filters.categoryId = categoryId
    if (fuelTypeId) filters.fuelTypeId = fuelTypeId
    if (transmissionId) filters.transmissionId = transmissionId
    if (search) filters.search = search

    fetchCarsFromApi(filters)
  }, [fetchCarsFromApi, searchParams])

  // Derive price range dynamically from cars
  const priceRange = useMemo(() => {
    if (cars.length === 0) return { min: 0, max: 1000 }

    const prices = cars
      .map((car) => Number(car.pricePerDay))
      .filter((price) => !Number.isNaN(price))

    if (prices.length === 0) return { min: 0, max: 1000 }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [cars])

  // Derive categories purely for React Compiler
  const vehicleTypes: FleetFilterOption[] = useMemo(() => {
    const validCategories = cars
      .filter((car) => car.category?.id && car.category?.name)
      .map((car) => [car.category.id, car.category.name] as [string, string])

    return Array.from(new Map(validCategories).entries()).map(([id, name]) => ({
      id,
      label: name,
      value: id,
      checked: false,
    }))
  }, [cars])

  // Derive unique manufacturers purely
  const brands: FleetFilterOption[] = useMemo(() => {
    const uniqueBrands = Array.from(
      new Set(
        cars
          .map((car) => car.manufacturer)
          .filter((brand): brand is string => Boolean(brand))
      )
    )

    return uniqueBrands.map((brand) => ({
      id: brand.toLowerCase().replace(/\s+/g, '-'),
      label: brand,
      value: brand,
      checked: false,
    }))
  }, [cars])

  // Derive unique transmissions purely
  const transmissions: FleetFilterOption[] = useMemo(() => {
    const validTransmissions = cars
      .filter((car) => car.transmission?.id && car.transmission?.name)
      .map((car) => [car.transmission.id, car.transmission.name] as [string, string])

    return Array.from(new Map(validTransmissions).entries()).map(([id, name]) => ({
      id,
      label: name,
      value: id,
      checked: false,
    }))
  }, [cars])

  // Handle filters from sidebar (placed after transmissions for dependency tracking)
  const handleFilterChange = useCallback(
    (newFilters: FleetFiltersState) => {
      const carFilters: FilterParams = {}

      if (newFilters.vehicleTypes && newFilters.vehicleTypes.length > 0) {
        carFilters.categoryId = newFilters.vehicleTypes[0]
      }

      if (newFilters.brand) {
        carFilters.search = newFilters.brand
      }

      if (newFilters.transmission) {
        const selectedTransmission = transmissions.find(
          (item) => item.value === newFilters.transmission || item.label === newFilters.transmission
        )

        if (selectedTransmission) {
          carFilters.transmissionId = selectedTransmission.value
        }
      }

      fetchCarsFromApi(carFilters)
    },
    [fetchCarsFromApi, transmissions]
  )

  const totalVehicles = cars.length

  return (
    <>
        title={hero.title}
      <FleetHero
        label={hero.label}
        description={hero.description}
        totalVehicles={totalVehicles} title={''}      />

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
            loading={isLoading}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FleetGrid
            cars={cars}
            totalVehicles={totalVehicles}
            onLoadMore={() => {
              console.log('Load more clicked')
            }}
          />
        </div>
      </div>
    </>
  )
}

export default function FleetPage() {
  return (
    <main className="mt-20 px-10 md:px-20 py-10 md:py-32 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="py-20 text-center text-gray-500">
            Loading fleet options...
          </div>
        }
      >
        <FleetContent />
      </Suspense>
    </main>
  )
}