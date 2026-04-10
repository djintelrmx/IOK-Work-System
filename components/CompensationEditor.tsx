'use client'
import { useState } from 'react'

interface Assignment {
  id: string
  role_in_job: string | null
  compensation: number
  team_members: { name: string; role: string | null }
}

export default function CompensationEditor({ assignments }: { assignments: Assignment[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(assignments.map(a => [a.id, String(a.compensation ?? 0)]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function save(assignmentId: string) {
    setSaving(assignmentId)
    await fetch(`/api/assignments/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compensation: parseFloat(values[assignmentId]) || 0 }),
    })
    setSaving(null)
    setSaved(assignmentId)
    setTimeout(() => setSaved(null), 2000)
  }

  const total = assignments.reduce((s, a) => s + (parseFloat(values[a.id]) || 0), 0)

  return (
    <div className="space-y-2">
      {assignments.map(a => (
        <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {a.team_members?.name?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{a.team_members?.name}</p>
            <p className="text-xs text-gray-400">{a.role_in_job ?? a.team_members?.role ?? '—'}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="number"
              min="0"
              value={values[a.id]}
              onChange={e => setValues(v => ({ ...v, [a.id]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save(a.id)}
              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="0"
            />
            <span className="text-xs text-gray-400">฿</span>
            <button
              onClick={() => save(a.id)}
              disabled={saving === a.id}
              className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {saving === a.id ? '...' : saved === a.id ? '✓' : 'บันทึก'}
            </button>
          </div>
        </div>
      ))}
      {assignments.length > 1 && (
        <div className="flex justify-end pt-2 border-t border-gray-50">
          <p className="text-sm text-gray-500">รวมค่าตอบแทน: <span className="font-semibold text-indigo-700">{total.toLocaleString('th-TH')} ฿</span></p>
        </div>
      )}
    </div>
  )
}
