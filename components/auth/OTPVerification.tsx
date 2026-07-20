/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/auth/OTPVerification.tsx
'use client'

import { useState, useEffect } from 'react'
import { OTPInput } from './OTPInput'
import { cn } from '@/lib/utils'

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResend?: () => Promise<void>
  onBack?: () => void
  purpose?: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'
  expiryMinutes?: number
  className?: string
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  onBack,
  purpose = 'REGISTER',
  expiryMinutes = 5,
  className,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(expiryMinutes * 60)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await onVerify(otp)
      setMessage(' Verification successful!')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!onResend || loading) return
    
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await onResend()
      setMessage(' New OTP sent successfully!')
      setTimeLeft(expiryMinutes * 60)
      setCanResend(false)
      setOtp('')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">Verify OTP</h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter the 6-digit code sent to <br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={() => {
              // Auto-submit when all digits filled
              if (otp.length === 6) {
                handleVerify(new Event('submit') as any)
              }
            }}
            disabled={loading}
          />

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                 OTP expires in{' '}
                <span className="font-mono font-semibold text-gray-700">
                  {formatTime(timeLeft)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium">
                 OTP has expired
              </p>
            )}
          </div>
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={cn(
            'w-full py-3 rounded-lg font-medium text-white transition',
            loading || otp.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 active:scale-[0.98]'
          )}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        {/* Actions */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || !canResend}
            className={cn(
              'text-sm transition',
              canResend && !loading
                ? 'text-gray-900 hover:text-gray-600 underline cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            )}
          >
            {canResend ? 'Resend OTP' : `Resend OTP (${formatTime(timeLeft)})`}
          </button>

          {onBack && (
            <>
              <br />
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ← Change email
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}