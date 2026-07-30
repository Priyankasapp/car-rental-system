/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { XIcon, Loader2 } from 'lucide-react'
import { EntityItem } from './EntityCard'

// Theme presets
export const COLOR_THEMES = [
  { label: 'Sky', color: 'bg-sky-400', circleBg: 'bg-sky-100', textColor: 'text-sky-700', borderColor: 'border-sky-200' },
  { label: 'Emerald', color: 'bg-emerald-400', circleBg: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { label: 'Purple', color: 'bg-purple-400', circleBg: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  { label: 'Rose', color: 'bg-rose-400', circleBg: 'bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  { label: 'Amber', color: 'bg-amber-400', circleBg: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { label: 'Teal', color: 'bg-teal-400', circleBg: 'bg-teal-100', textColor: 'text-teal-700', borderColor: 'border-teal-200' },
  { label: 'Indigo', color: 'bg-indigo-400', circleBg: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
]

export interface EntityModalProps {
  isOpen: boolean
  entityName: string
  initialData?: EntityItem | null
  onClose: () => void
  onSave: (data: Omit<EntityItem, 'id'> & { id?: string }) => Promise<void> | void
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  entityName,
  initialData,
  onClose,
  onSave
}) => {
  // Prevent body scrolling when modal is active & enable Escape key listener
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const key = initialData ? initialData.id : 'new'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-200">
      <EntityModalForm
        key={key}
        entityName={entityName}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  )
}

interface EntityModalFormProps {
  entityName: string
  initialData?: EntityItem | null
  onClose: () => void
  onSave: (data: Omit<EntityItem, 'id'> & { id?: string }) => Promise<void> | void
}

const EntityModalForm: React.FC<EntityModalFormProps> = ({
  entityName,
  initialData,
  onClose,
  onSave
}) => {
  const isEditMode = Boolean(initialData)

  const initialThemeIndex = initialData
    ? COLOR_THEMES.findIndex(t => t.color === initialData.color)
    : 0

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: (initialData?.status || 'Active') as 'Active' | 'Inactive',
    themeIndex: initialThemeIndex >= 0 ? initialThemeIndex : 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    const { color, circleBg, textColor, borderColor } = COLOR_THEMES[formData.themeIndex]

    try {
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        name: formData.name.trim().toUpperCase(),
        description: formData.description.trim(),
        status: formData.status,
        color,
        circleBg,
        textColor,
        borderColor
      })
      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 transition-all transform scale-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? `Edit ${entityName}` : `Add New ${entityName}`}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode ? 'Update details for this entry.' : 'Fill in information to create a new option.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mt-4 rounded-md bg-rose-50 p-3 border border-rose-200">
          <p className="text-xs font-medium text-rose-800">{errorMessage}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 tracking-wider mb-1.5">
            {entityName} Name
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            placeholder={`e.g. ${entityName === 'Category' ? 'SUV' : entityName === 'Fuel Type' ? 'HYBRID' : 'AUTOMATIC'}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            disabled={isSubmitting}
            placeholder="Provide a brief summary for this option..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 tracking-wider mb-1.5">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setFormData({ ...formData, status: 'Active' })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                formData.status === 'Active'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setFormData({ ...formData, status: 'Inactive' })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                formData.status === 'Inactive'
                  ? 'border-gray-400 bg-gray-100 text-gray-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Inactive
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-700 tracking-wider mb-1.5">
            Accent Color
          </label>
          <div className="flex items-center gap-2.5 pt-1">
            {COLOR_THEMES.map((theme, index) => (
              <button
                key={theme.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => setFormData({ ...formData, themeIndex: index })}
                className={`h-7 w-7 rounded-full ${theme.color} transition-all cursor-pointer flex items-center justify-center ${
                  formData.themeIndex === index 
                    ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' 
                    : 'hover:scale-105 opacity-80'
                } disabled:opacity-50`}
                title={theme.label}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-w-22 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-w-28 px-5 py-2.5 text-xs font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              `Create ${entityName}`
            )}
          </button>
        </div>
      </form>
    </div>
  )
}