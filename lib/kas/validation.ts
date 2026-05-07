export function validateKasAmount(amount: number): boolean {
  return amount >= 100
}

export function validateDescription(desc: string): boolean {
  return desc.trim().length > 0
}
