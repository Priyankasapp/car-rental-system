/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/page.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  AlertCircle,
} from 'lucide-react'

// Types
interface AuthUser {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
}

interface AdminStats {
  totalUsers?: number
  totalCars?: number
  totalBookings?: number
  revenue?: number
}

interface RecentBooking {
  id: string
  customerName: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string
  pickupDate: string
  dropoffDate: string
  total: number
  car: {
    manufacturer: string
    model: string
  }
}

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string
  value: number | string
  icon: any
  color: string
  subtitle?: string
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
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
  color 
}: { 
  title: string
  value: number
  icon: any
  color: string
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
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
      className="group p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-gray-300"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color} group-hover:scale-105 transition-transform`}>
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

export default function AdminDashboard() {
  const router = useRouter()

  // Local State (Replacing Auth & Admin Contexts)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [dataLoading, setDataLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const hasInitialized = useRef(false)

  // API Call: Fetch Dashboard Stats & Recent Bookings
  const fetchDashboardData = useCallback(async () => {
    try {
      setDataLoading(true)
      setError(null)

      // Fetch stats and recent bookings concurrently
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/reservations?limit=10', { credentials: 'include' })
      ])

      const statsData = await statsRes.json()
      const bookingsData = await bookingsRes.json()

      if (statsRes.ok && statsData.success) {
        setStats(statsData.data)
      }

      if (bookingsRes.ok && bookingsData.success) {
        const list = bookingsData.data?.bookings || bookingsData.data?.reservations || []
        setBookings(list)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setDataLoading(false)
    }
  }, [])

  // Initial Load: Authenticate and Fetch Data
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initDashboard = async () => {
      try {
        setAuthLoading(true)

        // 1. Verify User Session
        const authRes = await fetch('/api/auth/me', { credentials: 'include' })
        const authData = await authRes.json()

        if (!authRes.ok || !authData.success || !authData.data) {
          router.push('/login')
          return
        }

        const currentUser: AuthUser = authData.data?.user || authData.data
        const role = currentUser.role?.toUpperCase()

        // 2. Check Role Access
        if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          router.push('/admin')
          return
        }

        setUser(currentUser)

        // 3. Load Dashboard Content
        await fetchDashboardData()
      } catch (err) {
        console.error('Authentication check failed:', err)
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

    initDashboard()
  }, [router, fetchDashboardData])

  // Loading state
  if (authLoading || (dataLoading && !user)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Check admin access fallback
  const role = user?.role?.toUpperCase()
  if (!user || (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    return null
  }

  // Recent bookings (last 5)
  const recentBookings = bookings?.slice(0, 5) || []

  // Get status counts
  const statusCounts = {
    pending: bookings?.filter(b => b.status === 'PENDING').length || 0,
    confirmed: bookings?.filter(b => b.status === 'CONFIRMED').length || 0,
    completed: bookings?.filter(b => b.status === 'COMPLETED').length || 0,
    cancelled: bookings?.filter(b => b.status === 'CANCELLED').length || 0,
  }

  return (
    <div>
      {/* ===== WELCOME SECTION ===== */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName || 'Admin'}! 
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is what is happening with your platform today.
        </p>
      </div>

      {/* ===== ERROR DISPLAY ===== */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ===== MAIN STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-600"
          subtitle="Registered users"
        />
        <StatsCard
          title="Total Cars"
          value={stats?.totalCars || 0}
          icon={Car}
          color="bg-green-600"
          subtitle="In fleet"
        />
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          color="bg-purple-600"
          subtitle="All time"
        />
        <StatsCard
          title="Revenue"
          value={`₹${(stats?.revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-amber-600"
          subtitle="From confirmed bookings"
        />
      </div>

      {/* ===== BOOKING STATUS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BookingStatusCard
          title="Pending"
          value={statusCounts.pending}
          icon={Clock}
          color="bg-yellow-600"
        />
        <BookingStatusCard
          title="Confirmed"
          value={statusCounts.confirmed}
          icon={CheckCircle}
          color="bg-green-600"
        />
        <BookingStatusCard
          title="Completed"
          value={statusCounts.completed}
          icon={TrendingUp}
          color="bg-blue-600"
        />
        <BookingStatusCard
          title="Cancelled"
          value={statusCounts.cancelled}
          icon={XCircle}
          color="bg-red-600"
        />
      </div>

      {/* ===== QUICK ACTIONS & RECENT BOOKINGS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          
          <QuickActionCard
            title="Manage Bookings"
            description="View and manage all bookings"
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
            description="Manage registered users"
            href="/admin/users"
            icon={Users}
            color="bg-blue-600"
          />
          
          <QuickActionCard
            title="View Analytics"
            description="Detailed platform analytics"
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
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent bookings</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.car?.manufacturer} {booking.car?.model}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.pickupDate).toLocaleDateString()} → {new Date(booking.dropoffDate).toLocaleDateString()}
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
                          ₹{booking.total.toLocaleString()}
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