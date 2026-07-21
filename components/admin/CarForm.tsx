/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/CarForm.tsx
'use client'

import { useState } from 'react'
import { ImageUpload } from './ImageUpload'
import { Save, Loader2, AlertCircle } from 'lucide-react'

interface CarFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
  isEdit?: boolean
}

const categories = ['SEDAN', 'SUV', 'LUXURY', 'CONVERTIBLE', 'HATCHBACK', 'VAN']
const transmissions = ['AUTOMATIC', 'MANUAL']
const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']
const statuses = ['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'MAINTENANCE']

export function CarForm({ initialData, onSubmit, isLoading, isEdit = false }: CarFormProps) {
  const [formData, setFormData] = useState({
    manufacturer: initialData?.manufacturer || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    category: initialData?.category || 'SEDAN',
    licensePlate: initialData?.licensePlate || '',
    color: initialData?.color || '',
    transmission: initialData?.transmission || 'AUTOMATIC',
    fuelType: initialData?.fuelType || 'PETROL',
    seats: initialData?.seats || 5,
    luggageCapacity: initialData?.luggageCapacity || 4,
    features: initialData?.features?.join(', ') || '',
    pricePerDay: initialData?.pricePerDay || '',
    pricePerWeek: initialData?.pricePerWeek || '',
    pricePerMonth: initialData?.pricePerMonth || '',
    securityDeposit: initialData?.securityDeposit || 0,
    mileageFree: initialData?.mileageFree || '',
    mileageExtraFee: initialData?.mileageExtraFee || '',
    locationAddress: initialData?.locationAddress || '',
    locationCity: initialData?.locationCity || '',
    locationState: initialData?.locationState || '',
    locationZipCode: initialData?.locationZipCode || '',
    imageMain: initialData?.imageMain || '',
    imageGallery: initialData?.imageGallery || [],
    status: initialData?.status || 'AVAILABLE',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imageGallery || [])
  const [mainImage, setMainImage] = useState<string>(initialData?.imageMain || '')

  // ✅ Handle image upload
  const handleImageUpload = (url: string) => {
    setImageUrls(prev => [...prev, url])
    if (!mainImage) {
      setMainImage(url)
      setFormData(prev => ({ ...prev, imageMain: url }))
    }
  }

  // ✅ Handle image remove
  const handleImageRemove = (url: string) => {
    const newImages = imageUrls.filter(img => img !== url)
    setImageUrls(newImages)
    if (mainImage === url && newImages.length > 0) {
      setMainImage(newImages[0])
      setFormData(prev => ({ ...prev, imageMain: newImages[0] }))
    } else if (mainImage === url && newImages.length === 0) {
      setMainImage('')
      setFormData(prev => ({ ...prev, imageMain: '' }))
    }
  }

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.year || formData.year < 1900) newErrors.year = 'Valid year is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.licensePlate) newErrors.licensePlate = 'License plate is required'
    if (!formData.pricePerDay) newErrors.pricePerDay = 'Price per day is required'
    if (!mainImage) newErrors.imageMain = 'At least one image is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submitData = {
      ...formData,
      features: formData.features ? formData.features.split(',').map((f: string) => f.trim()) : [],
      imageGallery: imageUrls,
      imageMain: mainImage,
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
  }

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ===== IMAGE UPLOAD SECTION ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Images</h3>
        <ImageUpload
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          existingImages={imageUrls}
          maxImages={10}
        />
        {errors.imageMain && (
          <p className="mt-2 text-sm text-red-500">{errors.imageMain}</p>
        )}
      </div>

      {/* ===== BASIC INFORMATION ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manufacturer */}
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

          {/* Model */}
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

          {/* Year */}
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

          {/* Category */}
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

          {/* License Plate */}
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

          {/* Color */}
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

          {/* Transmission */}
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

          {/* Fuel Type */}
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

          {/* Seats */}
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

          {/* Luggage Capacity */}
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

      {/* ===== FEATURES ===== */}
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

      {/* ===== PRICING ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Per Day */}
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

          {/* Price Per Week */}
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

          {/* Price Per Month */}
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

          {/* Security Deposit */}
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

          {/* Mileage Free */}
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

          {/* Extra Mileage Fee */}
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

      {/* ===== LOCATION ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
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

          {/* City */}
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

          {/* State */}
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

          {/* ZIP Code */}
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

      {/* ===== STATUS ===== */}
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

      {/* ===== SUBMIT BUTTON ===== */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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

      {/* Error Message */}
      {errors.imageMain && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{errors.imageMain}</span>
        </div>
      )}
    </form>
  )
}