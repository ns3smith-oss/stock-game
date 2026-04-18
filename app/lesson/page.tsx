'use client'

import Link from 'next/link'
import { LessonFlow } from '@/components/LessonFlow'

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="px-4 pt-4 pb-2">
        <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
          ← Back to quests
        </Link>
      </div>

      {/* Lesson content */}
      <div className="px-4 py-4">
        <LessonFlow />
      </div>
    </div>
  )
}
