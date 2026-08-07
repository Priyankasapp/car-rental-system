/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'


// Types

interface StaffMasterApiItem {
  id: string
  title: string
  description?: string | null
  department?: string
  isActive?: boolean
  createdAt?: string
  _count?: { staffMembers: number }
}


// Page
export default function StaffMasterPage() {
  // ── Auth & permissions 
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.STAFF_MASTER_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.STAFF_MASTER_CREATE)
  const canDelete = hasPermission(PERMISSIONS.STAFF_MASTER_DELETE)

  // ── State 
  const [staffRoles, setStaffRoles] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch staff master roles 
  const fetchStaffRoles = useCallback(async () => {
    try {
      setError(null)

      const res = await fetch('/api/admin/staff-master')
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load staff master roles')
      }

      const mappedItems: EntityItem[] = (result.data.staffMasters || []).map(
        (role: StaffMasterApiItem) => ({
          id: role.id,
          name: role.title,
          description: role.description ?? undefined,
          count: role._count?.staffMembers ?? 0,
          createdAt: role.createdAt,
          isActive: role.isActive ?? true,
          status: role.isActive ? 'Active' : 'Inactive',
        })
      )

      setStaffRoles(mappedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching staff master roles:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Trigger fetch once auth + permission confirmed 
  useEffect(() => {
    if (isReady) {
      fetchStaffRoles()
    }
  }, [isReady, fetchStaffRoles])

  // ── Save (Create or Update) 
  const handleSaveStaffRole = async (
    item: Partial<EntityItem> & Record<string, unknown>
  ) => {
    if (!canCreate) {
      throw new Error('You do not have permission to create/edit staff roles')
    }

    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/staff-master/${item.id}`
      : '/api/admin/staff-master'

    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.name,
        department: item.department || 'Operations',
        description: item.description || null,
        isActive: item.isActive ?? true,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to save staff master role')
    }

    await fetchStaffRoles()
  }

  // ── Delete 
  const handleDeleteStaffRole = async (id: string) => {
    if (!canDelete) {
      throw new Error('You do not have permission to delete staff roles')
    }

    const res = await fetch(`/api/admin/staff-master/${id}`, {
      method: 'DELETE',
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to delete staff master role')
    }

    await fetchStaffRoles()
  }

  // ── Guards 
  if (userLoading || loading) {
    return (
      <EntityGridSkeleton
        title="Staff Master Roles"
        description="Manage staff job titles and department roles supported in UrbanDrive."
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
            You do not have permission to view staff master roles.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <p className="font-semibold text-base">Failed to load Staff Master Roles</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              fetchStaffRoles()
            }}
            className="mt-3 text-xs font-semibold underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Render 
  return (
    <EntityGridPage
      title="Staff Master Roles"
      entitySingularName="Staff Role"
      description="Manage job titles and departments for UrbanDrive staff members."
      addButtonText={canCreate ? 'Add Staff Role' : undefined}
      initialItems={staffRoles}
      emptyStateTitle="No staff roles defined yet"
      emptyStateDescription="Create your first staff master role to configure team designations."
      onSave={canCreate ? handleSaveStaffRole : undefined}
      onDelete={canDelete ? handleDeleteStaffRole : undefined}
    />
  )
}