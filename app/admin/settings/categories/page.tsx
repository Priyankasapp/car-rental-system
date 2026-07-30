/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/categories')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load categories')
      }

      setCategories(result.data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Create or Update Category Handler
  const handleSaveCategory = async (item: Partial<EntityItem>) => {
    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/categories/${item.id}`
      : '/api/admin/categories'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to save category')
    }

    // Refresh list after saving
    await fetchCategories()
  }

  // Delete Category Handler
  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to delete category')
    }

    // Refresh list after deleting
    await fetchCategories()
  }

 if (loading) {
    return (
      <EntityGridSkeleton
        title="Fuel Types"
        description="Manage categories configurations supported in UrbanDrive."
        cardCount={6}
      />
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
        <p className="font-medium">Failed to load categories</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            fetchCategories()
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
      title="Categories"
      entitySingularName="Category"
      description="Manage vehicle categories used in UrbanDrive."
      addButtonText="Add Category"
      initialItems={categories}
      emptyStateTitle="No categories yet"
      emptyStateDescription="Create your first vehicle category to get started."
      onSave={handleSaveCategory}
      onDelete={handleDeleteCategory}
    />
  )
}