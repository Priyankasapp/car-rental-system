import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: string
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {trend} from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  )
}