'use client'

import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base
          'inline-flex items-center justify-center gap-2 font-body font-semibold',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gd3/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          {
            // Gold primary
            'bg-gradient-to-r from-gd3 to-gd4 text-em1 shadow-lg shadow-gd3/20 hover:shadow-gd3/40 hover:scale-[1.02] active:scale-[0.98]':
              variant === 'primary',
            // Gold outline
            'border border-gd3/50 text-gd3 bg-transparent hover:bg-gd3/10 hover:border-gd3':
              variant === 'outline',
            // Ghost
            'text-gd4 bg-transparent hover:bg-gd3/10': variant === 'ghost',
          },
          // Sizes
          {
            'h-8 px-3 text-sm rounded-lg': size === 'sm',
            'h-11 px-5 text-base rounded-xl': size === 'md',
            'h-13 px-7 text-lg rounded-xl': size === 'lg',
          },
          // Full width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Memproses...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

GoldButton.displayName = 'GoldButton'

export default GoldButton
