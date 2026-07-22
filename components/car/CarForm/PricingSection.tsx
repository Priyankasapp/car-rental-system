// components/admin/cars/CarForm/PricingSection.tsx
import { DollarSign } from 'lucide-react'
import { SectionHeader } from '../shared/SectionHeader'
import { FormInput } from '../shared/FormInput'
import { ToggleSwitch } from '../shared/ToggleSwitch'

interface PricingSectionProps {
  formData: {
    pricePerDay: string | number
    pricePerWeek: string | number
    pricePerMonth: string | number
    securityDeposit: number
  }
  isActive: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onToggleStatus: () => void
}

export function PricingSection({ formData, isActive, onChange, onToggleStatus }: PricingSectionProps) {
  return (
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
          <ToggleSwitch
            isActive={isActive}
            onToggle={onToggleStatus}
            label={isActive ? 'Active Fleet' : 'Unavailable'}
          />
        </div>
      </div>
    </section>
  )
}