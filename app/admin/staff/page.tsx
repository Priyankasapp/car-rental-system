/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  LayoutGrid,
  List as ListIcon,
  RotateCw,
} from 'lucide-react'
import { usePagePermission } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/lib/permissions'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface StaffRole {
  id: string
  title: string
  department: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: string
  staffMaster: StaffRole | null
}

export default function StaffPage() {
  // ── Auth & permissions ───────────────────────────────────
  const { loading: userLoading, hasAccess, hasPermission, isReady } =
    usePagePermission(PERMISSIONS.STAFF_VIEW, '/admin')

  const canCreate = hasPermission(PERMISSIONS.STAFF_CREATE)

  // ── State ────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [roles, setRoles] = useState<StaffRole[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ── Modal state ──────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Form fields ──────────────────────────────────────────
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [staffMasterId, setStaffMasterId] = useState('')

  // ── Fetch staff + roles ──────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/admin/staff', { credentials: 'include' }),
        fetch('/api/admin/staff-master', { credentials: 'include' }),
      ])

      const staffData = await staffRes.json()
      const rolesData = await rolesRes.json()

      if (!staffRes.ok) throw new Error(staffData.message || 'Failed to load staff')
      if (!rolesRes.ok) throw new Error(rolesData.message || 'Failed to load staff roles')

      setStaffList(staffData.data.staffMembers || [])
      setRoles(rolesData.data.staffMasters || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      console.error('Error fetching staff data:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Trigger fetch once auth + permission confirmed ───────
  useEffect(() => {
    if (isReady) {
      fetchData()
    }
  }, [isReady, fetchData])

  // ── Open add modal ───────────────────────────────────────
  const openAddModal = () => {
    if (!canCreate) {
      alert('You do not have permission to create staff members')
      return
    }

    setFormError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setStaffMasterId(roles[0]?.id || '')
    setIsModalOpen(true)
  }

  // ── Create staff ─────────────────────────────────────────
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canCreate) {
      setFormError('You do not have permission to create staff members')
      return
    }

    if (!firstName || !lastName || !email || !staffMasterId) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      setSaving(true)
      setFormError(null)

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          staffMasterId,
          role: 'STAFF',
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create staff member')
      }

      setIsModalOpen(false)
      await fetchData()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating staff member'
      console.error('Error creating staff:', err)
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  // ── Filtered list ────────────────────────────────────────
  const filteredStaff = staffList.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    const query = search.toLowerCase()
    return (
      fullName.includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.staffMaster?.title.toLowerCase().includes(query) ||
      s.staffMaster?.department.toLowerCase().includes(query)
    )
  })

  // ── Guards ───────────────────────────────────────────────
  if (userLoading || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to view staff members.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold text-lg">Failed to load Staff</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              fetchData()
            }}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-gray-700" />
            Staff Members
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage employees and assign staff roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl transition-all shadow-xs"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* ✅ Only show Add button if canCreate */}
          {canCreate && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 border border-gray-200 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ListIcon className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-xs">
          No staff members found matching your search.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="border border-gray-200 rounded-2xl bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 text-gray-800 font-bold text-lg rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                    {staff.firstName[0]}
                    {staff.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    {staff.staffMaster ? (
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {staff.staffMaster.title} • {staff.staffMaster.department}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-0.5">Unassigned Role</p>
                    )}
                  </div>
                </div>

                <div>
                  {staff.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <UserCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                      <UserX className="w-3.5 h-3.5" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
                {staff.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{staff.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 text-gray-700 font-bold rounded-full flex items-center justify-center shrink-0 border border-gray-200">
                          {staff.firstName[0]}
                          {staff.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {staff.email}
                            </span>
                            {staff.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {staff.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {staff.staffMaster ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {staff.staffMaster.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {staff.staffMaster.department}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <UserCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                          <UserX className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal — only mount if canCreate */}
      {isModalOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
                <p className="text-xs text-gray-500">
                  Create a new employee profile and assign a staff role.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              id="staff-form"
              onSubmit={handleCreateStaff}
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Staff Role (Staff Master) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={staffMasterId}
                  onChange={(e) => setStaffMasterId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-900 focus:outline-none"
                >
                  <option value="" disabled>Select a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title} ({role.department})
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="staff-form"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Staff
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}