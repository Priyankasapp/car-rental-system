/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

export default function TransmissionTypesPage() {
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch transmission types (silentRefetch prevents layout flickering during save/delete)
  const fetchTransmissions = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/transmission-types')
      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load transmission types')
      }

      const formattedItems: EntityItem[] = json.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        status: item.status || 'Active',
        color: item.color || 'bg-indigo-400',
        circleBg: item.circleBg || 'bg-indigo-100',
        textColor: item.textColor || 'text-indigo-700',
        borderColor: item.borderColor || 'border-indigo-200',
        count: item._count?.cars ?? 0,
      }))

      setItems(formattedItems)
    } catch (err: any) {
      console.error('Error fetching transmission types:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransmissions(true)
  }, [fetchTransmissions])

  // Handle Save (Create or Update)
  const handleSave = async (data: Partial<EntityItem>) => {
    if (!data.name?.trim()) {
      alert('Transmission type name is required.')
      return
    }

    const isEdit = Boolean(data.id)
    const endpoint = isEdit
      ? `/api/admin/transmission-types/${data.id}`
      : '/api/admin/transmission-types'

    const method = isEdit ? 'PUT' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save transmission type')
      }

      // Smooth background refresh after saving
      await fetchTransmissions(false)
    } catch (err: any) {
      console.error('Error saving transmission type:', err)
      alert(err.message || 'Failed to save')
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
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

      // Smooth background refresh after deletion
      await fetchTransmissions(false)
    } catch (err: any) {
      console.error('Error deleting transmission type:', err)
      alert(err.message || 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <EntityGridSkeleton
        title="Fuel Types"
        description="Manage  transmission configurations supported in UrbanDrive."
        cardCount={6}
      />
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

  return (
    <EntityGridPage
      title="Transmission Types"
      entitySingularName="Transmission"
      description="Manage gearbox and transmission options available for vehicles."
      addButtonText="Add Transmission"
      initialItems={items}
      emptyStateTitle="No transmission types found"
      emptyStateDescription="Create your first transmission option to get started."
      onSave={handleSave}
      onDelete={handleDelete}
    />
  )
}