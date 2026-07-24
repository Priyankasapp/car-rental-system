/* eslint-disable react-hooks/set-state-in-effect */
// context/PermissionsContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {  PermissionKey } from '@/lib/permissions'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  permissions: string[]
  isActive: boolean
  createdAt: string
}

interface PermissionsContextType {
  // State
  staff: StaffMember[]
  selectedUser: StaffMember | null
  activePermissions: string[]
  loadingStaff: boolean
  loadingPermissions: boolean
  saving: boolean
  message: { type: 'success' | 'error'; text: string } | null

  // Actions
  selectUser: (member: StaffMember) => void
  togglePermission: (key: PermissionKey) => void
  savePermissions: () => Promise<void>
  clearMessage: () => void
  refreshStaff: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null)
  const [activePermissions, setActivePermissions] = useState<string[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ── Fetch all staff members ──────────────────────────────────────────────────
  const refreshStaff = useCallback(async () => {
    setLoadingStaff(true)
    try {
      const res = await fetch('/api/admin/staff', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setStaff(data.data.staff)
      }
    } catch (error) {
      console.error('Failed to load staff:', error)
    } finally {
      setLoadingStaff(false)
    }
  }, [])

  useEffect(() => {
    refreshStaff()
  }, [refreshStaff])

  // ── Select a staff member and load their permissions ──────────────────────────
  const selectUser = useCallback(async (member: StaffMember) => {
    setSelectedUser(member)
    setMessage(null)
    setLoadingPermissions(true)

    try {
      const res = await fetch(`/api/admin/staff/${member.id}/permissions`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setActivePermissions(data.data.user.permissions || [])
      }
    } catch (error) {
      console.error('Failed to load permissions:', error)
      // fallback to what we already have in the staff list
      setActivePermissions(member.permissions || [])
    } finally {
      setLoadingPermissions(false)
    }
  }, [])

  // ── Toggle a permission on/off ────────────────────────────────────────────────
  const togglePermission = useCallback((key: PermissionKey) => {
    setActivePermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    )
  }, [])

  // ── Save permissions to API ───────────────────────────────────────────────────
  const savePermissions = useCallback(async () => {
    if (!selectedUser) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/staff/${selectedUser.id}/permissions`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: activePermissions }),
      })
      const data = await res.json()

      if (data.success) {
        // Sync updated permissions back into the staff list
        setStaff((prev) =>
          prev.map((s) =>
            s.id === selectedUser.id
              ? { ...s, permissions: activePermissions }
              : s
          )
        )
        setSelectedUser((prev) =>
          prev ? { ...prev, permissions: activePermissions } : null
        )
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }, [selectedUser, activePermissions])

  // ── Clear message ─────────────────────────────────────────────────────────────
  const clearMessage = useCallback(() => setMessage(null), [])

  const value: PermissionsContextType = {
    staff,
    selectedUser,
    activePermissions,
    loadingStaff,
    loadingPermissions,
    saving,
    message,
    selectUser,
    togglePermission,
    savePermissions,
    clearMessage,
    refreshStaff,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used inside <PermissionsProvider>')
  }
  return context
}