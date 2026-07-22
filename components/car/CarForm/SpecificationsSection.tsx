// components/admin/cars/CarForm/SpecificationsSection.tsx
import { Gauge } from 'lucide-react'
import { SectionHeader } from '../shared/SectionHeader'
import { FormInput } from '../shared/FormInput'
import { FormSelect } from '../shared/FormSelect'

interface SpecificationsSectionProps {
  formData: {
    transmission: string
    fuelType: string
    seats: number
    luggageCapacity: number
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  transmissions: string[]
  fuelTypes: string[]
}

export function SpecificationsSection({ 
  formData, 
  onChange, 
  transmissions, 
  fuelTypes 
}: SpecificationsSectionProps) {
  return (
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
  )
}