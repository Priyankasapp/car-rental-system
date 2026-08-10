"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import FleetGrid from '@/components/fleet/FleetGrid'

interface ServiceCar {
  id: string
  manufacturer?: string | null
  model?: string | null
  year?: number | null
  licensePlate?: string | null
  status?: string | null
  imageMain?: string | null
}

interface ServiceDetails {
  id: string
  name: string
  description?: string | null
  cars?: ServiceCar[]
}

export default function ServicePage() {
  const params = useParams()
  const id = params?.id

  const [service, setService] = useState<ServiceDetails | null>(null)
  const [cars, setCars] = useState<ServiceCar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const fetchService = async () => {
      if (!isMounted) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/services/${id}`)
        const json = await response.json()

        if (!json.success) {
          throw new Error(json.message || 'Failed to load')
        }

        if (!isMounted) return

        setService(json.data)
        setCars(json.data.cars || [])
      } catch (err) {
        console.error('Error loading service:', err)
        setError((err as Error)?.message || 'Failed to load service')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchService()

    return () => {
      isMounted = false
    }
  }, [id])

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
