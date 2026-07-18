import { cn } from "@/lib/utils"

interface FeatureListProps {
  features: Array<{
    icon: string
    text: string
  }>
  className?: string
  iconColor?: string
}

export default function FeatureList({ 
  features, 
  className = '',
  iconColor = 'text-accent-success'
}: FeatureListProps) {
  return (
    <ul className={cn('space-y-4', className)}>
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-4 text-white dark:text-black text-base">
          <span className={`material-symbols-outlined ${iconColor}`}>
            {feature.icon}
          </span>
          {feature.text}
        </li>
      ))}
    </ul>
  )
}