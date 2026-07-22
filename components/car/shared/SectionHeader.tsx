// components/admin/cars/shared/SectionHeader.tsx
import { ReactNode } from 'react'

interface SectionHeaderProps {
  icon: ReactNode
  title: string
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
  )
}