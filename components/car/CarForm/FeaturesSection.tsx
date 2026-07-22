// components/admin/cars/CarForm/FeaturesSection.tsx
import { Settings } from 'lucide-react'
import { SectionHeader } from '../shared/SectionHeader'

interface FeaturesSectionProps {
  features: string[]
  selectedFeatures: string[]
  onToggleFeature: (feature: string) => void
}

export function FeaturesSection({ features, selectedFeatures, onToggleFeature }: FeaturesSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <SectionHeader icon={<Settings className="w-5 h-5 text-gray-900" />} title="Features" />
      <div className="space-y-3 max-h-70 overflow-y-auto pr-2">
        {features.map((feature) => (
          <label key={feature} className="flex items-center gap-3 group cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFeatures.includes(feature)}
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
  )
}