// components/car/CarInfo.tsx
import { cn } from '@/lib/utils'
import { FleetCar } from '@/types/fleet'

interface CarInfoProps {
  car: FleetCar
}

export function CarInfo({ car }: CarInfoProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-700',
    reserved: 'bg-yellow-100 text-yellow-700',
    'new-arrival': 'bg-purple-100 text-purple-700',
  }

  const statusLabels = {
    available: 'AVAILABLE',
    reserved: 'RESERVED',
    'new-arrival': 'NEW ARRIVAL',
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className={cn(
            'px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1',
            statusColors[car.status] || 'bg-gray-100 text-gray-700'
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {statusLabels[car.status] || 'AVAILABLE'}
          </span>
          <span className="text-xs text-gray-500">{car.year || '2024'} MODEL</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          {car.brand} {car.model}
        </h1>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-gray-200 py-6 gap-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Acceleration</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-900 font-semibold text-lg">2.6s</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Power</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-900 font-semibold text-lg">750hp</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Range</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-900 font-semibold text-lg">280mi</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Drivetrain</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-900 font-semibold text-lg">AWD</span>
          </div>
        </div>
      </div>
    </div>
  )
}