'use client'

interface ArabesqueBgProps {
  opacity?: number
  className?: string
}

export default function ArabesqueBg({ opacity = 0.04, className = '' }: ArabesqueBgProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        <defs>
          {/* 8-fold geometric Islamic pattern */}
          <pattern id="arabesque" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Outer octagon */}
            <polygon
              points="40,5 55,15 65,30 65,50 55,65 40,75 25,65 15,50 15,30 25,15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            {/* Inner star */}
            <polygon
              points="40,18 46,32 62,32 50,42 54,58 40,48 26,58 30,42 18,32 34,32"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {/* Cross lines */}
            <line x1="40" y1="5" x2="40" y2="75" stroke="currentColor" strokeWidth="0.3" />
            <line x1="5" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="0.3" />
            <line x1="15" y1="15" x2="65" y2="65" stroke="currentColor" strokeWidth="0.3" />
            <line x1="65" y1="15" x2="15" y2="65" stroke="currentColor" strokeWidth="0.3" />
            {/* Corner small diamonds */}
            <polygon points="0,0 5,4 0,8 -5,4" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <polygon points="80,0 85,4 80,8 75,4" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <polygon points="0,80 5,84 0,88 -5,84" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <polygon points="80,80 85,84 80,88 75,84" fill="none" stroke="currentColor" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arabesque)" color="#D4AF37" />
      </svg>
    </div>
  )
}
