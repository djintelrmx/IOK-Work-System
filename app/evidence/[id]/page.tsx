'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Doc {
  id: string
  file_name: string
  file_url: string
  file_type: string | null
  category: string | null
  created_at: string
}

interface Job {
  id: string
  job_number: string | null
  title: string
  job_date: string
  client_org: string
}

const TABS = [
  { key: 'photo',   label: 'รูปถ่าย',       icon: '📷' },
  { key: 'doc',     label: 'เอกสาร',        icon: '📄' },
  { key: 'expense', label: 'บิล/ใบเสร็จ',   icon: '🧾' },
  { key: 'note',    label: 'บันทึก',         icon: '📝' },
]

export default function EvidenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [tab, setTab] = useState('photo')
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: jobData }, { data: docData }] = await Promise.all([
        (supabase as any).from('jobs').select('id, job_number, title, job_date, client_org').eq('id', id).single(),
        (supabase as any).from('job_documents').select('*').eq('job_id', id).order('created_at', { ascending: false }),
      ])
      if (jobData) setJob(jobData)
      if (docData) setDocs(docData)
    }
    load()
  }, [id])

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  const countOf = (key: string) => docs.filter(d => (d.category ?? 'doc') === key).length
  const tabDocs = docs.filter(d => (d.category ?? 'doc') === tab)

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">‹</button>
        <div className="flex-1 min-w-0">
          {job?.job_number && (
            <p className="text-sm font-mono font-semibold text-indigo-500">{job.job_number}</p>
          )}
          <h1 className="text-lg font-bold text-gray-800 truncate">{job?.title ?? '...'}</h1>
          <p className="text-sm text-gray-400">{job?.client_org} · {job ? fmtDate(job.job_date) : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {TABS.map(t => {
          const count = countOf(t.key)
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-xl p-3 text-center transition-all border-2 ${active ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-gray-600'}`}>{t.label}</div>
              <div className={`text-sm mt-0.5 ${active ? 'text-indigo-500' : 'text-gray-400'}`}>
                {count > 0 ? `${count} รายการ` : '—'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {tabDocs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-3xl mb-2">{TABS.find(t => t.key === tab)?.icon}</p>
          <p className="text-gray-500 font-medium">ยังไม่มี{TABS.find(t => t.key === tab)?.label}</p>
          <p className="text-sm text-gray-400 mt-1">อัปโหลดได้จากหน้ารายละเอียดงาน</p>
        </div>
      ) : tab === 'photo' ? (
        /* Photo grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tabDocs.map(doc => (
            <button key={doc.id} onClick={() => setLightbox(doc.file_url)}
              className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <img src={doc.file_url} alt={doc.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-3xl transition-opacity">🔍</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{doc.file_name}</p>
              </div>
            </button>
          ))}
        </div>
      ) : tab === 'note' ? (
        /* Notes list */
        <div className="space-y-2">
          {tabDocs.map(doc => (
            <div key={doc.id} className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
              <p className="text-gray-800">{doc.file_name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(doc.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Files list (expense / doc) */
        <div className="space-y-2">
          {tabDocs.map(doc => (
            <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {doc.file_type === 'pdf' ? '📄' : doc.file_type === 'image' ? '🖼️' : doc.file_type === 'video' ? '🎬' : '📎'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{doc.file_name}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(doc.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className="text-sm text-indigo-500 flex-shrink-0">เปิด ↗</span>
            </a>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10">✕</button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-lg"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
