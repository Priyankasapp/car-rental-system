'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bottomNavLinks } from '@/data'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-surface z-50 shadow-[0px_-10px_40px_rgba(0,0,0,0.04)] border-t border-border">
      {bottomNavLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center transition-colors',
              isActive ? 'text-primary scale-110' : 'text-text-secondary hover:text-primary'
            )}
          >
            <Icon 
              name={link.icon} 
              className="text-2xl"
              filled={isActive}
              weight={isActive ? 400 : 300}
            />
            <span className="font-label-sm text-[10px] mt-1">
              {link.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}