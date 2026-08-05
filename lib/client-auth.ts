'use Client'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN'|'SUPERADMIN'
  phone?: string
  isEmailVerified?: boolean
  isActive?: boolean
  profilePicture?: string
  permissions: string[]
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try{
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if(!res.ok)return null

    const data = await res.json()

    if(data.success && data.data?.user){
      const user = data.data.user

      return{
        ...user,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      }
    }
    return null

  }catch(err){
    console.error('Error fetching current user:', err);
    return null
  }
}

export async function logoutCurrentUser(): Promise<void>{
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}