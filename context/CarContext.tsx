/* eslint-disable react-hooks/set-state-in-effect */
// context/CarContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { FleetCar, FleetFilterOption, apiCarToFleetCar } from '@/types/fleet'

interface CarContextType {
  // State
  cars: FleetCar[]
  filteredCars: FleetCar[]
  isLoading: boolean
  error: string | null
  
  // Filter state
  selectedBrands: string[]
  selectedTypes: string[]
  selectedTransmissions: string[]
  priceRange: { min: number; max: number; currentMin: number; currentMax: number }
  
  // Filter options
  brandOptions: FleetFilterOption[]
  typeOptions: FleetFilterOption[]
  transmissionOptions: FleetFilterOption[]
  
  // Actions
  fetchCars: () => Promise<void>
  toggleBrand: (brandId: string) => void
  toggleType: (typeId: string) => void
  toggleTransmission: (transmissionId: string) => void
  setPriceRange: (min: number, max: number) => void
  clearAllFilters: () => void
  toggleFavorite: (carId: string) => void
  isFavorite: (carId: string) => boolean
}

const CarContext = createContext<CarContextType | undefined>(undefined)

// Define types for API response
interface ApiCar {
  id: string
  manufacturer: string
  model: string
  year: number
  category: string
  pricePerDay: number
  imageMain: string
  transmission: string
  fuelType: string
  seats: number
  locationCity: string
  locationState: string
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'MAINTENANCE'
  isFavorite?: boolean
  averageRating?: number
  totalReviews?: number
}

interface ApiFilters {
  categories: string[]
  cities: string[]
  priceRange: {
    min: number
    max: number
  }
}

interface ApiResponse {
  success: boolean
  data: {
    cars: ApiCar[]
    filters: ApiFilters
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export function CarProvider({ children }: { children: React.ReactNode }) {
  // State
  const [cars, setCars] = useState<FleetCar[]>([])
  const [filteredCars, setFilteredCars] = useState<FleetCar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 1000,
    currentMin: 0,
    currentMax: 1000
  })
  
  // Filter options
  const [brandOptions, setBrandOptions] = useState<FleetFilterOption[]>([])
  const [typeOptions, setTypeOptions] = useState<FleetFilterOption[]>([])
  const [transmissionOptions, setTransmissionOptions] = useState<FleetFilterOption[]>([])

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carFavorites')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Use a state setter without triggering re-render cascade
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }, [])

  // Save favorites to localStorage - moved to separate effect
  useEffect(() => {
    try {
      localStorage.setItem('carFavorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [favorites])

  // Extract filter options from cars
  const extractFilterOptions = useCallback((fleetCars: FleetCar[]) => {
    // Brands
    const brands = [...new Set(fleetCars.map(car => car.brand))].map(brand => ({
      id: brand.toLowerCase().replace(/\s+/g, '-'),
      label: brand,
      value: brand,
      checked: selectedBrands.includes(brand)
    }))
    setBrandOptions(brands)
    
    // Types/Categories
    const types = [...new Set(fleetCars.map(car => car.category))].map(type => ({
      id: type.toLowerCase().replace(/\s+/g, '-'),
      label: type,
      value: type,
      checked: selectedTypes.includes(type)
    }))
    setTypeOptions(types)
    
    // Transmissions
    const transmissions = [...new Set(fleetCars.map(car => car.specs.transmission))].map(trans => ({
      id: trans.toLowerCase().replace(/\s+/g, '-'),
      label: trans,
      value: trans,
      checked: selectedTransmissions.includes(trans)
    }))
    setTransmissionOptions(transmissions)
  }, [selectedBrands, selectedTypes, selectedTransmissions])

  // Fetch cars from API
  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/cars?limit=20')
      
      if (!response.ok) {
        throw new Error('Failed to fetch cars')
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        // Convert API cars to FleetCar format
        const fleetCars = data.data.cars.map((car: ApiCar) => {
          const fleetCar = apiCarToFleetCar(car)
          fleetCar.favorite = favorites.includes(car.id)
          return fleetCar
        })
        
        setCars(fleetCars)
        setFilteredCars(fleetCars)
        
        // Extract filter options
        extractFilterOptions(fleetCars)
        
        // Set price range
        if (data.data.filters?.priceRange) {
          const minPrice = data.data.filters.priceRange.min / 100
          const maxPrice = data.data.filters.priceRange.max / 100
          setPriceRange({
            min: minPrice,
            max: maxPrice,
            currentMin: minPrice,
            currentMax: maxPrice,
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cars')
      console.error('Fetch cars error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [favorites, extractFilterOptions])

  // Apply all filters - this will be called by effects and user actions
  const applyFilters = useCallback(() => {
    let filtered = [...cars]
    
    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(car => selectedBrands.includes(car.brand))
    }
    
    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(car => selectedTypes.includes(car.category))
    }
    
    // Filter by transmissions
    if (selectedTransmissions.length > 0) {
      filtered = filtered.filter(car => 
        selectedTransmissions.includes(car.specs.transmission)
      )
    }
    
    // Filter by price range
    filtered = filtered.filter(car => 
      car.price >= priceRange.currentMin && car.price <= priceRange.currentMax
    )
    
    setFilteredCars(filtered)
  }, [cars, selectedBrands, selectedTypes, selectedTransmissions, priceRange])

  // Re-apply filters when dependencies change
  // Using a separate effect to update filtered cars
  useEffect(() => {
    // This is safe because applyFilters uses useCallback and has proper dependencies
    applyFilters()
  }, [applyFilters])

  // Alternative: Use useMemo for filtered cars instead of useEffect
  // This is actually better practice for derived state
  const computedFilteredCars = useMemo(() => {
    let filtered = [...cars]
    
    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(car => selectedBrands.includes(car.brand))
    }
    
    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(car => selectedTypes.includes(car.category))
    }
    
    // Filter by transmissions
    if (selectedTransmissions.length > 0) {
      filtered = filtered.filter(car => 
        selectedTransmissions.includes(car.specs.transmission)
      )
    }
    
    // Filter by price range
    filtered = filtered.filter(car => 
      car.price >= priceRange.currentMin && car.price <= priceRange.currentMax
    )
    
    return filtered
  }, [cars, selectedBrands, selectedTypes, selectedTransmissions, priceRange])

  // Update filteredCars when computed value changes
  useEffect(() => {
    setFilteredCars(computedFilteredCars)
  }, [computedFilteredCars])

  // Toggle brand filter
  const toggleBrand = useCallback((brandId: string) => {
    setSelectedBrands(prev => {
      const brand = brandOptions.find(b => b.id === brandId)
      if (!brand) return prev
      
      const brandName = brand.value
      const newBrands = prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
      
      // Update brand options checked state
      setBrandOptions(prevOptions => 
        prevOptions.map(opt => ({
          ...opt,
          checked: newBrands.includes(opt.value)
        }))
      )
      
      return newBrands
    })
  }, [brandOptions])

  // Toggle type filter
  const toggleType = useCallback((typeId: string) => {
    setSelectedTypes(prev => {
      const type = typeOptions.find(t => t.id === typeId)
      if (!type) return prev
      
      const typeName = type.value
      const newTypes = prev.includes(typeName)
        ? prev.filter(t => t !== typeName)
        : [...prev, typeName]
      
      setTypeOptions(prevOptions => 
        prevOptions.map(opt => ({
          ...opt,
          checked: newTypes.includes(opt.value)
        }))
      )
      
      return newTypes
    })
  }, [typeOptions])

  // Toggle transmission filter
  const toggleTransmission = useCallback((transmissionId: string) => {
    setSelectedTransmissions(prev => {
      const trans = transmissionOptions.find(t => t.id === transmissionId)
      if (!trans) return prev
      
      const transName = trans.value
      const newTransmissions = prev.includes(transName)
        ? prev.filter(t => t !== transName)
        : [...prev, transName]
      
      setTransmissionOptions(prevOptions => 
        prevOptions.map(opt => ({
          ...opt,
          checked: newTransmissions.includes(opt.value)
        }))
      )
      
      return newTransmissions
    })
  }, [transmissionOptions])

  // Set price range
  const setPriceRangeHandler = useCallback((min: number, max: number) => {
    setPriceRange(prev => ({
      ...prev,
      currentMin: min,
      currentMax: max
    }))
  }, [])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedBrands([])
    setSelectedTypes([])
    setSelectedTransmissions([])
    setPriceRange(prev => ({
      ...prev,
      currentMin: prev.min,
      currentMax: prev.max
    }))
    
    // Reset filter options checked state
    setBrandOptions(prev => prev.map(opt => ({ ...opt, checked: false })))
    setTypeOptions(prev => prev.map(opt => ({ ...opt, checked: false })))
    setTransmissionOptions(prev => prev.map(opt => ({ ...opt, checked: false })))
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback((carId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(carId)
      const newFavorites = isFav
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
      
      // Update cars
      setCars(prevCars =>
        prevCars.map(car =>
          car.id === carId
            ? { ...car, favorite: !isFav }
            : car
        )
      )
      
      return newFavorites
    })
  }, [])

  // Check if car is favorite
  const isFavorite = useCallback((carId: string): boolean => {
    return favorites.includes(carId)
  }, [favorites])

  // Load cars on mount
  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const value = useMemo(() => ({
    cars,
    filteredCars,
    isLoading,
    error,
    selectedBrands,
    selectedTypes,
    selectedTransmissions,
    priceRange,
    brandOptions,
    typeOptions,
    transmissionOptions,
    fetchCars,
    toggleBrand,
    toggleType,
    toggleTransmission,
    setPriceRange: setPriceRangeHandler,
    clearAllFilters,
    toggleFavorite,
    isFavorite,
  }), [
    cars,
    filteredCars,
    isLoading,
    error,
    selectedBrands,
    selectedTypes,
    selectedTransmissions,
    priceRange,
    brandOptions,
    typeOptions,
    transmissionOptions,
    fetchCars,
    toggleBrand,
    toggleType,
    toggleTransmission,
    setPriceRangeHandler,
    clearAllFilters,
    toggleFavorite,
    isFavorite,
  ])

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  )
}

export function useCars() {
  const context = useContext(CarContext)
  if (context === undefined) {
    throw new Error('useCars must be used within a CarProvider')
  }
  return context
}