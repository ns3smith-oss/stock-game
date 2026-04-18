import Link from 'next/link'
import { cn } from '@/lib/utils'

export type ModuleStatus = 'locked' | 'available' | 'complete'

interface ModuleCardProps {
  title: string
  description: string
  icon: string
  xpReward: number
  status: ModuleStatus
  href: string
  accentColor: string // Tailwind border color class
}

export function ModuleCard({
  title,
  description,
  icon,
  xpReward,
  status,
  href,
  accentColor,
}: ModuleCardProps) {
  const isLocked = status === 'locked'
  const isComplete = status === 'complete'

  const card = (
    <div
      className={cn(
        'relative flex items-start gap-4 bg-white/10 rounded-3xl p-5 border-l-4 transition-all',
        accentColor,
        isLocked && 'opacity-50 cursor-not-allowed',
        !isLocked && 'cursor-pointer hover:bg-white/20',
        status === 'available' && 'animate-pulseGlow'
      )}
    >
      {/* Icon */}
      <div className="text-5xl flex-shrink-0 select-none">{icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
          {status === 'available' && (
            <span className="text-xs bg-gold text-navy font-bold px-2 py-0.5 rounded-full">
              START
            </span>
          )}
        </div>
        <p className="text-gray-300 text-sm leading-snug">{description}</p>
        <div className="mt-2 text-gold text-xs font-semibold">+{xpReward} XP</div>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 text-2xl">
        {isLocked && '🔒'}
        {isComplete && '✅'}
        {status === 'available' && '▶️'}
      </div>
    </div>
  )

  if (isLocked) return card
  return <Link href={href} className="block">{card}</Link>
}
