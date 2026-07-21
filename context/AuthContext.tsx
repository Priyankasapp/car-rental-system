/* eslint-disable @typescript-eslint/no-explicit-any */
// context/AuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

// Types
export interface User {
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

// Updated OTPPurpose to match database
export type OTPPurpose = 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'

// Response Types
interface LoginResponse {
  requiresOTP: boolean
  email: string
}

interface RegisterResponse {
  success: boolean
  message: string
  email: string
}

interface VerifyOTPResponse {
  success: boolean
  message: string
  data?: {
    user?: User
    verified?: boolean
    email?: string
    redirectTo?: string
  }
}

interface ResendOTPResponse {
  success: boolean
  message: string
  data?: {
    remainingSeconds?: number
    expiresIn?: number
    purpose?: string
  }
}

interface RegisterData {
  email: string
  firstName: string
  lastName: string
  phone?: string
}

interface ResetPasswordData {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

//Forgot Password Response
interface ForgotPasswordResponse {
  success: boolean
  message: string
  data?: {
    email: string
    expiresIn: number
    purpose: string
  }
}

// Auth Context Type
interface AuthContextType {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<LoginResponse>
  verifyOTP: (email: string, otp: string, purpose: OTPPurpose, newPassword?: string) => Promise<VerifyOTPResponse>
  register: (userData: RegisterData) => Promise<RegisterResponse>
  resendOTP: (email: string, purpose: OTPPurpose) => Promise<ResendOTPResponse>
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (user: User) => void
  clearError: () => void
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
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

  // Login
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    setError(null)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      // If user is already logged in (no OTP required), set user
      if (!data.data?.requiresOTP && data.data?.user) {
        setUser(data.data.user)
      }
      
      return {
        requiresOTP: data.data?.requiresOTP || false,
        email: data.data?.email || email,
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  // Updated: Verify OTP with all purposes
  const verifyOTP = useCallback(async (
    email: string, 
    otp: string, 
    purpose: OTPPurpose,
    newPassword?: string
  ): Promise<VerifyOTPResponse> => {
    setError(null)
    
    try {
      const requestBody: any = { email, otp, purpose }
      
      //  Only include newPassword for PASSWORD_RESET
      if (purpose === 'PASSWORD_RESET' && newPassword) {
        requestBody.newPassword = newPassword
      }
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('Too many attempts. Please request a new OTP.')
        }
        if (data.canResend) {
          throw new Error(`${data.message} Please request a new OTP.`)
        }
        throw new Error(data.message || 'Verification failed')
      }
      
      //  If LOGIN, set user data
      if (purpose === 'LOGIN' && data.data?.user) {
        setUser(data.data.user)
      }
      
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  // Register
  const register = useCallback(async (userData: RegisterData): Promise<RegisterResponse> => {
    setError(null)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      
      return {
        success: data.success,
        message: data.message,
        email: data.data?.email || userData.email,
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  // Updated: Resend OTP with cooldown handling
  const resendOTP = useCallback(async (email: string, purpose: OTPPurpose): Promise<ResendOTPResponse> => {
    setError(null)
    
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        //  Handle cooldown error (429)
        if (response.status === 429 && data.data?.remainingSeconds) {
          throw new Error(`${data.message} (${data.data.remainingSeconds}s remaining)`)
        }
        throw new Error(data.message || 'Failed to resend OTP')
      }
      
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  //  New: Forgot Password
  const forgotPassword = useCallback(async (email: string): Promise<ForgotPasswordResponse> => {
    setError(null)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        //  Handle cooldown
        if (response.status === 429 && data.data?.remainingSeconds) {
          throw new Error(`${data.message} (${data.data.remainingSeconds}s remaining)`)
        }
        throw new Error(data.message || 'Failed to send reset OTP')
      }
      
      return {
        success: data.success,
        message: data.message,
        data: data.data,
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [])

  //  FIXED: resetPassword function - Simple validation
  const resetPassword = useCallback(async (resetData: ResetPasswordData) => {
    setError(null)
    
    // Validate passwords match
    if (resetData.newPassword !== resetData.confirmPassword) {
      const error = new Error('Passwords do not match')
      setError(error.message)
      throw error
    }
    
    // Validate password length
    if (resetData.newPassword.length < 8) {
      const error = new Error('Password must be at least 8 characters')
      setError(error.message)
      throw error
    }
    
    //  Check each requirement individually (allow ALL special characters)
    const hasUpperCase = /[A-Z]/.test(resetData.newPassword)
    const hasLowerCase = /[a-z]/.test(resetData.newPassword)
    const hasNumber = /[0-9]/.test(resetData.newPassword)
    const hasSpecial = /[^A-Za-z0-9]/.test(resetData.newPassword)
    
    //  Build specific error message
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      let errorMsg = 'Password must contain:'
      if (!hasUpperCase) errorMsg += ' uppercase,'
      if (!hasLowerCase) errorMsg += ' lowercase,'
      if (!hasNumber) errorMsg += ' number,'
      if (!hasSpecial) errorMsg += ' special character'
      errorMsg = errorMsg.replace(/,$/, '')
      
      const error = new Error(errorMsg)
      setError(error.message)
      throw error
    }
    
    try {
      //  Use verifyOTP with PASSWORD_RESET purpose
      const result = await verifyOTP(
        resetData.email, 
        resetData.otp, 
        'PASSWORD_RESET', 
        resetData.newPassword
      )
      
      return {
        success: true,
        message: result.message || 'Password reset successfully',
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }, [verifyOTP])

  // Logout
  const logout = useCallback(async () => {
    setError(null)
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      // Always clear user state
      setUser(null)
      
      if (!response.ok) {
        console.warn('Logout API failed, but user state cleared')
      }
    } catch (error) {
      console.error('Logout error:', error)
      //  Still clear user state even if API fails
      setUser(null)
    }
  }, [])

  // Update user
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  //  Memoized value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    verifyOTP,
    register,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    checkAuth,
    updateUser,
    clearError,
  }), [
    user,
    isLoading,
    error,
    login,
    verifyOTP,
    register,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    checkAuth,
    updateUser,
    clearError,
  ])

  // Check auth on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth()
  }, [checkAuth])

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