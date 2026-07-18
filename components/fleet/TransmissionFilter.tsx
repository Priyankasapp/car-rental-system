'use client'

import { useState } from 'react'
import { FleetFilterOption } from '@/types/fleet'
import { cn } from '@/lib/utils'

interface TransmissionFilterProps {
  transmissions: FleetFilterOption[]
  onChange?: (selected: string) => void
}

export default function TransmissionFilter({
  transmissions,
  onChange
}: TransmissionFilterProps) {
  const [selected, setSelected] = useState<string>('')

  const handleSelect = (value: string) => {
    const newValue = selected === value ? '' : value
    setSelected(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Micro Heading */}
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Transmission
      </h3>
      
      {/* Sleeker Flex Container */}
      <div className="flex gap-1.5">
        {transmissions.map((trans) => (
          <button
            key={trans.id}
            onClick={() => handleSelect(trans.value)}
            className={cn(
              'flex-1 py-1.5 bg-surface border text-center text-[10px] uppercase tracking-[0.05em] cursor-pointer transition-colors duration-200 rounded-none focus:outline-none focus:ring-0',
              selected === trans.value
                ? 'border-primary bg-primary text-white font-bold'
                : 'border-border text-text-secondary font-medium hover:border-primary hover:text-primary'
            )}
          >
            {trans.label}
          </button>
        ))}
      </div>
    </div>
  )
}