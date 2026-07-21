/* eslint-disable @typescript-eslint/no-explicit-any */
// context/BookingContext.tsx
'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from './AuthContext'

//  Types - Add id field and all booking fields
export interface BookingItem {
  id: string  
  carId: string
  carName: string
  carBrand: string
  carImage: string
  pricePerDay: number
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
  rentalDays: number
  subtotal: number
  tax: number
  total: number
  status?: string 
  reservationRef?: string  
}

export interface BookingState {
  currentBooking: BookingItem | null
  bookings: BookingItem[]
  isLoading: boolean
  error: string | null
}

interface BookingContextType {
  // State
  currentBooking: BookingItem | null
  bookings: BookingItem[]
  isLoading: boolean
  error: string | null
  
  // Actions
  createBooking: (bookingData: any) => Promise<any>
  getBookings: () => Promise<void>
  getBookingById: (id: string) => Promise<BookingItem | null>
  cancelBooking: (id: string) => Promise<void>
  clearCurrentBooking: () => void
  updateBooking: (id: string, data: Partial<BookingItem>) => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  const [currentBooking, setCurrentBooking] = useState<BookingItem | null>(null)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  //  Clear booking on logout
  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentBooking(null)
      setBookings([])
    }
  }, [isAuthenticated])

  //  Create a new booking
  const createBooking = useCallback(async (bookingData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking')
      }

      //  Ensure reservation has id
      const reservation = data.data?.reservation || data.data
      if (reservation && !reservation.id) {
        reservation.id = reservation._id || Math.random().toString(36).substring(2, 10)
      }

      //  Store current booking
      setCurrentBooking(reservation)
      
      //  Add to bookings list
      setBookings(prev => [reservation, ...prev])

      return reservation
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  //  Get all bookings
  const getBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please login to view bookings')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reservations')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings')
      }

      //  Ensure all bookings have id
      const reservations = data.data?.reservations || []
      const bookingsWithId = reservations.map((b: any) => {
        if (!b.id) {
          b.id = b._id || Math.random().toString(36).substring(2, 10)
        }
        return b
      })

      setBookings(bookingsWithId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  //  Get single booking by ID
  const getBookingById = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reservations/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking')
      }

      const reservation = data.data?.reservation || data.data
      if (reservation && !reservation.id) {
        reservation.id = reservation._id || id
      }

      setCurrentBooking(reservation)
      return reservation
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  //  Cancel booking
  const cancelBooking = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking')
      }

      //  Remove from bookings list
      setBookings(prev => prev.filter(b => b.id !== id))
      
      //  Clear current booking if it's the one cancelled
      if (currentBooking?.id === id) {
        setCurrentBooking(null)
      }

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentBooking])

  //  Update booking
  const updateBooking = useCallback(async (id: string, data: Partial<BookingItem>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update booking')
      }

      const updatedReservation = result.data?.reservation || result.data
      if (updatedReservation && !updatedReservation.id) {
        updatedReservation.id = updatedReservation._id || id
      }

      //  Update bookings list
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, ...updatedReservation } : b)
      )

      //  Update current booking if it's the one updated
      if (currentBooking?.id === id) {
        setCurrentBooking(prev => prev ? { ...prev, ...updatedReservation } : null)
      }

      return updatedReservation
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentBooking])

  //  Clear current booking
  const clearCurrentBooking = useCallback(() => {
    setCurrentBooking(null)
  }, [])

  const value = useMemo(() => ({
    currentBooking,
    bookings,
    isLoading,
    error,
    createBooking,
    getBookings,
    getBookingById,
    cancelBooking,
    clearCurrentBooking,
    updateBooking,
  }), [
    currentBooking,
    bookings,
    isLoading,
    error,
    createBooking,
    getBookings,
    getBookingById,
    cancelBooking,
    clearCurrentBooking,
    updateBooking,
  ])

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}