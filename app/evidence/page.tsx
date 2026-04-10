import { supabase } from '@/lib/supabase'
import type { JobDocument, Job } from '@/types/database'

export default async function EvidencePage() {
  const { data: raw } = await supabase
    .from('job_documents')
    .select('*, jobs(title, job_date)')
    .order('created_at', { ascending: false })

  const docs = (raw ?? []) as (JobDocument & { jobs: Pick<Job, 'title' | 'job_date'> | null })[]

  const FILE_ICON: Record<string, string> = {
    image: '🖼️', video: '🎬', pdf: '📄', link: '🔗',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">หลักฐาน / ผลงาน</h1>
        <p className="text-sm text-gray-400">ทั้งหมด {docs.length} ไฟล์</p>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-500 font-medium">ยังไม่มีหลักฐานหรือผลงาน</p>
          <p className="text-sm text-gray-400 mt-1">อัปโหลดได้จากหน้ารายละเอียดงาน</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {docs.map(doc => (
            <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl">
                {FILE_ICON[doc.file_type ?? ''] ?? '📄'}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                {doc.jobs && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.jobs.title}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
