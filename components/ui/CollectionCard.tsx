'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Collection } from '@/types'
import { cn } from '@/lib/utils'

interface CollectionCardProps {
  collection: Collection
  className?: string
}

export default function CollectionCard({
  collection,
  className = '',
}: CollectionCardProps) {
  return (
    <Link
      href={`/fleet?category=${encodeURIComponent(collection.name)}`}
      className={cn(
        'collection-card group block',
        className
      )}
    >
      <div
        className={cn(
          'relative flex h-56 flex-col justify-between',
          'overflow-hidden rounded-2xl',
          'border border-neutral-200 bg-white',
          'p-6 md:p-7',
          'transition-all duration-500 ease-out',
          'group-hover:-translate-y-2',
          'group-hover:border-black',
          'group-hover:bg-black',
          'group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)]'
        )}
      >
        {/* Background letter */}
        <span
          className={cn(
            'pointer-events-none absolute -right-2 -top-8',
            'select-none text-[140px] font-bold leading-none',
            'text-neutral-100',
            'transition-colors duration-500',
            'group-hover:text-neutral-900'
          )}
        >
          {collection.name.charAt(0).toUpperCase()}
        </span>

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.25em]',
              'text-neutral-400',
              'transition-colors duration-500',
              'group-hover:text-neutral-500'
            )}
          >
            Collection
          </span>

          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              'rounded-full border border-neutral-200',
              'transition-all duration-500',
              'group-hover:border-neutral-700',
              'group-hover:bg-white',
              'group-hover:text-black'
            )}
          >
            <ArrowUpRight
              size={18}
              strokeWidth={1.7}
              className="transition-transform duration-500 group-hover:rotate-45"
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <h3
            className={cn(
              'text-2xl font-medium tracking-tight',
              'text-black',
              'transition-colors duration-500',
              'group-hover:text-white',
              'md:text-3xl'
            )}
          >
            {collection.name}
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <span
              className={cn(
                'h-px w-8 bg-black',
                'transition-all duration-500',
                'group-hover:w-14',
                'group-hover:bg-white'
              )}
            />

            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.2em]',
                'text-neutral-400',
                'transition-colors duration-500',
                'group-hover:text-neutral-500'
              )}
            >
              Explore
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 