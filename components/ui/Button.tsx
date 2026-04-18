import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-brand-blue text-white hover:bg-indigo-500',
    secondary: 'bg-white text-navy border-2 border-gray-200 hover:border-brand-blue',
    success:   'bg-success text-white hover:bg-green-400',
    danger:    'bg-danger text-white hover:bg-red-400',
    ghost:     'bg-transparent text-gray-400 hover:text-white',
  }

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg w-full',
  }

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
