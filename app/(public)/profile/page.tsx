'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Loader2, User, Mail, Phone, Calendar, Save, ArrowLeft } from 'lucide-react'

interface ProfileUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  isEmailVerified: boolean
  profilePicture: string | null
  createdAt: string
  _count?: { reservations: number }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, updateUser, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      router.push('/login?redirect=/profile')
      return
    }

    fetch('/api/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user as ProfileUser
          setProfile(u)
          setFirstName(u.firstName)
          setLastName(u.lastName)
          setPhone(u.phone || '')
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [authUser, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')

      setProfile(data.data.user)
      updateUser(data.data.user)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage(data.message)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  const isStaffOrAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPERADMIN' || profile?.role === 'STAFF'

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black">My Profile</h1>
        <p className="text-gray-500 mt-2">Update your personal details and password</p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
            {profile?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" />
            {profile?.isEmailVerified ? 'Verified' : 'Not verified'}
          </div>
          {profile?._count && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              {profile._count.reservations} booking{profile._count.reservations !== 1 ? 's' : ''}
            </div>
          )}
          {isStaffOrAdmin && (
            <Link href="/admin/profile" className="text-sm font-medium text-black underline">
              Open admin profile →
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-base font-semibold">Change Password</h3>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
