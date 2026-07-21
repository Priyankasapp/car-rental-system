// components/admin/BookingStatusBadge.tsx
'use client'

import { cn } from '@/lib/utils'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BookingStatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

//  Status configuration
const statusConfig: Record<string, {
  label: string
  className: string
  icon: React.ElementType
}> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle,
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: AlertCircle,
  },
}

//  Size mapping
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

export default function BookingStatusBadge({ 
  status, 
  className,
  showIcon = true,
  size = 'md'
}: BookingStatusBadgeProps) {
  //  Get config for status
  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon
  const sizeClass = sizeClasses[size]
  const iconSize = iconSizes[size]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full border',
      config.className,
      sizeClass,
      className
    )}>
      {showIcon && <Icon className={cn(iconSize, 'shrink-0')} />}
      {config.label}
    </span>
  )
}

//  Status options for dropdown/filters
export const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'EXPIRED', label: 'Expired' },
]

//  Helper function to check if status is valid
export function isValidStatus(status: string): boolean {
  return status in statusConfig
}

//  Helper function to get status color for use in other components
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue',
    EXPIRED: 'gray',
  }
  return colors[status] || 'gray'
}

//  Helper function to get status label
export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}