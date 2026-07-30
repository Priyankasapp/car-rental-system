/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { LucideIcon } from 'lucide-react'
import { useState } from 'react'

interface FormSectionProps {
  icon: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function FormSection({ 
  icon: Icon, 
  title, 
  description, 
  children,
  collapsible = false,
  defaultCollapsed = false
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-black/5">
      <div 
        className={`px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/60 ${
          collapsible ? 'cursor-pointer select-none' : ''
        }`}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-xl transition-transform duration-300 group-hover:scale-110">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h2>
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {collapsible && (
            <button
              type="button"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation()
                setIsCollapsed(!isCollapsed)
              }}
            >
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          collapsible && isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[9999px] opacity-100'
        }`}
      >
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string
  icon?: LucideIcon
  required?: boolean
  isSelect?: boolean
  isTextarea?: boolean
  error?: string
  helper?: string
  children?: React.ReactNode
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export function InputField({ 
  label, 
  icon: Icon, 
  required, 
  isSelect, 
  isTextarea,
  error,
  helper,
  children,
  leftElement,
  rightElement,
  className = '',
  ...props 
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const baseStyles = `
    w-full px-4 py-2.5 
    bg-gray-50/50 
    border 
    rounded-xl 
    text-sm text-gray-900 
    outline-none 
    transition-all duration-200 
    placeholder:text-gray-400
    ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-black/10 focus:border-black'}
    ${isFocused ? 'bg-white' : 'hover:bg-white hover:border-gray-300'}
    ${leftElement ? 'pl-10' : ''}
    ${rightElement ? 'pr-10' : ''}
    ${className}
  `

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setIsFocused(true)
    if (props.onFocus) props.onFocus(e as any)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setIsFocused(false)
    if (props.onBlur) props.onBlur(e as any)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0)
    if (props.onChange) props.onChange(e as any)
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      
      <div className="relative">
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftElement}
          </div>
        )}

        {isSelect ? (
          <select 
            className={baseStyles} 
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            {children}
          </select>
        ) : isTextarea ? (
          <textarea
            className={`${baseStyles} min-h-25 resize-y`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        ) : (
          <input
            className={baseStyles}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        )}

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightElement}
          </div>
        )}

        {/* Focus indicator ring */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-black/10 pointer-events-none" />
        )}
      </div>

      {helper && !error && (
        <p className="text-xs text-gray-500 mt-1">{helper}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// Additional utility components

interface FormActionsProps {
  onCancel?: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}

export function FormActions({ 
  onCancel, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = 'Save & Publish',
  cancelLabel = 'Cancel',
  showCancel = true
}: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-black/30"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {submitLabel}
          </>
        )}
      </button>
    </div>
  )
}

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'archived' | 'pending'
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    draft: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Draft',
      className: 'bg-gray-100 text-gray-600'
    },
    published: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Published',
      className: 'bg-green-100 text-green-700'
    },
    archived: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      label: 'Archived',
      className: 'bg-gray-100 text-gray-600'
    },
    pending: {
      icon: (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.className} ${className}`}>
      {config.icon}
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  badge?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2.5 bg-black rounded-2xl">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}