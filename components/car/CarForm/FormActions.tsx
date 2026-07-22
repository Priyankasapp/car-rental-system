// components/admin/cars/CarForm/FormActions.tsx
import { Loader2, CheckCircle } from 'lucide-react'

interface FormActionsProps {
  isSubmitting: boolean
  isLoading: boolean
  submitSuccess: boolean
}

export function FormActions({ isSubmitting, isLoading, submitSuccess }: FormActionsProps) {
  return (
    <div className="space-y-4 pt-4">
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Registering...
          </span>
        ) : submitSuccess ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Registered Successfully!
          </span>
        ) : (
          'Register Vehicle'
        )}
      </button>
      <button
        type="button"
        className="w-full bg-transparent text-gray-500 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Save as Draft
      </button>
    </div>
  )
}