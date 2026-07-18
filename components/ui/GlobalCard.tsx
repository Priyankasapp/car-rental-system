'use client'

import { cn } from '@/lib/utils'
import Icon from './Icon'

interface FeatureType {
  id: string
  icon: string
  title: string
  description: string
}

interface FeatureCardProps {
  feature: FeatureType
  className?: string
}

export default function GlobalCard({ 
  feature, 
  className = '' 
}: FeatureCardProps) {
  if (!feature) return null

  return (
    <div className={cn('flex flex-col items-center text-center px-4', className)}>
      
      {/* Small subtle circular outline container for the icon */}
      <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-5 bg-white">
        <Icon 
          name={feature.icon} 
          className="text-lg text-black" 
        />
      </div>
      
      {/* Clean font title definition */}
      <h4 className="text-sm font-bold text-black mb-2 tracking-tight">
        {feature.title}
      </h4>
      
      {/* Small elegant layout parameter configurations */}
      <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}