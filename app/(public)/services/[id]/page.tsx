"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import FleetGrid from '@/components/fleet/FleetGrid'

export default function ServicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [service, setService] = useState<any | null>(null)
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError(null)

    fetch(`/api/services/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message || 'Failed to load')
        setService(json.data)
        setCars(json.data.cars || [])
      })
      .catch((err) => {
        console.error('Error loading service:', err)
        setError(err?.message || 'Failed to load service')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return <div className="py-12">Loading...</div>
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="py-12">
        <div>Service not found.</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">{service.name}</h1>
        {service.description && (
          <p className="mt-3 text-muted-foreground">{service.description}</p>
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Available Vehicles</h2>
        <FleetGrid cars={cars} totalVehicles={cars.length} onLoadMore={() => {}} />
      </div>
    </div>
  )
}
