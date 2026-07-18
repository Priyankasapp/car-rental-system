import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Icon from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-primary mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Icon name={icon} className="text-text-secondary" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-brand border border-border',
              'bg-transparent focus:outline-none focus:ring-0 focus:border-primary',
              'text-primary placeholder:text-text-secondary',
              'transition-colors duration-300',
              icon && 'pl-12',
              error && 'border-error',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input