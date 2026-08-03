/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Car, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

// ===== TYPES =====
interface DashboardMetrics {
  totalCustomers: number
  totalCars: number
  totalRevenue: number
  activeReservations: number
  pendingReservations: number
  completedReservations: number
  cancelledReservations: number
}

interface RecentReservation {
  id: string
  status: string
  totalAmount: number
  startDate: string
  endDate: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  car: {
    make: string
    model: string
    year: number
    licensePlate: string
  }
}

// ===== COMPONENTS =====

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  loading
}: { 
  title: string
  value: number | string
  icon: any
  color: string
  subtitle?: string
  loading?: boolean
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Booking Status Card
const BookingStatusCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  loading
}: { 
  title: string
  value: number
  icon: any
  color: string
  loading?: boolean
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mt-0.5" />
          ) : (
            <p className="text-xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </div>
  )
}

// Quick Action Card
const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  color 
}: { 
  title: string
  description: string
  href: string
  icon: any
  color: string
}) => {
  return (
    <Link
      href={href}
      className="group p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-gray-300 block"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color} group-hover:scale-105 transition-transform shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  )
}

// ===== MAIN DASHBOARD =====
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalCars: 0,
    totalRevenue: 0,
    activeReservations: 0,
    pendingReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
  })
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/dashboard')
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to load dashboard metrics')
      }

      if (result.data?.metrics) {
        setMetrics(result.data.metrics)
      }
      if (result.data?.recentReservations) {
        setRecentReservations(result.data.recentReservations)
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div>
      {/* ===== WELCOME SECTION ===== */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Admin! 
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is what is happening with your fleet and reservations today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ===== MAIN STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Customers"
          value={metrics.totalCustomers.toLocaleString()}
          icon={Users}
          color="bg-blue-600"
          subtitle="Registered active users"
          loading={loading}
        />
        <StatsCard
          title="Total Fleet Cars"
          value={metrics.totalCars.toLocaleString()}
          icon={Car}
          color="bg-green-600"
          subtitle="Active vehicles in system"
          loading={loading}
        />
        <StatsCard
          title="Active Rentals"
          value={metrics.activeReservations.toLocaleString()}
          icon={Calendar}
          color="bg-purple-600"
          subtitle="Currently ongoing"
          loading={loading}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-amber-600"
          subtitle="From completed payments"
          loading={loading}
        />
      </div>

      {/* ===== BOOKING STATUS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BookingStatusCard
          title="Pending Requests"
          value={metrics.pendingReservations}
          icon={Clock}
          color="bg-yellow-600"
          loading={loading}
        />
        <BookingStatusCard
          title="Confirmed"
          value={metrics.activeReservations}
          icon={CheckCircle}
          color="bg-green-600"
          loading={loading}
        />
        <BookingStatusCard
          title="Completed"
          value={metrics.completedReservations}
          icon={TrendingUp}
          color="bg-blue-600"
          loading={loading}
        />
        <BookingStatusCard
          title="Cancelled"
          value={metrics.cancelledReservations}
          icon={XCircle}
          color="bg-red-600"
          loading={loading}
        />
      </div>

      {/* ===== QUICK ACTIONS & RECENT BOOKINGS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          
          <QuickActionCard
            title="Manage Bookings"
            description="View and manage all reservations"
            href="/admin/bookings"
            icon={Calendar}
            color="bg-purple-600"
          />
          
          <QuickActionCard
            title="Add New Car"
            description="Add a new vehicle to fleet"
            href="/admin/cars/new"
            icon={Car}
            color="bg-green-600"
          />
          
          <QuickActionCard
            title="View All Users"
            description="Manage customer profiles"
            href="/admin/users"
            icon={Users}
            color="bg-blue-600"
          />
          
          <QuickActionCard
            title="View Analytics"
            description="Detailed financial analytics"
            href="/admin/analytics"
            icon={BarChart3}
            color="bg-amber-600"
          />
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link 
              href="/admin/bookings" 
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent reservations found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentReservations.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ₹{booking.totalAmount?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}