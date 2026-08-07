/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

export default function CarFeaturesPage() {
  // ── Auth & permissions ───────────────────────────────────
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.FEATURES_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.FEATURES_CREATE)
  const canDelete = hasPermission(PERMISSIONS.FEATURES_DELETE)

  // ── State ────────────────────────────────────────────────
  const [features, setFeatures] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch features ───────────────────────────────────────
  const fetchFeatures = useCallback(async () => {
    try {
      setError(null)

      const res = await fetch('/api/admin/car-features')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load car features')
      }

      setFeatures(result.data || result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching car features:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isReady) {
      fetchFeatures()
    }
  }, [isReady, fetchFeatures])

  // ── Save (Create or Update) 
  const handleSaveFeature = async (item: Partial<EntityItem>) => {
    if (!canCreate) {
      throw new Error('You do not have permission to create/edit features')
    }

    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/car-features/${item.id}`
      : '/api/admin/car-features'

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to save feature')
    }

    await fetchFeatures()
  }

  // ── Delete 
  const handleDeleteFeature = async (id: string | number) => {
    if (!canDelete) {
      throw new Error('You do not have permission to delete features')
    }

    const res = await fetch(`/api/admin/car-features/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || result.error || 'Failed to delete feature')
    }

    await fetchFeatures()
  }

  // ── Guards 
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Car Features & Amenities"
        description="Manage vehicle amenities available during car registration."
        cardCount={6}
      />
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to view car features.
          </p>
        </div>
      </div>
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

  // ── Render 
  return (
    <EntityGridPage
      title="Car Features & Amenities"
      entitySingularName="Feature"
      description="Manage vehicle amenities available during car registration."
      icon={Sparkles}
      addButtonText={canCreate ? 'Add Feature' : undefined}      
      initialItems={features}
      emptyStateTitle="No features yet"
      emptyStateDescription="Create your first amenity (e.g., GPS, Bluetooth) to get started."
      onSave={canCreate ? handleSaveFeature : undefined}          
      onDelete={canDelete ? handleDeleteFeature : undefined}      
    />
  )
}