'use client'

import { useState } from 'react'
import { FleetFilterOption } from '@/types/fleet'
import { cn } from '@/lib/utils'

interface BrandFilterProps {
  brands: FleetFilterOption[]
  onChange?: (selected: string) => void
}

export default function BrandFilter({
  brands,
  onChange
}: BrandFilterProps) {
  const [selected, setSelected] = useState<string>(
    brands.find(b => b.checked)?.value || ''
  )

  const handleSelect = (value: string) => {
    setSelected(value)
    onChange?.(value)
  }

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Micro Heading */}
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Brand
      </h3>
      
      {/* Sleeker Grid Container */}
      <div className="grid grid-cols-2 gap-1.5">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleSelect(brand.value)}
            className={cn(
              'px-3 py-1.5 border text-center text-[10px] uppercase tracking-[0.05em] cursor-pointer transition-colors duration-200 rounded-none',
              selected === brand.value
                ? 'border-primary bg-primary text-white font-bold'
                : 'border-border text-text-secondary font-medium hover:border-primary hover:text-primary'
            )}
          >
            {brand.label}
          </div>
        ))}
      </div>
    </div>
  )
}