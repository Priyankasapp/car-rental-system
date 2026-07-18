'use client'

import { useState } from 'react'

interface PriceRangeFilterProps {
  min: number
  max: number
  currentMin: number
  currentMax: number
  onChange?: (min: number, max: number) => void
}

export default function PriceRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onChange
}: PriceRangeFilterProps) {
  const [minValue, setMinValue] = useState(currentMin)
  const [maxValue, setMaxValue] = useState(currentMax)

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const safeValue = Math.min(value, maxValue - 10)
    setMinValue(safeValue)
    onChange?.(safeValue, maxValue)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const safeValue = Math.max(value, minValue + 10)
    setMaxValue(safeValue)
    onChange?.(minValue, safeValue)
  }

  const minPercent = ((minValue - min) / (max - min)) * 100
  const maxPercent = ((maxValue - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Micro-sized Title */}
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        Price Range
      </h3>
      
      {/* Thinner Track (Reduced height from h-1 to h-[2px]) */}
      <div className="relative w-full h-[2px] bg-border rounded-full mt-2">
        
        {/* Selected Highlight Bar */}
        <div 
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />

        {/* Min Range Slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-[2px] appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3"
          style={{ zIndex: minValue > max - 100 ? 5 : 4 }}
        />

        {/* Max Range Slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-[2px] appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3"
          style={{ zIndex: 4 }}
        />

        {/* Downsized Custom Min Thumb (Reduced from w-4 h-4 to w-3 h-3) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full pointer-events-none"
          style={{ left: `${minPercent}%`, zIndex: 3 }}
        />

        {/* Downsized Custom Max Thumb (Reduced from w-4 h-4 to w-3 h-3) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full pointer-events-none"
          style={{ left: `${maxPercent}%`, zIndex: 3 }}
        />
      </div>
      
      {/* Downsized Price Labels (Changed to text-[11px] and font-mono for clean look) */}
      <div className="flex justify-between text-[11px] font-mono text-text-secondary mt-1">
        <span>${minValue}</span>
        <span>${maxValue}+</span>
      </div>
    </div>
  )
}