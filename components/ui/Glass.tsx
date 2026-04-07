'use client'

import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'gold' | 'subtle'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const Glass = forwardRef<HTMLDivElement, GlassProps>(
  ({ className, variant = 'default', padding = 'md', rounded = 'xl', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          // Base glassmorphism
          'relative overflow-hidden',
          'backdrop-blur-md border',
          // Variant styles
          {
            'bg-white/5 border-white/10': variant === 'default',
            'bg-black/30 border-white/5': variant === 'dark',
            'bg-gd3/10 border-gd3/30': variant === 'gold',
            'bg-white/3 border-white/5': variant === 'subtle',
          },
          // Padding
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4 md:p-5': padding === 'md',
            'p-6 md:p-8': padding === 'lg',
          },
          // Rounded
          {
            'rounded-sm': rounded === 'sm',
            'rounded-md': rounded === 'md',
            'rounded-lg': rounded === 'lg',
            'rounded-xl': rounded === 'xl',
            'rounded-2xl': rounded === '2xl',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Glass.displayName = 'Glass'

export default Glass
