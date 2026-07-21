/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { RegistrationForm } from '@/components/auth/RegistrationForm'
import { OTPVerification } from '@/components/auth/OTPVerification'

export default function RegisterPage() {
  const router = useRouter()
  const { verifyOTP, resendOTP } = useAuth()
  
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (formData: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }) => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        if (response.status === 409) {
          setError('This email is already registered. Please login instead.')
          return
        }
        throw new Error(data.message || 'Registration failed')
      }

      setEmail(formData.email)
      setMessage(' Check your email for password and OTP!')
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await verifyOTP(email, otp, 'REGISTER')
      setMessage(' Email verified! Account active.')
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await resendOTP(email, 'REGISTER')
      setMessage(' New OTP sent successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('form')
    setError('')
    setMessage('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 'form' ? 'Create your account' : 'Verify OTP'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'form' 
                ? 'Join UrbanDrive today' 
                : 'Enter the 6-digit code sent to your email'}
            </p>
          </div>

          {/*  Only ONE error display - HERE */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">
                {error}
              </p>
              {/* {error.toLowerCase().includes('already registered') && (
                <Link 
                  href="/login" 
                  className="inline-block mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Go to Login →
                </Link>
              )} */}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 'form' && (
            <RegistrationForm
              onSubmit={handleRegister}
              // Don't pass error to child
              message={message}
            />
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <OTPVerification
              email={email}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              onBack={handleBack}
              purpose="REGISTER"
              expiryMinutes={5}
            />
          )}

        </div>
      </div>
    </div>
  )
}