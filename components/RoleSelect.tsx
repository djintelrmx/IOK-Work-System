'use client'
import { useState } from 'react'

export const ROLES = [
  'ช่างกล้อง', 'ดูแลเสียง', 'ไลฟ์สตรีม', 'ระบบแสง',
  'ตัดต่อวิดีโอ', 'ผู้ประสานงาน', 'ผู้ดูแลระบบ', 'อื่นๆ',
]

interface RoleSelectProps {
  name?: string
  defaultValue?: string | null
  className?: string
}

export default function RoleSelect({ name = 'role', defaultValue, className }: RoleSelectProps) {
  const predefined = ROLES.slice(0, -1) // ไม่รวม อื่นๆ
  const isOther = !!defaultValue && !predefined.includes(defaultValue)

  const [selected, setSelected] = useState(isOther ? 'อื่นๆ' : (defaultValue ?? ''))
  const [custom, setCustom] = useState(isOther ? (defaultValue ?? '') : '')

  const actualValue = selected === 'อื่นๆ' ? custom : selected

  return (
    <div className="space-y-2">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className={className ?? 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white'}
      >
        <option value="">— ไม่ระบุ —</option>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {selected === 'อื่นๆ' && (
        <input
          type="text"
          placeholder="ระบุบทบาท..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          autoFocus
        />
      )}
      <input type="hidden" name={name} value={actualValue} />
    </div>
  )
}
