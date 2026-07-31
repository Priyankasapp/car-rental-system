'use client'

import { useState, useEffect, use, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiCarToFleetCar, FleetCar } from '@/types/fleet'

interface CarDetailPageProps {
  params: Promise<{
    id: string
  }>
}

function CarDetailContent({ id }: { id: string }) {
  const [car, setCar] = useState<FleetCar | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCarDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/cars/${id}`)
        const json = await response.json()

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Failed to load vehicle details')
        }

        const formattedCar = apiCarToFleetCar(json.data)
        setCar(formattedCar)
        setSelectedImage(formattedCar.image)
      } catch (err) {
        console.error('Error fetching car details:', err)
        setError(err instanceof Error ? err.message : 'Failed to load vehicle')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-1/4 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The vehicle you're looking for doesn't exist or isn't available."}</p>
        <Link
          href="/fleet"
          className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition"
        >
          ← Back to Fleet
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/fleet" className="hover:text-black transition">
          Fleet
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{car.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="relative h-80 md:h-112.5 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={selectedImage || '/placeholder-car.jpg'}
              alt={car.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Gallery Thumbnails */}
          {car.imageGallery && car.imageGallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {car.imageGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-24 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === img ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${car.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Info Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                {car.category}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                  car.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {car.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{car.name}</h1>
            <p className="text-gray-500 text-sm mb-6">Model Year {car.year}</p>

            {/* Price Card */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Daily Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-gray-900">${car.price}</span>
                <span className="text-gray-500 text-sm">/ day</span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-xl">
                <span className="block text-xs text-gray-400">Transmission</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">
                  {car.specs.transmission || car.transmission}
                </span>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <span className="block text-xs text-gray-400">Fuel Type</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{car.fuelType}</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl">
                <span className="block text-xs text-gray-400">Seating</span>
                <span className="text-sm font-semibold text-gray-900">{car.seats} Seats</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl col-span-2 sm:col-span-3">
                <span className="block text-xs text-gray-400">Location</span>
                <span className="text-sm font-semibold text-gray-900">{car.location}</span>
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-gray-100">
            <button
              disabled={car.status !== 'available'}
              className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {car.status === 'available' ? 'Book This Vehicle' : 'Currently Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FleetDetailPage({ params }: CarDetailPageProps) {
  const resolvedParams = use(params)

  return (
    <main className="mt-20 px-6 md:px-20 py-10 md:py-20 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="py-20 text-center text-gray-500">Loading car details...</div>
        }
      >
        <CarDetailContent id={resolvedParams.id} />
      </Suspense>
    </main>
  )
}