// components/car/CarBookingSidebar.tsx
'use client'

import { useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'

interface CarBookingSidebarProps {
  carId: string
  price: number
  onBook: () => void
  isAuthenticated: boolean
}

export function CarBookingSidebar({ price, onBook, isAuthenticated }: CarBookingSidebarProps) {
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')

  const days = 3
  const subtotal = price * days
  const deliveryFee = 45
  const insurance = 120
  const total = subtotal + deliveryFee + insurance

  return (
    <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-8 space-y-8 shadow-lg">
      {/* Price */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wider">Starting at</p>
          <p className="text-4xl font-bold text-gray-900">
            ₹{price.toLocaleString()}
            <span className="text-lg font-normal text-gray-500">/day</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <span className="text-sm">★</span>
          <span className="font-bold">4.9</span>
          <span className="text-gray-500 text-sm">(128)</span>
        </div>
      </div>

      {/* Date & Location */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-px bg-gray-200 rounded-lg overflow-hidden">
          <div className="bg-white p-4">
            <label className="text-xs font-bold uppercase tracking-tighter">Delivery</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full border-none text-sm focus:ring-0 p-0"
              />
            </div>
          </div>
          <div className="bg-white p-4">
            <label className="text-xs font-bold uppercase tracking-tighter">Return</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full border-none text-sm focus:ring-0 p-0"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <label className="text-xs font-bold uppercase tracking-tighter">Pickup Location</label>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Enter location"
              className="w-full border-none text-sm focus:ring-0 p-0"
            />
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">₹{price.toLocaleString()} x {days} days</span>
          <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivery Fee</span>
          <span className="text-gray-900 font-medium">₹{deliveryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Insurance (Executive Plan)</span>
          <span className="text-gray-900 font-medium">₹{insurance}</span>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900 text-xl">₹{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition"
      >
        {isAuthenticated ? 'Instant Book' : 'Login to Book'}
      </button>

      <p className="text-center text-xs text-gray-500">
        Free cancellation up to 48 hours before delivery.
      </p>
    </div>
  )
}