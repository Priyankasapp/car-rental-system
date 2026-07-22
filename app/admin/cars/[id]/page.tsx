'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useAdmin } from '@/context/AdminContext'
import { CarStatusBadge } from '@/components/admin/CarStatusBadge'
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Gauge, 
  Fuel, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Car as CarIcon, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  ShieldCheck,
  Luggage
} from 'lucide-react'

type Car = {
  id: string
  manufacturer: string
  model: string
  year: number
  category: string
  licensePlate: string
  color?: string
  transmission: string
  fuelType: string
  seats: number
  luggageCapacity?: number
  features: string[]
  pricePerDay: number
  pricePerWeek?: number
  pricePerMonth?: number
  securityDeposit?: number
  mileageFree?: number
  mileageExtraFee?: number
  locationAddress?: string
  locationCity?: string
  locationState?: string
  locationZipCode?: string
  imageMain?: string
  imageGallery: string[]
  status: string
  createdAt: string
  updatedAt: string
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default function AdminCarDetailPage({ params }: PageProps) {
  const { id: carId } = use(params)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { deleteCar } = useAdmin()

  // Data & UI State
  const [car, setCar] = useState<Car | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Auth Guard & Fetch Car
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    const fetchCar = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/cars/${carId}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch vehicle details')
        }

        const carData = data.data.car
        setCar(carData)
        setActiveImage(carData.imageMain || carData.imageGallery?.[0] || null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (user && carId) {
      fetchCar()
    }
  }, [user, authLoading, carId, router])

  // Delete Handler
  const handleDelete = async () => {
    if (!car) return
    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteCar(car.id)
      router.push('/admin/cars')
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete vehicle')
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        <p className="mt-3 text-sm font-medium text-gray-500">Loading car details...</p>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Vehicle Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{error || 'Unable to display vehicle details.'}</p>
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fleet
        </Link>
      </div>
    )
  }

  const carTitle = `${car.manufacturer} ${car.model}`
  const gallery = [car.imageMain, ...(car.imageGallery || [])].filter(Boolean) as string[]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* ===== HEADER & ACTIONS ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars"
            className="p-2.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{carTitle}</h1>
              <CarStatusBadge status={car.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <span>Year {car.year}</span> • 
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-semibold">{car.licensePlate}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/cars/${car.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-gray-700 border border-gray-200 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            Public View
          </Link>

          <Link
            href={`/admin/cars/${car.id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===== MAIN GRID CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Gallery & Specs (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image Showcase */}
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="relative aspect-16/9 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              {activeImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeImage}
                  alt={carTitle}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <CarIcon className="w-16 h-16" />
                  <span className="text-xs text-gray-400 mt-2 font-medium">No cover image provided</span>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white uppercase tracking-wider">
                {car.category}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImage === imgUrl ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Specs Card Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">Technical Specifications</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Transmission</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{car.transmission}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Fuel className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Fuel Type</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{car.fuelType}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Capacity</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{car.seats} Passengers</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Luggage className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Luggage</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{car.luggageCapacity || 0} Bags</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          {car.features && car.features.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">Features & Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Pricing & Location Details (1 Col) */}
        <div className="space-y-6">
          {/* Rate & Pricing Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Rental Rates</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-medium text-gray-500">Daily Rate</span>
                <span className="text-lg font-bold text-gray-900">₹{car.pricePerDay.toLocaleString()}</span>
              </div>

              {car.pricePerWeek ? (
                <div className="flex justify-between items-baseline px-3 py-2 text-xs">
                  <span className="text-gray-500">Weekly Rate</span>
                  <span className="font-semibold text-gray-800">₹{car.pricePerWeek.toLocaleString()}</span>
                </div>
              ) : null}

              {car.pricePerMonth ? (
                <div className="flex justify-between items-baseline px-3 py-2 text-xs">
                  <span className="text-gray-500">Monthly Rate</span>
                  <span className="font-semibold text-gray-800">₹{car.pricePerMonth.toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            {/* Deposit & Mileage Rules */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Security Deposit
                </span>
                <span className="font-medium text-gray-900">₹{(car.securityDeposit || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Included Mileage</span>
                <span className="font-medium text-gray-900">{car.mileageFree || 'Unlimited'} km/day</span>
              </div>
            </div>
          </div>

          {/* Depot Location Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Pickup Location</h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">{car.locationCity || 'Main Depot'}</p>
              <p className="text-xs text-gray-500">{car.locationAddress || 'No detailed address provided.'}</p>
              {car.locationState && <p className="text-xs text-gray-400">{car.locationState}, {car.locationZipCode}</p>}
            </div>
          </div>

          {/* System Metadata */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2 text-[11px] text-gray-500">
            <div className="flex justify-between">
              <span>Added On:</span>
              <span className="font-medium text-gray-700">{new Date(car.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium text-gray-700">{new Date(car.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Vehicle</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{carTitle}</span>?
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}