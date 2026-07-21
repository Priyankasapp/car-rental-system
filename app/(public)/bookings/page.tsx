/* eslint-disable @next/next/no-img-element */
// app/(dashboard)/bookings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Car, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useBooking } from '@/context/BookingContext'
import { useAuth } from '@/context/AuthContext'

export default function BookingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { bookings, getBookings, isLoading: bookingLoading, cancelBooking } = useBooking()
  
  // Track which booking is being cancelled (for loading state)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/bookings')
      return
    }
    
    // Fetch bookings when user is authenticated
    if (user) {
      getBookings()
    }
  }, [user, authLoading, getBookings, router])

  /**
   * Handles booking cancellation with confirmation
   */
  const handleCancel = async (bookingId: string) => {
    // Confirm before cancelling
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }
    
    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId)
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    } finally {
      setCancellingId(null)
    }
  }

  /**
   * Returns the appropriate status badge styling based on booking status
   */
  const getStatusBadge = (status: string): string => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
      EXPIRED: 'bg-gray-50 text-gray-700 border-gray-200',
    }
    return styles[status] || styles.PENDING
  }

  /**
   * Returns the human-readable label for booking status
   */
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      PENDING: 'Pending Approval',
      CONFIRMED: 'Confirmed',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
      EXPIRED: 'Expired',
    }
    return labels[status] || status
  }

  /**
   * Returns the appropriate status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Show loading state
  if (authLoading || bookingLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // If user is not logged in, don't render anything (redirect will happen)
  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mt-20 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your car rental bookings
          </p>
        </div>
        <Link
          href="/fleet"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Car className="w-4 h-4" />
          Book a Car
        </Link>
      </div>

      {/* Empty State - No Bookings */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No Bookings Yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            You haven&apos;t made any bookings yet. Browse our fleet and book your dream car today.
          </p>
          <Link
            href="/fleet"
            className="inline-block mt-4 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      ) : (
        /* Bookings List */
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* Left: Car Info */}
                <div className="flex items-start gap-4">
                  {/* Car Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {booking.carImage ? (
                      <img
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Car Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.carName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {booking.carBrand}
                    </p>
                    
                    {/* Booking Dates */}
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.pickupDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.dropoffDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}</span>
                      </div>
                    </div>

                    {/* Pickup Location */}
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(booking.status || 'PENDING')}`}>
                    {getStatusIcon(booking.status || 'PENDING')}
                    {getStatusLabel(booking.status || 'PENDING')}
                  </span>
                  
                  {/* Total Price */}
                  <span className="text-lg font-bold text-gray-900">
                    ₹{booking.total.toLocaleString()}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Details
                    </Link>

                    {/* Cancel Button - Only for PENDING or CONFIRMED bookings */}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}