'use client'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN' | 'STAFF'
  phone?: string | null
  isEmailVerified?: boolean
  isActive?: boolean
  profilePicture?: string | null
  permissions?: string[]
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/auth/me', { credentials: 'include' })
  if (!response.ok) return null

  const data = await response.json()
  return data.success && data.data?.user ? data.data.user : null
}

export async function logoutCurrentUser(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}
