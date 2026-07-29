/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import { EntityItem } from './EntityCard'

// Theme presets (renamed `name` to `label` so it doesn't collide with the entity's `name` property)
export const COLOR_THEMES = [
  { label: 'Sky', color: 'bg-sky-400', circleBg: 'bg-sky-100', textColor: 'text-sky-700', borderColor: 'border-sky-200' },
  { label: 'Emerald', color: 'bg-emerald-400', circleBg: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  { label: 'Purple', color: 'bg-purple-400', circleBg: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  { label: 'Rose', color: 'bg-rose-400', circleBg: 'bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  { label: 'Amber', color: 'bg-amber-400', circleBg: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { label: 'Teal', color: 'bg-teal-400', circleBg: 'bg-teal-100', textColor: 'text-teal-700', borderColor: 'border-teal-200' },
  { label: 'Indigo', color: 'bg-indigo-400', circleBg: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
]

interface EntityModalProps {
  isOpen: boolean
  entityName: string
  initialData?: EntityItem | null
  onClose: () => void
  onSave: (data: Omit<EntityItem, 'id'> & { id?: number }) => void
}

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  entityName,
  initialData,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    themeIndex: 0
  })

  useEffect(() => {
    if (initialData) {
      const foundIndex = COLOR_THEMES.findIndex(t => t.color === initialData.color)
      setFormData({
        name: initialData.name,
        description: initialData.description,
        status: initialData.status,
        themeIndex: foundIndex >= 0 ? foundIndex : 0
      })
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        themeIndex: 0
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const isEditMode = Boolean(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const { color, circleBg, textColor, borderColor } = COLOR_THEMES[formData.themeIndex]

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: formData.name.toUpperCase(),
      description: formData.description,
      status: formData.status,
      color,
      circleBg,
      textColor,
      borderColor
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-200">
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
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

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
              placeholder={`e.g. ${entityName === 'Category' ? 'SUV' : entityName === 'Fuel Type' ? 'HYBRID' : 'AUTOMATIC'}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a brief summary for this option..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
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
                onClick={() => setFormData({ ...formData, status: 'Active' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                  formData.status === 'Active'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                  formData.status === 'Inactive'
                    ? 'border-gray-400 bg-gray-100 text-gray-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
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
                  onClick={() => setFormData({ ...formData, themeIndex: index })}
                  className={`h-7 w-7 rounded-full ${theme.color} transition-all cursor-pointer flex items-center justify-center ${
                    formData.themeIndex === index 
                      ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' 
                      : 'hover:scale-105 opacity-80'
                  }`}
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
              className="min-w-22 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-w-25 px-5 py-2.5 text-xs font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
            >
              {isEditMode ? 'Save Changes' : `Create ${entityName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}