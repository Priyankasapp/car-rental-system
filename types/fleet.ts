// types/fleet.ts



// Your existing types
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
  price: number
  image: string
  specs: {
    power: string
    transmission: string
  }
  status: 'available' | 'reserved' | 'new-arrival'
  favorite?: boolean
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

//  Fixed Helper function to convert API car to FleetCar
export function apiCarToFleetCar(apiCar: ApiCar): FleetCar {
  const statusMap: Record<string, 'available' | 'reserved' | 'new-arrival'> = {
    'AVAILABLE': 'available',
    'RESERVED': 'reserved',
    'UNAVAILABLE': 'reserved',
    'MAINTENANCE': 'reserved'
  }

  //  Return single object with all properties (no duplicates)
  return {
    id: apiCar.id,
    name: `${apiCar.manufacturer} ${apiCar.model}`,
    model: apiCar.model,
    brand: apiCar.manufacturer,
    category: apiCar.category,
    price: apiCar.pricePerDay, // Keep as is (in rupees)
    image: apiCar.imageMain,
    specs: {
      power: `${apiCar.seats} Seats`,
      transmission: apiCar.transmission,
    },
    status: statusMap[apiCar.status] || 'available',
    favorite: apiCar.isFavorite || false,
    // Optional fields for display
    year: apiCar.year,
    manufacturer: apiCar.manufacturer,
    seats: apiCar.seats,
    transmission: apiCar.transmission,
    location: apiCar.locationCity,
  }
}