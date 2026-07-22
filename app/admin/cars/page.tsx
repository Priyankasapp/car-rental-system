/* eslint-disable @next/next/no-img-element */
// app/(admin)/cars/page.tsx
'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, 
  Car as CarIcon, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Gauge, 
  Users, 
  Fuel, 
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Wrench,
  XCircle
} from 'lucide-react'
import { CarStatusBadge } from '@/components/admin/CarStatusBadge'

export default function AdminCarsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { cars, isLoading, error, fetchCars, deleteCar } = useAdmin()
  const hasInitialized = useRef(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  // Check admin access and fetch cars
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN') && !hasInitialized.current) {
      hasInitialized.current = true
      fetchCars()
    }
  }, [user, authLoading, router, fetchCars])

  // Filtered Cars Memo
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch = 
        `${car.manufacturer} ${car.model} ${car.licensePlate}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'ALL' || car.category === selectedCategory
      const matchesStatus = selectedStatus === 'ALL' || car.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [cars, searchTerm, selectedCategory, selectedStatus])

  // Stats Counters
  const stats = useMemo(() => {
    return {
      total: cars.length,
      available: cars.filter(c => c.status === 'AVAILABLE').length,
      reserved: cars.filter(c => c.status === 'RESERVED').length,
      maintenance: cars.filter(c => c.status === 'MAINTENANCE').length,
    }
  }, [cars])

  // Handle delete car
  const handleDelete = async (id: string, carName: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    if (!confirm(`Are you sure you want to delete ${carName}? This action cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteCar(id)
    } catch (err) {
      console.error('Failed to delete car:', err)
    } finally {
      setDeletingId(null)
    }
  }

  //  Handle card click - navigate to car detail
  const handleCardClick = (carId: string) => {
    router.push(`/admin/cars/${carId}`)
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading fleet data...</p>
      </div>
    )
  }

  // Auth Guard
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of all vehicles, current status, and availability
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {/* ===== METRICS OVERVIEW BAR ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 rounded-lg text-gray-700">
            <CarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Fleet</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Available</p>
            <p className="text-xl font-bold text-gray-900">{stats.available}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <CarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Reserved</p>
            <p className="text-xl font-bold text-gray-900">{stats.reserved}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Maintenance</p>
            <p className="text-xl font-bold text-gray-900">{stats.maintenance}</p>
          </div>
        </div>
      </div>

      {/* ===== ERROR MESSAGE ===== */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ===== FILTERS & SEARCH TOOLBAR ===== */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search make, model, license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="SEDAN">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="LUXURY">Luxury</option>
            <option value="CONVERTIBLE">Convertible</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="VAN">Van</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* ===== CARS GRID ===== */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200/80 rounded-2xl">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No vehicles match your criteria</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCars.map((car) => {
            const carTitle = `${car.manufacturer} ${car.model}`
            return (
              <div
                key={car.id}
                onClick={() => handleCardClick(car.id)} 
                className="group bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
              >
                {/* Visual Header / Image Container */}
                <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                  {car.imageMain ? (
                    <img
                      src={car.imageMain}
                      alt={carTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <CarIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {/* Gradient Overlay for Actions */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 justify-between">
                    <span className="text-xs font-medium text-white/90">
                      ID: {car.id.slice(-6)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/cars/${car.id}/edit`}
                        onClick={(e) => e.stopPropagation()} 
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white text-gray-800 transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(car.id, carTitle, e)} 
                        disabled={deletingId === car.id}
                        className="p-2 bg-red-600/90 backdrop-blur-sm rounded-lg hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                        title="Delete Vehicle"
                      >
                        {deletingId === car.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <CarStatusBadge status={car.status} size="sm" />
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider text-white uppercase">
                    {car.category}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Title & License */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                        {carTitle}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[11px] font-semibold rounded border border-gray-200">
                        {car.licensePlate}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Year {car.year}</p>
                  </div>

                  {/* Feature Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Gauge className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Fuel className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{car.locationCity || 'Main Depot'}</span>
                    </div>
                  </div>

                  {/* Price & View Details */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">Rate</span>
                      <p className="text-base font-extrabold text-gray-900">
                        ₹{car.pricePerDay.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ day</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cars/${car.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()} 
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View on website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <span className="text-xs font-medium text-gray-400">
                        Click to view →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}