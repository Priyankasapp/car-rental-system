/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, AlertCircle } from 'lucide-react'
import BookingTable from '@/components/admin/BookingTable'
import BookingFilters from '@/components/admin/BookingFilters'

type Booking = any
type BookingFiltersState = Record<string, any>

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [filters, setFiltersState] = useState<BookingFiltersState>({})

  const hasInitialized = useRef(false)

  const fetchBookings = async (activeFilters: BookingFiltersState = filters) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()

      Object.entries(activeFilters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
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
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/bookings/stats`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStats(data.data)
      }
    } catch {
      setStats(null)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }

    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN') && !hasInitialized.current) {
      hasInitialized.current = true
      fetchBookings()
      fetchStats()
    }
  }, [user, authLoading, router])

  const handleFilterChange = (newFilters: BookingFiltersState) => {
    setFiltersState(newFilters)
    fetchBookings(newFilters)
  }

  if (authLoading || (isLoading && bookings.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all customer bookings and reservations
          </p>
        </div>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-yellow-600">●</span>
                <span className="text-gray-600">Pending: {stats.pendingBookings ?? 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">●</span>
                <span className="text-gray-600">Confirmed: {stats.confirmedBookings ?? 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400">●</span>
                <span className="text-gray-600">Total: {stats.totalBookings ?? 0}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <BookingFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      <div className="mt-6">
        <BookingTable
          bookings={bookings}
          loading={isLoading}
          onRefresh={() => fetchBookings(filters)}
        />
      </div>

      {!isLoading && bookings.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </div>
  )
}