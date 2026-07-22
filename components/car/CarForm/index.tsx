// components/admin/CarForm/index.tsx
'use client'

import { BasicInfoSection } from './BasicInfoSection'
import { SpecificationsSection } from './SpecificationsSection'
import { MediaGallerySection } from './MediaGallerySection'
import { PricingSection } from './PricingSection'
import { FeaturesSection } from './FeaturesSection'
import { FormActions } from './FormActions'

// Make sure this interface is exported
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

// Make sure this interface is exported
export interface CarFormProps {
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
  return (
    <form onSubmit={onSubmit} className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <BasicInfoSection
            formData={formData}
            onChange={onChange}
            categories={categories}
          />
          
          <SpecificationsSection
            formData={formData}
            onChange={onChange}
            transmissions={transmissions}
            fuelTypes={fuelTypes}
          />
          
          <MediaGallerySection
            images={uploadedImages}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
          />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <PricingSection
            formData={formData}
            isActive={isActive}
            onChange={onChange}
            onToggleStatus={onToggleStatus}
          />
          
          <FeaturesSection
            features={featuresList}
            selectedFeatures={formData.features}
            onToggleFeature={onToggleFeature}
          />
          
          <FormActions
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            submitSuccess={submitSuccess}
          />
        </div>
      </div>
    </form>
  )
}