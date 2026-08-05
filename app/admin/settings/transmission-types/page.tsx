/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function TransmissionTypesPage() {
  const router = useRouter()
  const [items, setItems] = useState<EntityItem[]>([])
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
      const canView = hasPermission(user, 'transmissions:view')
      
      if (!canView) {
        router.push('/admin')
        return
      }
      
      setHasAccess(true)
      fetchTransmissions(true)
    }
  }, [user, userLoading])

  // Fetch transmission types 
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

  // Handle Save (Create or Update)
  const handleSave = async (data: Partial<EntityItem>) => {
    //  Permission check for create/edit
    if (!hasPermission(user, 'transmissions:create')) {
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
    //  Permission check for delete
    if (!hasPermission(user, 'transmissions:delete')) {
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

      // Smooth background refresh after deletion
      await fetchTransmissions(false)
    } catch (err: any) {
      console.error('Error deleting transmission type:', err)
      alert(err.message || 'Failed to delete')
    }
  }

  //  Loading state
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Transmission Types"
        description="Manage transmission configurations supported in UrbanDrive."
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