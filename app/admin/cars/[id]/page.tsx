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

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Car>>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'pricing'>('overview')

  useEffect(() => {
    let isMounted = true

    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/cars/${carId}`)
        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch car details')
        }

        if (isMounted) {
          setCar(json.data)
          setFormData(json.data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred'
          setError(errorMessage)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (carId) {
      fetchCarDetails()
    }

    return () => {
      isMounted = false
    }
  }, [carId])

  // Handle Input Updates
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Save Updates via PUT
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update vehicle')
      }

      setCar(json.data)
      setFormData(json.data)
      setIsEditing(false)
      alert('Car details updated successfully!')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Delete Car via DELETE
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/cars/${carId}`, { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete vehicle')
      }

      alert('Vehicle deleted successfully!')
      router.push('/admin/cars')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Deletion failed'
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">Error Loading Vehicle</h2>
          <p className="mt-2 text-red-600">{error || 'Car not found'}</p>
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
      {/* Top Header / Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/cars"
              className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              {car.year} {car.manufacturer} {car.model}
            </h1>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-wider ${
                car.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : car.status === 'RENTED'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : car.status === 'MAINTENANCE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {car.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ID: <span className="font-mono">{car.id}</span> | License Plate: <span className="font-mono font-bold text-slate-700">{car.licensePlate}</span> | VIN: {car.vin || 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Vehicle'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-medium">
        {(['overview', 'gallery', 'pricing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2.5 capitalize transition-all ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* EDIT FORM (Inline Overlay) */}
      {isEditing && (
        <form onSubmit={handleSave} className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-blue-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Editing {car.manufacturer} {car.model}</h2>
            <span className="text-xs text-slate-500">Update fields below and press Save Changes</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">License Plate</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Price Per Day ($)</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay || 0}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Security Deposit ($)</label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit || 0}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status || 'AVAILABLE'}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RENTED">RENTED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Main Image URL</label>
              <input
                type="text"
                name="imageMain"
                value={formData.imageMain || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-6 border-t border-blue-200 pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Featured Vehicle
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Published on Site
            </label>
          </div>

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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: OVERVIEW & SPECS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Image View */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
              <div className="relative h-64 w-full bg-slate-100 rounded-lg overflow-hidden">
                {car.imageMain ? (
                  <Image
                    src={car.imageMain}
                    alt={`${car.manufacturer} ${car.model}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                    No Main Image Available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specs Panel */}
          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-base font-bold text-slate-900 border-b pb-2">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm sm:grid-cols-3">
              <div>
                <span className="text-slate-400 block text-xs">Category</span>
                <span className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-bold ${car.category?.circleBg || 'bg-slate-100'} ${car.category?.textColor || 'text-slate-800'}`}>
                  {car.category?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Transmission</span>
                <span className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-bold ${car.transmission?.circleBg || 'bg-slate-100'} ${car.transmission?.textColor || 'text-slate-800'}`}>
                  {car.transmission?.name || 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Fuel Type</span>
                <span className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-bold ${car.fuelType?.circleBg || 'bg-slate-100'} ${car.fuelType?.textColor || 'text-slate-800'}`}>
                  {car.fuelType?.name || 'Gasoline'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Doors / Seats</span>
                <span className="font-semibold text-slate-800">{car.doors} Doors / {car.seats} Seats</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Luggage Capacity</span>
                <span className="font-semibold text-slate-800">{car.luggageCapacity} Bags</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Drive Type</span>
                <span className="font-semibold text-slate-800">{car.driveType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Color</span>
                <span className="font-semibold text-slate-800 capitalize">{car.color || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Engine / Power</span>
                <span className="font-semibold text-slate-800">
                  {car.engineSize || 'N/A'} {car.horsepower ? `(${car.horsepower} HP)` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Odometer</span>
                <span className="font-semibold text-slate-800">{car.odometer ? `${car.odometer} km` : 'N/A'}</span>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Features & Amenities</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {car.featureMasters && car.featureMasters.length > 0 ? (
                  car.featureMasters.map((feat) => (
                    <span key={feat.id} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      {feat.name}
                    </span>
                  ))
                ) : car.features && car.features.length > 0 ? (
                  car.features.map((feat, idx) => (
                    <span key={idx} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      {feat}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific features assigned.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GALLERY */}
      {activeTab === 'gallery' && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-slate-900 border-b pb-2">Photo Gallery</h3>
          {car.imageGallery && car.imageGallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {car.imageGallery.map((url, idx) => (
                <div key={idx} className="relative h-44 w-full rounded-lg overflow-hidden border bg-slate-50 shadow-sm">
                  <Image src={url} alt={`Gallery image ${idx + 1}`} fill unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No additional gallery photos provided.</p>
          )}
        </div>
      )}

      {/* TAB 3: PRICING & LOCATION */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Rental Rates</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500">Daily Rate</span>
                <span className="font-bold text-emerald-600 text-base">${car.pricePerDay} / day</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500">Weekly Rate</span>
                <span className="font-semibold text-slate-800">{car.pricePerWeek ? `$${car.pricePerWeek} / week` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500">Monthly Rate</span>
                <span className="font-semibold text-slate-800">{car.pricePerMonth ? `$${car.pricePerMonth} / month` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500">Security Deposit</span>
                <span className="font-bold text-slate-800">${car.securityDeposit}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-slate-500">Free Mileage / Day</span>
                <span className="font-semibold text-slate-800">{car.mileageFree ? `${car.mileageFree} km` : 'Unlimited'}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Extra Mileage Fee</span>
                <span className="font-semibold text-slate-800">{car.mileageExtraFee ? `$${car.mileageExtraFee} / km` : 'Free'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">Location Information</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Address:</span> {car.locationAddress || 'Not set'}</p>
              <p><span className="font-semibold text-slate-900">City:</span> {car.locationCity || 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">State / Zip:</span> {car.locationState || ''} {car.locationZipCode || ''}</p>
              <p className="font-mono text-xs text-slate-400 pt-2">
                Coordinates: Lat {car.locationLat ?? 'N/A'}, Lng {car.locationLng ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}