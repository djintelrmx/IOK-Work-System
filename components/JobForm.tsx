'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { TeamMember } from '@/types/database'
import { supabase } from '@/lib/supabase'

const JOB_TYPES = ['ไลฟ์สตรีม', 'ถ่ายทอดสดภายใน', 'ถ่ายภาพนิ่ง', 'ผลิตวิดีโอ', 'ระบบเสียง', 'ระบบแสง / สี', 'สื่อมัลติมีเดีย', 'อื่นๆ']
const ROLES = ['ช่างกล้อง', 'ดูแลเสียง', 'ไลฟ์สตรีม', 'ระบบแสง', 'ประสานงาน', 'ตัดต่อ', 'กราฟิก', 'อื่นๆ']

type OrderType = 'letter' | 'direct' | 'other'

const CATEGORY_LABEL: Record<string, string> = {
  photo: '📷 ภาพถ่ายงาน',
  expense: '🧾 ใบเสร็จ/ค่าใช้จ่าย',
  doc: '📄 เอกสาร',
  note: '📝 บันทึก',
}
const CATEGORY_COLOR: Record<string, string> = {
  photo: 'bg-blue-100 text-blue-700',
  expense: 'bg-orange-100 text-orange-700',
  doc: 'bg-gray-100 text-gray-700',
  note: 'bg-purple-100 text-purple-700',
}

interface QueuedFile {
  file: File
  category: string
  preview?: string
}

export default function JobForm({ members }: { members: TeamMember[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [orderType, setOrderType] = useState<OrderType>('letter')
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [jobTypeCustom, setJobTypeCustom] = useState('')
  const [jobType, setJobType] = useState('')

  // File upload state
  const [fileCategory, setFileCategory] = useState('photo')
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  const [noteText, setNoteText] = useState('')
  const [noteAmount, setNoteAmount] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList) {
    const newFiles: QueuedFile[] = Array.from(files).map(file => ({
      file,
      category: fileCategory,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    setQueuedFiles(prev => [...prev, ...newFiles])
  }

  function removeQueued(i: number) {
    setQueuedFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  function addNote() {
    if (!noteText.trim()) return
    const label = noteAmount ? `${noteText} (${Number(noteAmount).toLocaleString('th-TH')} บาท)` : noteText
    setQueuedFiles(prev => [...prev, { file: new File([label], label, { type: 'text/plain' }), category: 'note' }])
    setNoteText('')
    setNoteAmount('')
  }

  async function uploadQueuedFiles(jobId: string) {
    for (const qf of queuedFiles) {
      if (qf.category === 'note') {
        await (supabase as any).from('job_documents').insert({
          job_id: jobId,
          file_name: qf.file.name,
          file_url: '',
          file_type: 'note',
          category: qf.category,
        })
        continue
      }
      const ext = qf.file.name.split('.').pop() ?? 'bin'
      const path = `jobs/${jobId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('job-docs').upload(path, qf.file, { upsert: false })
      if (upErr) { setUploadError('อัปโหลดบางไฟล์ไม่สำเร็จ: ' + upErr.message); continue }
      const { data } = supabase.storage.from('job-docs').getPublicUrl(path)
      let fileType = 'doc'
      if (qf.file.type.startsWith('image/')) fileType = 'image'
      else if (qf.file.type.startsWith('video/')) fileType = 'video'
      else if (qf.file.type === 'application/pdf') fileType = 'pdf'
      await (supabase as any).from('job_documents').insert({
        job_id: jobId,
        file_name: qf.file.name,
        file_url: data.publicUrl,
        file_type: fileType,
        category: qf.category,
      })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setUploadError('')
    const fd = new FormData(e.currentTarget)

    const jobData = {
      title: fd.get('title') as string,
      job_type: fd.get('job_type') as string,
      job_type_custom: fd.get('job_type') === 'อื่นๆ' ? jobTypeCustom : null,
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
      const { jobId } = await res.json()
      if (queuedFiles.length > 0 && jobId) {
        await uploadQueuedFiles(jobId)
      }
      router.push(`/jobs/${jobId}`)
      router.refresh()
    } else {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300'
  const labelCls = 'text-sm font-semibold text-gray-600 block mb-1'

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
            <select name="job_type" required className={inputCls}
              value={jobType}
              onChange={e => { setJobType(e.target.value); if (e.target.value !== 'อื่นๆ') setJobTypeCustom('') }}>
              <option value="">-- เลือกประเภท --</option>
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {jobType === 'อื่นๆ' && (
              <input value={jobTypeCustom} onChange={e => setJobTypeCustom(e.target.value)}
                className={inputCls + ' mt-2'} placeholder="ระบุประเภทงาน เช่น บันทึกเทป, ถ่ายทำโฆษณา..." />
            )}
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
              className={`border-2 rounded-lg p-3 text-center text-sm font-semibold transition-all ${orderType === val ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
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
          <div className="pt-1">
            <label className={labelCls}>ผู้สั่งงาน / หัวหน้า</label>
            <input name="signer_name" placeholder="ชื่อ-นามสกุล ตำแหน่ง" className={inputCls} />
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
      </Section>

      {/* ส่วนที่ 5: แนบเอกสาร / หลักฐาน */}
      <Section title="แนบเอกสาร / หลักฐาน" icon="📎">
        {/* Category selector */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setFileCategory(k)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${fileCategory === k ? CATEGORY_COLOR[k] + ' ring-2 ring-offset-1 ring-current' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {v}
            </button>
          ))}
        </div>

        {fileCategory === 'note' ? (
          <div className="space-y-2">
            <input value={noteText} onChange={e => setNoteText(e.target.value)}
              className={inputCls} placeholder="รายละเอียดค่าใช้จ่าย / บันทึก..." />
            <div className="flex gap-2">
              <input value={noteAmount} onChange={e => setNoteAmount(e.target.value)} type="number"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="จำนวนเงิน (บาท) ถ้ามี" />
              <button type="button" onClick={addNote} disabled={!noteText.trim()}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                เพิ่ม
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg py-4 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            + เลือกไฟล์ (รูป, PDF, Word)
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple className="hidden"
          onChange={e => { if (e.target.files?.length) addFiles(e.target.files); if (fileRef.current) fileRef.current.value = '' }} />

        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        {/* Queued files preview */}
        {queuedFiles.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">ไฟล์ที่จะแนบ ({queuedFiles.length} รายการ)</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {queuedFiles.map((qf, i) => (
                <div key={i} className="relative group border border-gray-100 rounded-lg overflow-hidden">
                  {qf.category === 'note' ? (
                    <div className="h-16 bg-purple-50 flex items-center justify-center p-2">
                      <p className="text-xs text-purple-700 text-center line-clamp-3">{qf.file.name}</p>
                    </div>
                  ) : qf.preview ? (
                    <img src={qf.preview} alt="" className="w-full h-16 object-cover" />
                  ) : (
                    <div className="h-16 bg-gray-50 flex flex-col items-center justify-center gap-1">
                      <span className="text-2xl">📄</span>
                      <p className="text-xs text-gray-500 px-1 truncate w-full text-center">{qf.file.name}</p>
                    </div>
                  )}
                  <span className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[qf.category]}`}>
                    {qf.category}
                  </span>
                  <button type="button" onClick={() => removeQueued(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ปุ่ม */}
      <div className="flex gap-3 pt-2 pb-6">
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {saving ? `กำลังบันทึก${queuedFiles.length > 0 ? ` + อัปโหลด ${queuedFiles.length} ไฟล์...` : '...'}` : '✓ บันทึกใบงาน'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  )
}

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>
}
