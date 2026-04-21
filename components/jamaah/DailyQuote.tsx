'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'
import Glass from '@/components/ui/Glass'
import { getTodayQuote } from '@/lib/quotes/daily'

interface DailyQuoteProps {
  className?: string
}

export default function DailyQuote({ className }: DailyQuoteProps) {
  const [quote, setQuote] = useState(() => getTodayQuote())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setQuote(getTodayQuote())
  }, [])

  async function handleCopy() {
    const text = `"${quote.text}"\n— ${quote.source}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard may be blocked — ignore silently
    }
  }

  return (
    <Glass variant="subtle" rounded="xl" padding="md" className={className}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gd3/15 border border-gd3/25 flex items-center justify-center shrink-0">
          <BookOpen size={16} className="text-gd3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gd3/70 mb-1.5">
            Quote Hari Ini
          </p>
          <p className="text-sm text-tx1 leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-white/50 italic truncate">— {quote.source}</p>
            <button
              onClick={handleCopy}
              aria-label="Salin quote"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/60 hover:text-gd3 hover:bg-gd3/10 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check size={12} /> Disalin
                </>
              ) : (
                <>
                  <Copy size={12} /> Salin
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Glass>
  )
}
