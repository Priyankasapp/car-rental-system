// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RegistrationForm } from '@/components/auth/RegistrationForm'
import { OTPVerification } from '@/components/auth/OTPVerification'

export default function RegisterPage() {
  const router = useRouter()
  const { verifyOTP } = useAuth()
  
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (formData: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }) => {
    setError('')
    setMessage('')

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Registration failed')
    }

    // Store email for OTP verification
    setEmail(formData.email)
    setMessage('📧 Check your email for password and OTP!')
    setStep('otp')
  }

  const handleVerifyOTP = async (otp: string) => {
    await verifyOTP(email, otp, 'REGISTER')
    
    // Success - redirect to login
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }

  const handleResendOTP = async () => {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'REGISTER' }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Failed to resend OTP')
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

          {/* Step 1: Registration Form */}
          {step === 'form' && (
            <RegistrationForm
              onSubmit={handleRegister}
              error={error}
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