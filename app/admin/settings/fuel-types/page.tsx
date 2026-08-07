/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FuelIcon } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

// ── API item shape 
interface FuelTypeApiItem {
  id: string
  name: string
  description?: string | null
  status?: string | null
  color?: string | null
  circleBg?: string | null
  textColor?: string | null
  borderColor?: string | null
  isActive?: boolean
}

export default function FuelTypesPage() {
  // ── Auth & permissions 
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.FUELS_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.FUELS_CREATE)
  const canDelete = hasPermission(PERMISSIONS.FUELS_DELETE)

  // ── State 
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch fuel types 
  const fetchFuelTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/fuel-types')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch fuel types')
      }

      const formattedItems: EntityItem[] = json.data.map(
        (item: FuelTypeApiItem) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          status: item.status || 'Active',
          color: item.color || 'bg-sky-400',
          circleBg: item.circleBg || 'bg-sky-100',
          textColor: item.textColor || 'text-sky-700',
          borderColor: item.borderColor || 'border-sky-200',
          isActive: item.isActive ?? item.status === 'Active',
        })
      )

      setItems(formattedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching fuel types:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Trigger fetch once auth + permission confirmed ───────
  useEffect(() => {
    if (isReady) {
      fetchFuelTypes()
    }
  }, [isReady, fetchFuelTypes])

  // ── Save (Create or Update) 
  const handleSaveItem = async (itemData: Partial<EntityItem>) => {
    if (!canCreate) {
      throw new Error('You do not have permission to create/edit fuel types')
    }

    const isEdit = Boolean(itemData.id)
    const url = isEdit
      ? `/api/admin/fuel-types/${itemData.id}`
      : '/api/admin/fuel-types'

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(
        json.message || `Failed to ${isEdit ? 'update' : 'create'} fuel type`
      )
    }

    await fetchFuelTypes()
  }

  // ── Delete 
  const handleDeleteItem = async (id: string | number) => {
    if (!canDelete) {
      throw new Error('You do not have permission to delete fuel types')
    }

    const res = await fetch(`/api/admin/fuel-types/${id}`, {
      method: 'DELETE',
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete fuel type')
    }

    await fetchFuelTypes()
  }

  // ── Guards 
   if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Fuel Types"
        description="Manage engine fuel configurations supported in UrbanDrive."
        icon={FuelIcon}
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
            You do not have permission to view fuel types.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 text-red-600 border border-red-200 text-center my-8">
        <p className="font-semibold">Failed to load Fuel Types</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchFuelTypes}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <EntityGridPage
      title="Fuel Types"
      entitySingularName="Fuel Type"
      description="Manage engine fuel configurations supported in UrbanDrive."
      addButtonText={canCreate ? 'Add Fuel Type' : undefined}
      initialItems={items}
      onSave={canCreate ? handleSaveItem : undefined}
      onDelete={canDelete ? handleDeleteItem : undefined}
      emptyStateTitle="No fuel types found"
      emptyStateDescription="Create your first fuel option to get started."
    />
  )
}