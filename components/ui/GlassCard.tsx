import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true 
}: GlassCardProps) {
  return (
    <div className={cn(
      'glass-panel rounded-brand border border-white/50',
      'shadow-[0px_10px_40px_rgba(0,0,0,0.04)]',
      hover && 'transition-all duration-300 hover:shadow-[0px_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1',
      className
    )}>
      {children}
    </div>
  )
}