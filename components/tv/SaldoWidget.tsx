'use client'

import LiquidCounter from '@/components/ui/LiquidCounter'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatRupiah } from '@/lib/infaq/code'

interface SaldoWidgetProps {
  saldo: number
  totalIn: number
  totalOut: number
  lastUpdated?: Date
  isOffline?: boolean
}

export default function SaldoWidget({
  saldo,
  totalIn,
  totalOut,
  lastUpdated,
  isOffline = false,
}: SaldoWidgetProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/50 uppercase tracking-widest">Kas Masjid</p>
        {isOffline && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
            Data tersimpan
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-4xl font-display font-bold text-gd3">
          Rp{' '}
          <LiquidCounter
            value={saldo}
            formatter={(v) => v.toLocaleString('id-ID')}
            className="tabular-nums"
          />
        </p>
        <p className="text-xs text-white/30 mt-1">Terverifikasi & transparan</p>
      </div>

      <div className="flex gap-4 pt-3 border-t border-white/10">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-em4 text-xs mb-0.5">
            <TrendingUp size={10} /> Masuk
          </div>
          <p className="text-sm font-semibold text-tx1 truncate">{formatRupiah(totalIn)}</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-red-400 text-xs mb-0.5">
            <TrendingDown size={10} /> Keluar
          </div>
          <p className="text-sm font-semibold text-tx1 truncate">{formatRupiah(totalOut)}</p>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-white/20 mt-2">
          Data per {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
