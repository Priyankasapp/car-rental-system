/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/bookings/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Trash2,
  Shield,
  Users,
  Building2,
  Award,
  ChevronDown
} from 'lucide-react'

//  Define BookingDetail interface
interface BookingDetail {
  id: string
  reservationRef: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  isGuestBooking: boolean
  pickupLocation: string
  pickupDate: string
  pickupTime: string
  dropoffLocation: string
  dropoffDate: string
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
  status: string
  cancellationReason: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  availableActions: string[]
  car: {
    id: string
    manufacturer: string
    model: string
    year: number
    imageMain: string
    licensePlate: string
    category: string
    status: string
  }
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    role: string
  } | null
  paymentSummary: {
    totalPaid: number
    totalRefunded: number
    paymentCount: number
    completedPayments: number
  }
  auditLogs: Array<{
    id: string
    action: string
    previousStatus: string
    newStatus: string
    notes: string
    createdAt: string
    performedByUser: {
      firstName: string
      lastName: string
      email: string
    }
  }>
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { 
    currentBooking,
    isLoading,
    error,
    fetchBookingById,
    deleteBooking,
    fetchBookings,
  } = useAdmin()

  //  Unwrap params using use()
  const { id } = use(params)
  
  //  Use all state variables
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoadingLocal, setIsLoadingLocal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  //  Update booking when currentBooking changes
  useEffect(() => {
    if (currentBooking) {
      setBooking(currentBooking as unknown as BookingDetail)
    }
  }, [currentBooking])

  //  Fetch booking when id changes
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
      fetchBookingById(id)
    }
  }, [user, authLoading, router, fetchBookingById, id])

  //  Status change handler
  const handleStatusChange = async (status: string, reason?: string) => {
    if (!booking) return
    setIsLoadingLocal(true)
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          cancellationReason: reason 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status')
      }
      
      await fetchBookingById(booking.id)
      setShowStatusDropdown(false)
      setShowCancelModal(false)
      setCancellationReason('')
    } catch (error) {
      console.error('Error updating status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setIsLoadingLocal(false)
    }
  }

  //  Delete handler
  const handleDelete = async () => {
    if (!booking) return
    setIsLoadingLocal(true)
    try {
      await deleteBooking(booking.id)
      await fetchBookings()
      router.push('/admin/bookings')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    } finally {
      setIsLoadingLocal(false)
      setShowDeleteModal(false)
    }
  }

  //  Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-green-50 text-green-800 border-green-200',
      CANCELLED: 'bg-red-50 text-red-800 border-red-200',
      COMPLETED: 'bg-blue-50 text-blue-800 border-blue-200',
      EXPIRED: 'bg-gray-50 text-gray-800 border-gray-200',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <ClockIcon className="w-4 h-4" />,
      CONFIRMED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <XCircle className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      EXPIRED: <AlertCircle className="w-4 h-4" />,
    }
    return icons[status as keyof typeof icons] || <AlertCircle className="w-4 h-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CONFIRM': 'Confirm Booking',
      'CANCEL': 'Cancel Booking',
      'COMPLETE': 'Complete Booking',
    }
    return labels[action] || action
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-500">Loading booking details...</p>
      </div>
    )
  }

  // Check admin access
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium text-gray-900">Error loading booking</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Bookings
        </button>
      </div>
    )
  }

  // No booking found
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Calendar className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-medium text-gray-900">Booking not found</p>
        <p className="text-sm text-gray-500">The booking you are looking for does not exist or has been deleted</p>
        <Link
          href="/admin/bookings"
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Booking #{booking.reservationRef}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Dropdown */}
          {booking.availableActions && booking.availableActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={isLoadingLocal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <span>Change Status</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStatusDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowStatusDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                    {booking.availableActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          if (action === 'CANCEL') {
                            setShowCancelModal(true)
                            setShowStatusDropdown(false)
                          } else {
                            handleStatusChange(action)
                          }
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                          action === 'CANCEL' ? 'text-red-600' : 
                          action === 'CONFIRM' ? 'text-green-600' :
                          'text-blue-600'
                        }`}
                      >
                        {getStatusActionLabel(action)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

         
         
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for cancelling this booking.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none min-h-[100px]"
              placeholder="Enter cancellation reason..."
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (cancellationReason.trim()) {
                    handleStatusChange('CANCELLED', cancellationReason)
                  }
                }}
                disabled={!cancellationReason.trim() || isLoadingLocal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Booking</h2>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoadingLocal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {booking.customerEmail}
                </p>
              </div>
              {booking.customerPhone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {booking.customerPhone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Booking Type</p>
                <p className="font-medium text-gray-900">
                  {booking.isGuestBooking ? 'Guest Booking' : 'Registered User'}
                </p>
              </div>
              {booking.user && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">User Account</p>
                  <p className="font-medium text-gray-900">
                    {booking.user.firstName} {booking.user.lastName}
                    <span className="text-sm text-gray-500 ml-2">
                      ({booking.user.email})
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Rental Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  Pickup
                </div>
                <p className="font-medium text-gray-900">{booking.pickupLocation}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(booking.pickupDate)}
                  <Clock className="w-4 h-4 ml-2" />
                  {booking.pickupTime}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  Dropoff
                </div>
                <p className="font-medium text-gray-900">{booking.dropoffLocation}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(booking.dropoffDate)}
                  <Clock className="w-4 h-4 ml-2" />
                  {booking.dropoffTime}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Rental Days: <strong>{booking.rentalDays}</strong></span>
              <span>Daily Rate: <strong>{formatCurrency(booking.dailyRate)}</strong></span>
            </div>
          </div>

          {/* Extras */}
          {(booking.chauffeur || booking.conciergeDelivery || booking.platinumInsurance || booking.satelliteConnectivity) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                Additional Services
              </h2>
              <div className="flex flex-wrap gap-3">
                {booking.chauffeur && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Users className="w-4 h-4" />
                    Chauffeur
                  </span>
                )}
                {booking.conciergeDelivery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    <Building2 className="w-4 h-4" />
                    Concierge Delivery
                  </span>
                )}
                {booking.platinumInsurance && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                    <Shield className="w-4 h-4" />
                    Platinum Insurance
                  </span>
                )}
                {booking.satelliteConnectivity && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    Satellite Connectivity
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {booking.adminNotes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              <p className="text-gray-600">{booking.adminNotes}</p>
            </div>
          )}

          {booking.cancellationReason && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancellation Reason
              </h2>
              <p className="text-red-700">{booking.cancellationReason}</p>
            </div>
          )}

          {/* Audit Log */}
          {booking.auditLogs && booking.auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Activity Log
              </h2>
              <div className="space-y-4">
                {booking.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                        {log.previousStatus && log.newStatus && (
                          <span className="text-gray-500">
                            {' '}from <span className="text-yellow-600">{log.previousStatus}</span>
                            {' '}to <span className="text-green-600">{log.newStatus}</span>
                          </span>
                        )}
                      </p>
                      {log.notes && (
                        <p className="text-sm text-gray-500">{log.notes}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{log.performedByUser.firstName} {log.performedByUser.lastName}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Car Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-gray-400" />
              Vehicle
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {booking.car.imageMain ? (
                  <img 
                    src={booking.car.imageMain} 
                    alt={`${booking.car.manufacturer} ${booking.car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Car className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.car.manufacturer} {booking.car.model}
                </p>
                <p className="text-sm text-gray-500">{booking.car.year}</p>
                <p className="text-sm text-gray-500">{booking.car.category}</p>
                <p className="text-xs text-gray-400">License: {booking.car.licensePlate}</p>
              </div>
            </div>
            <Link
              href={`/admin/cars/${booking.car.id}`}
              className="mt-3 text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
            >
              View Car Details
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daily Rate</span>
                <span className="text-gray-900">{formatCurrency(booking.dailyRate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rental Days</span>
                <span className="text-gray-900">{booking.rentalDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(booking.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">{formatCurrency(booking.tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900 text-lg">{formatCurrency(booking.total)}</span>
                </div>
              </div>
              {booking.paymentSummary && booking.paymentSummary.totalPaid > 0 && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(booking.paymentSummary.totalPaid)}</span>
                  </div>
                  {booking.paymentSummary.totalRefunded > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Refunded</span>
                      <span>{formatCurrency(booking.paymentSummary.totalRefunded)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Booking Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {booking.status === 'CONFIRMED' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking Confirmed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.status === 'CANCELLED' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking Cancelled</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.status === 'COMPLETED' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking Completed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}