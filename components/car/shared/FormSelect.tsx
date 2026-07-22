// components/admin/cars/shared/FormSelect.tsx
import { SelectHTMLAttributes } from 'react'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  options: string[]
}

export function FormSelect({ label, name, options, ...props }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className="text-[10px] font-semibold uppercase tracking-widest text-gray-500"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs appearance-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}