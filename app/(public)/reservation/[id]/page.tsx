'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface FleetCar {
  id: string
  name: string
  category: string
  status: string
  year: number
  price: number
  image: string
  fuelType: string
  seats: number
  location: string
  transmission: string
  features: string[]
}

interface RawCar {
  id: string
  manufacturer: string
  model: string
  year: number
  seats: number
  pricePerDay: number
  imageMain: string | null
  imageGallery: string[]
  status: string
  locationAddress: string | null
  locationCity: string | null
  locationState: string | null
  locationZipCode: string | null
  features: string[]
  category: { id: string; name: string } | null
  fuelType: { id: string; name: string } | null
  transmission: { id: string; name: string } | null
}

interface BookingResponse {
  success: boolean
  message?: string
  data?: {
    reservation?: {
      id?: string
      reservationRef?: string
    }
  }
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string

  // CAR STATE
  const [car, setCar] = useState<FleetCar | null>(null)
  const [carLoading, setCarLoading] = useState(true)
  const [carError, setCarError] = useState('')

  // CUSTOMER STATE
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // RENTAL DETAILS STATE
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupTime, setPickupTime] = useState('10:00')

  // EXTRAS
  const [hasChauffeur, setHasChauffeur] = useState(false)
  const [hasDelivery, setHasDelivery] = useState(false)
  const [hasSatellite, setHasSatellite] = useState(false)
  const hasInsurance = true

  // SUBMISSION STATE
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Get Today's Date String for `min` date attribute (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // 1. FETCH USER PROFILE TO PRE-FILL CUSTOMER DETAILS
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            setFullName(`${data.user.firstName || ''} ${data.user.lastName || ''}`.trim())
            setEmail(data.user.email || '')
            setPhone(data.user.phone || '')
          }
        }
      } catch {
        // Soft fail if unauthenticated or error
      }
    }
    loadUserProfile()
  }, [])

  // 2. FETCH CAR DETAILS
  useEffect(() => {
    if (!carId) return

    const fetchCar = async () => {
      try {
        setCarLoading(true)
        setCarError('')

        const response = await fetch(`/api/cars/${carId}`)
        const json = await response.json()

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Failed to load vehicle details.')
        }

        const rawCar: RawCar = json.data

        const formattedCar: FleetCar = {
          id: rawCar.id,
          name: `${rawCar.manufacturer} ${rawCar.model}`.trim() || 'Luxury Vehicle',
          category: rawCar.category?.name || 'Standard',
          status: rawCar.status || 'AVAILABLE',
          year: rawCar.year,
          price: rawCar.pricePerDay || 0,
          image: rawCar.imageMain || rawCar.imageGallery?.[0] || '',
          fuelType: rawCar.fuelType?.name || 'Gasoline',
          seats: rawCar.seats || 4,
          location: rawCar.locationAddress || rawCar.locationCity || 'Main Depot',
          transmission: rawCar.transmission?.name || 'Automatic',
          features: Array.isArray(rawCar.features) ? rawCar.features : [],
        }

        setCar(formattedCar)
        if (!pickupLocation) {
          setPickupLocation(formattedCar.location)
        }
      } catch (error) {
        console.error('Failed to fetch car:', error)
        setCarError(error instanceof Error ? error.message : 'Failed to load vehicle')
      } finally {
        setCarLoading(false)
      }
    }

    fetchCar()
  }, [carId, pickupLocation])

  // 3. UTC SAFE DAY CALCULATION
  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1

    const [pYear, pMonth, pDay] = pickupDate.split('-').map(Number)
    const [rYear, rMonth, rDay] = returnDate.split('-').map(Number)

    const startUTC = Date.UTC(pYear, pMonth - 1, pDay)
    const endUTC = Date.UTC(rYear, rMonth - 1, rDay)

    const diffDays = Math.ceil((endUTC - startUTC) / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }, [pickupDate, returnDate])

  // 4. PRICING CALCULATIONS
  const dailyRate = car?.price || 0
  const baseRate = dailyRate * rentalDays
  const addOns =
    (hasChauffeur ? 100 * rentalDays : 0) +
    (hasDelivery ? 150 : 0) +
    (hasSatellite ? 45 * rentalDays : 0)

  const subtotal = baseRate + addOns
  const tax = Math.round(subtotal * 0.12)
  const total = subtotal + tax

  // 5. SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!car) {
      setErrorMessage('Vehicle selection is missing.')
      return
    }

    if (car.status !== 'AVAILABLE') {
      setErrorMessage('This vehicle is currently unavailable for booking.')
      return
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please complete all customer contact details.')
      return
    }

    if (!pickupLocation.trim() || !pickupDate || !returnDate || !pickupTime) {
      setErrorMessage('Please complete all rental date and time fields.')
      return
    }

    if (new Date(returnDate) <= new Date(pickupDate)) {
      setErrorMessage('Return date must be strictly after the pickup date.')
      return
    }

    setIsSubmitting(true)

    try {
      const bookingData = {
        carId: car.id,
        customer: {
          name: fullName,
          email,
          phone,
        },
        pickup: {
          location: pickupLocation,
          date: pickupDate,
          time: pickupTime,
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
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingData),
      })

      const result: BookingResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to complete booking.')
      }

      const bookingRef =
        result.data?.reservation?.reservationRef ||
        result.data?.reservation?.id ||
        'CONFIRMED'

      setSuccessMessage(`Booking submitted successfully! Ref: ${bookingRef}`)

      setTimeout(() => {
        router.push('/bookings')
      }, 2000)
    } catch (error) {
      console.error('Booking error:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to create booking'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (carLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Not Available</h1>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          {carError || 'The requested vehicle could not be loaded or no longer exists.'}
        </p>
        <Link
          href="/fleet"
          className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          Browse Full Fleet
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/fleet" className="text-xl font-bold text-gray-900">
              UrbanDrive
            </Link>

            <button
              type="submit"
              form="reservation-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN FORM AREA */}
          <div className="lg:col-span-2 space-y-6">
            {/* CAR SUMMARY CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      No Preview
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{car.name}</h1>
                  <p className="text-gray-500 mt-1">
                    {car.year} • {car.category}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {car.transmission}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {car.seats} Seats
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {car.fuelType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESERVATION FORM */}
            <form
              id="reservation-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-8"
            >
              {/* CUSTOMER INFO */}
              <section>
                <h2 className="font-semibold text-lg text-gray-900 mb-4">
                  Customer Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                  />

                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                  />

                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition sm:col-span-2"
                  />
                </div>
              </section>

              {/* RENTAL DETAILS */}
              <section>
                <h2 className="font-semibold text-lg text-gray-900 mb-4">
                  Rental Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    placeholder="Pickup & Dropoff Location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition sm:col-span-2"
                  />

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Pickup Date
                    </label>
                    <input
                      required
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Return Date
                    </label>
                    <input
                      required
                      type="date"
                      min={pickupDate || todayStr}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                      Pickup Time
                    </label>
                    <input
                      required
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-black transition"
                    />
                  </div>
                </div>
              </section>

              {/* EXTRAS */}
              <section>
                <h2 className="font-semibold text-lg text-gray-900 mb-4">
                  Optional Extras
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 cursor-pointer transition">
                    <span>
                      <span className="font-medium text-gray-900 block">
                        Professional Chauffeur
                      </span>
                      <small className="text-gray-500">+₹100 / day</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={hasChauffeur}
                      onChange={(e) => setHasChauffeur(e.target.checked)}
                      className="w-5 h-5 rounded text-black focus:ring-black"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 cursor-pointer transition">
                    <span>
                      <span className="font-medium text-gray-900 block">
                        Concierge Delivery
                      </span>
                      <small className="text-gray-500">+₹150 flat fee</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(e) => setHasDelivery(e.target.checked)}
                      className="w-5 h-5 rounded text-black focus:ring-black"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 cursor-pointer transition">
                    <span>
                      <span className="font-medium text-gray-900 block">
                        Satellite Connectivity
                      </span>
                      <small className="text-gray-500">+₹45 / day</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={hasSatellite}
                      onChange={(e) => setHasSatellite(e.target.checked)}
                      className="w-5 h-5 rounded text-black focus:ring-black"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-80">
                    <span>
                      <span className="font-medium text-gray-900 block">
                        Platinum Insurance Coverage
                      </span>
                      <small className="text-gray-500">Included in base package</small>
                    </span>
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 rounded text-black"
                    />
                  </label>
                </div>
              </section>
            </form>
          </div>

          {/* ASIDE SUMMARY */}
          <aside>
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Price Breakdown</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="font-medium">₹{dailyRate.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Duration</span>
                  <span className="font-medium">
                    {rentalDays} {rentalDays === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rental Fee</span>
                  <span className="font-medium">₹{baseRate.toLocaleString()}</span>
                </div>

                {addOns > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>Selected Add-ons</span>
                    <span className="font-medium">+₹{addOns.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Tax (12%)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
                  <strong className="text-lg text-gray-900">Total Due</strong>
                  <strong className="text-2xl text-gray-900">
                    ₹{total.toLocaleString()}
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                form="reservation-form"
                disabled={isSubmitting}
                className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition shadow-sm"
              >
                {isSubmitting ? 'Processing Request...' : 'Confirm Booking'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                No payment is required right now. Payment will be processed upon vehicle pickup.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}