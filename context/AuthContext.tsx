// context/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Types
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'
  phone?: string
  isEmailVerified: boolean
  isActive: boolean
  profilePicture?: string
}

interface AuthContextType {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  verifyOTP: (email: string, otp: string, purpose: 'LOGIN' | 'REGISTER') => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (user: User) => void
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.user) {
          setUser(data.data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login - send email + password, get OTP
  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Login failed')
    }
  }, [])

  // Verify OTP
  const verifyOTP = useCallback(async (email: string, otp: string, purpose: 'LOGIN' | 'REGISTER') => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose }),
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Verification failed')
    }
    
    const data = await response.json()
    if (data.success && data.data.user) {
      setUser(data.data.user)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }, [])

  // Update user
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  // Check auth on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth()
  }, [checkAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyOTP,
    logout,
    checkAuth,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}