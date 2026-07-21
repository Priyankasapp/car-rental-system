// app/(admin)/cars/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { Plus, Car, AlertCircle, Edit, Trash2, Eye, MapPin, Gauge, Users, Fuel } from 'lucide-react'
import { CarStatusBadge } from '@/components/admin/CarStatusBadge'

export default function AdminCarsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { cars, isLoading, error, fetchCars, deleteCar } = useAdmin()
  const hasInitialized = useRef(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ✅ Check admin access and fetch cars
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

  // ✅ Handle delete car
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteCar(id)
    } catch (error) {
      console.error('Failed to delete car:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // ✅ Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // ✅ Check admin access
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cars</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your fleet of vehicles
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Car
        </Link>
      </div>

      {/* ===== ERROR MESSAGE ===== */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ===== CARS GRID ===== */}
      {cars.length === 0 && !isLoading && !error ? (
        /* Empty State */
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No cars found</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first car to the fleet</p>
          <Link
            href="/admin/cars/new"
            className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Car
          </Link>
        </div>
      ) : (
        /* Cars Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Car Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {car.imageMain ? (
                  <img
                    src={car.imageMain}
                    alt={`${car.manufacturer} ${car.model}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <CarStatusBadge status={car.status} size="sm" />
                </div>

                {/* Actions - Top Left */}
                <div className="absolute top-3 left-3 flex items-center gap-1">
                  <Link
                    href={`/cars/${car.id}`}
                    target="_blank"
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    title="View on website"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </Link>
                  <Link
                    href={`/admin/cars/${car.id}/edit`}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    title="Edit car"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(car.id)}
                    disabled={deletingId === car.id}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                    title="Delete car"
                  >
                    {deletingId === car.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Car Info */}
              <div className="p-4">
                {/* Title */}
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {car.manufacturer} {car.model}
                  </h3>
                  <p className="text-sm text-gray-500">{car.year} • {car.category}</p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span>{car.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{car.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{car.locationCity || 'N/A'}</span>
                  </div>
                </div>

                {/* License Plate */}
                <div className="mb-3">
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {car.licensePlate}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Price per day</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{car.pricePerDay.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/cars/${car.id}/edit`}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}