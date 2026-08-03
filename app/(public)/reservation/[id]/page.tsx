'use client'

import { useEffect, useState } from 'react'
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

  category: {
    id: string
    name: string
  } | null

  fuelType: {
    id: string
    name: string
  } | null

  transmission: {
    id: string
    name: string
  } | null
}

interface BookingResponse {
  success: boolean
  message?: string
  data?: {
    reservation?: {
      id?: string
      reservationRef?: string
    }
    status?: string
    message?: string
  }
}

export default function ReservationPage() {
  const params = useParams()
  const router = useRouter()

  const carId = params.id as string

  // ==========================================
  // CAR STATE
  // ==========================================

  const [car, setCar] = useState<FleetCar | null>(null)
  const [carLoading, setCarLoading] = useState(true)
  const [carError, setCarError] = useState('')

  // ==========================================
  // CUSTOMER
  // ==========================================

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // ==========================================
  // RENTAL DETAILS
  // ==========================================

  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')

  // ==========================================
  // EXTRAS
  // ==========================================

  const [hasChauffeur, setHasChauffeur] = useState(false)
  const [hasDelivery, setHasDelivery] = useState(false)
  const [hasSatellite, setHasSatellite] = useState(false)

  const hasInsurance = true

  // ==========================================
  // BOOKING STATE
  // ==========================================

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // ==========================================
  // FETCH CAR
  // ==========================================

  useEffect(() => {
    if (!carId) return

    const fetchCar = async () => {
      try {
        setCarLoading(true)
        setCarError('')

        const response = await fetch(`/api/cars/${carId}`)

        const json = await response.json()

        if (!response.ok || !json.success) {
          throw new Error(
            json.message || 'Failed to load vehicle'
          )
        }

        const rawCar: RawCar = json.data

        // ======================================
        // FORMAT PRISMA CAR RESPONSE
        // ======================================

        const formattedCar: FleetCar = {
          id: rawCar.id,

          name:
            `${rawCar.manufacturer} ${rawCar.model}`.trim() ||
            'Unnamed Vehicle',

          category:
            rawCar.category?.name || 'Standard',

          // Keep upper-case status for backend compatibility
          status:
            rawCar.status || 'AVAILABLE',

          year:
            rawCar.year,

          price:
            rawCar.pricePerDay || 0,

          // Cloudinary URL
          image:
            rawCar.imageMain ||
            rawCar.imageGallery?.[0] ||
            '',

          fuelType:
            rawCar.fuelType?.name ||
            'Gasoline',

          seats:
            rawCar.seats || 4,

          location:
            rawCar.locationAddress ||
            rawCar.locationCity ||
            'Main Depot',

          transmission:
            rawCar.transmission?.name ||
            'Automatic',

          features:
            Array.isArray(rawCar.features)
              ? rawCar.features
              : [],
        }

        setCar(formattedCar)
      } catch (error) {
        console.error(
          'Failed to fetch car:',
          error
        )

        setCarError(
          error instanceof Error
            ? error.message
            : 'Failed to load vehicle'
        )
      } finally {
        setCarLoading(false)
      }
    }

    fetchCar()
  }, [carId])

  // ==========================================
  // PRICE CALCULATION
  // ==========================================

  const rentalDays = (() => {
    if (!pickupDate || !returnDate) {
      return 1
    }

    const start = new Date(pickupDate)
    const end = new Date(returnDate)

    const difference =
      end.getTime() - start.getTime()

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    )

    return days > 0 ? days : 1
  })()

  const dailyRate = car?.price || 0

  const baseRate =
    dailyRate * rentalDays

  const addOns =
    (hasChauffeur
      ? 100 * rentalDays
      : 0) +
    (hasDelivery ? 150 : 0) +
    (hasSatellite
      ? 45 * rentalDays
      : 0)

  const subtotal =
    baseRate + addOns

  const tax =
    Math.round(subtotal * 0.12)

  const total =
    subtotal + tax

  // ==========================================
  // SUBMIT BOOKING
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!car) {
      setErrorMessage(
        'Vehicle not found.'
      )
      return
    }

    if (car.status !== 'AVAILABLE') {
      setErrorMessage(
        'This vehicle is currently unavailable.'
      )
      return
    }

    if (
      !fullName ||
      !email ||
      !phone
    ) {
      setErrorMessage(
        'Please enter your customer details.'
      )
      return
    }

    if (
      !pickupLocation ||
      !pickupDate ||
      !returnDate ||
      !pickupTime
    ) {
      setErrorMessage(
        'Please complete all rental details.'
      )
      return
    }

    if (
      new Date(returnDate) <=
      new Date(pickupDate)
    ) {
      setErrorMessage(
        'Return date must be after pickup date.'
      )
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
          conciergeDelivery:
            hasDelivery,

          platinumInsurance:
            hasInsurance,

          satelliteConnectivity:
            hasSatellite,
        },
      }

      console.log(
        'BOOKING DATA:',
        bookingData
      )

      // ✅ FIXED: Points to /api/reservations
      const response = await fetch(
        '/api/reservations',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          credentials: 'include',

          body: JSON.stringify(
            bookingData
          ),
        }
      )

      const result: BookingResponse =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Failed to create booking'
        )
      }

      // ✅ FIXED: Reads reservationRef nested inside data.reservation
      const bookingRef =
        result.data?.reservation?.reservationRef ||
        result.data?.reservation?.id ||
        'CONFIRMED'

      setSuccessMessage(
        `Booking submitted successfully! Reference: ${bookingRef}`
      )

      setTimeout(() => {
        router.push('/bookings')
      }, 2500)
    } catch (error) {
      console.error(
        'Booking error:',
        error
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to create booking'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (carLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-500">
            Loading vehicle...
          </p>
        </div>
      </div>
    )
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">

        <h1 className="text-2xl font-bold text-gray-900">
          Vehicle Not Found
        </h1>

        <p className="text-gray-500 mt-2 text-center">
          {carError ||
            'The vehicle does not exist.'}
        </p>

        <Link
          href="/fleet"
          className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Browse Fleet
        </Link>

      </div>
    )
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-16">

            <Link
              href="/fleet"
              className="text-xl font-bold text-gray-900"
            >
              UrbanDrive
            </Link>

            <button
              type="submit"
              form="reservation-form"
              disabled={isSubmitting}
              className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : 'Confirm Booking'}
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ERROR */}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">

            {/* VEHICLE */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex flex-col sm:flex-row gap-5">

                {/* CLOUDINARY IMAGE */}

                <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                  {car.image ? (
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-gray-900">
                    {car.name}
                  </h1>

                  <p className="text-gray-500 mt-1">
                    {car.year} • {car.category}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">

                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {car.transmission}
                    </span>

                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {car.seats} Seats
                    </span>

                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {car.fuelType}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* FORM */}

            <form
              id="reservation-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8"
            >

              {/* CUSTOMER */}

              <section>

                <h2 className="font-semibold text-lg mb-4">
                  Customer Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">

                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                  />

                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                  />

                  <input
                    required
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                  />

                </div>

              </section>

              {/* RENTAL DETAILS */}

              <section>

                <h2 className="font-semibold text-lg mb-4">
                  Rental Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">

                  <input
                    required
                    type="text"
                    placeholder="Pickup Location"
                    value={pickupLocation}
                    onChange={(e) =>
                      setPickupLocation(e.target.value)
                    }
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black sm:col-span-2"
                  />

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date
                    </label>

                    <input
                      required
                      type="date"
                      value={pickupDate}
                      onChange={(e) =>
                        setPickupDate(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>

                    <input
                      required
                      type="date"
                      value={returnDate}
                      onChange={(e) =>
                        setReturnDate(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Time
                    </label>

                    <input
                      required
                      type="time"
                      value={pickupTime}
                      onChange={(e) =>
                        setPickupTime(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />

                  </div>

                </div>

              </section>

              {/* EXTRAS */}

              <section>

                <h2 className="font-semibold text-lg mb-4">
                  Extras
                </h2>

                <div className="space-y-3">

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">

                    <span>

                      <span className="font-medium">
                        Professional Chauffeur
                      </span>

                      <small className="block text-gray-500">
                        +₹100/day
                      </small>

                    </span>

                    <input
                      type="checkbox"
                      checked={hasChauffeur}
                      onChange={(e) =>
                        setHasChauffeur(e.target.checked)
                      }
                      className="w-5 h-5"
                    />

                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">

                    <span>

                      <span className="font-medium">
                        Concierge Delivery
                      </span>

                      <small className="block text-gray-500">
                        +₹150
                      </small>

                    </span>

                    <input
                      type="checkbox"
                      checked={hasDelivery}
                      onChange={(e) =>
                        setHasDelivery(e.target.checked)
                      }
                      className="w-5 h-5"
                    />

                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">

                    <span>

                      <span className="font-medium">
                        Satellite Connectivity
                      </span>

                      <small className="block text-gray-500">
                        +₹45/day
                      </small>

                    </span>

                    <input
                      type="checkbox"
                      checked={hasSatellite}
                      onChange={(e) =>
                        setHasSatellite(e.target.checked)
                      }
                      className="w-5 h-5"
                    />

                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">

                    <span>

                      <span className="font-medium">
                        Platinum Insurance
                      </span>

                      <small className="block text-gray-500">
                        Included
                      </small>

                    </span>

                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5"
                    />

                  </label>

                </div>

              </section>

            </form>

          </div>

          {/* RIGHT - PRICE */}

          <aside>

            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-lg font-bold mb-6">
                Price Summary
              </h2>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Daily Rate
                  </span>

                  <span className="font-medium">
                    ₹{dailyRate.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Rental Days
                  </span>

                  <span className="font-medium">
                    {rentalDays}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Base Price
                  </span>

                  <span className="font-medium">
                    ₹{baseRate.toLocaleString()}
                  </span>
                </div>

                {addOns > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Add-ons
                    </span>

                    <span className="font-medium">
                      ₹{addOns.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax (12%)
                  </span>

                  <span className="font-medium">
                    ₹{tax.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between">

                  <strong className="text-lg">
                    Total
                  </strong>

                  <strong className="text-xl">
                    ₹{total.toLocaleString()}
                  </strong>

                </div>

              </div>

              <button
                type="submit"
                form="reservation-form"
                disabled={isSubmitting}
                className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {isSubmitting
                  ? 'Processing...'
                  : 'Confirm Booking'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You won&apos;t be charged yet.
                Payment will be collected at pickup.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </main>
  )
}