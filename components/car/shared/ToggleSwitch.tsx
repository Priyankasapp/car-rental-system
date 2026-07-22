// components/admin/cars/shared/ToggleSwitch.tsx
interface ToggleSwitchProps {
  isActive: boolean
  onToggle: () => void
  label: string
}

export function ToggleSwitch({ isActive, onToggle, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
          isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
            isActive ? 'right-1' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}