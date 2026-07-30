/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import {  Loader2 } from 'lucide-react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'

export default function FuelTypesPage() {
  const [items, setItems] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch Fuel Types from backend API
  const fetchFuelTypes = useCallback(async () => {
    try {
      
      setError(null) 
      const res = await fetch('/api/admin/fuel-types')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch fuel types')
      }

      setItems(json.data)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFuelTypes()
  }, [fetchFuelTypes])

  //  Handle Add / Edit submit
  const handleSaveItem = async (itemData: Partial<EntityItem>) => {
    const isEdit = Boolean(itemData.id)
    const url = isEdit
      ? `/api/admin/fuel-types/${itemData.id}`
      : '/api/admin/fuel-types'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })

    const json = await res.json()

    if (!res.ok ) {
      throw new Error(json.message || `Failed to ${isEdit ? 'update' : 'create'} fuel type`)
    }

    await fetchFuelTypes()
  }

  // 3. Handle Delete
  const handleDeleteItem = async (id: string | number) => {
    const res = await fetch(`/api/admin/fuel-types/${id}`, {
      method: 'DELETE',
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete fuel type')
    }

    await fetchFuelTypes()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading fuel types...</p>
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

  return (
    <EntityGridPage
      title="Fuel Types"
      entitySingularName="Fuel Type"
      description="Manage engine fuel configurations supported in UrbanDrive."
      addButtonText="Add Fuel Type"
      initialItems={items}
      onSave={handleSaveItem}
      onDelete={handleDeleteItem}
      emptyStateTitle="No fuel types found"
      emptyStateDescription="Create your first fuel option to get started."
    />
  )
}