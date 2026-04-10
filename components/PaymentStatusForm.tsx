'use client'
import { useState } from 'react'

type PaymentStatus = 'unpaid' | 'partial' | 'paid'

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; active: string }> = {
  unpaid:  { label: 'ยังไม่ชำระ',    color: 'bg-red-50 text-red-600 hover:bg-red-100',      active: 'bg-red-500 text-white ring-2 ring-red-400' },
  partial: { label: 'ชำระบางส่วน',   color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', active: 'bg-yellow-500 text-white ring-2 ring-yellow-400' },
  paid:    { label: 'ชำระแล้ว ✓',    color: 'bg-green-50 text-green-700 hover:bg-green-100', active: 'bg-green-500 text-white ring-2 ring-green-400' },
}

interface Props {
  jobId: string
  initialStatus: PaymentStatus
  initialDate?: string | null
  initialNote?: string | null
}

export default function PaymentStatusForm({ jobId, initialStatus, initialDate, initialNote }: Props) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus ?? 'unpaid')
  const [date, setDate] = useState(initialDate ?? '')
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(newStatus: PaymentStatus) {
    setSaving(true)
    setStatus(newStatus)
    await fetch(`/api/jobs/${jobId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: newStatus, payment_date: date || null, payment_note: note || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveDetails() {
    setSaving(true)
    await fetch(`/api/jobs/${jobId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: status, payment_date: date || null, payment_note: note || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">สถานะการชำระเงิน</h2>
        {saved && <span className="text-sm text-green-600 font-medium">✓ บันทึกแล้ว</span>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(STATUS_CONFIG) as PaymentStatus[]).map(s => (
          <button key={s} onClick={() => save(s)} disabled={saving}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all disabled:opacity-60 ${status === s ? STATUS_CONFIG[s].active : STATUS_CONFIG[s].color}`}>
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {(status === 'partial' || status === 'paid') && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">วันที่รับเงิน</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">หมายเหตุการชำระ</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="เช่น โอนผ่านบัญชีธนาคาร, เช็คเลขที่..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <button onClick={saveDetails} disabled={saving}
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? 'กำลังบันทึก...' : 'บันทึกรายละเอียด'}
          </button>
        </div>
      )}
    </div>
  )
}
