// components/admin/cars/shared/FormInput.tsx
import { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
}

export function FormInput({ label, name, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className="text-[10px] font-semibold uppercase tracking-widest text-gray-500"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="w-full bg-gray-50 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors py-3 text-xs"
        {...props}
      />
    </div>
  )
}