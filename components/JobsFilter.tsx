'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface Props {
  initialQ: string
  initialStatus: string
  initialSource: string
  initialFrom: string
  initialTo: string
}

export default function JobsFilter({ initialQ, initialStatus, initialSource, initialFrom, initialTo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(initialQ)
  const [status, setStatus] = useState(initialStatus)
  const [source, setSource] = useState(initialSource)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)

  function apply(overrides?: Partial<{ q: string; status: string; source: string; from: string; to: string }>) {
    const params = new URLSearchParams()
    const vals = { q, status, source, from, to, ...overrides }
    if (vals.q) params.set('q', vals.q)
    if (vals.status) params.set('status', vals.status)
    if (vals.source) params.set('source', vals.source)
    if (vals.from) params.set('from', vals.from)
    if (vals.to) params.set('to', vals.to)
    router.push(`${pathname}?${params.toString()}`)
  }

  function reset() {
    setQ(''); setStatus(''); setSource(''); setFrom(''); setTo('')
    router.push(pathname)
  }

  const hasFilter = q || status || source || from || to

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="🔍 ค้นหาชื่องาน, หน่วยงาน..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button onClick={() => apply()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          ค้นหา
        </button>
        {hasFilter && (
          <button onClick={reset}
            className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            ล้าง
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={status} onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="in_progress">กำลังทำ</option>
          <option value="done">เสร็จแล้ว</option>
        </select>

        <select value={source} onChange={e => { setSource(e.target.value); apply({ source: e.target.value }) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
          <option value="">ทุกแหล่งงาน</option>
          <option value="ภายในมหาวิทยาลัย">ภายในมหาวิทยาลัย</option>
          <option value="ภายนอกมหาวิทยาลัย">ภายนอกมหาวิทยาลัย</option>
        </select>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span>จาก</span>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); apply({ from: e.target.value }) }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <span>ถึง</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); apply({ to: e.target.value }) }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>
    </div>
  )
}
