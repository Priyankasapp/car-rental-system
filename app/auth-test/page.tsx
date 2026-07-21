// app/auth-test/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AuthTestPage() {
  const { user, isLoading, isAuthenticated, login, verifyOTP, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(email)
      setMessage('OTP sent! Check terminal or database')
      setStep('otp')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await verifyOTP(email, otp, 'LOGIN')
      setMessage(' Login successful!')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      {/* Status */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p><strong>Status:</strong> {isAuthenticated ? ' Logged In' : ' Not Logged In'}</p>
        {user && (
          <>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </>
        )}
      </div>

      {isAuthenticated ? (
        <button
          onClick={logout}
          className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      ) : (
        <>
          {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">{message}</div>}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <p className="text-sm text-gray-600 mb-2">OTP sent to: {email}</p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full mt-2 text-sm text-blue-600 hover:underline"
              >
                Change Email
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}