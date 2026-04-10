import { supabase } from '@/lib/supabase'
import type { Job, TeamMember, JobDocument } from '@/types/database'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { updateJobStatus } from './actions'
import { getAccessLevel } from '@/lib/access'
import JobDocsUploader from '@/components/JobDocsUploader'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const ORDER_LABEL: Record<string, string> = { letter: 'ผ่านหนังสือ', direct: 'หัวหน้าสั่งตรง', other: 'อื่นๆ' }

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: raw }, accessLevel] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, job_assignments(*, team_members(*)), job_documents(*)')
      .eq('id', id)
      .single(),
    getAccessLevel(),
  ])

  if (!raw) notFound()

  const job = raw as Job & {
    job_assignments: { role_in_job: string | null; team_members: TeamMember }[]
    job_documents: JobDocument[]
  }

  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
  const fmtTime = (t: string) => { const [h, m] = t.split(':'); return `${parseInt(h)}.${m}` }
  const profit = (job.income ?? 0) - (job.expense ?? 0)

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      {/* Back */}
      <Link href="/jobs" className="text-sm text-indigo-500 hover:underline">← กลับรายการงาน</Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{job.job_type}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[job.status]}`}>
            {STATUS_LABEL[job.status]}
          </span>
        </div>

        {/* เปลี่ยนสถานะ — เฉพาะ admin และ staff */}
        {(accessLevel === 'admin' || accessLevel === 'staff') && (
          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs text-gray-400 font-medium mb-2">เปลี่ยนสถานะ</p>
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'in_progress', 'done'] as const).map(s => {
                const active = job.status === s
                const colors: Record<string, string> = {
                  pending:     active ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-400' : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                  in_progress: active ? 'bg-amber-200 text-amber-800 ring-2 ring-amber-400' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                  done:        active ? 'bg-green-200 text-green-800 ring-2 ring-green-500' : 'bg-green-50 text-green-600 hover:bg-green-100',
                }
                return (
                  <form key={s} action={updateJobStatus.bind(null, id, s)}>
                    <button type="submit" disabled={active}
                      className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all disabled:cursor-default ${colors[s]}`}>
                      {active && '✓ '}{STATUS_LABEL[s]}
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        )}

        {job.description && (
          <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-50 leading-relaxed">{job.description}</p>
        )}
      </div>

      {/* ข้อมูลงาน */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">ข้อมูลงาน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Row label="วันที่" value={fmtDate(job.job_date)} />
          {job.job_time_start && (
            <Row label="เวลา" value={`${fmtTime(job.job_time_start)}${job.job_time_end ? ` - ${fmtTime(job.job_time_end)}` : ''} น.`} />
          )}
          <Row label="หน่วยงาน / ผู้ว่าจ้าง" value={job.client_org} />
          <Row label="แหล่งที่มา" value={job.source} />
          {job.location && <Row label="สถานที่" value={job.location} />}
          <Row label="การสั่งงาน" value={ORDER_LABEL[job.order_type]} />
          {job.doc_number && <Row label="เลขที่หนังสือ" value={job.doc_number} />}
          {job.doc_date && <Row label="วันที่หนังสือ" value={fmtDate(job.doc_date)} />}
          {job.signer_name && <Row label="ผู้ลงนาม" value={job.signer_name} />}
          {job.approver_name && <Row label="ผู้อนุมัติ" value={job.approver_name} />}
          {job.supervisor_name && <Row label="ผู้ควบคุมงาน" value={job.supervisor_name} />}
        </div>
      </div>

      {/* การเงิน */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">การเงิน</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">รายได้</p>
            <p className="text-lg font-bold text-green-700">{fmt(job.income ?? 0)}</p>
            <p className="text-xs text-green-500">บาท</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-red-500 font-medium mb-1">รายจ่าย</p>
            <p className="text-lg font-bold text-red-600">{fmt(job.expense ?? 0)}</p>
            <p className="text-xs text-red-400">บาท</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo-600 font-medium mb-1">กำไร</p>
            <p className="text-lg font-bold text-indigo-700">{fmt(profit)}</p>
            <p className="text-xs text-indigo-400">บาท</p>
          </div>
        </div>
      </div>

      {/* ทีมงาน */}
      {job.job_assignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">ทีมงาน ({job.job_assignments.length} คน)</h2>
          <div className="space-y-2">
            {job.job_assignments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {a.team_members?.name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.team_members?.name}</p>
                  <p className="text-xs text-gray-400">{a.role_in_job ?? a.team_members?.role ?? '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* เอกสาร / หลักฐาน */}
      <JobDocsUploader
        jobId={id}
        initialDocs={job.job_documents}
        canEdit={accessLevel === 'admin' || accessLevel === 'staff'}
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        {(accessLevel === 'admin' || accessLevel === 'staff') && (
          <Link href={`/jobs/${id}/edit`}
            className="flex-1 text-center border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm py-2.5 rounded-xl transition-colors font-medium min-w-[120px]">
            ✏️ แก้ไขงาน
          </Link>
        )}
        <Link href={`/jobs/${id}/print`} target="_blank"
          className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors font-medium min-w-[100px]">
          🖨️ พิมพ์ใบงาน
        </Link>
        <Link href="/jobs"
          className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors font-medium min-w-[100px]">
          กลับรายการ
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}

