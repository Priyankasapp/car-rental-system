import { cn } from "@/lib/utils"

interface BrandCardProps {
  icon: string
  title: string
  description: string
  className?: string
}

export default function BrandCard({
  icon,
  title,
  description,
  className = ''
}: BrandCardProps) {
  return (
    <div className={cn(
      'bg-surface p-12 shadow-[0px_10px_40px_rgba(0,0,0,0.04)] border border-border',
      'flex flex-col items-center text-center space-y-8',
      'group hover:bg-primary dark:hover:bg-white transition-colors duration-500',
      className
    )}>
      <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:border-primary-fixed group-hover:text-primary-fixed transition-colors">
        <span className="material-symbols-outlined text-4xl">
          {icon}
        </span>
      </div>
      <div className="space-y-4">
        <h3 className="font-headline-md text-headline-md text-primary group-hover:text-white dark:group-hover:text-black transition-colors">
          {title}
        </h3>
        <p className="font-body-md text-body-md text-text-secondary group-hover:text-primary-fixed-dim dark:group-hover:text-text-secondary transition-colors">
          {description}
        </p>
      </div>
    </div>
  )
}