// components/admin/permissions/PermissionCards.tsx
'use client'

import { usePermissions } from '@/context/PermissionsContext'
import { PERMISSIONS, PERMISSION_CATEGORIES, PermissionKey } from '@/lib/permissions'

export function PermissionCards() {
  const {
    selectedUser,
    activePermissions,
    loadingPermissions,
    saving,
    message,
    togglePermission,
    savePermissions,
  } = usePermissions()

  // Nothing selected yet
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-4xl mb-3">👈</div>
          <p className="text-gray-500 text-sm">
            Select a staff member to manage their permissions
          </p>
        </div>
      </div>
    )
  }

  // Loading selected user's permissions
  if (loadingPermissions) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Selected user header + save button */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            {selectedUser.email} · {selectedUser.role}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500">
            {activePermissions.length} / {PERMISSIONS.length} enabled
          </span>
          <button
            onClick={savePermissions}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Success / Error message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Permission cards grouped by category */}
      {PERMISSION_CATEGORIES.map((category) => (
        <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">{category}</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERMISSIONS.filter((p) => p.category === category).map((permission) => {
              const isEnabled = activePermissions.includes(permission.key)
              return (
                <button
                  key={permission.key}
                  onClick={() => togglePermission(permission.key as PermissionKey)}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left w-full transition-all ${
                    isEnabled
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Toggle pill */}
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors ${
                        isEnabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <p className={`text-sm font-medium ${isEnabled ? 'text-blue-800' : 'text-gray-800'}`}>
                      {permission.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {permission.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

    </div>
  )
}