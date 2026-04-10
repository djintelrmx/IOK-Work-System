'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { QuotationStatus } from '@/types/database'

const STATUSES: { value: QuotationStatus; label: string; color: string; active: string }[] = [
  { value: 'draft',     label: 'ร่าง',    color: 'bg-gray-50 text-gray-500 hover:bg-gray-100',   active: 'bg-gray-200 text-gray-700 ring-2 ring-gray-400' },
  { value: 'sent',      label: 'ส่งแล้ว', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',   active: 'bg-blue-200 text-blue-800 ring-2 ring-blue-400' },
  { value: 'approved',  label: 'อนุมัติ', color: 'bg-green-50 text-green-600 hover:bg-green-100',active: 'bg-green-200 text-green-800 ring-2 ring-green-500' },
  { value: 'rejected',  label: 'ปฏิเสธ', color: 'bg-red-50 text-red-500 hover:bg-red-100',       active: 'bg-red-200 text-red-700 ring-2 ring-red-400' },
  { value: 'cancelled', label: 'ยกเลิก', color: 'bg-gray-50 text-gray-400 hover:bg-gray-100',    active: 'bg-gray-200 text-gray-600 ring-2 ring-gray-300' },
]

export default function QuotationStatusForm({ quotationId, currentStatus }: { quotationId: string; currentStatus: QuotationStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function changeStatus(status: QuotationStatus) {
    if (status === currentStatus) return
    setLoading(true)
    await fetch(`/api/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.map(s => (
        <button key={s.value} type="button" onClick={() => changeStatus(s.value)}
          disabled={loading || s.value === currentStatus}
          className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all disabled:cursor-default ${s.value === currentStatus ? s.active : s.color}`}>
          {s.value === currentStatus && '✓ '}{s.label}
        </button>
      ))}
    </div>
  )
}
