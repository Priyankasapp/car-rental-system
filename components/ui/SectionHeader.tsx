
import { cn } from '@/lib/utils'

import Icon from './Icon'
import { Button } from './Button'

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
  align?: 'left' | 'center'
}

export default function SectionHeader({
  label,
  title,
  description,
  action,
  className = '',
  align = 'left',
}: SectionHeaderProps) {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
  }

  return (
    <div className={cn(
      'flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12',
      alignment[align],
      className
    )}>
      <div>
        {label && (
  <p className="font-medium text-[10px] text-text-secondary tracking-[0.25em] uppercase mb-2">
    {label}
  </p>
)}
        <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-primary leading-tight">
  {title}
</h3>
        {description && (
          <p className="font-body-md text-body-md text-text-secondary mt-2 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button variant="ghost" className="hidden md:flex items-center gap-2 group">
          {action.label}
          <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </div>
  )
}