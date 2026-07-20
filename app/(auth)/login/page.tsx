/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { OTPVerification } from '@/components/auth/OTPVerification'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, verifyOTP, resendOTP } = useAuth()
  
  // Check if redirected from reset password
  const resetSuccess = searchParams.get('reset') === 'success'
  
  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(resetSuccess ? 'Password reset successfully! Please login.' : '')

  //  Login with email + password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const result = await login(email, password)
      
      //  Check if OTP is required
      if (result.requiresOTP) {
        setMessage(' Please enter the OTP sent to your email.')
        setStep('otp')
      } else {
        // No OTP required - logged in directly
        setMessage('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/fleet')
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  //  Verify OTP
  const handleVerifyOTP = async (otp: string) => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await verifyOTP(email, otp, 'LOGIN')
      setMessage(' Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/fleet')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  //  Resend OTP
  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resendOTP(email, 'LOGIN')
      setMessage(' New OTP sent successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Back to login
  const handleBack = () => {
    setStep('login')
    setError('')
    setMessage('')
  }

  const isSubmitting = loading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 'login' ? 'Sign in to your account' : 'Verify OTP'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'login' ? (
                <>
                  Or{' '}
                  <Link href="/register" className="font-medium text-gray-900 hover:text-gray-600 underline">
                    create a new account
                  </Link>
                </>
              ) : (
                'Enter the 6-digit code sent to your email'
              )}
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          {/* ========== STEP 1: LOGIN FORM ========== */}
          {step === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end mt-1">
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-gray-500 hover:text-gray-700 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full py-3 rounded-lg font-medium text-white transition',
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800 active:scale-[0.98]'
                )}
              >
                {isSubmitting ? 'Logging in...' : 'Sign in'}
              </button>

              {/* Footer Links */}
              <div className="text-center space-y-2">
                <Link 
                  href="/register" 
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition"
                >
                  Don&apos;t have an account? Sign up
                </Link>
                <br />
                <Link 
                  href="/" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Back to home
                </Link>
              </div>
            </form>
          )}

          {/* ==========  OTP VERIFICATION ========== */}
          {step === 'otp' && (
            <OTPVerification
              email={email}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              onBack={handleBack}
              purpose="LOGIN"
              expiryMinutes={5}
              className="mt-4"
            />
          )}

        </div>
      </div>
    </div>
  )
}