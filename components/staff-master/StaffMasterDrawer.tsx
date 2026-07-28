/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/StaffMasterDrawer.tsx
'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { PERMISSIONS, PERMISSION_CATEGORIES } from '@/lib/permissions'
import { StaffMaster } from '@/context/AdminContext'

export type StaffMasterFormPayload = {
  title: string
  department: string
  staffType: 'DRIVER' | 'CLEANER' | null
  description: string | null
  defaultPermissions: string[]
  isActive: boolean
}

interface StaffMasterDrawerProps {
  isOpen: boolean
  onClose: () => void
  editing: StaffMaster | null
  onSubmit: (payload: StaffMasterFormPayload) => Promise<void>
}

const emptyForm = {
  title: '',
  department: '',
  staffType: '' as '' | 'DRIVER' | 'CLEANER',
  description: '',
  defaultPermissions: [] as string[],
  isActive: true,
}

export default function StaffMasterDrawer({ isOpen, onClose, editing, onSubmit }: StaffMasterDrawerProps) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset / prefill whenever the drawer opens for a different target
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    if (editing) {
      setForm({
        title: editing.title,
        department: editing.department,
        staffType: editing.staffType || '',
        description: editing.description || '',
        defaultPermissions: editing.defaultPermissions,
        isActive: editing.isActive,
      })
    } else {
      setForm(emptyForm)
    }
  }, [isOpen, editing])

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      defaultPermissions: prev.defaultPermissions.includes(key)
        ? prev.defaultPermissions.filter((p) => p !== key)
        : [...prev.defaultPermissions, key],
    }))
  }

  const toggleCategory = (category: string, keys: string[], checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      defaultPermissions: checked
        ? Array.from(new Set([...prev.defaultPermissions, ...keys]))
        : prev.defaultPermissions.filter((p) => !keys.includes(p)),
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.department.trim()) {
      setError('Staff type name and department are required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        title: form.title.trim(),
        department: form.department.trim(),
        staffType: form.staffType || null,
        description: form.description.trim() || null,
        defaultPermissions: form.defaultPermissions,
        isActive: form.isActive,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save staff type')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-screen flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-semibold text-text-primary">
                {editing ? 'Edit staff type' : 'Add staff type'}
              </h2>
              <p className="text-text-secondary mt-1">
                {editing ? 'Update this role and its system permissions.' : 'Create a staff role and define its system permissions.'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
          )}

          {/* General info */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">Staff type name</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Regional Manager"
                className="w-full border-b border-border focus:border-primary focus:ring-0 px-0 py-3 text-lg bg-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Operations"
                className="w-full border-b border-border focus:border-primary focus:ring-0 px-0 py-3 text-lg bg-transparent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">Staff type (optional)</label>
              <select
                value={form.staffType}
                onChange={(e) => setForm({ ...form, staffType: e.target.value as typeof form.staffType })}
                className="w-full border-b border-border focus:border-primary focus:ring-0 px-0 py-3 text-lg bg-transparent transition-colors"
              >
                <option value="">None</option>
                <option value="DRIVER">Driver</option>
                <option value="CLEANER">Cleaner</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe the responsibilities of this role..."
                rows={3}
                className="w-full border-b border-border focus:border-primary focus:ring-0 px-0 py-3 text-base bg-transparent transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-semibold text-text-primary">Status</h4>
                <p className="text-text-secondary text-sm">Enable or disable this role within the system.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                <span className="ml-3 text-xs font-semibold text-text-primary uppercase tracking-tight">
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-2xl font-semibold text-text-primary">Module permissions</h3>
              <p className="text-text-secondary mt-1">Choose what this staff role can access by default.</p>
            </div>

            <div className="space-y-4">
              {PERMISSION_CATEGORIES.map((category) => {
                const groupPerms = PERMISSIONS.filter((p) => p.category === category)
                const groupKeys = groupPerms.map((p) => p.key)
                const allChecked = groupKeys.every((k) => form.defaultPermissions.includes(k))

                return (
                  <div key={category} className="border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-text-primary uppercase tracking-widest text-sm">{category}</h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={(e) => toggleCategory(category, groupKeys, e.target.checked)}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Select all</span>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {groupPerms.map((p) => (
                        <label key={p.key} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={form.defaultPermissions.includes(p.key)}
                            onChange={() => togglePermission(p.key)}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-0"
                          />
                          <span className="text-text-secondary group-hover:text-text-primary transition-colors text-sm">
                            {p.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-border bg-white flex justify-end items-center gap-6">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary text-on-primary px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Create staff type'}
          </button>
        </div>
      </div>
    </div>
  )
}