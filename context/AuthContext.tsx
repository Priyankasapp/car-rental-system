/* eslint-disable @typescript-eslint/no-explicit-any */
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

// ✅ Define OTPPurpose type for reusability
type OTPPurpose = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | '2FA'

interface AuthContextType {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<{ requiresOTP: boolean; email: string }>
  verifyOTP: (email: string, otp: string, purpose: OTPPurpose) => Promise<void>  // Using type
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; email: string }>
  resendOTP: (email: string, purpose: OTPPurpose) => Promise<any>  //  Using type
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (user: User) => void
}

interface RegisterData {
  email: string
  firstName: string
  lastName: string
  phone?: string
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
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }
    
    // Return login response which includes OTP requirement
    return {
      requiresOTP: data.data.requiresOTP || false,
      email: data.data.email || email,
    }
  }, [])

  // ✅ Fixed: Verify OTP with correct purpose type
  const verifyOTP = useCallback(async (
    email: string, 
    otp: string, 
    purpose: OTPPurpose  // ✅ Changed from 'LOGIN' | 'REGISTER'
  ) => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // ✅ Better error handling
      if (data.canResend) {
        throw new Error(`${data.message} Please request a new OTP.`)
      }
      throw new Error(data.message || 'Verification failed')
    }
    
    if (data.success && data.data.user) {
      setUser(data.data.user)
    }
  }, [])

  // Register new user
  const register = useCallback(async (userData: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }
    
    return {
      success: data.success,
      message: data.message,
      email: data.data.email,
    }
  }, [])

  // ✅ Fixed: Resend OTP with correct purpose type
  const resendOTP = useCallback(async (
    email: string, 
    purpose: OTPPurpose  // ✅ Changed from 'LOGIN' | 'REGISTER'
  ) => {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // ✅ Handle cooldown error (429)
      if (response.status === 429 && data.data?.remainingSeconds) {
        throw new Error(`${data.message} (${data.data.remainingSeconds}s remaining)`)
      }
      throw new Error(data.message || 'Failed to resend OTP')
    }
    
    return data  // ✅ Return data for frontend
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setUser(null)
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if API fails
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
    register,
    resendOTP,
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