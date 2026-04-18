import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function Badge({ label, color = 'bg-gold text-navy', className }: BadgeProps) {
  return (
    <span className={cn('text-xs font-bold px-2 py-1 rounded-full', color, className)}>
      {label}
    </span>
  )
}
