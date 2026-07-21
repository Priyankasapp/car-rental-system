// components/admin/CarStatusBadge.tsx
'use client'

import { cn } from '@/lib/utils'

interface CarStatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

//  Status configuration
const statusConfig: Record<string, {
  label: string
  className: string
  dotColor: string
}> = {
  AVAILABLE: {
    label: 'Available',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  RESERVED: {
    label: 'Reserved',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  UNAVAILABLE: {
    label: 'Unavailable',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-500',
  },
}

//  Size mapping
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export function CarStatusBadge({ 
  status, 
  className,
  size = 'md'
}: CarStatusBadgeProps) {
  //  Get config for status
  const config = statusConfig[status] || statusConfig.AVAILABLE
  const sizeClass = sizeClasses[size]
  const dotSize = dotSizes[size]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      config.className,
      sizeClass,
      className
    )}>
      {/* Status Dot */}
      <span className={cn(
        'rounded-full',
        config.dotColor,
        dotSize
      )} />
      {config.label}
    </span>
  )
}

//  Helper function to get status color (for use in other components)
export function getCarStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'green',
    RESERVED: 'yellow',
    UNAVAILABLE: 'red',
    MAINTENANCE: 'gray',
  }
  return colors[status] || 'gray'
}

//  Helper function to get status label
export function getCarStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}

//  Status options for dropdown/filters
export const carStatusOptions = [
  { value: '', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
]

//  Check if status is valid
export function isValidCarStatus(status: string): boolean {
  return status in statusConfig
}