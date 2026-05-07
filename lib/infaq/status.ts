export function getStatusBadge(
  status: string,
  isExpired: boolean
): { label: string; className: string } {
  if (status === 'verified') {
    return { label: '✓ Terverifikasi', className: 'badge-approved' }
  }
  if (status === 'rejected') {
    return { label: '✗ Ditolak', className: 'badge-rejected' }
  }
  if (isExpired) {
    return {
      label: 'Kadaluarsa',
      className:
        'text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30',
    }
  }
  return { label: '⏳ Menunggu', className: 'badge-pending' }
}
