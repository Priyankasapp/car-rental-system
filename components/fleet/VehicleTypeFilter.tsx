'use client'

import { useState } from 'react'
import { FleetFilterOption } from '@/types/fleet'
import { cn } from '@/lib/utils'

interface VehicleTypeFilterProps {
  types: FleetFilterOption[]
  onChange?: (selected: string[]) => void
}

export default function VehicleTypeFilter({
  types,
  onChange
}: VehicleTypeFilterProps) {
  const [selected, setSelected] = useState<string[]>(
    types.filter(t => t.checked).map(t => t.value)
  )

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    
    setSelected(newSelected)
    onChange?.(newSelected)
  }

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Micro Heading */}
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Vehicle Type
      </h3>
      
      <div className="flex flex-col gap-2">
        {types.map((type) => (
          <label 
            key={type.id}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Downsized Square Checkbox */}
            <input
              type="checkbox"
              checked={selected.includes(type.value)}
              onChange={() => handleToggle(type.value)}
              className="w-3.5 h-3.5 rounded-none border-neutral-300 text-primary focus:ring-0 focus:outline-none focus:ring-offset-0 cursor-pointer"
            />
            
            {/* Downsized Text Label to 10px */}
            <span className={cn(
              'text-[10px] uppercase tracking-[0.05em] group-hover:text-primary transition-colors duration-200',
              selected.includes(type.value) 
                ? 'text-primary font-bold' 
                : 'text-text-secondary font-medium'
            )}>
              {type.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}