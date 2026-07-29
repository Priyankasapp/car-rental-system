/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/staff/page.tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin, AdminStaff } from '@/context/AdminContext'
import StatsCard from '@/components/ui/StatsCard'
import { MoreVertical, Search, UsersRound } from 'lucide-react'

type StaffFilter = 'All' | 'Active' | 'Inactive'

const filterOptions: StaffFilter[] = ['All', 'Active', 'Inactive']

const roleBadgeClass = (role: string) =>
  role === 'SUPERADMIN' || role === 'ADMIN'
    ? 'bg-primary text-on-primary'
    : 'bg-surface-container-highest text-primary'

const roleLabel = (role: string) => {
  if (role === 'SUPERADMIN') return 'Super Admin'
  if (role === 'ADMIN') return 'Admin'
  return 'Staff'
}

function StatusIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-[12px] font-medium ${
        isActive ? 'text-accent-success' : 'text-text-secondary'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent-success' : 'bg-outline'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  )
}

function StaffAvatar({ member }: { member: AdminStaff }) {
  const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="w-20 h-20 rounded-full bg-primary-container border-2 border-surface-container-highest flex items-center justify-center mb-4">
      <span className="text-on-primary font-bold text-[20px]">{initials}</span>
    </div>
  )
}

function StaffCard({
  member,
  onEdit,
  onDelete,
}: {
  member: AdminStaff
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-[0px_10px_40px_rgba(0,0,0,0.04)] relative group hover:scale-[1.02] transition-all duration-300">
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="text-text-secondary hover:text-primary transition-colors"
          aria-label="Staff options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-border shadow-lg z-10 rounded-lg overflow-hidden">
            <button
              onClick={() => { setMenuOpen(false); onEdit(member.id) }}
              className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-container"
            >
              Edit
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(member.id) }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface-container"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center">
        <StaffAvatar member={member} />

        <h4 className="font-bold text-on-surface text-lg mb-1">
          {member.firstName} {member.lastName}
        </h4>
        <p className="text-text-secondary text-[12px] mb-4">{member.email}</p>

        <span className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-widest mb-4 ${roleBadgeClass(member.role)}`}>
          {roleLabel(member.role)}
        </span>

        <div className="w-full pt-4 border-t border-border flex items-center justify-between">
          <StatusIndicator isActive={member.isActive} />
          <p className="text-text-secondary text-[12px]">
            Added {new Date(member.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminStaffPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showCreatedBanner = searchParams.get('created') === '1'
  const { staff, fetchStaff, deleteStaff, isLoading } = useAdmin()
  const [filter, setFilter] = useState<StaffFilter>('All')
  const [search, setSearch] = useState('')
  const hasFetched = useRef(false)

  // fetchStaff already runs on admin login via context init, but guard
  // against navigating here before that first load completes
  useEffect(() => {
    if (!hasFetched.current && staff.length === 0 && !isLoading) {
      hasFetched.current = true
      fetchStaff()
    }
  }, [staff.length, isLoading, fetchStaff])

  const stats = useMemo(() => {
    const total = staff.length
    const active = staff.filter((s) => s.isActive).length
    const inactive = total - active
    const admins = staff.filter((s) => s.role === 'ADMIN' || s.role === 'SUPERADMIN').length

    return [
      { label: 'Total staff', value: String(total), icon: 'groups', sub: 'Across the system' },
      { label: 'Active', value: String(active), icon: 'circle', sub: 'Currently enabled', subColor: 'text-green-600' },
      { label: 'Inactive', value: String(inactive), icon: 'cancel', sub: inactive > 0 ? 'Access disabled' : 'None', subColor: 'text-red-500' },
      { label: 'Admins', value: String(admins), icon: 'shield', sub: 'Elevated access' },
    ]
  }, [staff])

  const filteredStaff = staff.filter((member) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Active' && member.isActive) ||
      (filter === 'Inactive' && !member.isActive)

    const term = search.toLowerCase()
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)

    return matchesFilter && matchesSearch
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member? They will lose access immediately.')) return
    try {
      await deleteStaff(id)
    } catch (err: any) {
      alert(err.message || 'Failed to remove staff member')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/staff/${id}/edit`)
  }

  return (
    <div className="p-8">
      {showCreatedBanner && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Staff member created successfully. Their temporary password and email verification OTP have been sent to their inbox.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black">Staff users</h2>
          <p className="mt-2 max-w-md text-gray-600">
            Manage your team, assign roles, and monitor account activity.
          </p>
        </div>

        <Link
          href="/admin/staff/new"
          className="rounded-lg bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800"
        >
          + Add staff
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="mb-12 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <StatsCard key={item.label} {...item} index={index} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-5 py-2 rounded-full text-[12px] font-bold transition-colors whitespace-nowrap ${
                filter === option
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff, roles..."
            className="bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all outline-none"
          />
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading && staff.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-xl">
          <p className="text-text-secondary">Loading staff...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-xl">
          <UsersRound className="h-10 w-10 text-outline mx-auto mb-3" />
          <h3 className="font-bold text-on-surface text-lg">No staff found</h3>
          <p className="text-text-secondary text-[13px] mt-1">
            {search ? 'Try a different search term.' : 'No staff match this filter yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((member) => (
            <StaffCard key={member.id} member={member} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}