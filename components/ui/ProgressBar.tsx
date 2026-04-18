import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number        // 0–100
  color?: string
  height?: string
  className?: string
}

export function ProgressBar({
  value,
  color = 'bg-gold',
  height = 'h-3',
  className,
}: ProgressBarProps) {
  return (
    <div className={cn('w-full bg-white/20 rounded-full overflow-hidden', height, className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
