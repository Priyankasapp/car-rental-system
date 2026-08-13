/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

// Types
interface CategoryApiItem {
  id: string
  name?: string
  title?: string
  description?: string | null
  isActive?: boolean
  color?: string | null
  circleBg?: string | null
  textColor?: string | null
  borderColor?: string | null
  createdAt?: string
  _count?: { vehicles?: number; items?: number }
}

export default function CategoriesPage() {
  // Auth & permissions 
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.CATEGORIES_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.CATEGORIES_CREATE)
  const canDelete = hasPermission(PERMISSIONS.CATEGORIES_DELETE)

  // State 
  const [categories, setCategories] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories 
  const fetchCategories = useCallback(async () => {
    try {
      setError(null)

      const res = await fetch('/api/admin/categories')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load categories')
      }

      const rawItems: CategoryApiItem[] = Array.isArray(result.data)
        ? result.data
        : result.data?.categories || []

      const mappedItems: EntityItem[] = rawItems.map((cat: CategoryApiItem) => {
        const activeStatus = typeof cat.isActive === 'boolean' ? cat.isActive : true
        return {
          id: cat.id,
          name: cat.name || cat.title || '',
          description: cat.description ?? undefined,
          createdAt: cat.createdAt,
          isActive: activeStatus,
          status: activeStatus ? 'Active' : 'Inactive',
          color: cat.color ?? undefined,
          circleBg: (cat as any).circleBg ?? undefined,
          textColor: (cat as any).textColor ?? undefined,
          borderColor: (cat as any).borderColor ?? undefined,
        }
      })
      
      setCategories(mappedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching categories:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Trigger fetch once auth + permission confirmed 
  useEffect(() => {
    if (isReady) {
      fetchCategories()
    }
  }, [isReady, fetchCategories])

  // Save (Create or Update) 
  const handleSaveCategory = async (
    item: Partial<EntityItem> & Record<string, unknown>
  ) => {
    if (!canCreate) {
      throw new Error('You do not have permission to create/edit categories')
    }

    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/categories/${item.id}`
      : '/api/admin/categories'

    // Derive boolean isActive directly from item.status if conflict exists
    const activeValue = item.status 
    ? item.status === 'Active' 
    : (typeof item.isActive === 'boolean' ? item.isActive : true)

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...item,
        name: item.name,
        description: item.description || null,
        isActive: activeValue,
        color: item.color || null,
        circleBg: (item as any).circleBg || null,
        textColor: (item as any).textColor || null,
        borderColor: (item as any).borderColor || null,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to save category')
    }

    await fetchCategories()
  }

  // Delete 
  const handleDeleteCategory = async (id: string) => {
    if (!canDelete) {
      throw new Error('You do not have permission to delete categories')
    }

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to delete category')
    }

    await fetchCategories()
  }

  // Guards 
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Categories"
        description="Manage categories configurations supported in UrbanDrive."
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
            You do not have permission to view categories.
          </p>
        </div>
      </div>
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

  // Render 
  return (
    <EntityGridPage
      title="Categories"
      entitySingularName="Category"
      description="Manage vehicle categories used in UrbanDrive."
      addButtonText={canCreate ? 'Add Category' : undefined}
      initialItems={categories}
      emptyStateTitle="No categories yet"
      emptyStateDescription="Create your first vehicle category to get started."
      onSave={canCreate ? handleSaveCategory : undefined}
      onDelete={canDelete ? handleDeleteCategory : undefined}
    />
  )
}