'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Bell, Mail, Smartphone, ArrowLeft } from 'lucide-react'

interface NotificationPrefs {
  email: boolean
  push: boolean
  sms: boolean
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [prefs, setPrefs] = useState<NotificationPrefs>({ email: true, push: true, sms: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    fetch('/api/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user?.preferences?.notifications) {
          setPrefs({ ...prefs, ...data.data.user.preferences.notifications })
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: { notifications: prefs } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save settings')
      setMessage('Settings saved successfully')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const toggles = [
    { key: 'email' as const, label: 'Email notifications', desc: 'Booking updates and admin alerts', icon: Mail },
    { key: 'push' as const, label: 'Push notifications', desc: 'In-browser alerts for urgent items', icon: Bell },
    { key: 'sms' as const, label: 'SMS notifications', desc: 'Text messages for critical updates', icon: Smartphone },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your notification preferences</p>
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

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {toggles.map(({ key, label, desc, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900" />
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
