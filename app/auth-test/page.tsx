// app/auth-test/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AuthTestPage() {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    verifyOTP,
    logout,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Login and send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      // login requires email and password
      await login(email, password)

      setMessage('OTP sent! Check your email.')
      setStep('otp')
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to login or send OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      await verifyOTP(email, otp, 'LOGIN')

      setMessage('Login successful!')
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6">
          Auth Test
        </h1>

        {/* Authentication Status */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p>
            <strong>Status:</strong>{' '}
            {isAuthenticated
              ? 'Logged In'
              : 'Not Logged In'}
          </p>

          {user && (
            <div className="mt-3 space-y-1">
              <p>
                <strong>Name:</strong>{' '}
                {user.firstName} {user.lastName}
              </p>

              <p>
                <strong>Email:</strong>{' '}
                {user.email}
              </p>

              <p>
                <strong>Role:</strong>{' '}
                {user.role}
              </p>
            </div>
          )}
        </div>

        {isAuthenticated ? (

          // Logged-in state
          <button
            onClick={logout}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>

        ) : (

          // Not logged-in state
          <>

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                {message}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {step === 'email' ? (

              // Step 1: Email + Password
              <form onSubmit={handleSendOTP}>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? 'Sending OTP...'
                    : 'Login & Send OTP'}
                </button>

              </form>

            ) : (

              // Step 2: OTP
              <form onSubmit={handleVerifyOTP}>

                <p className="text-sm text-gray-600 mb-3">
                  OTP sent to: {email}
                </p>

                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading
                    ? 'Verifying...'
                    : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                    setMessage('')
                  }}
                  className="w-full mt-3 text-sm text-blue-600 hover:underline"
                >
                  Change Email
                </button>

              </form>

            )}

          </>

        )}

      </div>
    </div>
  )
}