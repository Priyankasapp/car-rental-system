'use client'


import { LucideIcon } from 'lucide-react'

interface EntityGridSkeletonProps {
  title: string
  description: string
  icon?: LucideIcon
  cardCount?: number
  showAddButton?: boolean 
  showActions?: boolean 
}

export function EntityGridSkeleton({
  title,
  description,
  icon: Icon,
  cardCount = 6,
  showAddButton = true,
  showActions = true,
}: EntityGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-slate-400" />}
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        
        {/* Add Button Skeleton */}
        {showAddButton && (
          <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4 animate-pulse"
          >
            {/* Top Row: Color Badge & Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Circle Badge Skeleton */}
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  {/* Title Skeleton */}
                  <div className="h-5 w-28 bg-slate-200 rounded" />
                  {/* Status Skeleton */}
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              {/* Count Badge Skeleton */}
              <div className="h-6 w-14 bg-slate-100 rounded-full" />
            </div>

            {/* Middle Row: Description */}
            <div className="space-y-2 py-1">
              <div className="h-3.5 w-full bg-slate-200 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
            </div>

            {/* Bottom Row: Actions */}
            {showActions && (
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <div className="h-8 w-24 bg-slate-100 rounded-md" />
                  <div className="h-8 w-24 bg-slate-200 rounded-md" />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  )
}