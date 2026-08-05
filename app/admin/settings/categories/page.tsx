/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

//  Permission helper function
function hasPermission(user: any, permission: string): boolean {
  if (!user) return false
  const role = user.role?.toUpperCase()
  if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') return true
  const permissions = user.permissions || []
  return permissions.includes(permission)
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<EntityItem[]>([])
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
      const canView = hasPermission(user, 'categories:view')
      
      if (!canView) {
        router.push('/admin')
        return
      }
      
      setHasAccess(true)
      fetchCategories()
    }
  }, [user, userLoading])

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

  // Create or Update Category Handler
  const handleSaveCategory = async (item: Partial<EntityItem>) => {
    //  Permission check for create/edit
    if (!hasPermission(user, 'categories:create')) {
      throw new Error('You do not have permission to create/edit categories')
    }
    
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

    await fetchCategories()
  }

  // Delete Category Handler
  const handleDeleteCategory = async (id: string) => {
    //  Permission check for delete
    if (!hasPermission(user, 'categories:delete')) {
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

  //  Loading state
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Categories"
        description="Manage categories configurations supported in UrbanDrive."
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