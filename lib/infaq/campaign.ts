export function calculateProgress(raised: number, target: number | null): number | null {
  if (target === null) return null
  if (target === 0) return raised > 0 ? 100 : 0
  const progress = (raised / target) * 100
  return Math.max(0, Math.min(progress, 100))
}
