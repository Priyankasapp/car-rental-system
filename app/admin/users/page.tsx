// app/(admin)/users/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import { useAuth } from '@/context/AuthContext'
import { 
  Plus, 
  Users, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'

//  User Role Badge Component
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

//  User Status Badge Component
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
  const [filterRole, setFilterRole] = useState('')

  //  Check admin access and fetch users
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
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === '' || u.role === filterRole
    
    return matchesSearch && matchesRole
  })

  //  Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  //  Check admin access
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
            Manage all registered users
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Link>
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
        <div className="relative min-w-45">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none bg-white text-sm"
          >
            <option value="">All Roles</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="CUSTOMER">Customer</option>
          </select>
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
            {searchTerm || filterRole ? 'Try adjusting your filters' : 'Add your first user'}
          </p>
          {!searchTerm && !filterRole && (
            <Link
              href="/admin/users/new"
              className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add User
            </Link>
          )}
        </div>
      ) : (
        /* Users Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* User Header */}
              <div className="p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <UserRoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>
                  <UserStatusBadge isActive={user.isActive} />
                </div>
              </div>

              {/* User Details */}
              <div className="p-4 space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}

                {/* Joined Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{user._count?.reservations || 0}</p>
                    <p className="text-xs text-gray-500">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{user._count?.sessions || 0}</p>
                    <p className="text-xs text-gray-500">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {user.isEmailVerified ? '✅' : '❌'}
                    </p>
                    <p className="text-xs text-gray-500">Verified</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id || user.id === user.id} // Can't delete yourself
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={user.id === user.id ? "You cannot delete yourself" : "Delete user"}
                >
                  {deletingId === user.id ? (
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