'use client'

import { useEffect, useRef, useState } from 'react'

interface LiquidCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  formatter?: (value: number) => string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function LiquidCounter({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
  formatter,
}: LiquidCounterProps) {
  const [displayed, setDisplayed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    startValueRef.current = displayed
    startRef.current = null

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp

      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const current = Math.round(startValueRef.current + (value - startValueRef.current) * eased)

      setDisplayed(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const formatted = formatter
    ? formatter(displayed)
    : displayed.toLocaleString('id-ID')

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
