'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentAtmosphere, type AtmosphereConfig } from '@/lib/atmosphere'

const AtmosphereContext = createContext<AtmosphereConfig | null>(null)

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext)
  if (!ctx) throw new Error('useAtmosphere must be inside AtmosphereProvider')
  return ctx
}

export default function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphere] = useState<AtmosphereConfig>(getCurrentAtmosphere())

  useEffect(() => {
    // Update atmosphere when minute changes
    const interval = setInterval(() => {
      setAtmosphere(getCurrentAtmosphere())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AtmosphereContext.Provider value={atmosphere}>
      <div
        className="atmosphere-bg min-h-dvh"
        style={{ background: atmosphere.gradient }}
      >
        {children}
      </div>
    </AtmosphereContext.Provider>
  )
}
