export function RecentActivity() {
  const activities = [
    { user: 'John Doe', action: 'Booked a Tesla Model 3', time: '2 hours ago' },
    { user: 'Jane Smith', action: 'Rented a BMW 7 Series', time: '4 hours ago' },
    { user: 'Mike Johnson', action: 'Cancelled a Mercedes S-Class', time: '6 hours ago' },
    { user: 'Sarah Wilson', action: 'Extended her rental', time: '1 day ago' },
  ]

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between pb-4 border-b border-secondary-100 dark:border-secondary-700 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-secondary-900 dark:text-white">
                {activity.user}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                {activity.action}
              </p>
            </div>
            <span className="text-xs text-secondary-500 dark:text-secondary-400">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}