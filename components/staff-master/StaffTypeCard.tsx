// components/admin/StaffTypeCard.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, ShieldCheck, Users } from 'lucide-react'
import { StaffMaster } from '@/context/AdminContext'

interface StaffTypeCardProps {
  staffMaster: StaffMaster
  onEdit: (staffMaster: StaffMaster) => void
  onDelete: (id: string) => void
}

export default function StaffTypeCard({ staffMaster, onEdit, onDelete }: StaffTypeCardProps) {
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
    <div className="relative bg-surface border border-border p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0px_10px_40px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-text-primary">{staffMaster.title}</h3>
          <span
            className={`inline-block mt-1 px-3 py-1 font-semibold text-[10px] rounded-full uppercase tracking-tighter ${
              staffMaster.isActive
                ? 'bg-accent-success/10 text-accent-success'
                : 'bg-red-500/10 text-red-600'
            }`}
          >
            {staffMaster.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-text-secondary hover:text-text-primary p-1 rounded-full transition-colors"
            aria-label="Staff type options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-border shadow-lg z-10">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onEdit(staffMaster)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-container"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(staffMaster.id)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface-container"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-text-secondary text-base mb-8 min-h-[3rem]">
        {staffMaster.description || 'No description added yet.'}
      </p>

      <div className="flex items-center justify-between text-text-secondary">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {staffMaster.defaultPermissions.length} permissions granted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {staffMaster._count?.staffMembers ?? 0}
          </span>
        </div>
      </div>
    </div>
  )
}