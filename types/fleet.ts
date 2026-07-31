// types/fleet.ts

// Existing filter types
export interface FleetFilter {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'button' | 'range'
  options?: FleetFilterOption[]
  min?: number
  max?: number
}

export interface FleetFilterOption {
  id: string
  label: string
  value: string
  checked?: boolean
}

export interface FleetCar {
  id: string
  name: string
  model: string
  brand: string
  category: string
  type?: string
  price: number
  image: string
  imageGallery?: string[] // Primary array of extra gallery images
  images?: string[]       // Optional alias for image gallery compatibility
  fuelType: string
  specs: {
    power: string
    transmission: string
    acceleration?: string
  }
  status: 'available' | 'reserved' | 'new-arrival'
  favorite?: boolean
  features?: string[]    // Added to resolve the features property error
  // Additional fields for display
  year?: number
  manufacturer?: string
  seats?: number
  transmission?: string
  location?: string
}

export interface FleetData {
  hero: {
    label: string
    title: string
    description: string
    totalVehicles: number
  }
  filters: {
    priceRange: {
      min: number
      max: number
      currentMin: number
      currentMax: number
    }
    vehicleTypes: FleetFilterOption[]
    brands: FleetFilterOption[]
    transmission: FleetFilterOption[]
  }
  cars: FleetCar[]
  footer: {
    brand: {
      name: string
      description: string
    }
    sections: {
      title: string
      links: {
        label: string
        href: string
      }[]
    }[]
  }
}

// New types for API integration
export interface ApiCar {
  id: string
  manufacturer: string
  model: string
  year: number
  category: string | { id: string; name: string }
  pricePerDay: number
  imageMain: string
  imageGallery?: string[]
  images?: string[]
  features?: string[]
  transmission: string | { id: string; name: string }
  fuelType: string | { id: string; name: string }
  seats: number
  locationCity?: string
  locationAddress?: string
  locationState?: string
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'MAINTENANCE' | string
  isFavorite?: boolean
  averageRating?: number
  totalReviews?: number
}

// Helper function to convert API car to FleetCar
export function apiCarToFleetCar(apiCar: ApiCar): FleetCar {
  const statusMap: Record<string, 'available' | 'reserved' | 'new-arrival'> = {
    'AVAILABLE': 'available',
    'RESERVED': 'reserved',
    'UNAVAILABLE': 'reserved',
    'MAINTENANCE': 'reserved',
  }

  // Helper to extract string name whether relation object or string
  const getRelName = (val: string | { id: string; name: string } | undefined): string => {
    if (!val) return ''
    return typeof val === 'object' ? val.name : val
  }

  // Parse or normalize gallery images
  const gallery = 
    apiCar.imageGallery?.length ? apiCar.imageGallery :
    apiCar.images?.length ? apiCar.images :
    apiCar.imageMain ? [apiCar.imageMain] : []

  const categoryName = getRelName(apiCar.category)
  const transmissionName = getRelName(apiCar.transmission)
  const fuelTypeName = getRelName(apiCar.fuelType)
  const location = apiCar.locationCity || apiCar.locationAddress || 'Main Depot'

  return {
    id: apiCar.id,
    name: `${apiCar.manufacturer || ''} ${apiCar.model || ''}`.trim() || 'Vehicle',
    model: apiCar.model,
    brand: apiCar.manufacturer,
    category: categoryName,
    type: categoryName,
    price: apiCar.pricePerDay || 0,
    image: apiCar.imageMain || gallery[0] || '',
    imageGallery: gallery,
    images: gallery,
    fuelType: fuelTypeName,
    features: apiCar.features || [],
    specs: {
      power: `${apiCar.seats || 0} Seats`,
      transmission: transmissionName,
    },
    status: statusMap[apiCar.status] || 'available',
    favorite: apiCar.isFavorite || false,
    year: apiCar.year,
    manufacturer: apiCar.manufacturer,
    seats: apiCar.seats,
    transmission: transmissionName,
    location,
  }
}