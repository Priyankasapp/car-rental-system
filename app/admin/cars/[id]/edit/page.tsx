'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Car as CarIcon, 
  DollarSign, 
  MapPin, 
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
  Trash2
} from 'lucide-react'

type EditPageProps = {
  params: Promise<{ id: string }>
}

export default function EditCarPage({ params }: EditPageProps) {
  const { id: carId } = use(params)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  // Refs for hidden file inputs
  const mainImageInputRef = useRef<HTMLInputElement | null>(null)
  const galleryImageInputRef = useRef<HTMLInputElement | null>(null)

  // Form & UI state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Image Upload State
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'SEDAN',
    licensePlate: '',
    color: '',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seats: 5,
    luggageCapacity: 2,
    features: [] as string[],
    featureInput: '',
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    securityDeposit: 0,
    mileageFree: 200,
    mileageExtraFee: 10,
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationZipCode: '',
    imageMain: '',
    imageGallery: [] as string[],
    status: 'AVAILABLE'
  })

  // Auth Guard & Initial Data Fetching
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/admin/cars/${carId}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load vehicle data')
        }

        const car = data.data.car
        setFormData({
          manufacturer: car.manufacturer || '',
          model: car.model || '',
          year: car.year || new Date().getFullYear(),
          category: car.category || 'SEDAN',
          licensePlate: car.licensePlate || '',
          color: car.color || '',
          transmission: car.transmission || 'AUTOMATIC',
          fuelType: car.fuelType || 'PETROL',
          seats: car.seats || 5,
          luggageCapacity: car.luggageCapacity || 2,
          features: car.features || [],
          featureInput: '',
          pricePerDay: car.pricePerDay || 0,
          pricePerWeek: car.pricePerWeek || 0,
          pricePerMonth: car.pricePerMonth || 0,
          securityDeposit: car.securityDeposit || 0,
          mileageFree: car.mileageFree || 0,
          mileageExtraFee: car.mileageExtraFee || 0,
          locationAddress: car.locationAddress || '',
          locationCity: car.locationCity || '',
          locationState: car.locationState || '',
          locationZipCode: car.locationZipCode || '',
          imageMain: car.imageMain || '',
          imageGallery: car.imageGallery || [],
          status: car.status || 'AVAILABLE'
        })

        // Set existing images as initial previews
        if (car.imageMain) setMainImagePreview(car.imageMain)
        if (car.imageGallery) setGalleryPreviews(car.imageGallery)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching car details')
      } finally {
        setLoading(false)
      }
    }

    if (user && carId) {
      fetchCarDetails()
    }
  }, [user, authLoading, carId, router])

  // Form Field Change Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  // --- Main Image File Handler ---
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setMainImagePreview(result)
        setFormData((prev) => ({ ...prev, imageMain: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setMainImagePreview(null)
    setFormData((prev) => ({ ...prev, imageMain: '' }))
    if (mainImageInputRef.current) mainImageInputRef.current.value = ''
  }

  // --- Gallery Images File Handler ---
  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setGalleryPreviews((prev) => [...prev, result])
        setFormData((prev) => ({ ...prev, imageGallery: [...prev.imageGallery, result] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, i) => i !== index)
    }))
  }

  // Feature Tag Handlers
  const handleAddFeature = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    if (!formData.featureInput.trim()) return

    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, prev.featureInput.trim()],
      featureInput: ''
    }))
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        seats: Number(formData.seats),
        luggageCapacity: Number(formData.luggageCapacity),
        pricePerDay: Number(formData.pricePerDay),
        pricePerWeek: Number(formData.pricePerWeek),
        pricePerMonth: Number(formData.pricePerMonth),
        securityDeposit: Number(formData.securityDeposit),
        mileageFree: Number(formData.mileageFree),
        mileageExtraFee: Number(formData.mileageExtraFee)
      }

      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update vehicle')
      }

      setSuccessMsg('Vehicle updated successfully!')
      setTimeout(() => router.push('/admin/cars'), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        <p className="mt-3 text-sm font-medium text-gray-500">Loading vehicle details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars"
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {carId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 font-semibold text-gray-900 text-base">
            <CarIcon className="w-5 h-5 text-gray-500" />
            <span>Basic Vehicle Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturer / Make</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">License Plate</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxury</option>
                <option value="CONVERTIBLE">Convertible</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="VAN">Van</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer font-medium"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: File Uploads */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 font-semibold text-gray-900 text-base">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <span>Vehicle Images</span>
          </div>

          {/* Main Cover Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Main Cover Image</label>
            <input
              type="file"
              ref={mainImageInputRef}
              accept="image/*"
              onChange={handleMainImageChange}
              className="hidden"
            />

            {mainImagePreview ? (
              <div className="relative aspect-16/9 md:w-80 rounded-xl overflow-hidden border border-gray-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeMainImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => mainImageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-gray-900 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
              >
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <p className="text-xs font-medium text-gray-700">
                  Click to upload main image <span className="text-gray-400">(PNG, JPG, WEBP)</span>
                </p>
              </div>
            )}
          </div>

          {/* Gallery Images Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Gallery Images</label>
            <input
              type="file"
              ref={galleryImageInputRef}
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div
                onClick={() => galleryImageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-gray-900 rounded-xl aspect-4/3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50"
              >
                <UploadCloud className="w-6 h-6 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-600">Add Image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Specifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 font-semibold text-gray-900 text-base">
            <CarIcon className="w-5 h-5 text-gray-500" />
            <span>Specifications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Transmission</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
                <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Seats</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Features Tag Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Features / Options</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="featureInput"
                placeholder="Add feature (e.g. Sunroof, Bluetooth)"
                value={formData.featureInput}
                onChange={handleChange}
                onKeyDown={handleAddFeature}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {formData.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 font-semibold text-gray-900 text-base">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span>Pricing & Deposit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Daily Rate (₹)</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Rate (₹)</label>
              <input
                type="number"
                name="pricePerWeek"
                value={formData.pricePerWeek}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Location */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 font-semibold text-gray-900 text-base">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span>Location</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/cars"
            className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Updating...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
  )
}