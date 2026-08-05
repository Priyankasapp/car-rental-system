'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface CategoryDetail {
  id: string
  name: string
  description?: string | null
  color?: string | null
  circleBg?: string | null
  textColor?: string | null
  borderColor?: string | null
  status?: string
  isActive?: boolean
}

interface FeatureMaster {
  id: string
  name: string
  description?: string | null
  status?: string
  isActive?: boolean
  featureCarIds?: string[]
}

interface Car {
  id: string
  manufacturer: string
  model: string
  year: number
  licensePlate: string
  vin?: string | null
  color?: string | null
  doors: number
  seats: number
  luggageCapacity: number
  engineSize?: string | null
  horsepower?: number | null
  driveType: string
  odometer?: number | null
  featureIds?: string[]
  features: string[]
  featureMasters: FeatureMaster[]
  categoryId?: string | null
  category?: CategoryDetail | null
  transmissionId?: string | null
  transmission?: CategoryDetail | null
  fuelTypeId?: string | null
  fuelType?: CategoryDetail | null
  pricePerDay: number
  pricePerWeek?: number | null
  pricePerMonth?: number | null
  securityDeposit: number
  mileageFree?: number | null
  mileageExtraFee?: number | null
  locationAddress?: string | null
  locationCity?: string | null
  locationState?: string | null
  locationZipCode?: string | null
  locationLat?: number | null
  locationLng?: number | null
  imageMain: string
  imageGallery: string[]
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE'
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  permissions?: string[]
  isEmailVerified: boolean
  createdAt: string
}

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const carId = resolvedParams.id
  const router = useRouter()

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

 
  // AUTH / PERMISSIONS
 

  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)


  // EDIT MODE


  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Car>>({})
  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState<
    'overview' | 'gallery' | 'pricing'
  >('overview')


  // FETCH CURRENT USER + PERMISSIONS
 

  useEffect(() => {
    let isMounted = true

    const fetchCurrentUser = async () => {
      try {
        setAuthLoading(true)

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch current user')
        }

        if (isMounted) {
          setUser(json.data.user)
        }
      } catch (error) {
        console.error('Failed to load user permissions:', error)

        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false)
        }
      }
    }

    fetchCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])


  // PERMISSION CHECK


  const hasPermission = (permission: string) => {
    if (!user) return false

    const role = user.role?.toUpperCase()

    // Super Admin gets everything
    if (
      role === 'SUPERADMIN' ||
      role === 'SUPER_ADMIN'
    ) {
      return true
    }

    const permissions = user.permissions || []

    if (!Array.isArray(permissions)) {
      return false
    }

    const domain = permission.split(':')[0]

    return (
      permissions.includes('*') ||
      permissions.includes(`${domain}:*`) ||
      permissions.includes(permission)
    )
  }

  const canViewCars = hasPermission('cars:view')
  const canEditCars = hasPermission('cars:edit')
  const canDeleteCars = hasPermission('cars:delete')

  // FETCH CAR DETAILS
 

  useEffect(() => {
    let isMounted = true

    const fetchCarDetails = async () => {
      try {
        setLoading(true)

        const res = await fetch(`/api/admin/cars/${carId}`, {
          credentials: 'include',
          cache: 'no-store',
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(
            json.message || 'Failed to fetch car details'
          )
        }

        if (isMounted) {
          setCar(json.data)
          setFormData(json.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'An error occurred'

          setError(errorMessage)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (carId) {
      fetchCarDetails()
    }

    return () => {
      isMounted = false
    }
  }, [carId])


  // HANDLE INPUT


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target

    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  
  // SAVE CAR


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEditCars) {
      alert('You do not have permission to edit cars.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(
          json.message || 'Failed to update vehicle'
        )
      }

      setCar(json.data)
      setFormData(json.data)
      setIsEditing(false)

      alert('Car details updated successfully!')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Update failed'

      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // DELETE CAR


  const handleDelete = async () => {
    if (!canDeleteCars) {
      alert('You do not have permission to delete cars.')
      return
    }

    if (
      !confirm(
        'Are you sure you want to delete this vehicle? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const res = await fetch(
        `/api/admin/cars/${carId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(
          json.message || 'Failed to delete vehicle'
        )
      }

      alert('Vehicle deleted successfully!')

      router.push('/admin/cars')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Deletion failed'

      alert(errorMessage)
    }
  }

  // LOADING
 

  if (loading || authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }


  // VIEW PERMISSION


  if (!canViewCars) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Access Denied
          </h2>

          <p className="mt-2 text-sm text-red-600">
            You do not have permission to view vehicle details.
          </p>

          <Link
            href="/admin"
            className="mt-5 inline-block rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }


  // ERROR


  if (error || !car) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Error Loading Vehicle
          </h2>

          <p className="mt-2 text-red-600">
            {error || 'Car not found'}
          </p>

          <Link
            href="/admin/cars"
            className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to Vehicles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

 
          {/* HEADER */}
    

      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <Link
              href="/admin/cars"
              className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ← Back
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              {car.manufacturer}
            </h1>

            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-bold tracking-wider ${
                car.status === 'AVAILABLE'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : car.status === 'RENTED'
                    ? 'border-blue-300 bg-blue-100 text-blue-800'
                    : car.status === 'MAINTENANCE'
                      ? 'border-amber-300 bg-amber-100 text-amber-800'
                      : 'border-rose-300 bg-rose-100 text-rose-800'
              }`}
            >
              {car.status}
            </span>

          </div>
        </div>

        {/* ======================================================
            ACTION BUTTONS
        ====================================================== */}

        <div className="flex items-center gap-2">

          {/* EDIT BUTTON */}

          {canEditCars && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              {isEditing
                ? 'Cancel Edit'
                : 'Edit Vehicle'}
            </button>
          )}

          {/* DELETE BUTTON */}

          {canDeleteCars && (
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}

        </div>
      </div>

      {/* ========================================================
          TABS
      ======================================================== */}

      <div className="flex border-b border-slate-200 text-sm font-medium">

        {(
          ['overview', 'gallery', 'pricing'] as const
        ).map((tab) => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 capitalize transition-all ${
              activeTab === tab
                ? 'border-blue-600 font-bold text-black'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>

        ))}

      </div>

      {/* ========================================================
          EDIT FORM
          ONLY IF cars:edit
      ======================================================== */}

      {isEditing && canEditCars && (
        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-xl border border-blue-200 bg-blue-50/50 p-6"
        >

          <div className="flex items-center justify-between border-b border-blue-200 pb-3">

            <h2 className="text-lg font-bold text-slate-900">
              Editing {car.manufacturer} {car.model}
            </h2>

            <span className="text-xs text-slate-500">
              Update fields below and press Save Changes
            </span>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">

            {/* Manufacturer */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Manufacturer
              </label>

              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* Model */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Model
              </label>

              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* Year */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Year
              </label>

              <input
                type="number"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* License Plate */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                License Plate
              </label>

              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* Price */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Price Per Day
              </label>

              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay || 0}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* Security */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Security Deposit
              </label>

              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit || 0}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

            {/* Status */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={formData.status || 'AVAILABLE'}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              >
                <option value="AVAILABLE">
                  AVAILABLE
                </option>
                <option value="RENTED">
                  RENTED
                </option>
                <option value="MAINTENANCE">
                  MAINTENANCE
                </option>
                <option value="UNAVAILABLE">
                  UNAVAILABLE
                </option>
              </select>
            </div>

            {/* Image */}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Main Image URL
              </label>

              <input
                type="text"
                name="imageMain"
                value={formData.imageMain || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>

          </div>

          {/* Featured / Published */}

          <div className="flex gap-6 border-t border-blue-200 pt-4">

            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">

              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300"
              />

              Featured Vehicle

            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">

              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300"
              />

              Published on Site

            </label>

          </div>

          {/* Save */}

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>

          </div>

        </form>
      )}


          {/* OVERVIEW */}
   

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Image */}

          <div className="lg:col-span-1">

            <div className="overflow-hidden rounded-xl border bg-white p-2 shadow-sm">

              <div className="relative h-64 w-full overflow-hidden rounded-lg bg-slate-100">

                {car.imageMain ? (
                  <Image
                    src={car.imageMain}
                    alt={`${car.manufacturer} ${car.model}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No Main Image Available
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Specifications */}

          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

            <h3 className="mb-4 border-b pb-2 text-base font-bold text-slate-900">
              Technical Specifications
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">

              <div>
                <span className="block text-xs text-slate-400">
                  Category
                </span>

                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                  {car.category?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Transmission
                </span>

                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                  {car.transmission?.name || 'Standard'}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Fuel Type
                </span>

                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                  {car.fuelType?.name || 'Gasoline'}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Doors / Seats
                </span>

                <span className="font-semibold text-slate-800">
                  {car.doors} Doors / {car.seats} Seats
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Luggage Capacity
                </span>

                <span className="font-semibold text-slate-800">
                  {car.luggageCapacity} Bags
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Drive Type
                </span>

                <span className="font-semibold text-slate-800">
                  {car.driveType}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Color
                </span>

                <span className="font-semibold capitalize text-slate-800">
                  {car.color || 'N/A'}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Engine / Power
                </span>

                <span className="font-semibold text-slate-800">
                  {car.engineSize || 'N/A'}{' '}
                  {car.horsepower
                    ? `(${car.horsepower} HP)`
                    : ''}
                </span>
              </div>

              <div>
                <span className="block text-xs text-slate-400">
                  Odometer
                </span>

                <span className="font-semibold text-slate-800">
                  {car.odometer
                    ? `${car.odometer} km`
                    : 'N/A'}
                </span>
              </div>

            </div>

            {/* Features */}

            <div className="mt-6 border-t pt-4">

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Features & Amenities
              </h4>

              <div className="mt-3 flex flex-wrap gap-2">

                {car.featureMasters &&
                car.featureMasters.length > 0 ? (
                  car.featureMasters.map((feat) => (
                    <span
                      key={feat.id}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {feat.name}
                    </span>
                  ))
                ) : car.features &&
                  car.features.length > 0 ? (
                  car.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {feat}
                    </span>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400">
                    No specific features assigned.
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>
      )}


          {/* GALLERY */}


      {activeTab === 'gallery' && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h3 className="mb-4 border-b pb-2 text-base font-bold text-slate-900">
            Photo Gallery
          </h3>

          {car.imageGallery &&
          car.imageGallery.length > 0 ? (

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

              {car.imageGallery.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-44 w-full overflow-hidden rounded-lg border bg-slate-50 shadow-sm"
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}

            </div>

          ) : (

            <p className="text-sm italic text-slate-500">
              No additional gallery photos provided.
            </p>

          )}

        </div>
      )}

          {/* PRICING */}
   

      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">

            <h3 className="border-b pb-2 text-base font-bold text-slate-900">
              Rental Rates
            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">
                  Daily Rate
                </span>

                <span className="text-base font-bold text-emerald-600">
                  ₹{car.pricePerDay} / day
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">
                  Weekly Rate
                </span>

                <span className="font-semibold text-slate-800">
                  {car.pricePerWeek
                    ? `₹${car.pricePerWeek} / week`
                    : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">
                  Monthly Rate
                </span>

                <span className="font-semibold text-slate-800">
                  {car.pricePerMonth
                    ? `₹${car.pricePerMonth} / month`
                    : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">
                  Security Deposit
                </span>

                <span className="font-bold text-slate-800">
                  ₹{car.securityDeposit}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-slate-500">
                  Free Mileage / Day
                </span>

                <span className="font-semibold text-slate-800">
                  {car.mileageFree
                    ? `${car.mileageFree} km`
                    : 'Unlimited'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">
                  Extra Mileage Fee
                </span>

                <span className="font-semibold text-slate-800">
                  {car.mileageExtraFee
                    ? `₹${car.mileageExtraFee} / km`
                    : 'Free'}
                </span>
              </div>

            </div>

          </div>

          <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">

            <h3 className="border-b pb-2 text-base font-bold text-slate-900">
              Location Information
            </h3>

            <div className="space-y-2 text-sm text-slate-700">

              <p>
                <span className="font-semibold text-slate-900">
                  Address:
                </span>{' '}
                {car.locationAddress || 'Not set'}
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  City:
                </span>{' '}
                {car.locationCity || 'N/A'}
              </p>

              <p>
                <span className="font-semibold text-slate-900">
                  State / Zip:
                </span>{' '}
                {car.locationState || ''}{' '}
                {car.locationZipCode || ''}
              </p>

              <p className="pt-2 font-mono text-xs text-slate-400">
                Coordinates: Lat{' '}
                {car.locationLat ?? 'N/A'}, Lng{' '}
                {car.locationLng ?? 'N/A'}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}