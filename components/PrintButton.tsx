'use client'

interface PrintButtonProps {
  label?: string
  className?: string
}

export default function PrintButton({ label = '🖨️ พิมพ์ / PDF', className }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={className ?? 'flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors font-medium min-w-[100px]'}
    >
      {label}
    </button>
  )
}
