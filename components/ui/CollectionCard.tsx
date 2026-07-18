import { Collection } from '@/types'
import { cn } from '@/lib/utils'
import Icon from './Icon'

interface CollectionCardProps {
  collection: Collection
  className?: string
}

export default function CollectionCard({ 
  collection, 
  className = '' 
}: CollectionCardProps) {
  return (
    <div className={cn(
      'group cursor-pointer',
      className
    )}>
      <div className={cn(
        'bg-surface rounded-brand h-48 mb-4',
        'flex flex-col items-center justify-center',
        'transition-all duration-300',
        'border border-transparent',
        'group-hover:bg-white group-hover:shadow-[0px_10px_40px_rgba(0,0,0,0.04)] group-hover:border-border'
      )}>
        <Icon 
          name={collection.icon} 
          className="text-4xl mb-4 text-primary"
          weight={200}
        />
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
          {collection.name}
        </span>
      </div>
    </div>
  )
}