// app/(admin)/cars/new/page.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { 
  ArrowLeft, 
  Info, 
  Gauge, 
  Image as ImageIcon, 
  DollarSign, 
  Settings, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function NewCarPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addCar, isLoading } = useAdmin()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
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
    luggageCapacity: 4,
    features: [] as string[],
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    securityDeposit: 0,
    mileageFree: '',
    mileageExtraFee: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationZipCode: '',
    imageMain: '',
    imageGallery: [] as string[],
    status: 'AVAILABLE',
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  const categories = ['SEDAN', 'SUV', 'LUXURY', 'CONVERTIBLE', 'HATCHBACK', 'VAN']
  const transmissions = ['AUTOMATIC', 'MANUAL']
  const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']

  // Check admin access
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
    router.push('/fleet')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value,
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Simulate image upload - in real app, you'd upload to server
    const newImages = Array.from(files).map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...newImages])
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare data for API
      const carData = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        pricePerWeek: formData.pricePerWeek ? Number(formData.pricePerWeek) : null,
        pricePerMonth: formData.pricePerMonth ? Number(formData.pricePerMonth) : null,
        securityDeposit: Number(formData.securityDeposit),
        mileageFree: formData.mileageFree ? Number(formData.mileageFree) : null,
        mileageExtraFee: formData.mileageExtraFee ? Number(formData.mileageExtraFee) : null,
        imageMain: uploadedImages[0] || '/assets/car-placeholder.jpg',
        imageGallery: uploadedImages,
        status: isActive ? 'AVAILABLE' : 'UNAVAILABLE',
      }

      await addCar(carData)
      setSubmitSuccess(true)
      
      setTimeout(() => {
        router.push('/admin/cars')
      }, 1500)
    } catch (error) {
      console.error('Error adding car:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const featuresList = [
    'GPS Navigation',
    'Bluetooth',
    'Backup Camera',
    'Cruise Control',
    'Leather Seats',
    'Sunroof',
    'Heated Seats',
    'Keyless Entry',
    'Apple CarPlay',
    'Android Auto',
    'Parking Sensors',
    'Blind Spot Monitor',
  ]

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/cars"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Add New Fleet Vehicle
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl w-100">
              Expand the UrbanDrive collection with high-performance automotive excellence. 
              Ensure all specifications are accurate to maintain our premium service standards.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ===== LEFT COLUMN: FORM CONTROLS ===== */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Basic Information */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      VIHICAL NAME *
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="e.g. Porsche"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="e.g. Taycan Turbo S"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs appearance-none"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="2024"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      License Plate *
                    </label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="e.g. Jet Black"
                    />
                  </div>
                </div>
              </section>

              {/* Specifications */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Gauge className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">Specifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                    >
                      {transmissions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                    >
                      {fuelTypes.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                   <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Seats
                    </label>
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      min={1}
                      max={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Luggage
                    </label>
                    <input
                      type="number"
                      name="luggageCapacity"
                      value={formData.luggageCapacity}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      min={0}
                      max={20}
                    />
                  </div>
                </div>
              </section>

              {/* Media Gallery */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">Media Gallery</h2>
                </div>

                {/* Drag & Drop */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-900 transition-colors cursor-pointer group mb-6"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('border-gray-900', 'bg-gray-50')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-gray-900', 'bg-gray-50')
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('border-gray-900', 'bg-gray-50')
                    const files = e.dataTransfer.files
                    if (files.length > 0) {
                      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
                      setUploadedImages(prev => [...prev, ...newImages])
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-lg text-gray-900 mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG or WEBP (max. 4096×4096px)</p>
                  </div>
                </div>

                {/* Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
                      <Image
                        src={image}
                        alt={`Upload ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {uploadedImages.length < 8 && (
                    <div 
                      className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ===== RIGHT COLUMN: SETTINGS & ACTIONS ===== */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Pricing & Availability */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
               
                  <h2 className="text-xl font-semibold text-gray-900"> ₹ Commercials</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Daily Rate (₹) *
                    </label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="5000"
                      min={0}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Weekly Rate (₹)
                    </label>
                    <input
                      type="number"
                      name="pricePerWeek"
                      value={formData.pricePerWeek}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="30000"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Monthly Rate (₹)
                    </label>
                    <input
                      type="number"
                      name="pricePerMonth"
                      value={formData.pricePerMonth}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="120000"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      name="securityDeposit"
                      value={formData.securityDeposit}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
                      placeholder="5000"
                      min={0}
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 block mb-4">
                      Availability Status
                    </label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">
                        {isActive ? 'Active Fleet' : 'Unavailable'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                          isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                          isActive ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features & Amenities */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-5 h-5 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">Features</h2>
                </div>
                <div className="space-y-3 max-h-70 overflow-y-auto pr-2">
                  {featuresList.map((feature) => (
                    <label key={feature} className="flex items-center gap-3 group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </span>
                  ) : submitSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Registered Successfully!
                    </span>
                  ) : (
                    'Register Vehicle'
                  )}
                </button>
                <button
                  type="button"
                  className="w-full bg-transparent text-gray-500 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}