// components/admin/cars/CarForm/BasicInfoSection.tsx
import { Info } from 'lucide-react'
import { SectionHeader } from '../shared/SectionHeader'
import { FormInput } from '../shared/FormInput'
import { FormSelect } from '../shared/FormSelect'

interface BasicInfoSectionProps {
  formData: {
    manufacturer: string
    model: string
    category: string
    year: number
    licensePlate: string
    color: string
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  categories: string[]
}

export function BasicInfoSection({ formData, onChange, categories }: BasicInfoSectionProps) {
  return (
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
  )
}