'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { JobDocument } from '@/types/database'

const CATEGORY_LABEL: Record<string, string> = {
  photo: '📷 ภาพถ่ายงาน',
  expense: '🧾 ใบเสร็จ/ค่าใช้จ่าย',
  doc: '📄 เอกสาร',
  note: '📝 บันทึก/หมายเหตุ',
}
const CATEGORY_COLOR: Record<string, string> = {
  photo: 'bg-blue-100 text-blue-700',
  expense: 'bg-orange-100 text-orange-700',
  doc: 'bg-gray-100 text-gray-700',
  note: 'bg-purple-100 text-purple-700',
}
const FILE_ICON: Record<string, string> = { image: '🖼️', video: '🎬', pdf: '📄', link: '🔗', note: '📝' }

interface Props {
  jobId: string
  initialDocs: JobDocument[]
  canEdit: boolean
}

export default function JobDocsUploader({ jobId, initialDocs, canEdit }: Props) {
  const [docs, setDocs] = useState<JobDocument[]>(initialDocs)
  const [category, setCategory] = useState<string>('photo')
  const [noteText, setNoteText] = useState('')
  const [noteAmount, setNoteAmount] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    setError('')
    try {
      // supabase client available from import
      const ext = file.name.split('.').pop()
      const path = `jobs/${jobId}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('job-docs').upload(path, file, { upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('job-docs').getPublicUrl(path)

      let fileType: string
      if (file.type.startsWith('image/')) fileType = 'image'
      else if (file.type.startsWith('video/')) fileType = 'video'
      else if (file.type === 'application/pdf') fileType = 'pdf'
      else fileType = 'doc'

      const { data: doc, error: dbErr } = await (supabase as any)
        .from('job_documents')
        .insert({ job_id: jobId, file_name: file.name, file_url: data.publicUrl, file_type: fileType, category })
        .select()
        .single()
      if (dbErr) throw dbErr
      setDocs(prev => [doc as JobDocument, ...prev])
    } catch (e: any) {
      setError('อัปโหลดไม่สำเร็จ: ' + (e.message ?? 'กรุณาสร้าง bucket "job-docs" ใน Supabase Storage'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveNote() {
    if (!noteText.trim()) return
    setUploading(true)
    setError('')
    try {
      // supabase client available from import
      const label = noteAmount ? `${noteText} (${Number(noteAmount).toLocaleString('th-TH')} บาท)` : noteText
      const { data: doc, error: dbErr } = await (supabase as any)
        .from('job_documents')
        .insert({ job_id: jobId, file_name: label, file_url: '', file_type: 'note', category })
        .select()
        .single()
      if (dbErr) throw dbErr
      setDocs(prev => [doc as JobDocument, ...prev])
      setNoteText('')
      setNoteAmount('')
    } catch (e: any) {
      setError('บันทึกไม่สำเร็จ: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  async function deleteDoc(docId: string) {
    await (supabase as any).from('job_documents').delete().eq('id', docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  const grouped = docs.reduce<Record<string, JobDocument[]>>((acc, d) => {
    const cat = (d as any).category ?? 'doc'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(d)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <h2 className="font-semibold text-gray-700">เอกสาร / หลักฐาน ({docs.length} รายการ)</h2>

      {canEdit && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {/* Category selector */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setCategory(k)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${category === k ? CATEGORY_COLOR[k] + ' ring-2 ring-offset-1 ring-current' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {v}
              </button>
            ))}
          </div>

          {category === 'note' ? (
            <div className="space-y-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="รายละเอียดค่าใช้จ่าย / บันทึก..." />
              <div className="flex gap-2">
                <input value={noteAmount} onChange={e => setNoteAmount(e.target.value)} type="number"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="จำนวนเงิน (บาท) ถ้ามี" />
                <button onClick={saveNote} disabled={uploading || !noteText.trim()}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  บันทึก
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg py-3 text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
                {uploading ? '⏳ กำลังอัปโหลด...' : '+ เลือกไฟล์'}
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* Doc list grouped by category */}
      {docs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีเอกสาร</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catDocs]) => (
            <div key={cat}>
              <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2 ${CATEGORY_COLOR[cat] ?? 'bg-gray-100 text-gray-600'}`}>
                {CATEGORY_LABEL[cat] ?? cat}
              </p>
              {cat === 'note' ? (
                <div className="space-y-1.5">
                  {catDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between gap-2 bg-purple-50 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-700 flex-1">{doc.file_name}</p>
                      {canEdit && (
                        <button onClick={() => deleteDoc(doc.id)} className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {catDocs.map(doc => (
                    <div key={doc.id} className="relative group border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        {doc.file_type === 'image' ? (
                          <img src={doc.file_url} alt={doc.file_name} className="w-full h-20 object-cover" />
                        ) : (
                          <div className="h-20 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-3xl">
                            {FILE_ICON[doc.file_type ?? ''] ?? '📄'}
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-700 truncate">{doc.file_name}</p>
                        </div>
                      </a>
                      {canEdit && (
                        <button onClick={() => deleteDoc(doc.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
