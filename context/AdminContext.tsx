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
  // State
  bookings: AdminBooking[]
  currentBooking: AdminBooking | null
  stats: AdminStats | null
  isLoading: boolean
  error: string | null
  filters: BookingFilters
  
  // Actions - Bookings
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  fetchBookingById: (id: string) => Promise<void>
  confirmBooking: (id: string) => Promise<void>
  rejectBooking: (id: string, reason?: string) => Promise<void>
  
  // Actions - Stats
  fetchStats: () => Promise<void>
  
  // Actions - Filters
  setFilters: (filters: BookingFilters) => void
  clearFilters: () => void
}

// ============== CONTEXT ==============

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const hasInitialized = useRef(false)  
  
  // ============== STATE ==============
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [currentBooking, setCurrentBooking] = useState<AdminBooking | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<BookingFilters>({})

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

  // ============== FILTERS ==============
  const setFilters = useCallback((newFilters: BookingFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    fetchBookings({})
  }, [fetchBookings])

  // ============== INITIAL LOAD - FIXED ==============
  useEffect(() => {
    // Only run once when admin is available
    if (isAdmin && !hasInitialized.current) {
      hasInitialized.current = true
      fetchBookings()
      fetchStats()
    }
  }, [isAdmin, fetchBookings, fetchStats])

  // ============== CONTEXT VALUE ==============
  const value = useMemo(() => ({
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