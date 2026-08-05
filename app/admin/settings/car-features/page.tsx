/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

// Permission helper function
function hasPermission(user: any, permission: string): boolean {
  if (!user) return false
  const role = user.role?.toUpperCase()
  if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') return true
  const permissions = user.permissions || []
  return permissions.includes(permission)
}

export default function CarFeaturesPage() {
  const router = useRouter()
  const [features, setFeatures] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState<boolean>(true)
  const [hasAccess, setHasAccess] = useState<boolean>(false)

  //  Load current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.data.user)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setUserLoading(false)
      }
    }
    loadUser()
  }, [])

  //  Permission check
  useEffect(() => {
    if (!userLoading && user) {
      const canView = hasPermission(user, 'features:view')
      
      if (!canView) {
        router.push('/admin')
        return
      }
      
      setHasAccess(true)
      fetchFeatures()
    }
  }, [user, userLoading])

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

  // Create or Update Feature Handler using PUT for updates
  const handleSaveFeature = async (item: Partial<EntityItem>) => {
    //  Permission check for create/edit
    if (!hasPermission(user, 'features:create')) {
      throw new Error('You do not have permission to create/edit features')
    }
    
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

    await fetchFeatures()
  }

  // Delete Feature Handler
  const handleDeleteFeature = async (id: string | number) => {
    //  Permission check for delete
    if (!hasPermission(user, 'features:delete')) {
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

  //  Loading state
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Car Features & Amenities"
        description="Manage vehicle amenities available during car registration."
        cardCount={6}
      />
    )
  }

  //  Access denied state
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