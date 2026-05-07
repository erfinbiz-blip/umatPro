export function calculateTotalTransfer(nominal: number, uniqueCode: number): number {
  return nominal + uniqueCode
}

export function formatUniqueCode(code: number): string {
  return code.toString().padStart(3, '0')
}
