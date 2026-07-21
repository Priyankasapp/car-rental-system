/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/reservation/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCars } from '@/context/CarContext'
import { useAuth } from '@/context/AuthContext'
import { useBooking } from '@/context/BookingContext'

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const { cars, isLoading } = useCars()
  const { user } = useAuth()
  const { createBooking, isLoading: bookingLoading } = useBooking()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // --- Form States ---
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')

  // --- Extras ---
  const [hasChauffeur, setHasChauffeur] = useState(false)
  const [hasDelivery, setHasDelivery] = useState(false)
  const [hasSatellite, setHasSatellite] = useState(false)
  const [hasInsurance] = useState(true)

  // --- Customer Info ---
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // --- Find Car ---
  const car = cars.find((c) => c.id === params?.id)

  //  Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(`${user.firstName} ${user.lastName}`)
      setEmail(user.email)
      setPhone(user.phone || '')
    }
  }, [user])

  // --- Calculations ---
  const rentalDays = (() => {
    if (!pickupDate || !returnDate) return 1
    const start = new Date(pickupDate)
    const end = new Date(returnDate)
    const diff = end.getTime() - start.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))
    return days > 0 ? days : 1
  })()

  const dailyRate = car?.price || 0
  const baseRate = dailyRate * rentalDays
  const addOns = (hasChauffeur ? 100 * rentalDays : 0) + (hasDelivery ? 150 : 0) + (hasSatellite ? 45 * rentalDays : 0)
  const subtotal = baseRate + addOns
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + tax

  // --- Handle Submit with BookingContext ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setErrorMessage('Please login to complete your booking.')
      router.push(`/login?redirect=/reservation/${params?.id}`)
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      //  Prepare booking data
      const bookingData = {
        carId: car?.id,
        customer: {
          name: fullName,
          email: email,
          phone: phone,
        },
        pickup: {
          location: pickupLocation,
          date: pickupDate,
          time: pickupTime || '10:00',
        },
        dropoff: {
          location: pickupLocation,
          date: returnDate,
          time: '10:00',
        },
        chauffeur: hasChauffeur,
        enhancements: {
          conciergeDelivery: hasDelivery,
          platinumInsurance: hasInsurance,
          satelliteConnectivity: hasSatellite,
        },
        pricing: {
          dailyRate: dailyRate,
          rentalDays: rentalDays,
          subtotal: subtotal,
          tax: tax,
          total: total,
        },
      }

      //  Create booking using context
      const result = await createBooking(bookingData)

      //  Show success message with booking reference
      const bookingRef = result?.reservationRef || result?.id || ''
      setSuccessMessage(` Booking request submitted! Reference: ${bookingRef}. Waiting for admin confirmation.`)
      
      setTimeout(() => {
        router.push('/bookings')
      }, 3000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // --- Car Not Found ---
  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900">Car not found</h1>
        <p className="text-gray-500 mt-2">The vehicle you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/fleet" className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Browse Fleet
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/fleet" className="text-xl font-bold text-gray-900">
              UrbanDrive
            </Link>
            <div className="flex items-center gap-4">
              {!user && (
                <Link href="/login" className="text-sm text-gray-600 hover:text-black transition">
                  Sign In
                </Link>
              )}
              <button
                type="submit"
                form="reservation-form"
                disabled={isSubmitting || bookingLoading}
                className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isSubmitting || bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Login Prompt */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-yellow-800">
               You are booking as a guest. Please{' '}
              <Link href={`/login?redirect=/reservation/${params?.id}`} className="font-semibold underline">
                sign in
              </Link>{' '}
              to manage your bookings.
            </p>
          </div>
        )}

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Car Details + Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {car.manufacturer} {car.model}
                  </h1>
                  <p className="text-sm text-gray-500">{car.year} • {car.category}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                      {car.transmission}
                    </span>
                    <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                      {car.seats} Seats
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{car.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/day</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form id="reservation-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Driver Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Driver Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      disabled={!!user}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      disabled={!!user}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      disabled={!!user}
                    />
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Itinerary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Location *</label>
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Enter pickup location"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Return Date *</label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Time *</label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Extras */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Extras</h3>
                <div className="space-y-3">
                  {[
                    { id: 'chauffeur', label: 'Professional Chauffeur', price: '+₹100/day', checked: hasChauffeur, setter: setHasChauffeur },
                    { id: 'delivery', label: 'Concierge Delivery', price: '+₹150', checked: hasDelivery, setter: setHasDelivery },
                    { id: 'satellite', label: 'Satellite Connectivity', price: '+₹45/day', checked: hasSatellite, setter: setHasSatellite },
                    { id: 'insurance', label: 'Platinum Insurance', price: 'Included', checked: hasInsurance, setter: null, disabled: true },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.price}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.setter?.(e.target.checked)}
                        disabled={item.disabled}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Price Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="font-medium">₹{dailyRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Days</span>
                  <span className="font-medium">{rentalDays} days</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">₹{baseRate.toLocaleString()}</span>
                </div>

                {addOns > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Add-ons</span>
                    <span className="font-medium">+₹{addOns.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (12%)</span>
                  <span className="font-medium">₹{tax.toFixed(0)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{total.toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="reservation-form"
                disabled={isSubmitting || bookingLoading}
                className="w-full py-3.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isSubmitting || bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You wont be charged yet. Payment will be collected at pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}