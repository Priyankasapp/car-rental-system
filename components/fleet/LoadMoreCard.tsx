interface LoadMoreCardProps {
  title: string
  description: string
  onClick?: () => void
}

export default function LoadMoreCard({
  title,
  description,
  onClick
}: LoadMoreCardProps) {
  return (
    <div 
      onClick={onClick}
      className="border-2 border-dashed border-border rounded-[20px] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-surface-container-low transition-colors"
    >
      <div className="w-16 h-16 bg-white executive-shadow rounded-full flex items-center justify-center mb-4 transition-transform group-hover:rotate-90 duration-500">
        <span className="material-symbols-outlined text-primary scale-125">
          add
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-primary mb-2">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-text-secondary">
        {description}
      </p>
    </div>
  )
}