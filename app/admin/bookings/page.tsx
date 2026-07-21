/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/bookings/page.tsx
'use client'

import { useEffect, useRef } from 'react'  
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, AlertCircle } from 'lucide-react'
import BookingTable from '@/components/admin/BookingTable'
import BookingFilters from '@/components/admin/BookingFilters'

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { 
    bookings, 
    isLoading, 
    error, 
    fetchBookings,
    fetchStats,
    stats,
    filters,
    setFilters,
  } = useAdmin()

  const hasInitialized = useRef(false)  

  // Check admin access and fetch data - FIXED
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    // Redirect if not admin
    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    //  Only fetch once when admin is available
    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN') && !hasInitialized.current) {
      hasInitialized.current = true
      fetchBookings()
      fetchStats()
    }
  }, [user, authLoading, router, fetchBookings, fetchStats])

  // Handle filter change
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    fetchBookings(newFilters)
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check admin access
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all customer bookings and reservations
          </p>
        </div>
        
        {/* Stats Quick View */}
        <div className="flex items-center gap-4">
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-yellow-600">●</span>
                <span className="text-gray-600">Pending: {stats.pendingBookings}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">●</span>
                <span className="text-gray-600">Confirmed: {stats.confirmedBookings}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-gray-400">●</span>
                <span className="text-gray-600">Total: {stats.totalBookings}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filters */}
      <BookingFilters 
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Bookings Table */}
      <div className="mt-6">
        <BookingTable 
          bookings={bookings} 
          loading={isLoading}
          onRefresh={() => fetchBookings(filters)}
        />
      </div>

      {/* No Bookings State */}
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