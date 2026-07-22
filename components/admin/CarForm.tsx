/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/CarForm.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { 
  Info, Gauge, ImageIcon, DollarSign, Settings, 
  Loader2, CheckCircle, Upload, Trash2, Plus,
  ArrowLeft 
} from 'lucide-react'

// Types
export interface CarFormData {
  manufacturer: string
  model: string
  year: number
  category: string
  licensePlate: string
  color: string
  transmission: string
  fuelType: string
  seats: number
  luggageCapacity: number
  features: string[]
  pricePerDay: string | number
  pricePerWeek: string | number
  pricePerMonth: string | number
  securityDeposit: number
  mileageFree: string | number | null
  mileageExtraFee: string | number | null
  locationAddress: string
  locationCity: string
  locationState: string
  locationZipCode: string
  imageMain: string
  imageGallery: string[]
  status: string
}

interface CarFormProps {
  formData: CarFormData
  isActive: boolean
  uploadedImages: string[]
  isSubmitting: boolean
  isLoading: boolean
  submitSuccess: boolean
  categories: string[]
  transmissions: string[]
  fuelTypes: string[]
  featuresList: string[]
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onToggleFeature: (feature: string) => void
  onImageUpload: (files: FileList) => void
  onImageRemove: (index: number) => void
  onToggleStatus: () => void
  onSubmit: (e: React.FormEvent) => void
}

// Sub-components
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
  </div>
)

const FormInput = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</label>
    <input className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs" {...props} />
  </div>
)

const FormSelect = ({ label, options, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</label>
    <select className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs appearance-none" {...props}>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
)

export function CarForm({
  formData,
  isActive,
  uploadedImages,
  isSubmitting,
  isLoading,
  submitSuccess,
  categories,
  transmissions,
  fuelTypes,
  featuresList,
  onChange,
  onToggleFeature,
  onImageUpload,
  onImageRemove,
  onToggleStatus,
  onSubmit
}: CarFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Basic Information */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <SectionHeader icon={<Info className="w-5 h-5 text-gray-900" />} title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput 
                  label="Vehicle Name *" 
                  name="manufacturer" 
                  value={formData.manufacturer} 
                  onChange={onChange} 
                  placeholder="e.g. Porsche" 
                  required 
                />
              </div>
              <FormInput 
                label="Model *" 
                name="model" 
                value={formData.model} 
                onChange={onChange} 
                placeholder="e.g. Taycan Turbo S" 
                required 
              />
              <FormSelect 
                label="Category *" 
                name="category" 
                value={formData.category} 
                onChange={onChange} 
                options={categories} 
                required 
              />
              <FormInput 
                label="Year *" 
                name="year" 
                type="number" 
                value={formData.year} 
                onChange={onChange} 
                placeholder="2024" 
                min={1900} 
                max={new Date().getFullYear() + 1} 
                required 
              />
              <FormInput 
                label="License Plate *" 
                name="licensePlate" 
                value={formData.licensePlate} 
                onChange={onChange} 
                placeholder="ABC-1234" 
                required 
              />
              <FormInput 
                label="Color" 
                name="color" 
                value={formData.color} 
                onChange={onChange} 
                placeholder="e.g. Jet Black" 
              />
            </div>
          </section>

          {/* Specifications */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <SectionHeader icon={<Gauge className="w-5 h-5 text-gray-900" />} title="Specifications" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormSelect 
                label="Transmission" 
                name="transmission" 
                value={formData.transmission} 
                onChange={onChange} 
                options={transmissions} 
              />
              <FormSelect 
                label="Fuel Type" 
                name="fuelType" 
                value={formData.fuelType} 
                onChange={onChange} 
                options={fuelTypes} 
              />
              <FormInput 
                label="Seats" 
                name="seats" 
                type="number" 
                value={formData.seats} 
                onChange={onChange} 
                min={1} 
                max={10} 
              />
              <FormInput 
                label="Luggage" 
                name="luggageCapacity" 
                type="number" 
                value={formData.luggageCapacity} 
                onChange={onChange} 
                min={0} 
                max={20} 
              />
            </div>
          </section>

          {/* Media Gallery */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            <SectionHeader icon={<ImageIcon className="w-5 h-5 text-gray-900" />} title="Media Gallery" />
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-900 transition-colors cursor-pointer group mb-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={(e) => e.target.files && onImageUpload(e.target.files)} 
              />
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-lg text-gray-900 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG or WEBP (max. 4096×4096px)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group">
                  <Image 
                    src={image} 
                    alt={`Upload ${index + 1}`} 
                    width={200} 
                    height={200} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => onImageRemove(index)} 
                      className="bg-white text-gray-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {uploadedImages.length < 8 && (
                <div 
                  className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Pricing */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <SectionHeader icon={<DollarSign className="w-5 h-5 text-gray-900" />} title="₹ Commercials" />
            <div className="space-y-4">
              <FormInput 
                label="Daily Rate (₹) *" 
                name="pricePerDay" 
                type="number" 
                value={formData.pricePerDay} 
                onChange={onChange} 
                placeholder="5000" 
                min={0} 
                required 
              />
              <FormInput 
                label="Weekly Rate (₹)" 
                name="pricePerWeek" 
                type="number" 
                value={formData.pricePerWeek} 
                onChange={onChange} 
                placeholder="30000" 
                min={0} 
              />
              <FormInput 
                label="Monthly Rate (₹)" 
                name="pricePerMonth" 
                type="number" 
                value={formData.pricePerMonth} 
                onChange={onChange} 
                placeholder="120000" 
                min={0} 
              />
              <FormInput 
                label="Security Deposit (₹)" 
                name="securityDeposit" 
                type="number" 
                value={formData.securityDeposit} 
                onChange={onChange} 
                placeholder="5000" 
                min={0} 
              />
              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 block mb-4">
                  Availability Status
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    {isActive ? 'Active Fleet' : 'Unavailable'}
                  </span>
                  <button 
                    type="button" 
                    onClick={onToggleStatus} 
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                      isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      isActive ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <SectionHeader icon={<Settings className="w-5 h-5 text-gray-900" />} title="Features" />
            <div className="space-y-3 max-h-70 overflow-y-auto pr-2">
              {featuresList.map((feature) => (
                <label key={feature} className="flex items-center gap-3 group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.features.includes(feature)} 
                    onChange={() => onToggleFeature(feature)} 
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" 
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || isLoading} 
              className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </span>
              ) : submitSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Registered Successfully!
                </span>
              ) : (
                'Register Vehicle'
              )}
            </button>
            <button 
              type="button" 
              className="w-full bg-transparent text-gray-500 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}