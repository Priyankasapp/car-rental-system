/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/staff-master/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useAdmin, StaffMaster } from '@/context/AdminContext'
import StatsCard from '@/components/ui/StatsCard'
import { PERMISSIONS } from '@/lib/permissions'
import StaffMasterDrawer, { StaffMasterFormPayload } from '@/components/staff-master/StaffMasterDrawer'
import StaffTypeCard from '@/components/staff-master/StaffTypeCard'

const StaffMasterPage = () => {
  const { staffMasters, addStaffMaster, updateStaffMaster, deleteStaffMaster } = useAdmin()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMaster | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = staffMasters.length
    const active = staffMasters.filter((m) => m.isActive).length
    const inactive = total - active
    const distinctPermissions = new Set(staffMasters.flatMap((m) => m.defaultPermissions)).size

    return [
      { label: 'Total staff types', value: String(total), icon: 'layers', sub: 'Across the system' },
      { label: 'Active roles', value: String(active), icon: 'check_circle', sub: `${total ? Math.round((active / total) * 100) : 0}% of total library` },
      { label: 'Inactive roles', value: String(inactive), icon: 'cancel', sub: inactive > 0 ? 'Requires review' : 'None' },
      { label: 'Permissions in use', value: String(distinctPermissions), icon: 'key', sub: `Out of ${PERMISSIONS.length} available` },
    ]
  }, [staffMasters])

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }

  const openEdit = (staffMaster: StaffMaster) => {
    setEditing(staffMaster)
    setDrawerOpen(true)
  }

  const handleSubmit = async (payload: StaffMasterFormPayload) => {
    if (editing) {
      await updateStaffMaster(editing.id, payload)
    } else {
      await addStaffMaster(payload)
    }
    setDrawerOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff type? This only works if no staff are currently assigned to it.')) return

    setDeletingId(id)
    try {
      await deleteStaffMaster(id)
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff type')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-semibold text-text-primary">Staff management</h2>
          <p className="text-text-secondary mt-2 max-w-md">
            Manage your organization&apos;s administrative roles and system access.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-on-primary px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-[0.98]"
        >
          Add staff type
        </button>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        {stats.map((item, index) => (
          <StatsCard key={item.label} {...item} index={index} />
        ))}
      </section>

      {staffMasters.length === 0 ? (
        <div className="border border-border bg-surface p-16 text-center">
          <p className="text-text-secondary">No staff types yet — add your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMasters.map((master) => (
            <StaffTypeCard
              key={master.id}
              staffMaster={master}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <StaffMasterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {deletingId && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Deleting...
        </div>
      )}
    </div>
  )
}

export default StaffMasterPage