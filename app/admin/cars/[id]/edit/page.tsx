/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/cars/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { CarForm } from '@/components/admin/CarForm'

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params?.id as string

  const { user, isLoading: authLoading } = useAuth()
  const { 
    cars, 
    isLoading, 
    fetchCars, 
    updateCar  } = useAdmin()
  
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  //  Check admin access and fetch car
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN')) {
      // First try to find car in existing cars list
      const existingCar = cars.find(c => c.id === carId)
      if (existingCar) {
        setCar(existingCar)
        setLoading(false)
      } else {
        // If not in list, fetch cars first
        fetchCars()
      }
    }
  }, [user, authLoading, router, carId, cars, fetchCars])

  //  When cars are fetched, find the car
  useEffect(() => {
    if (cars.length > 0 && carId) {
      const foundCar = cars.find(c => c.id === carId)
      if (foundCar) {
        setCar(foundCar)
        setLoading(false)
      } else {
        setNotFound(true)
        setLoading(false)
      }
    }
  }, [cars, carId])

  //  Handle form submission
  const handleSubmit = async (formData: any) => {
    setSubmitError(null)
    try {
      await updateCar(carId, formData)
      router.push('/admin/cars')
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update car')
    }
  }

  //  Loading states
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

  //  If car not found
  if (notFound || (!loading && !car)) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Car not found</h3>
        <p className="text-sm text-gray-500 mt-1">
          The car you are looking for does not exist or has been deleted.
        </p>
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
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/cars"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Car</h1>
          <p className="text-sm text-gray-500 mt-1">
            Editing {car?.manufacturer} {car?.model}
          </p>
        </div>
      </div>

      {/* ===== ERROR MESSAGE ===== */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      {/* ===== CAR FORM ===== */}
      <CarForm 
        initialData={car}
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        isEdit={true}
      />
    </div>
  )
}