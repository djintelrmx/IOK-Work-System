import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import Link from 'next/link'

export default async function EvidencePage() {
  // ดึงงานทั้งหมดที่มีเอกสาร/ไฟล์แนบ
  const { data: rawJobs } = await supabase
    .from('jobs')
    .select('id, job_number, title, job_date, client_org, job_type')
    .order('job_date', { ascending: false })

  const { data: rawCounts } = await (supabase as any)
    .from('job_documents')
    .select('job_id')

  const jobs = (rawJobs ?? []) as Pick<Job, 'id' | 'job_number' | 'title' | 'job_date' | 'client_org' | 'job_type'>[]
  const docs = (rawCounts ?? []) as { job_id: string }[]

  // นับจำนวนเอกสารต่อ job
  const countMap: Record<string, number> = {}
  for (const d of docs) {
    countMap[d.job_id] = (countMap[d.job_id] ?? 0) + 1
  }

  // เรียงให้งานที่มีเอกสารขึ้นก่อน
  const sorted = [...jobs].sort((a, b) => {
    const ca = countMap[a.id] ?? 0
    const cb = countMap[b.id] ?? 0
    return cb - ca
  })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  const JOB_ICON: Record<string, string> = {
    'ไลฟ์สตรีม': '📡',
    'ถ่ายทอดสดภายใน': '📹',
    'ถ่ายภาพนิ่ง': '📷',
    'ผลิตวิดีโอ': '🎬',
    'ระบบเสียง': '🔊',
    'ระบบแสง / สี': '💡',
    'สื่อมัลติมีเดีย': '🖥',
    'อื่นๆ': '📋',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">หลักฐาน / ผลงาน</h1>
        <p className="text-sm text-gray-400">เลือกงานเพื่อดูรูปภาพและเอกสารที่แนบ</p>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-500 font-medium">ยังไม่มีงานในระบบ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {sorted.map(job => {
              const count = countMap[job.id] ?? 0
              return (
                <Link key={job.id} href={`/evidence/${job.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {JOB_ICON[job.job_type ?? ''] ?? '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {job.job_number && (
                      <p className="text-xs font-mono font-semibold text-indigo-500 mb-0.5">{job.job_number}</p>
                    )}
                    <p className="font-semibold text-gray-800 truncate">{job.title}</p>
                    <p className="text-sm text-gray-400">{job.client_org} · {fmtDate(job.job_date)}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {count > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">
                        📎 {count} ไฟล์
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">ยังไม่มีไฟล์</span>
                    )}
                  </div>
                  <div className="text-gray-300 flex-shrink-0">›</div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
