import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    
    const variants = {
      default: "bg-primary-600 text-white hover:bg-primary-700 active:scale-95",
      destructive: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
      outline: "border border-input bg-background hover:bg-secondary-100 active:scale-95",
      secondary: "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 active:scale-95",
      ghost: "hover:bg-secondary-100 active:scale-95",
      link: "underline-offset-4 hover:underline text-primary-600"
    }
    
    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10"
    }

    // Dark mode variants
    const darkVariants = {
      default: "dark:bg-primary-500 dark:hover:bg-primary-600",
      destructive: "dark:bg-red-600 dark:hover:bg-red-700",
      outline: "dark:border-input dark:bg-background dark:hover:bg-secondary-800",
      secondary: "dark:bg-secondary-700 dark:text-secondary-50 dark:hover:bg-secondary-600",
      ghost: "dark:hover:bg-secondary-800",
      link: "dark:text-primary-400"
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          darkVariants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }