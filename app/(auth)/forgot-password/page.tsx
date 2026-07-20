/* eslint-disable react-hooks/static-components */
// app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { OTPVerification } from '@/components/auth/OTPVerification'

type ErrorWithMessage = {
  message: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword, resetPassword, isLoading: authLoading } = useAuth()
  
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  //  State for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setMessage('Password reset OTP sent to your email.')
      setStep('otp')
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otpCode: string) => {
    setError('')
    setMessage('')
    setOtp(otpCode)
    setStep('reset')
  }

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
      
      setMessage('Password reset successfully! Redirecting to login...')
      
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

  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await forgotPassword(email)
      setMessage('New OTP sent successfully!')
    } catch (err) {
      const error = err as ErrorWithMessage
      setError(error.message || 'Failed to resend OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('email')
    setError('')
    setMessage('')
    setOtp('')
  }

  const isSubmitting = loading || authLoading

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
                  We will send a password reset OTP to this email.
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
                  Back to login
                </Link>
                <br />
                <Link 
                  href="/register" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Do not have an account? Sign up
                </Link>
              </div>
            </form>
          )}

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

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {email}
                </div>
              </div>

              {/*  New Password with Eye Icon */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showNewPassword} />  
                  </button>
                </div>
                <ul className="mt-1 text-xs text-gray-500 space-y-0.5">
                  <li className={cn(
                    newPassword.length >= 8 ? 'text-green-600' : ''
                  )}>
                    At least 8 characters
                  </li>
                  <li className={cn(
                    /[A-Z]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    At least one uppercase letter
                  </li>
                  <li className={cn(
                    /[a-z]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    At least one lowercase letter
                  </li>
                  <li className={cn(
                    /[0-9]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    At least one number
                  </li>
                  <li className={cn(
                    /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''
                  )}>
                    At least one special character
                  </li>
                </ul>
              </div>

              {/*Confirm Password with Eye Icon */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      'w-full px-4 py-2 pr-10 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed',
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    )}
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    tabIndex={-1}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
              </div>

              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg text-sm">
                  Passwords match
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
                  Change email or resend OTP
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}