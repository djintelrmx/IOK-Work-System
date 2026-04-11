'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'in_progress', label: 'กำลังทำ' },
  { value: 'done', label: 'เสร็จแล้ว' },
]

interface Job { id: string; title: string; status: string }

export default function BulkJobActions({ jobs }: { jobs: Job[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const toggle = (id: string) => setSelected(prev => {
    const s = new Set(prev)
    s.has(id) ? s.delete(id) : s.add(id)
    return s
  })
  const toggleAll = () => setSelected(prev => prev.size === jobs.length ? new Set() : new Set(jobs.map(j => j.id)))

  async function bulkUpdate(status: string) {
    if (!selected.size) return
    setSaving(true)
    await fetch('/api/jobs/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), status }),
    })
    setSaving(false)
    setSelected(new Set())
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 rounded-xl border border-indigo-100 flex-wrap">
          <span className="text-sm font-medium text-indigo-700">เลือก {selected.size} งาน</span>
          <div className="flex-1" />
          <span className="text-xs text-indigo-400">เปลี่ยนสถานะเป็น:</span>
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => bulkUpdate(s.value)} disabled={saving}
              className="text-xs px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 font-medium">
              {saving ? '...' : s.label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())}
            className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-700">ยกเลิก</button>
        </div>
      )}

      {/* Job rows with checkboxes */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-3">
          <input type="checkbox" checked={selected.size === jobs.length && jobs.length > 0}
            onChange={toggleAll} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300" />
          <span className="text-xs text-gray-400">เลือกทั้งหมด</span>
        </div>
        <div className="divide-y divide-gray-50">
          {jobs.map(job => (
            <label key={job.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected.has(job.id) ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
              <input type="checkbox" checked={selected.has(job.id)} onChange={() => toggle(job.id)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-800 truncate">{job.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
