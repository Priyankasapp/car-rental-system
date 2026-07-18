import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CTASectionProps {
  title: string
  subtitle?: string
  primaryButton: {
    label: string
    href: string
  }
  secondaryButton?: {
    label: string
    href: string
  }
  className?: string
}

export default function CTASection({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  className = ''
}: CTASectionProps) {
  return (
    <section className={cn(
      'py-48 text-center relative overflow-hidden bg-background',
      className
    )}>
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-primary col-span-1" />
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-12 max-w-3xl mx-auto px-5">
        <h2 className="font-display-lg text-display-lg text-primary tracking-tighter">
          {title}
        </h2>
        {subtitle && (
          <p className="font-body-lg text-body-lg text-text-secondary italic">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link
            href={primaryButton.href}
            className="w-full sm:w-auto bg-primary text-on-primary px-12 py-5 font-label-sm text-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity text-center"
          >
            {primaryButton.label}
          </Link>
          {secondaryButton && (
            <Link
              href={secondaryButton.href}
              className="w-full sm:w-auto border border-primary text-primary px-12 py-5 font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-center"
            >
              {secondaryButton.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}