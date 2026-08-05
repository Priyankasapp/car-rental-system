/* eslint-disable react-hooks/refs */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  AlertCircle,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Check,
  X,
  UserPlus,
} from 'lucide-react'

import {
  hasPermission,
  PERMISSIONS,
} from '@/lib/permissions'

// ============================================================
// TYPES
// ============================================================

interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  permissions?: string[]
}

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  _count?: {
    reservations?: number
    payments?: number
  }
}

// ============================================================
// USER ROLE BADGE
// ============================================================

const UserRoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    SUPERADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
    STAFF: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CUSTOMER: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const labels: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    STAFF: 'Staff',
    CUSTOMER: 'Customer',
  }

  const normalizedRole = role?.toUpperCase() || 'CUSTOMER'

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
        styles[normalizedRole] || styles.CUSTOMER
      }`}
    >
      {labels[normalizedRole] || role}
    </span>
  )
}

// ============================================================
// USER STATUS BADGE
// ============================================================

const UserStatusBadge = ({
  isActive,
}: {
  isActive: boolean
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${
        isActive
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}

      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ============================================================
// ADMIN USERS PAGE (CONTEXT-FREE)
// ============================================================

export default function AdminUsersPage() {
  const router = useRouter()

  // LOCAL AUTH & DATA STATE
  const [user, setUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const hasInitialized = useRef(false)

  // ==========================================================
  // PERMISSION CHECK
  // ==========================================================

  const can = useCallback(
    (permission: keyof typeof PERMISSIONS) => {
      if (!user) return false

      const role = user.role?.toUpperCase()

      // Super Admin can do everything
      if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') {
        return true
      }

      return hasPermission(
        user.role,
        user.permissions || [],
        PERMISSIONS[permission]
      )
    },
    [user]
  )

  const canViewUsers = can('USERS_VIEW')
  const canCreateUsers = can('USERS_CREATE')
  const canEditUsers = can('USERS_EDIT')
  const canDeleteUsers = can('USERS_DELETE')

  // ==========================================================
  // API: FETCH USERS
  // ==========================================================

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/admin/users', {
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customer list')
      }

      setUsers(data.data?.users || data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ==========================================================
  // INITIAL LOAD: AUTH & USERS FETCH
  // ==========================================================

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initializePage = async () => {
      try {
        setAuthLoading(true)

        // 1. Check Auth Status
        const authRes = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        const authData = await authRes.json()

        if (!authRes.ok || !authData.success || !authData.data) {
          router.push('/login')
          return
        }

        const currentUser: AuthUser = authData.data?.user || authData.data
        setUser(currentUser)

        // 2. Check Role / Permissions
        const role = currentUser.role?.toUpperCase()
        const isSuperAdmin = role === 'SUPERADMIN' || role === 'SUPER_ADMIN'
        const hasViewPerm =
          isSuperAdmin ||
          hasPermission(
            currentUser.role,
            currentUser.permissions || [],
            PERMISSIONS.USERS_VIEW
          )

        if (!hasViewPerm) {
          router.push('/admin')
          return
        }

        // 3. Fetch User List
        await fetchUsers()
      } catch (err) {
        console.error('Failed to initialize page session:', err)
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

    initializePage()
  }, [router, fetchUsers])

  // ==========================================================
  // API: DELETE USER
  // ==========================================================

  const handleDelete = async (id: string) => {
    if (!canDeleteUsers) return

    if (
      !confirm(
        'Are you sure you want to delete this customer? This action cannot be undone.'
      )
    ) {
      return
    }

    setDeletingId(id)

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete customer')
      }

      // Remove deleted user from state
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error('Failed to delete customer:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete customer')
    } finally {
      setDeletingId(null)
    }
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredUsers = (users || []).filter((u) => {
    const search = searchTerm.toLowerCase().trim()

    if (!search) return true

    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
    const email = (u.email || '').toLowerCase()
    const phone = (u.phone || '').toLowerCase()

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search)
    )
  })

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (authLoading || (isLoading && users.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  // ==========================================================
  // ACCESS DENIED
  // ==========================================================

  if (!user || !canViewUsers) {
    return null
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage registered customer accounts
          </p>
        </div>

        {/* Only show Add Customer if users:create */}
        {canCreateUsers && (
          <Link
            href="/admin/users/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Link>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* SEARCH */}
     <div className="flex flex-col sm:flex-row gap-4 mb-6">
  <div className="flex-1 relative">
    <label htmlFor="user-search" className="sr-only">
      Search users by name, email, or phone
    </label>

    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      aria-hidden="true"
    />

    <input
      id="user-search"
      type="text"
      placeholder="Search by name, email, or phone..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
    />
  </div>
</div>

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No customers found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? 'Try adjusting your search query'
              : 'No registered customer accounts available.'}
          </p>
        </div>
      ) : (
        /* USERS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                {/* USER HEADER */}
                <div className="p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-lg uppercase shrink-0">
                        {u.firstName?.[0] || 'U'}
                        {u.lastName?.[0] || ''}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {u.firstName} {u.lastName}
                        </h3>

                        <div className="flex items-center gap-2 mt-0.5">
                          <UserRoleBadge role={u.role} />
                        </div>
                      </div>
                    </div>

                    <UserStatusBadge isActive={u.isActive} />
                  </div>
                </div>

                {/* USER DETAILS */}
                <div className="p-4 space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>

                  {/* Phone */}
                  {u.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}

                  {/* Joined */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      Joined{' '}
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                    <div className="text-center flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {u._count?.reservations ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>

                    <div className="text-center flex-1">
                      <p className="text-lg font-semibold text-gray-900">
                        {u._count?.payments ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Payments</p>
                    </div>

                    <div className="text-center flex-1">
                      <div className="h-7 flex items-center justify-center">
                        {u.isEmailVerified ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                {/* EDIT */}
                {canEditUsers && (
                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                )}

                {/* DELETE */}
                {canDeleteUsers && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id || u.id === user?.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      u.id === user?.id
                        ? 'You cannot delete yourself'
                        : 'Delete customer'
                    }
                  >
                    {deletingId === u.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}