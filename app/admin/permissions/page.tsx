/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
'use client'

import { useState, useEffect } from 'react'

interface PermissionItem {
  key: string
  label: string
  description: string
}

interface PermissionGroup {
  category: string
  permissions: PermissionItem[]
}

interface UserTarget {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  permissions: string[]
  staffMaster?: {
    staffType: string
    defaultPermissions: string[]
  }
}

interface StaffMasterTarget {
  id: string
  staffType: string
  description: string
  defaultPermissions: string[]
  title: string
}

export default function PermissionsManagementPage() {
  const [catalog, setCatalog] = useState<PermissionGroup[]>([])
  const [users, setUsers] = useState<UserTarget[]>([])
  const [staffMasters, setStaffMasters] = useState<StaffMasterTarget[]>([])
  
  const [activeTab, setActiveTab] = useState<'USERS' | 'STAFF_ROLES'>('USERS')
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch initial data
  useEffect(() => {
    fetchPermissionsData()
  }, [])

  async function fetchPermissionsData() {
    try {
      setLoading(true)
      const res = await fetch('/api/permissions')
      const json = await res.json()

      if (json.success) {
        setCatalog(json.data.permissionCatalog || [])
        setUsers(json.data.users || [])
        setStaffMasters(json.data.staffMasters || [])

        // Select first user by default if available
        if (json.data.users?.length > 0) {
          setSelectedTargetId(json.data.users[0].id)
          setSelectedPermissions(json.data.users[0].permissions || [])
        }
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to load permissions' })
      }
    } catch (_err) {
      setMessage({ type: 'error', text: 'Error connecting to server' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Target Selection Change
  const handleSelectUser = (user: UserTarget) => {
    setSelectedTargetId(user.id)
    setSelectedPermissions(user.permissions || [])
    setMessage(null)
  }

  const handleSelectStaffMaster = (staff: StaffMasterTarget) => {
    setSelectedTargetId(staff.id)
    setSelectedPermissions(staff.defaultPermissions || [])
    setMessage(null)
  }

  // Toggle individual permission key
  const handleTogglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    )
  }

  // Toggle whole category group
  const handleToggleCategory = (group: PermissionGroup) => {
    const groupKeys = group.permissions.map((p) => p.key)
    const allSelected = groupKeys.every((k) => selectedPermissions.includes(k))

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)))
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupKeys])))
    }
  }

  // Save changes to API
  const handleSave = async () => {
    if (!selectedTargetId) return

    try {
      setSaving(true)
      setMessage(null)

      const payload = {
        targetType: activeTab === 'USERS' ? 'USER' : 'STAFF_MASTER',
        targetId: selectedTargetId,
        permissions: selectedPermissions,
      }

      const res = await fetch('/api/permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (json.success) {
        setMessage({ type: 'success', text: 'Permissions updated successfully!' })

        // Update local state
        if (activeTab === 'USERS') {
          setUsers((prev) =>
            prev.map((u) => (u.id === selectedTargetId ? { ...u, permissions: selectedPermissions } : u))
          )
        } else {
          setStaffMasters((prev) =>
            prev.map((s) => (s.id === selectedTargetId ? { ...s, defaultPermissions: selectedPermissions } : s))
          )
        }
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to update permissions' })
      }
    } catch (_err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const selectedUser = users.find((u) => u.id === selectedTargetId)
  const isSuperAdmin = selectedUser?.role === 'SUPERADMIN'

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading permissions matrix...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access & Permissions Matrix</h1>
          <p className="text-sm text-slate-500">
            Configure fine-grained system access controls for users and staff role defaults.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || isSuperAdmin}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => {
            setActiveTab('USERS')
            if (users.length > 0) handleSelectUser(users[0])
          }}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'USERS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Individual Users ({users.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('STAFF_ROLES')
            if (staffMasters.length > 0) handleSelectStaffMaster(staffMasters[0])
          }}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'STAFF_ROLES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Staff Role Defaults ({staffMasters.length})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar Target List */}
        <div className="bg-white border rounded-xl p-4 space-y-2 shadow-sm h-fit">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select {activeTab === 'USERS' ? 'User' : 'Staff Role'}
          </h2>

          {activeTab === 'USERS' ? (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedTargetId === user.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
                <div className="mt-1 flex gap-2 items-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {user.role}
                  </span>
                  {user.role === 'SUPERADMIN' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      ALL ACCESS
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            staffMasters.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleSelectStaffMaster(staff)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedTargetId === staff.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm">{staff.staffType}</div>
                <div className="text-xs text-slate-500">{staff.title || 'Default permissions template'}</div>
              </button>
            ))
          )}
        </div>

        {/* Right Permission Group Toggles */}
        <div className="md:col-span-2 bg-white border rounded-xl p-6 shadow-sm space-y-6">
          {isSuperAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
              ⚡ <strong>Superadmin Role Notice:</strong> This user automatically bypasses all permission checks and has full access across the entire platform.
            </div>
          )}

          {catalog.map((group) => {
            const groupKeys = group.permissions.map((p) => p.key)
            const allSelected = groupKeys.every((k) => selectedPermissions.includes(k))

            return (
              <div key={group.category} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800">{group.category}</h3>
                  <button
                    type="button"
                    disabled={isSuperAdmin}
                    onClick={() => handleToggleCategory(group)}
                    className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-40"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.permissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key)

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? 'bg-blue-50/50 border-blue-200'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        } ${isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isSuperAdmin}
                          checked={isChecked || isSuperAdmin}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{perm.label}</div>
                          <div className="text-xs text-slate-500">{perm.description}</div>
                          <code className="text-[10px] text-slate-400 mt-1 block">{perm.key}</code>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}