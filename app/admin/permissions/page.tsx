// app/admin/permissions/page.tsx
'use client'

import { PermissionCards } from '@/components/permissions/PermissionCards'
import { StaffList } from '@/components/permissions/StaffList'
import { PermissionsProvider } from '@/context/PermissionsContext'


// Wrap in provider here so the provider scope is limited to this page
export default function PermissionsPage() {
  return (
    <PermissionsProvider>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Permission Manager</h1>
          <p className="text-gray-500 mt-1">
            Select a staff member to manage their access permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StaffList />
          </div>
          <div className="lg:col-span-2">
            <PermissionCards />
          </div>
        </div>

      </div>
    </PermissionsProvider>
  )
}