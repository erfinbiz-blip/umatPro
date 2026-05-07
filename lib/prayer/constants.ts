export const PRAYER_ORDER = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

export const PRAYER_LABELS: Record<string, string> = {
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
}

export function filterMainPrayers<T extends { name: string }>(prayers: T[]): T[] {
  return prayers.filter((p) => p.name !== 'syuruq')
}
