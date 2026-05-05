import { cn } from '@/lib/cn'

interface SectionHeaderProps {
  label?: string
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        align === 'center' && 'text-center',
        className
      )}
    >
      {label && (
        <p className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-brand">
          {label}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8E8F0] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-base text-[#C8C8DC] leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
