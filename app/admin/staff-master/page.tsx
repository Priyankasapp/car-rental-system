/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { EntityGridPage } from '@/components/settings/EntityGridPage'
import { EntityItem } from '@/components/settings/EntityCard'
import { EntityGridSkeleton } from '@/components/settings/EntityGridSkeleton'

export default function StaffMasterPage() {
  const [staffRoles, setStaffRoles] = useState<EntityItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Staff Master roles from API
  const fetchStaffRoles = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/staff-master', {
        headers: { 'x-user-role': 'SUPERADMIN' },
      })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to load staff master roles')
      }

      // Map API payload to standard EntityItem schema used by EntityGridPage
      const mappedItems: EntityItem[] = (result.data.staffMasters || []).map(
        (role: any) => ({
          id: role.id,
          name: role.title,
          description: role.department
            ? `Department: ${role.department}${
                role.description ? ` • ${role.description}` : ''
              }`
            : role.description || undefined,
          count: role._count?.staffMembers || 0,
          createdAt: role.createdAt,
        })
      )

      setStaffRoles(mappedItems)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaffRoles()
  }, [fetchStaffRoles])

  // Create or Update Staff Role Handler
  const handleSaveStaffRole = async (item: Partial<EntityItem> & Record<string, any>) => {
    const isEdit = Boolean(item.id)
    const url = isEdit
      ? `/api/admin/staff-master/${item.id}`
      : '/api/admin/staff-master'
    const method = isEdit ? 'PUT' : 'POST'

    // Parse department from description input if entered or split
    const body = {
      title: item.name,
      department: item.description?.startsWith('Department:')
        ? item.description.split('Department:')[1].split('•')[0].trim()
        : 'Operations', // Fallback department if omitted
      description: item.description || null,
      isActive: item.isActive ?? true,
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SUPERADMIN',
      },
      body: JSON.stringify(body),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to save staff master role')
    }

    // Refresh list after saving
    await fetchCategories()
  }

  // Delete / Deactivate Staff Role Handler
  const handleDeleteStaffRole = async (id: string) => {
    const res = await fetch(`/api/admin/staff-master/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'SUPERADMIN' },
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to delete staff master role')
    }

    // Refresh list after deleting
    await fetchStaffRoles()
  }

  const fetchCategories = fetchStaffRoles

  if (loading) {
    return (
      <EntityGridSkeleton
        title="Staff Master Roles"
        description="Manage staff job titles and department roles supported in UrbanDrive."
        cardCount={6}
      />
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

  return (
    <EntityGridPage
      title="Staff Master Roles"
      entitySingularName="Staff Role"
      description="Manage job titles and departments for UrbanDrive staff members."
      addButtonText="Add Staff Role"
      initialItems={staffRoles}
      emptyStateTitle="No staff roles defined yet"
      emptyStateDescription="Create your first staff master role to configure team designations."
      onSave={handleSaveStaffRole}
      onDelete={handleDeleteStaffRole}
    />
  )
}