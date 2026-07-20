'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
}: OTPInputProps) {
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Normalize string value down to actual entered characters to prevent padding bugs
  const rawDigits = value.replace(/\s/g, '').split('')

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Handle individual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.trim()
    
    // Only allow digits
    if (newValue.length > 0 && !/^[0-9]$/.test(newValue)) return
    
    const updatedValue = [...rawDigits]
    updatedValue[index] = newValue
    
    // Clean up empty slots trailing down the line
    const updatedString = updatedValue.join('')
    onChange(updatedString)
    
    // Auto-advance to next input if digit entered
    if (newValue.length === 1 && index < length - 1) {
      setActiveInput(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
    
    // Trigger onComplete when all digits filled
    if (updatedString.length === length) {
      onComplete?.(updatedString)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const { key } = e

    // Handle backspace
    if (key === 'Backspace') {
      e.preventDefault()
      
      const updatedValue = [...rawDigits]
      
      if (rawDigits[index]) {
        // If current slot has a digit, clear it
        updatedValue[index] = ''
        onChange(updatedValue.join(''))
      } else if (index > 0) {
        // If empty, shift focus back and clear previous slot
        setActiveInput(index - 1)
        inputRefs.current[index - 1]?.focus()
        updatedValue[index - 1] = ''
        onChange(updatedValue.join(''))
      }
      return
    }

    // Handle arrow keys
    if (key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      setActiveInput(index - 1)
      inputRefs.current[index - 1]?.focus()
      return
    }

    if (key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      setActiveInput(index + 1)
      inputRefs.current[index + 1]?.focus()
      return
    }

    // Handle delete key
    if (key === 'Delete') {
      e.preventDefault()
      const updatedValue = [...rawDigits]
      updatedValue[index] = ''
      onChange(updatedValue.join(''))
      return
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (digitsOnly.length > 0) {
      onChange(digitsOnly)
      
      // Focus last filled input
      const focusIndex = Math.min(digitsOnly.length, length - 1)
      setActiveInput(focusIndex)
      inputRefs.current[focusIndex]?.focus()
      
      if (digitsOnly.length === length) {
        onComplete?.(digitsOnly)
      }
    }
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          value={rawDigits[index] || ''}
          onChange={(e) => handleInputChange(e, index)}
          onFocus={() => setActiveInput(index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-xl font-semibold',
            'border-2 rounded-lg transition-all duration-200',
            'bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
            activeInput === index && 'border-black ring-2 ring-black ring-opacity-20',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            rawDigits[index] && 'border-green-500',
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}