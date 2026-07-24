// components/admin/permissions/StaffList.tsx
'use client'

import { usePermissions } from '@/context/PermissionsContext'

export function StaffList() {
  const { staff, selectedUser, loadingStaff, selectUser } = usePermissions()

  if (loadingStaff) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Staff & Admins ({staff.length})
        </h2>
      </div>

      {staff.length === 0 ? (
        <div className="px-4 py-10 text-center text-gray-400 text-sm">
          No staff members found.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {staff.map((member) => {
            const isSelected = selectedUser?.id === member.id
            return (
              <li key={member.id}>
                <button
                  onClick={() => selectUser(member)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          member.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {member.role}
                      </span>
                      <span className="text-xs text-gray-400">
                        {member.permissions.length} permissions
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}