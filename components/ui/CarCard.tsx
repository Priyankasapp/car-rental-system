
import { Car } from '@/types'
import { cn } from '@/lib/utils'


interface CarCardProps {
  car: Car
  className?: string
}

export default function CarCard({ car, className = '' }: CarCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-brand overflow-hidden group',
      'shadow-[0px_10px_40px_rgba(0,0,0,0.04)] border border-border',
      'flex flex-col transition-all duration-300 hover:shadow-[0px_20px_60px_rgba(0,0,0,0.08)]',
      className
    )}>
      {/* Image */}
      <div className="relative h-[400px] overflow-hidden bg-surface">
        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${car.image})` }}
        />
        {car.badge && (
          <div className="absolute top-6 left-6 bg-black text-white px-4 py-1 rounded-full text-label-sm font-label-sm tracking-wider uppercase">
            {car.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="font-headline-md text-headline-md text-primary">
              {car.name}
            </h4>
            <p className="font-body-md text-text-secondary">
              {car.description}
            </p>
          </div>
          <div className="text-right">
            <span className="font-headline-md text-headline-md text-primary">
              ${car.price}
            </span>
            <span className="font-label-sm text-label-sm text-text-secondary"> / DAY</span>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 mt-auto">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-[10px] text-text-secondary uppercase tracking-widest">
              Transmission
            </span>
            <span className="font-body-md font-semibold text-primary">
              {car.specs.transmission}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-[10px] text-text-secondary uppercase tracking-widest">
              Power
            </span>
            <span className="font-body-md font-semibold text-primary">
              {car.specs.power}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="font-label-sm text-[10px] text-text-secondary uppercase tracking-widest">
              {car.specs.acceleration ? '0-60 MPH' : car.specs.passengers ? 'Passengers' : 'Range'}
            </span>
            <span className="font-body-md font-semibold text-primary">
              {car.specs.acceleration || car.specs.passengers || car.specs.range}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}