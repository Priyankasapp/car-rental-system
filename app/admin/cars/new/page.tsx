/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/cars/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft,  AlertCircle } from 'lucide-react'
import { CarForm } from '@/components/admin/CarForm'

export default function NewCarPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { isLoading, addCar } = useAdmin()
  const [submitError, setSubmitError] = useState<string | null>(null)

  //  Check admin access
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }
  }, [user, authLoading, router])

  //  Handle form submission
  const handleSubmit = async (formData: any) => {
    setSubmitError(null)
    try {
      await addCar(formData)
      router.push('/admin/cars')
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create car')
    }
  }

  //  Loading states
  if (authLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new vehicle to your fleet
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
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        isEdit={false}
      />
    </div>
  )
}