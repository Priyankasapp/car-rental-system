/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

export default function CarFeaturesPage() {
  const [features, setFeatures] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch features from API
  const fetchFeatures = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/car-features')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load car features')
      }

      setFeatures(result.data || result)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  // Create or Update Feature Handler using PUT for updates
  const handleSaveFeature = async (item: Partial<EntityItem>) => {
    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/car-features/${item.id}`
      : '/api/admin/car-features'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to save feature')
    }

    // Refresh list after saving
    await fetchFeatures()
  }

  // Delete Feature Handler
  const handleDeleteFeature = async (id: string | number) => {
    const res = await fetch(`/api/admin/car-features/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to delete feature')
    }

    // Refresh list after deleting
    await fetchFeatures()
  }

  if (loading) {
    return (
      <EntityGridSkeleton
        title="Car Features & Amenities"
        description="Manage vehicle amenities available during car registration."
        cardCount={6}
      />
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
        <p className="font-medium">Failed to load car features</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            fetchFeatures()
          }}
          className="mt-2 text-xs font-semibold underline hover:no-underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <EntityGridPage
      title="Car Features & Amenities"
      entitySingularName="Feature"
      description="Manage vehicle amenities available during car registration."
      icon={Sparkles}
      addButtonText="Add Feature"
      initialItems={features}
      emptyStateTitle="No features yet"
      emptyStateDescription="Create your first amenity (e.g., GPS, Bluetooth) to get started."
      onSave={handleSaveFeature}
      onDelete={handleDeleteFeature}
    />
  )
}