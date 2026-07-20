// app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { OTPVerification } from '@/components/auth/OTPVerification'

// ✅ Define error type
type ErrorWithMessage = {
  message: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword, verifyOTP, resetPassword, isLoading: authLoading } = useAuth()
  
  // State
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // ✅ Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setMessage(' Password reset OTP sent to your email.')
      setStep('otp')
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // ✅Step 2: Verify OTP
  const handleVerifyOTP = async (otpCode: string) => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await verifyOTP(email, otpCode, 'PASSWORD_RESET')
      setOtp(otpCode)
      setMessage('✅ OTP verified! Please set a new password.')
      setStep('reset')
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Invalid OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      })
      
      setMessage('✅ Password reset successfully! Redirecting to login...')
      
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setMessage('📧 New OTP sent successfully!')
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to resend OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ Back to email step
  const handleBack = () => {
    setStep('email')
    setError('')
    setMessage('')
    setOtp('')
  }

  const isSubmitting = loading || authLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'Set New Password'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'email' && 'Enter your email to receive a password reset OTP'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'reset' && 'Enter your new password (min 8 characters)'}
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

          {/* ========== STEP 1: EMAIL FORM ========== */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  We&apos;ll send a password reset OTP to this email.
                </p>
              </div>

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
                {isSubmitting ? 'Sending...' : 'Send Reset OTP'}
              </button>

              <div className="text-center space-y-2">
                <Link 
                  href="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition"
                >
                  ← Back to login
                </Link>
                <br />
                <Link 
                  href="/register" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Don&apos;t have an account? Sign up
                </Link>
              </div>
            </form>
          )}

          {/* ========== STEP 2: OTP VERIFICATION ========== */}
          {step === 'otp' && (
            <OTPVerification
              email={email}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              onBack={handleBack}
              purpose="PASSWORD_RESET"
              expiryMinutes={10}
              className="mt-4"
            />
          )}

          {/* ========== STEP 3: RESET PASSWORD FORM ========== */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {email}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                />
                <ul className="mt-1 text-xs text-gray-500 space-y-0.5">
                  <li className={cn(
                    newPassword.length >= 8 ? 'text-green-600' : ''
                  )}>
                    • At least 8 characters
                  </li>
                  <li className={cn(
                    /[A-Z]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    • At least one uppercase letter
                  </li>
                  <li className={cn(
                    /[a-z]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    • At least one lowercase letter
                  </li>
                  <li className={cn(
                    /[0-9]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    • At least one number
                  </li>
                  <li className={cn(
                    /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    • At least one special character
                  </li>
                </ul>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed',
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  )}
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg text-sm">
                  ✅ Passwords match!
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className={cn(
                  'w-full py-3 rounded-lg font-medium text-white transition',
                  isSubmitting || !newPassword || !confirmPassword || newPassword !== confirmPassword
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 active:scale-[0.98]'
                )}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition"
                >
                  ← Change email or resend OTP
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}