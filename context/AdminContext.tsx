/* eslint-disable @typescript-eslint/no-explicit-any */
// context/AdminContext.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

// ============== TYPES ==============

export interface AdminBooking {
  id: string
  reservationRef: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  carId: string
  car: {
    id: string
    manufacturer: string
    model: string
    year: number
    imageMain: string
  }
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
  } | null
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  pickupTime: string
  dropoffTime: string
  chauffeur: boolean
  conciergeDelivery: boolean
  platinumInsurance: boolean
  satelliteConnectivity: boolean
  dailyRate: number
  rentalDays: number
  subtotal: number
  tax: number
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED'
  cancellationReason: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminCar {
  id: string
  manufacturer: string
  model: string
  year: number
  category: string
  licensePlate: string
  color: string | null
  transmission: string
  fuelType: string
  seats: number
  luggageCapacity: number
  features: string[]
  pricePerDay: number
  pricePerWeek: number | null
  pricePerMonth: number | null
  securityDeposit: number
  mileageFree: number | null
  mileageExtraFee: number | null
  locationAddress: string
  locationCity: string
  locationState: string
  locationZipCode: string
  locationLat: number | null
  locationLng: number | null
  imageMain: string
  imageGallery: string[]
  status: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE' | 'MAINTENANCE'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  isEmailVerified: boolean
  isActive: boolean
  profilePicture: string | null
  createdAt: string
  updatedAt: string
  _count: {
    reservations: number
    sessions: number
    emailLogs: number
  }
}

export interface AdminStats {
  totalUsers: number
  totalCars: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  revenue: number
}

interface BookingFilters {
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface AdminContextType {
  // State - Bookings
  bookings: AdminBooking[]
  currentBooking: AdminBooking | null
  stats: AdminStats | null
  isLoading: boolean
  error: string | null
  filters: BookingFilters
  
  // State - Cars
  cars: AdminCar[]
  
  // State - Users
  users: AdminUser[]
  
  // Actions - Bookings
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  fetchBookingById: (id: string) => Promise<void>
  confirmBooking: (id: string) => Promise<void>
  rejectBooking: (id: string, reason?: string) => Promise<void>
  
  // Actions - Stats
  fetchStats: () => Promise<void>
  
  // Actions - Cars
  fetchCars: () => Promise<void>
  addCar: (carData: any) => Promise<any>
  updateCar: (id: string, carData: any) => Promise<any>
  deleteCar: (id: string) => Promise<void>
  
  // Actions - Users
  fetchUsers: () => Promise<void>
  addUser: (userData: any) => Promise<any>
  updateUser: (id: string, userData: any) => Promise<any>
  deleteUser: (id: string) => Promise<void>
  
  // Actions - Filters
  setFilters: (filters: BookingFilters) => void
  clearFilters: () => void
}

// ============== CONTEXT ==============

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const hasInitialized = useRef(false)
  
  // ============== STATE - BOOKINGS ==============
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [currentBooking, setCurrentBooking] = useState<AdminBooking | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [filters, setFiltersState] = useState<BookingFilters>({})

  // ============== STATE - CARS ==============
  const [cars, setCars] = useState<AdminCar[]>([])

  // ============== STATE - USERS ==============
  const [users, setUsers] = useState<AdminUser[]>([])

  // ============== STATE - UI ==============
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============== CHECK ADMIN ACCESS ==============
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN'

  // ============== FETCH BOOKINGS ==============
  const fetchBookings = useCallback(async (newFilters?: BookingFilters) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const mergedFilters = { ...filters, ...newFilters }
      const params = new URLSearchParams()
      
      if (mergedFilters.search) params.append('search', mergedFilters.search)
      if (mergedFilters.status) params.append('status', mergedFilters.status)
      if (mergedFilters.startDate) params.append('startDate', mergedFilters.startDate)
      if (mergedFilters.endDate) params.append('endDate', mergedFilters.endDate)

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings')
      }

      setBookings(data.data.bookings)
      setFiltersState(mergedFilters)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, filters])

  // ============== FETCH SINGLE BOOKING ==============
  const fetchBookingById = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking')
      }

      setCurrentBooking(data.data.booking)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== CONFIRM BOOKING ==============
  const confirmBooking = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${id}/confirm`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm booking')
      }

      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b)
      )

      if (currentBooking?.id === id) {
        setCurrentBooking(prev => prev ? { ...prev, status: 'CONFIRMED' } : null)
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, currentBooking])

  // ============== REJECT BOOKING ==============
  const rejectBooking = useCallback(async (id: string, reason?: string) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject booking')
      }

      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: 'CANCELLED', cancellationReason: reason || null } : b)
      )

      if (currentBooking?.id === id) {
        setCurrentBooking(prev => 
          prev ? { ...prev, status: 'CANCELLED', cancellationReason: reason || null } : null
        )
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, currentBooking])

  // ============== FETCH STATS ==============
  const fetchStats = useCallback(async () => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats')
      }

      setStats(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== FETCH CARS ==============
  const fetchCars = useCallback(async () => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/cars')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cars')
      }

      setCars(data.data.cars)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== ADD CAR ==============
  const addCar = useCallback(async (carData: any) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add car')
      }

      setCars(prev => [...prev, data.data.car])
      return data.data.car
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== UPDATE CAR ==============
  const updateCar = useCallback(async (id: string, carData: any) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update car')
      }

      setCars(prev => prev.map(c => c.id === id ? data.data.car : c))
      return data.data.car
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== DELETE CAR ==============
  const deleteCar = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/cars/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete car')
      }

      setCars(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== FETCH USERS ==============
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users')
      }

      setUsers(data.data.users)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== ADD USER ==============
  const addUser = useCallback(async (userData: any) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add user')
      }

      setUsers(prev => [...prev, data.data.user])
      return data.data.user
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== UPDATE USER ==============
  const updateUser = useCallback(async (id: string, userData: any) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      setUsers(prev => prev.map(u => u.id === id ? data.data.user : u))
      return data.data.user
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== DELETE USER ==============
  const deleteUser = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Admin access required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user')
      }

      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // ============== FILTERS ==============
  const setFilters = useCallback((newFilters: BookingFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    fetchBookings({})
  }, [fetchBookings])

  // ============== INITIAL LOAD ==============
  useEffect(() => {
    if (isAdmin && !hasInitialized.current) {
      hasInitialized.current = true
      fetchBookings()
      fetchStats()
      fetchCars()
      fetchUsers()  // ✅ Fetch users on initial load
    }
  }, [isAdmin, fetchBookings, fetchStats, fetchCars, fetchUsers])

  // ============== CONTEXT VALUE ==============
  const value = useMemo(() => ({
    // Bookings
    bookings,
    currentBooking,
    stats,
    isLoading,
    error,
    filters,
    fetchBookings,
    fetchBookingById,
    confirmBooking,
    rejectBooking,
    fetchStats,
    setFilters,
    clearFilters,
    // Cars
    cars,
    fetchCars,
    addCar,
    updateCar,
    deleteCar,
    // Users
    users,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  }), [
    bookings,
    currentBooking,
    stats,
    isLoading,
    error,
    filters,
    fetchBookings,
    fetchBookingById,
    confirmBooking,
    rejectBooking,
    fetchStats,
    setFilters,
    clearFilters,
    cars,
    fetchCars,
    addCar,
    updateCar,
    deleteCar,
    users,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  ])

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// ============== HOOK ==============
export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}