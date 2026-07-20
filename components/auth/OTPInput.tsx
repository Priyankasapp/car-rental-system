// components/auth/OTPInput.tsx
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

  // Split value into array of characters
  const digits = value.padEnd(length, ' ').split('').slice(0, length)

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  //  Handle individual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value
    
    // Sirf 1 character allow karo
    if (newValue.length > 1) return
    
    // Sirf digits allow karo
    if (newValue.length > 0 && !/^[0-9]$/.test(newValue)) return
    
    // Update value at specific index
    const updatedValue = value.split('')
    updatedValue[index] = newValue
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
      
      // If current input has value, clear it
      if (value[index]) {
        const newValue = value.slice(0, index) + value.slice(index + 1)
        onChange(newValue)
        return
      }
      
      // If current input is empty, move to previous
      if (index > 0) {
        setActiveInput(index - 1)
        inputRefs.current[index - 1]?.focus()
        // Clear previous input
        const newValue = value.slice(0, index - 1) + value.slice(index)
        onChange(newValue)
      }
      return
    }

    // Handle arrow keys
    if (key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) {
        setActiveInput(index - 1)
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (key === 'ArrowRight') {
      e.preventDefault()
      if (index < length - 1) {
        setActiveInput(index + 1)
        inputRefs.current[index + 1]?.focus()
      }
      return
    }

    // Handle delete key
    if (key === 'Delete') {
      e.preventDefault()
      if (value[index]) {
        const newValue = value.slice(0, index) + value.slice(index + 1)
        onChange(newValue)
      }
      return
    }

    // For digit keys, let onChange handle it
    // But prevent default to avoid double input
    if (/^[0-9]$/.test(key)) {
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (digits.length > 0) {
      const newValue = digits.padEnd(length, ' ')
      onChange(newValue.slice(0, length))
      
      // Focus last filled input
      const focusIndex = Math.min(digits.length, length - 1)
      setActiveInput(focusIndex)
      inputRefs.current[focusIndex]?.focus()
      
      // Trigger onComplete if all digits filled
      if (digits.length === length) {
        onComplete?.(digits.slice(0, length))
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
          value={digits[index] === ' ' ? '' : digits[index]}
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
            value[index] && 'border-green-500',
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}