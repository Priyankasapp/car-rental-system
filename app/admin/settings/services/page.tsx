/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

export default function ServicesPage() {
  // ── Auth & permissions ───────────────────────────────────
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.SERVICES_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.SERVICES_CREATE)
  const canDelete = hasPermission(PERMISSIONS.SERVICES_DELETE)

  // ── State ────────────────────────────────────────────────
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch services ───────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/admin/services')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch services')
      }

      setItems(json.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching services:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Trigger fetch once auth + permission confirmed ───────
  useEffect(() => {
    if (isReady) {
      fetchServices()
    }
  }, [isReady, fetchServices])

  // ── Save (Create or Update) ──────────────────────────────
  const handleSaveItem = async (itemData: Partial<EntityItem>) => {
    if (!canCreate) {
      throw new Error('You do not have permission to create/edit services')
    }

    const isEdit = Boolean(itemData.id)
    const url = isEdit
      ? `/api/admin/services/${itemData.id}`
      : '/api/admin/services'

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(
        json.message || `Failed to ${isEdit ? 'update' : 'create'} service`
      )
    }

    await fetchServices()
  }

  // ── Delete ───────────────────────────────────────────────
  const handleDeleteItem = async (id: string | number) => {
    if (!canDelete) {
      throw new Error('You do not have permission to delete services')
    }

    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete service')
    }

    await fetchServices()
  }

  // ── Guards ───────────────────────────────────────────────
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Services"
        description="Manage contact service configurations supported in UrbanDrive."
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
            You do not have permission to view services.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 text-red-600 border border-red-200 text-center my-8">
        <p className="font-semibold">Failed to load Services</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchServices}
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
      title="Services"
      entitySingularName="Service"
      description="Manage contact service configurations supported in UrbanDrive."
      addButtonText={canCreate ? 'Add Service' : undefined}
      initialItems={items}
      onSave={canCreate ? handleSaveItem : undefined}
      onDelete={canDelete ? handleDeleteItem : undefined}
      emptyStateTitle="No services found"
      emptyStateDescription="Create your first service option to get started."
    />
  )
}