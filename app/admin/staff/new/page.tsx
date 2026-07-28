/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/context/AdminContext'
import {
  User,
  Plus,
  Settings,
  ShieldCheck,
  UploadCloud,
  Loader2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react'

type StaffRole = 'STAFF' | 'ADMIN' | 'SUPERADMIN'

interface AddStaffFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: StaffRole
  isActive: boolean
  licenseNumber: string
  issuingCountry: string
  licenseFile: File | null
}

export default function AddStaffPage() {
  const router = useRouter()
  const { addStaff } = useAdmin()

  const [formData, setFormData] = useState<AddStaffFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'STAFF',
    isActive: true,
    licenseNumber: '',
    issuingCountry: '',
    licenseFile: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData((prev) => ({ ...prev, [name]: target.checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, licenseFile: e.dataTransfer.files[0] }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, licenseFile: files[0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    try {
      setIsSubmitting(true)

      await addStaff({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        isActive: formData.isActive,
        licenseNumber: formData.licenseNumber.trim(),
        issuingCountry: formData.issuingCountry.trim(),
        licenseFile: formData.licenseFile,
      })

      router.push('/admin/staff')
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard new staff member. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-8 pb-24 px-4 md:px-16 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Directory
        </Link>
        <header className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">
            Add New Staff Member
          </h1>
          <p className="text-base text-text-secondary">
            Onboard a new staff user or administrator to your team.
          </p>
        </header>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-border rounded-xl p-8 md:p-12 space-y-12 shadow-[0px_10px_40px_rgba(0,0,0,0.04)]">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Staff Profile */}
          <section className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-surface-container border border-border flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-surface-container-high">
                  <User className="h-10 w-10 text-text-secondary" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  Staff Profile
                </h3>
                <p className="text-sm text-text-secondary">
                  Basic identity and contact details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Julian"
                  required
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sterling"
                  required
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="julian@sterling.com"
                  required
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Account Configuration */}
          <section className="space-y-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-primary">
                Account Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Role Selection
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none cursor-pointer"
                >
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="text-base font-semibold text-primary">
                    Account Status
                  </p>
                  <p className="text-xs text-text-secondary">
                    Set initial status for system login access.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            {/* System Generated Password Notice */}
            <div className="p-4 rounded-lg bg-surface-container-low border border-border flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-primary block mb-0.5">
                  Automated Credentials Setup
                </span>
                Passwords are automatically generated by the system. Upon
                submission, an invitation email will be sent to the staff member
                with login instructions.
              </div>
            </div>
          </section>

          {/* Section 3: Verification Details */}
          <section className="space-y-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-primary">
                Verification Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Driver&apos;s License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="AB1234567"
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-2">
                  Issuing Country
                </label>
                <input
                  type="text"
                  name="issuingCountry"
                  value={formData.issuingCountry}
                  onChange={handleInputChange}
                  placeholder="United States"
                  className="w-full bg-transparent border-0 border-b border-border py-3 px-0 focus:border-primary focus:ring-0 transition-colors text-base text-text-primary outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold tracking-wider uppercase text-text-secondary mb-4">
                  Driver&apos;s License / ID Copy
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragActive(true)
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer group relative ${
                    dragActive
                      ? 'border-primary bg-surface-container-low'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <UploadCloud className="h-10 w-10 text-text-secondary group-hover:text-primary transition-colors" />
                    {formData.licenseFile ? (
                      <p className="text-sm font-semibold text-primary">
                        Selected: {formData.licenseFile.name}
                      </p>
                    ) : (
                      <p className="text-base text-text-secondary">
                        Drag and drop file here, or{' '}
                        <span className="text-primary font-semibold underline">
                          browse
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-text-secondary opacity-60">
                      High-resolution JPG, PNG or PDF (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Action Buttons */}
          <div className="pt-8 flex flex-col md:flex-row items-center gap-6 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-lg text-base font-semibold ease-out duration-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSubmitting ? 'Creating Staff Member...' : 'Create Staff Member'}
            </button>

            <Link
              href="/admin/staff"
              className="w-full md:w-auto px-8 py-4 text-center text-text-secondary hover:text-primary text-base transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}