/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

// API item shape
interface FeatureApiItem {
  id: string
  name: string
  description?: string | null
  status?: string | null
  isActive?: boolean
  color?: string | null
  circleBg?: string | null
  textColor?: string | null
  borderColor?: string | null
  _count?: { cars?: number }
}

export default function CarFeaturesPage() {
  // Auth & permissions
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.FEATURES_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.FEATURES_CREATE)
  const canDelete = hasPermission(PERMISSIONS.FEATURES_DELETE)

  // State
  const [features, setFeatures] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch features
  const fetchFeatures = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/car-features')
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to load car features')
      }

      const rawItems: FeatureApiItem[] = Array.isArray(result.data)
        ? result.data
        : result.data?.features || []

      const formattedItems: EntityItem[] = rawItems.map((item: FeatureApiItem) => {
        const activeStatus = item.status ? item.status === 'Active' : (item.isActive ?? true)
        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          isActive: activeStatus,
          status: activeStatus ? 'Active' : 'Inactive',
          color: item.color || 'bg-amber-400',
          circleBg: item.circleBg || 'bg-amber-100',
          textColor: item.textColor || 'text-amber-700',
          borderColor: item.borderColor || 'border-amber-200',
          count: item._count?.cars ?? 0,
        }
      })

      setFeatures(formattedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching car features:', err)
      setError(message)
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isReady) {
      fetchFeatures(true)
    }
  }, [isReady, fetchFeatures])

  // Save (Create or Update)
  const handleSaveFeature = async (data: Partial<EntityItem>) => {
    if (!canCreate) {
      alert('You do not have permission to create/edit features')
      return
    }

    if (!data.name?.trim()) {
      alert('Feature name is required.')
      return
    }

    const isEdit = Boolean(data.id)
    const url = isEdit
      ? `/api/admin/car-features/${data.id}`
      : '/api/admin/car-features'

    const isCurrentlyActive = data.status
      ? data.status === 'Active'
      : (typeof data.isActive === 'boolean' ? data.isActive : true)

    const payload = {
      ...data,
      name: data.name.trim(),
      description: data.description || null,
      isActive: isCurrentlyActive,
      status: isCurrentlyActive ? 'Active' : 'Inactive',
    }

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST', // FIXED: Changed PUT to PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to save feature')
      }

      await fetchFeatures(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save feature'
      console.error('Error saving car feature:', err)
      alert(message)
    }
  }

  // Delete
  const handleDeleteFeature = async (id: string | number) => {
    if (!canDelete) {
      alert('You do not have permission to delete features')
      return
    }

    if (!confirm('Are you sure you want to permanently delete this feature?')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/car-features/${id}`, {
        method: 'DELETE',
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to delete feature')
      }

      await fetchFeatures(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete feature'
      console.error('Error deleting car feature:', err)
      alert(message)
    }
  }

  // Guards
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
      <div className="flex flex-col items-center justify-center min-h-100 gap-3">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
        <button
          onClick={() => fetchFeatures(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Render
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