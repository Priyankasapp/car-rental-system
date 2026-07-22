// app/(admin)/cars/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { BackButton } from '@/components/car/BackButton'
import { CarForm } from '@/components/admin/CarForm'
import { CarFormData } from '@/components/car/CarForm'


export default function NewCarPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addCar, isLoading } = useAdmin()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Constants
  const categories = ['SEDAN', 'SUV', 'LUXURY', 'CONVERTIBLE', 'HATCHBACK', 'VAN']
  const transmissions = ['AUTOMATIC', 'MANUAL']
  const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']
  const featuresList = [
    'GPS Navigation', 'Bluetooth', 'Backup Camera', 'Cruise Control',
    'Leather Seats', 'Sunroof', 'Heated Seats', 'Keyless Entry',
    'Apple CarPlay', 'Android Auto', 'Parking Sensors', 'Blind Spot Monitor'
  ]

  // Form state with proper type
  const [formData, setFormData] = useState<CarFormData>({
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
    features: [],
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
    imageGallery: [],
    status: 'AVAILABLE',
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
    }
  }, [authLoading, user, router])

  // Handlers
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

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...newImages])
  }

  // Add this missing function
  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Add New Fleet Vehicle
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Expand the UrbanDrive collection with high-performance automotive excellence. 
              Ensure all specifications are accurate to maintain our premium service standards.
            </p>
          </div>
        </div>

        <CarForm
          formData={formData}
          isActive={isActive}
          uploadedImages={uploadedImages}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          submitSuccess={submitSuccess}
          categories={categories}
          transmissions={transmissions}
          fuelTypes={fuelTypes}
          featuresList={featuresList}
          onChange={handleChange}
          onToggleFeature={handleFeatureToggle}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          onToggleStatus={() => setIsActive(!isActive)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}