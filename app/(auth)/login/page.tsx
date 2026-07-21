/* eslint-disable react-hooks/static-components */
 
// app/(auth)/login/page.tsx
'use client'

import { useState} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { OTPVerification } from '@/components/auth/OTPVerification'

//  Define error type
type ErrorWithMessage = {
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, verifyOTP, resendOTP } = useAuth()
  
  // Check if redirected from reset password
  const resetSuccess = searchParams.get('reset') === 'success'
  
  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)  
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(resetSuccess ? 'Password reset successfully! Please login.' : '')

  //  Handle Login with redirect URL
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const result = await login(email, password)
      
      // ✅ Check if OTP is required
      if (result.requiresOTP) {
        setMessage('📧 Please enter the OTP sent to your email.')
        setStep('otp')
      } else {
        // ✅ Use redirectUrl from API response
        const redirectUrl = result.redirectUrl || '/'
        setMessage('Login successful! Redirecting...')
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1000)
      }
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Login failed')
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
        router.push('/')
      }, 1000)
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Invalid OTP')
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
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to resend OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  //  Back to login
  const handleBack = () => {
    setStep('login')
    setError('')
    setMessage('')
  }

  const isSubmitting = loading

  //  Eye icon component
  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      {show ? (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </>
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </>
      )}
    </svg>
  )

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

              {/* Password with Eye Icon */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
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

          {/* ========== OTP VERIFICATION ========== */}
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