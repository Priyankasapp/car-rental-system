// app/(admin)/users/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
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
  X
} from 'lucide-react'

// User Role Badge Component
const UserRoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    SUPERADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
    STAFF: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    CUSTOMER: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const labels: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    ADMIN: 'Admin',
    STAFF: 'Staff',
    CUSTOMER: 'Customer',
  }

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${styles[role] || styles.CUSTOMER}`}>
      {labels[role] || role}
    </span>
  )
}

// User Status Badge Component
const UserStatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${
      isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {isActive ? (
        <CheckCircle className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { users, isLoading, error, fetchUsers, deleteUser } = useAdmin()
  const hasInitialized = useRef(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Check admin access and fetch users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!authLoading && user && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      router.push('/fleet')
      return
    }

    if (user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN') && !hasInitialized.current) {
      hasInitialized.current = true
      fetchUsers()
    }
  }, [user, authLoading, router, fetchUsers])

  // Handle delete user
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteUser(id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    return (
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check admin access
  if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all registered customers
          </p>
        </div>
      </div>

      {/* ===== ERROR MESSAGE ===== */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ===== FILTERS ===== */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* ===== USERS GRID ===== */}
      {filteredUsers.length === 0 && !isLoading && !error ? (
        /* Empty State */
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm ? 'Try adjusting your search query' : 'No registered users available.'}
          </p>
        </div>
      ) : (
        /* Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* User Header */}
              <div className="p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-lg">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
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

              {/* User Details */}
              <div className="p-4 space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{u.email}</span>
                </div>

                {/* Phone */}
                {u.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{u.phone}</span>
                  </div>
                )}

                {/* Joined Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <div className="text-center flex-1">
                    <p className="text-lg font-semibold text-gray-900">{u._count?.reservations || 0}</p>
                    <p className="text-xs text-gray-500">Bookings</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-semibold text-gray-900">{u._count?.sessions || 0}</p>
                    <p className="text-xs text-gray-500">Sessions</p>
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

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={deletingId === u.id || u.id === user.id} // Can't delete yourself
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={u.id === user.id ? "You cannot delete yourself" : "Delete user"}
                >
                  {deletingId === u.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}