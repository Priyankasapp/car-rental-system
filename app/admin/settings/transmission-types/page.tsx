/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useCallback, useState } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

// ── API item shape ───────────────────────────────────────────
interface TransmissionApiItem {
  id: string
  name: string
  description?: string | null
  status?: string | null
  color?: string | null
  circleBg?: string | null
  textColor?: string | null
  borderColor?: string | null
  _count?: { cars: number }
}

export default function TransmissionTypesPage() {
  // ── Auth & permissions ───────────────────────────────────
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.TRANSMISSIONS_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.TRANSMISSIONS_CREATE)
  const canDelete = hasPermission(PERMISSIONS.TRANSMISSIONS_DELETE)

  // ── State ────────────────────────────────────────────────
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch transmission types ─────────────────────────────
  const fetchTransmissions = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/transmission-types')
      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load transmission types')
      }

      const formattedItems: EntityItem[] = json.data.map(
        (item: TransmissionApiItem) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          status: item.status || 'Active',
          color: item.color || 'bg-indigo-400',
          circleBg: item.circleBg || 'bg-indigo-100',
          textColor: item.textColor || 'text-indigo-700',
          borderColor: item.borderColor || 'border-indigo-200',
          count: item._count?.cars ?? 0,
        })
      )

      setItems(formattedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching transmission types:', err)
      setError(message)
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [])

  // ── Trigger fetch once auth + permission confirmed ───────
  useEffect(() => {
    if (isReady) {
      fetchTransmissions(true)
    }
  }, [isReady, fetchTransmissions])

  // ── Save (Create or Update) ──────────────────────────────
  const handleSave = async (data: Partial<EntityItem>) => {
    if (!canCreate) {
      alert('You do not have permission to create/edit transmission types')
      return
    }

    if (!data.name?.trim()) {
      alert('Transmission type name is required.')
      return
    }

    const isEdit = Boolean(data.id)
    const endpoint = isEdit
      ? `/api/admin/transmission-types/${data.id}`
      : '/api/admin/transmission-types'

    try {
      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save transmission type')
      }

      await fetchTransmissions(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      console.error('Error saving transmission type:', err)
      alert(message)
    }
  }

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('You do not have permission to delete transmission types')
      return
    }

    if (!confirm('Are you sure you want to delete this transmission type?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/transmission-types/${id}`, {
        method: 'DELETE',
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete transmission type')
      }

      await fetchTransmissions(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete'
      console.error('Error deleting transmission type:', err)
      alert(message)
    }
  }

  // ── Guards ───────────────────────────────────────────────
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Transmission Types"
        description="Manage transmission configurations supported in UrbanDrive."
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
            You do not have permission to view transmission types.
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
          onClick={() => fetchTransmissions(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <EntityGridPage
      title="Transmission Types"
      entitySingularName="Transmission"
      description="Manage gearbox and transmission options available for vehicles."
       addButtonText={canCreate ? "Add Transmission" : undefined}
      initialItems={items}
      emptyStateTitle="No transmission types found"
      emptyStateDescription="Create your first transmission option to get started."
      onSave={canCreate ? handleSave : undefined}
      onDelete={canDelete ? handleDelete : undefined}
    />
  )
}