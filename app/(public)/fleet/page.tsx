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

// Interface definitions
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
  status?: string
}

function FleetContent() {
  const searchParams = useSearchParams()

  // Local state replacing CarContext
  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const { hero } = fleetData

  // Function to fetch cars directly from the backend API
  const fetchCarsFromApi = useCallback(async (filters: FilterParams = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()

      if (filters.category) query.append('category', filters.category)
      if (filters.city) query.append('city', filters.city)
      if (filters.search) query.append('search', filters.search)
      if (filters.minPrice !== undefined) query.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice !== undefined) query.append('maxPrice', filters.maxPrice.toString())
      if (filters.status) query.append('status', filters.status)

      const response = await fetch(`/api/cars?${query.toString()}`)
      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load cars')
      }

      setCars(json.data.cars || [])
    } catch (err: any) {
      console.error('Error fetching cars:', err)
      setError(err?.message || 'Failed to fetch vehicles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load cars on initial page render and whenever URL query params change
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

    fetchCarsFromApi(filters)
  }, [fetchCarsFromApi, searchParams])

  // Handle filter changes directly from the sidebar
  const handleFilterChange = useCallback(
    (newFilters: FleetFiltersState) => {
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

      fetchCarsFromApi(carFilters)
    },
    [fetchCarsFromApi]
  )

  // Dynamically derive price bounds from fetched cars
  const priceRange = useMemo(() => {
    if (cars.length === 0) return { min: 0, max: 1000 }
    const prices = cars.map((c) => c.pricePerDay || 0)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [cars])

  // Compute unique categories/types options
  const vehicleTypes: FleetFilterOption[] = useMemo(() => {
    const categoriesMap = new Map<string, string>()
    cars.forEach((car) => {
      const id = car.categoryId || car.category?.id || car.category
      const name = car.category?.name || car.category || 'Standard'
      if (id) categoriesMap.set(id, name)
    })

    return Array.from(categoriesMap.entries()).map(([id, name]) => ({
      id,
      label: name,
      value: id,
      checked: false,
    }))
  }, [cars])

  // Get unique brands/manufacturers from cars safely
  const brands: FleetFilterOption[] = useMemo(() => {
    const uniqueBrands = Array.from(
      new Set(
        cars
          .map((car) => car.manufacturer || car.brand)
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

  // Get unique transmissions safely
  const transmissions: FleetFilterOption[] = useMemo(() => {
    const rawTransmissions = cars
      .map((car) => car.transmission?.name || car.specs?.transmission || car.transmission)
      .filter((trans): trans is string => Boolean(trans) && typeof trans === 'string')

    const uniqueTrans = Array.from(new Set(rawTransmissions))

    return uniqueTrans.map((trans) => ({
      id: trans.toLowerCase().replace(/\s+/g, '-'),
      label: trans,
      value: trans,
      checked: false,
    }))
  }, [cars])

  const totalVehicles = cars.length

  return (
    <>
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
            loading={isLoading}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FleetGrid
            cars={cars}
            totalVehicles={totalVehicles}
            onLoadMore={() => console.log('Load more clicked')}
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