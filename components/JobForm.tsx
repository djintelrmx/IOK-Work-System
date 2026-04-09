'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TeamMember } from '@/types/database'

const JOB_TYPES = ['ไลฟ์สตรีม', 'ถ่ายทอดสดภายใน', 'ถ่ายภาพนิ่ง', 'ผลิตวิดีโอ', 'ระบบเสียง', 'ระบบแสง / สี', 'สื่อมัลติมีเดีย', 'อื่นๆ']
const ROLES = ['ช่างกล้อง', 'ดูแลเสียง', 'ไลฟ์สตรีม', 'ระบบแสง', 'ประสานงาน', 'ตัดต่อ', 'กราฟิก', 'อื่นๆ']

type OrderType = 'letter' | 'direct' | 'other'

export default function JobForm({ members }: { members: TeamMember[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [orderType, setOrderType] = useState<OrderType>('letter')
  const [assignments, setAssignments] = useState<Record<string, string>>({}) // member_id → role

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)

    const jobData = {
      title: fd.get('title') as string,
      job_type: fd.get('job_type') as string,
      source: fd.get('source') as string,
      client_org: fd.get('client_org') as string,
      location: fd.get('location') as string || null,
      job_date: fd.get('job_date') as string,
      job_time_start: fd.get('job_time_start') as string || null,
      job_time_end: fd.get('job_time_end') as string || null,
      order_type: orderType,
      doc_number: fd.get('doc_number') as string || null,
      doc_date: fd.get('doc_date') as string || null,
      signer_name: fd.get('signer_name') as string || null,
      approver_name: fd.get('approver_name') as string || null,
      supervisor_name: fd.get('supervisor_name') as string || null,
      income: Number(fd.get('income') ?? 0),
      expense: Number(fd.get('expense') ?? 0),
      status: 'pending',
    }

    const assignmentList = Object.entries(assignments)
      .filter(([, role]) => role)
      .map(([member_id, role_in_job]) => ({ member_id, role_in_job }))

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...jobData, assignments: assignmentList }),
    })

    if (res.ok) {
      router.push('/jobs')
      router.refresh()
    } else {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'
  const labelCls = 'text-xs font-semibold text-gray-600 block mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ส่วนที่ 1: ข้อมูลงาน */}
      <Section title="ข้อมูลงาน" icon="📋">
        <div>
          <label className={labelCls}>ชื่องาน / เรื่อง <Required /></label>
          <input name="title" required placeholder="เช่น ถ่ายทอดสดพิธีรับปริญญา 2568" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>ประเภทงาน <Required /></label>
            <select name="job_type" required className={inputCls}>
              <option value="">-- เลือกประเภท --</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>แหล่งที่มาของงาน <Required /></label>
            <select name="source" required className={inputCls}>
              <option value="">-- เลือก --</option>
              <option>ภายในมหาวิทยาลัย</option>
              <option>ภายนอกมหาวิทยาลัย</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>หน่วยงาน / ผู้ว่าจ้าง <Required /></label>
          <input name="client_org" required placeholder="เช่น คณะบริหารธุรกิจ, บริษัท ABC จำกัด" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>วันที่ปฏิบัติงาน <Required /></label>
            <input name="job_date" type="date" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>สถานที่</label>
            <input name="location" placeholder="เช่น หอประชุมใหญ่" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>เวลาเริ่ม</label>
            <input name="job_time_start" type="time" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>เวลาสิ้นสุด</label>
            <input name="job_time_end" type="time" className={inputCls} />
          </div>
        </div>
      </Section>

      {/* ส่วนที่ 2: รูปแบบการสั่งงาน */}
      <Section title="รูปแบบการสั่งงาน" icon="📄">
        <div className="grid grid-cols-3 gap-2">
          {([['letter', '📨', 'ผ่านหนังสือ'], ['direct', '🗣️', 'หัวหน้าสั่งโดยตรง'], ['other', '💬', 'อื่นๆ']] as const).map(([val, emoji, label]) => (
            <button key={val} type="button" onClick={() => setOrderType(val)}
              className={`border-2 rounded-lg p-3 text-center text-xs font-semibold transition-all ${orderType === val ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <span className="block text-xl mb-1">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {orderType === 'letter' && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>เลขที่หนังสือ</label>
                <input name="doc_number" placeholder="เช่น กบ.0001/2568" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>วันที่ในหนังสือ</label>
                <input name="doc_date" type="date" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ผู้ลงนามในหนังสือ</label>
                <input name="signer_name" placeholder="เช่น คณบดี, อธิการบดี" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ผู้อนุมัติงาน</label>
                <input name="approver_name" placeholder="ชื่อ-ตำแหน่ง (ถ้ามี)" className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {(orderType === 'direct' || orderType === 'other') && (
          <div className="space-y-3 pt-1">
            <div>
              <label className={labelCls}>ผู้สั่งงาน / หัวหน้า</label>
              <input name="signer_name" placeholder="ชื่อ-นามสกุล ตำแหน่ง" className={inputCls} />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>หัวหน้างานผู้จ่ายงานให้ทีม <Required /></label>
          <input name="supervisor_name" required placeholder="ชื่อ-นามสกุล" className={inputCls} />
        </div>
      </Section>

      {/* ส่วนที่ 3: การเงิน */}
      <Section title="การเงิน" icon="💰">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>รายได้ / ค่าตอบแทน (บาท)</label>
            <input name="income" type="number" min="0" defaultValue="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ประมาณการรายจ่าย (บาท)</label>
            <input name="expense" type="number" min="0" defaultValue="0" className={inputCls} />
          </div>
        </div>
      </Section>

      {/* ส่วนที่ 4: มอบหมายทีมงาน */}
      <Section title="มอบหมายทีมงาน" icon="👥">
        {members.length === 0 ? (
          <p className="text-sm text-gray-400">ยังไม่มีทีมงานในระบบ</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                <input type="checkbox"
                  className="accent-indigo-600 w-4 h-4 flex-shrink-0"
                  checked={m.id in assignments}
                  onChange={e => {
                    if (e.target.checked) setAssignments(p => ({ ...p, [m.id]: '' }))
                    else setAssignments(p => { const n = { ...p }; delete n[m.id]; return n })
                  }} />
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <span className="text-sm flex-1">{m.name}</span>
                {m.id in assignments && (
                  <select
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                    value={assignments[m.id]}
                    onChange={e => setAssignments(p => ({ ...p, [m.id]: e.target.value }))}>
                    <option value="">เลือกบทบาท</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>📅</span> ระบบจะเพิ่มงานลงปฏิทิน Google ให้ทีมงานที่เลือกอัตโนมัติ (เร็วๆ นี้)
        </p>
      </Section>

      {/* ปุ่ม */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {saving ? 'กำลังบันทึก...' : '✓ บันทึก + มอบหมายทีมงาน'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  )
}

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>
}
