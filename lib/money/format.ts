export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function parseAmountInput(input: string): number {
  return parseInt(input.replace(/\D/g, ''), 10) || 0
}

export function formatAmountInput(amount: number): string {
  return amount.toLocaleString('id-ID')
}
