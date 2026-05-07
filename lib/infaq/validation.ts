export function parseAmountInput(input: string): number {
  return parseInt(input.replace(/\D/g, ''), 10) || 0
}

export function validateMinAmount(amount: number, min = 5000): boolean {
  return amount >= min
}

export function isExpired(expiresAt: string | Date): boolean {
  const date = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return date.getTime() < Date.now()
}
