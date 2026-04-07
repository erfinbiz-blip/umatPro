// Prayer time → adaptive background gradient mapping
// Creates a living, breathing visual atmosphere tied to the time of worship

export type AtmosphereKey = 'fajr' | 'duha' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface AtmosphereConfig {
  key: AtmosphereKey
  label: string
  gradient: string
  textColor: string
}

export const ATMOSPHERES: Record<AtmosphereKey, AtmosphereConfig> = {
  fajr: {
    key: 'fajr',
    label: 'Fajar',
    gradient: 'linear-gradient(135deg, #0a0e2e 0%, #1a2050 40%, #0d2a4a 100%)',
    textColor: '#c8d8ff',
  },
  duha: {
    key: 'duha',
    label: 'Duha',
    gradient: 'linear-gradient(135deg, #1a1208 0%, #2d1f08 40%, #064E3B 100%)',
    textColor: '#e8d4a0',
  },
  dhuhr: {
    key: 'dhuhr',
    label: 'Zuhur',
    gradient: 'linear-gradient(135deg, #022D1A 0%, #064E3B 50%, #0A6B4A 100%)',
    textColor: '#F8F6F0',
  },
  asr: {
    key: 'asr',
    label: 'Ashar',
    gradient: 'linear-gradient(135deg, #1a2a0a 0%, #2a3a12 40%, #064E3B 100%)',
    textColor: '#d4e8b0',
  },
  maghrib: {
    key: 'maghrib',
    label: 'Maghrib',
    gradient: 'linear-gradient(135deg, #2d1508 0%, #3d2010 40%, #0A6B4A 100%)',
    textColor: '#f0c890',
  },
  isha: {
    key: 'isha',
    label: "Isya'",
    gradient: 'linear-gradient(135deg, #060D08 0%, #0a1a10 50%, #022D1A 100%)',
    textColor: '#a0c8b0',
  },
}

/**
 * Maps current hour to atmosphere key.
 * Fajr: 04-06, Duha: 06-12, Dhuhr: 12-15, Asr: 15-18, Maghrib: 18-20, Isha: 20-04
 */
export function getCurrentAtmosphere(hour?: number): AtmosphereConfig {
  const h = hour ?? new Date().getHours()

  if (h >= 4 && h < 6) return ATMOSPHERES.fajr
  if (h >= 6 && h < 12) return ATMOSPHERES.duha
  if (h >= 12 && h < 15) return ATMOSPHERES.dhuhr
  if (h >= 15 && h < 18) return ATMOSPHERES.asr
  if (h >= 18 && h < 20) return ATMOSPHERES.maghrib
  return ATMOSPHERES.isha
}

export function getAtmosphereForPrayer(prayer: string): AtmosphereConfig {
  const map: Record<string, AtmosphereKey> = {
    subuh: 'fajr',
    fajr: 'fajr',
    syuruq: 'duha',
    dzuhur: 'dhuhr',
    dhuhr: 'dhuhr',
    ashar: 'asr',
    asr: 'asr',
    maghrib: 'maghrib',
    isya: 'isha',
    isha: 'isha',
  }
  const key = map[prayer.toLowerCase()] ?? 'dhuhr'
  return ATMOSPHERES[key]
}
