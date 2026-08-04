// app/admin/bookings/page.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getCurrentUser, type CurrentUser } from '@/lib/client-auth'
import { useRouter } from 'next/navigation'
import { Calendar, AlertCircle } from 'lucide-react'
import BookingTable from '@/components/admin/BookingTable'
import BookingFilters from '@/components/admin/BookingFilters'

export interface Booking {
  id: string
  reservationRef: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: string
  dropoffDate: string
  pickupTime: string
  dropoffTime: string
  pickupLocation: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  total: number
  car: {
    id: string
    manufacturer: string
    model: string
    year: number
    imageMain: string | null
    licensePlate: string | null
    status: string
  }
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string
    role: string
  }
  createdAt: string
}

export interface BookingStats {
  pendingBookings?: number
  confirmedBookings?: number
  totalBookings?: number
}

export type BookingFiltersState = {
  status?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [filters, setFiltersState] = useState<BookingFiltersState>({})

  const hasInitialized = useRef(false)

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setAuthLoading(false))
  }, [])

  // API Call to fetch bookings
  const fetchBookings = useCallback(async (activeFilters: BookingFiltersState = filters) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()

      Object.entries(activeFilters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      const res = await fetch(`/api/admin/reservations?${params.toString()}`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch bookings')
      }

      setBookings(data.data?.bookings || data.data?.reservations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // API Call to fetch stats summary
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reservations/stats`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStats(data.data)
      }
    } catch {
      setStats(null)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN'|| user?.role === 'STAFF'

    if (!authLoading && user && !isAdmin) {
      router.push('/admin')
      return
    }

    if (user && isAdmin && !hasInitialized.current) {
      hasInitialized.current = true
      fetchBookings()
      fetchStats()
    }
  }, [user, authLoading, router, fetchBookings, fetchStats])

  const handleFilterChange = (newFilters: BookingFiltersState) => {
    setFiltersState(newFilters)
    fetchBookings(newFilters)
  }

  if (authLoading || (isLoading && bookings.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    )
  }

  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN'

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, cancel, or modify active customer reservations
          </p>
        </div>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-gray-600">Pending: {stats.pendingBookings ?? 0}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Confirmed: {stats.confirmedBookings ?? 0}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-gray-600">Total: {stats.totalBookings ?? 0}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <BookingFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      <div className="mt-6">
        <BookingTable
          bookings={bookings}
          loading={isLoading}
          onRefresh={() => {
            fetchBookings(filters)
            fetchStats()
          }}
        />
      </div>

      {!isLoading && bookings.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search criteria or filter properties.
          </p>
        </div>
      )}
    </div>
  )
}
