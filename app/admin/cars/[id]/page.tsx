/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/cars/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'

//  Car Form Component
const CarForm = ({ 
  car, 
  onSubmit, 
  isLoading,
  isEdit = false 
}: { 
  car?: any
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
  isEdit?: boolean
}) => {
  const [formData, setFormData] = useState({
    manufacturer: car?.manufacturer || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    category: car?.category || 'SEDAN',
    licensePlate: car?.licensePlate || '',
    color: car?.color || '',
    transmission: car?.transmission || 'AUTOMATIC',
    fuelType: car?.fuelType || 'PETROL',
    seats: car?.seats || 5,
    luggageCapacity: car?.luggageCapacity || 4,
    features: car?.features?.join(', ') || '',
    pricePerDay: car?.pricePerDay || '',
    pricePerWeek: car?.pricePerWeek || '',
    pricePerMonth: car?.pricePerMonth || '',
    securityDeposit: car?.securityDeposit || 0,
    mileageFree: car?.mileageFree || '',
    mileageExtraFee: car?.mileageExtraFee || '',
    locationAddress: car?.locationAddress || '',
    locationCity: car?.locationCity || '',
    locationState: car?.locationState || '',
    locationZipCode: car?.locationZipCode || '',
    imageMain: car?.imageMain || '',
    imageGallery: car?.imageGallery?.join(', ') || '',
    status: car?.status || 'AVAILABLE',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ['SEDAN', 'SUV', 'LUXURY', 'CONVERTIBLE', 'HATCHBACK', 'VAN']
  const transmissions = ['AUTOMATIC', 'MANUAL']
  const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']
  const statuses = ['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'MAINTENANCE']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required'
    }
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.licensePlate) newErrors.licensePlate = 'License plate is required'
    if (!formData.pricePerDay) newErrors.pricePerDay = 'Price per day is required'
    if (!formData.imageMain) newErrors.imageMain = 'Main image URL is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        features: formData.features ? formData.features.split(',').map((f: string) => f.trim()) : [],
        imageGallery: formData.imageGallery ? formData.imageGallery.split(',').map((f: string) => f.trim()) : [],
        pricePerDay: Number(formData.pricePerDay),
        pricePerWeek: formData.pricePerWeek ? Number(formData.pricePerWeek) : null,
        pricePerMonth: formData.pricePerMonth ? Number(formData.pricePerMonth) : null,
        securityDeposit: Number(formData.securityDeposit),
        mileageFree: formData.mileageFree ? Number(formData.mileageFree) : null,
        mileageExtraFee: formData.mileageExtraFee ? Number(formData.mileageExtraFee) : null,
        year: Number(formData.year),
        seats: Number(formData.seats),
        luggageCapacity: Number(formData.luggageCapacity),
      }
      await onSubmit(submitData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer *
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.manufacturer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Toyota"
            />
            {errors.manufacturer && (
              <p className="mt-1 text-sm text-red-500">{errors.manufacturer}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Camry"
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-500">{errors.model}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
              min={1900}
              max={new Date().getFullYear() + 1}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-500">{errors.year}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.licensePlate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., ABC-1234"
            />
            {errors.licensePlate && (
              <p className="mt-1 text-sm text-red-500">{errors.licensePlate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              placeholder="e.g., Red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            >
              {transmissions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            >
              {fuelTypes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seats
            </label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={1}
              max={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Luggage Capacity
            </label>
            <input
              type="number"
              name="luggageCapacity"
              value={formData.luggageCapacity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
              max={20}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features (comma separated)
          </label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            rows={3}
            placeholder="e.g., GPS, Bluetooth, Backup Camera, Cruise Control"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Day (₹) *
            </label>
            <input
              type="number"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.pricePerDay ? 'border-red-500' : 'border-gray-300'
              }`}
              min={0}
              placeholder="e.g., 5000"
            />
            {errors.pricePerDay && (
              <p className="mt-1 text-sm text-red-500">{errors.pricePerDay}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Week (₹)
            </label>
            <input
              type="number"
              name="pricePerWeek"
              value={formData.pricePerWeek}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
              placeholder="e.g., 30000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Month (₹)
            </label>
            <input
              type="number"
              name="pricePerMonth"
              value={formData.pricePerMonth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
              placeholder="e.g., 120000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Deposit (₹)
            </label>
            <input
              type="number"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage Free (km)
            </label>
            <input
              type="number"
              name="mileageFree"
              value={formData.mileageFree}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Mileage Fee (₹/km)
            </label>
            <input
              type="number"
              name="mileageExtraFee"
              value={formData.mileageExtraFee}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              min={0}
              placeholder="e.g., 50"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              placeholder="e.g., 123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              placeholder="e.g., New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="locationState"
              value={formData.locationState}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              placeholder="e.g., NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="locationZipCode"
              value={formData.locationZipCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              placeholder="e.g., 10001"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Image URL *
            </label>
            <input
              type="url"
              name="imageMain"
              value={formData.imageMain}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none ${
                errors.imageMain ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageMain && (
              <p className="mt-1 text-sm text-red-500">{errors.imageMain}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Images (comma separated URLs)
            </label>
            <textarea
              name="imageGallery"
              value={formData.imageGallery}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              rows={2}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/cars"
          className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? 'Update Car' : 'Create Car'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const { cars, isLoading, fetchCars, updateCar, addCar } = useAdmin()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEdit = !!params?.id
  const carId = params?.id as string

  //  Fetch car data if editing
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    if (isEdit && cars.length === 0) {
      fetchCars()
    }

    if (isEdit && cars.length > 0) {
      const foundCar = cars.find(c => c.id === carId)
      if (foundCar) {
        setCar(foundCar)
      } else {
        // Car not found in list, fetch directly
        fetchCars()
      }
      setLoading(false)
    } else if (!isEdit) {
      setLoading(false)
    }
  }, [user, authLoading, router, isEdit, carId, cars, fetchCars])

  //  Handle form submission
  const handleSubmit = async (formData: any) => {
    setSubmitError(null)
    try {
      if (isEdit) {
        await updateCar(carId, formData)
      } else {
        await addCar(formData)
      }
      router.push('/admin/cars')
    } catch (err: any) {
      setSubmitError(err.message || `Failed to ${isEdit ? 'update' : 'create'} car`)
    }
  }

  // Loading states
  if (authLoading || loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  //  Check admin access
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  //  If editing and car not found
  if (isEdit && !car && !loading) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Car not found</h3>
        <p className="text-sm text-gray-500 mt-1">The car you are looking for does not exist.</p>
        <Link
          href="/admin/cars"
          className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Cars
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cars"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Car' : 'Add New Car'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit 
              ? `Editing ${car?.manufacturer} ${car?.model}` 
              : 'Add a new vehicle to your fleet'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      {/* Car Form */}
      <CarForm 
        car={car} 
        onSubmit={handleSubmit} 
        isLoading={isLoading}
        isEdit={isEdit}
      />
    </div>
  )
}