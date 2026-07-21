/* eslint-disable @next/next/no-img-element */
// components/admin/BookingTable.tsx
'use client'

import Link from 'next/link'
import BookingStatusBadge from './BookingStatusBadge'
import { Calendar, User, Car, Eye, RefreshCw } from 'lucide-react'

interface Booking {
  id: string
  reservationRef: string
  customerName: string
  customerEmail: string
  car: {
    manufacturer: string
    model: string
    imageMain?: string
  }
  pickupDate: string
  dropoffDate: string
  total: number
  status: string
  createdAt: string
}

interface BookingTableProps {
  bookings: Booking[]
  loading?: boolean
  onRefresh?: () => void
}

export default function BookingTable({ 
  bookings, 
  loading = false,
  onRefresh 
}: BookingTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Car
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition">
                {/* Booking ID */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {booking.reservationRef}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Car */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {booking.car.imageMain ? (
                      <img 
                        src={booking.car.imageMain} 
                        alt={`${booking.car.manufacturer} ${booking.car.model}`}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <Car className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {booking.car.manufacturer} {booking.car.model}
                    </span>
                  </div>
                </td>

                {/* Dates */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    <p>{new Date(booking.pickupDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</p>
                    <p className="text-xs text-gray-400">
                      → {new Date(booking.dropoffDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </td>

                {/* Total */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{booking.total.toLocaleString()}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <BookingStatusBadge status={booking.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}