'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Calendar, MapPin, Truck, CreditCard } from 'lucide-react'

interface BookingCar {
  id: string
  manufacturer: string
  model: string
  year: number
  imageMain: string | null
  imageGallery: string[]
}

interface Booking {
  id: string
  reservationRef: string
  status: string
  pickupDate: string
  dropoffDate: string
  pickupLocation: string
  dropoffLocation: string
  total: number
  rentalDays?: number
  createdAt: string
  car: BookingCar | null
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-slate-100 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-700',
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('/api/reservations', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        })

        if (res.status === 401) {
          router.push('/login?redirect=/bookings')
          return
        }

        const data = await res.json()

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Unable to load your bookings.')
        }

        setBookings(data.data?.reservations || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings.')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [router])

  return (
    <main className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gray-500">My Bookings</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your reservation history</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              View active reservations, pending booking requests, and completed trips. Manage your next ride from one place.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-500" />
            <p className="mt-4 text-sm text-slate-500">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p className="text-lg font-semibold">Unable to load bookings</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Truck className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">No bookings yet</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Start your next ride by booking a premium vehicle from our fleet.
            </p>
            <Link
              href="/fleet"
              className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse fleet
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const carName = booking.car
                ? `${booking.car.manufacturer} ${booking.car.model}`
                : 'Reserved Vehicle'
              const statusClass = statusStyles[booking.status] || 'bg-slate-100 text-slate-800'

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid gap-6 md:grid-cols-[1.4fr_0.9fr] p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reservation</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{booking.reservationRef}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vehicle</p>
                          <p className="mt-2 font-semibold text-slate-900">{carName}</p>
                          <p className="mt-1 text-sm text-slate-600">{booking.car?.year ?? ''}</p>
                        </div>

                        <div className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">₹{booking.total.toLocaleString()}</p>
                          {booking.rentalDays != null && (
                            <p className="mt-1 text-sm text-slate-600">{booking.rentalDays} day{booking.rentalDays === 1 ? '' : 's'}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pickup</p>
                          <p className="mt-2 font-semibold text-slate-900">{booking.pickupLocation}</p>
                          <p className="mt-1 text-sm text-slate-600">{new Date(booking.pickupDate).toLocaleDateString()}</p>
                        </div>

                        <div className="rounded-3xl bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Return</p>
                          <p className="mt-2 font-semibold text-slate-900">{booking.dropoffLocation}</p>
                          <p className="mt-1 text-sm text-slate-600">{new Date(booking.dropoffDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3 text-slate-700">
                        <MapPin className="h-4 w-4" />
                        <p className="text-sm">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">Pickup starts {new Date(booking.pickupDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700">
                        <CreditCard className="h-4 w-4" />
                        <p className="text-sm">Charged ₹{booking.total.toLocaleString()}</p>
                      </div>
                      <Link
                        href={`/reservation/${booking.car?.id ?? ''}`}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View vehicle
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
