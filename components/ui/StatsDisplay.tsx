import { cn } from "@/lib/utils"

interface StatsDisplayProps {
  stats: Array<{
    value: string
    label: string
  }>
  className?: string
}

export default function StatsDisplay({ stats, className = '' }: StatsDisplayProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-8', className)}>
      {stats.map((stat, index) => (
        <div key={index}>
          <div className="font-headline-md text-headline-md text-primary">
            {stat.value}
          </div>
          <div className="font-label-sm text-label-sm text-text-secondary uppercase">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}