// app/(public)/cars/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCars } from '@/context/CarContext'
import { useAuth } from '@/context/AuthContext'
import { CarGallery } from '@/components/car/CarGallery'
import { CarInfo } from '@/components/car/CarInfo'
import { CarBookingSidebar } from '@/components/car/CarBookingSidebar'
import Link from 'next/link'

// Mock data (will be replaced with real data)

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { cars, isLoading } = useCars()
  const { user } = useAuth()

  const car = cars.find((c) => c.id === params?.id)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Car not found</h1>
        <Link href="/fleet" className="mt-4 text-blue-600 underline">Back to Fleet</Link>
      </div>
    )
  }

  const images = [car.image, car.image, car.image, car.image]

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/reservation/${car.id}`)
      return
    }
    router.push(`/reservation/${car.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <Link href="/fleet" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-6">
          ← Back to Fleet
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <div className="flex-1 space-y-12">
            <CarGallery mainImage={car.image} images={images} />
            <CarInfo car={car} />
          
          </div>

          {/* Right Column */}
          <aside className="w-full lg:w-105">
            <CarBookingSidebar
              carId={car.id}
              price={car.price}
              onBook={handleBook}
              isAuthenticated={!!user}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}