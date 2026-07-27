/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { useAdmin, StaffMaster } from '@/context/AdminContext'
import { PERMISSIONS } from '@/lib/permissions'

// Helper to normalize permissions whether PERMISSIONS is an object or an array
const permissionOptions = Array.isArray(PERMISSIONS)
  ? PERMISSIONS.map((p) => typeof p === 'string' ? { key: p, label: p } : p)
  : typeof PERMISSIONS === 'object' && PERMISSIONS !== null
  ? Object.entries(PERMISSIONS).map(([key, val]) => ({
      key: typeof val === 'string' ? val : key,
      label: typeof val === 'string' ? val : key,
    }))
  : []

export default function StaffMasterPage() {
  const { staffMasters, isLoading, error, addStaffMaster, updateStaffMaster, deleteStaffMaster } = useAdmin()

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingMaster, setEditingMaster] = useState<StaffMaster | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [staffType, setStaffType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingMaster(null)
    setTitle('')
    setDepartment('')
    setStaffType('')
    setDescription('')
    setSelectedPermissions([])
    setFormError(null)
    setShowModal(true)
  }

  // Open Modal for Edit
  const handleOpenEdit = (master: StaffMaster) => {
    setEditingMaster(master)
    setTitle(master.title)
    setDepartment(master.department)
    setStaffType(master.staffType || '')
    setDescription(master.description || '')
    setSelectedPermissions(master.defaultPermissions || [])
    setFormError(null)
    setShowModal(true)
  }

  // Toggle Permission Checkbox
  const togglePermission = (key: string) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    )
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    const payload = {
      title,
      department,
      staffType: staffType || null,
      description: description || null,
      defaultPermissions: selectedPermissions,
    }

    try {
      if (editingMaster) {
        await updateStaffMaster(editingMaster.id, payload)
      } else {
        await addStaffMaster(payload)
      }
      setShowModal(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save Staff Master'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  // Delete Handler
  const handleDelete = async (id: string, masterTitle: string) => {
    if (confirm(`Are you sure you want to delete "${masterTitle}"?`)) {
      try {
        await deleteStaffMaster(id)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete Staff Master'
        alert(msg)
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Master</h1>
          <p className="text-sm text-gray-500">
            Create job templates with default permission blueprints for your staff members.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          + Add Staff Master
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && staffMasters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading Staff Masters...</div>
        ) : staffMasters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No Staff Masters created yet. Click &quot;+ Add Staff Master&quot; to set up your first role template.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Role Title</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Staff Type</th>
                  <th className="px-6 py-3">Default Permissions</th>
                  <th className="px-6 py-3">Assigned Staff</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffMasters.map((master) => (
                  <tr key={master.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {master.title}
                      {master.description && (
                        <p className="text-xs text-gray-500 font-normal line-clamp-1">{master.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{master.department}</td>
                    <td className="px-6 py-4">
                      {master.staffType ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {master.staffType}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">General Staff</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="font-semibold text-gray-900">{master.defaultPermissions?.length || 0}</span> assigned
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {master._count?.staffMembers || 0} members
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEdit(master)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(master.id, master.title)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMaster ? 'Edit Staff Master' : 'Create Staff Master'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Driver"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Logistics & Operations"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Staff Type (Optional)</label>
                <select
                  value={staffType}
                  onChange={(e) => setStaffType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">None / General Admin Staff</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="CLEANER">CLEANER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe key responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Permissions List */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Default Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-3 rounded-lg bg-gray-50 border-gray-200">
                  {permissionOptions.map((perm: { key: string; label: string }) => (
                    <label key={perm.key} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : editingMaster ? 'Update Master' : 'Save Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}