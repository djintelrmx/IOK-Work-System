import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import Link from 'next/link'
import JobsFilter from '@/components/JobsFilter'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const PAYMENT_COLOR: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-500',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
}
const PAYMENT_LABEL: Record<string, string> = { unpaid: 'ค้างชำระ', partial: 'บางส่วน', paid: 'ชำระแล้ว' }
const ORDER_LABEL: Record<string, string> = { letter: 'ผ่านหนังสือ', direct: 'หัวหน้าสั่งตรง', other: 'อื่นๆ' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string; source?: string; from?: string; to?: string }>
}

export default async function JobsPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ''
  const statusFilter = sp.status ?? ''
  const sourceFilter = sp.source ?? ''
  const from = sp.from ?? ''
  const to = sp.to ?? ''

  let query = supabase
    .from('jobs')
    .select('*, job_assignments(*, team_members(id, name))')
    .order('job_date', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)
  if (sourceFilter) query = query.eq('source', sourceFilter)
  if (from) query = query.gte('job_date', from)
  if (to) query = query.lte('job_date', to)
  if (q) query = query.or(`title.ilike.%${q}%,client_org.ilike.%${q}%`)

  const { data: rawJobs } = await query
  const all = (rawJobs ?? []) as (Job & { job_assignments: { member_id: string; team_members: { name: string } | null }[] } & { payment_status?: string })[]
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ใบสั่งงาน</h1>
          <p className="text-sm text-gray-400">พบ {all.length} งาน</p>
        </div>
        <div className="flex gap-2">
          <Link href="/jobs/export" target="_blank"
            className="flex items-center gap-1.5 border border-green-200 text-green-700 hover:bg-green-50 text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            ⬇️ Export
          </Link>
          <Link href="/jobs/new"
            className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            + บันทึกรับงาน
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <JobsFilter initialQ={q} initialStatus={statusFilter} initialSource={sourceFilter} initialFrom={from} initialTo={to} />

      {all.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <p className="text-sm text-gray-400">ไม่พบข้อมูลงานที่ตรงกัน</p>
        </div>
      ) : (
        <>
          {/* Mobile: card view */}
          <div className="md:hidden space-y-2">
            {all.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {(job as any).job_number && (
                      <p className="text-xs font-mono text-indigo-400 mb-0.5">{(job as any).job_number}</p>
                    )}
                    <p className="font-semibold text-gray-800 leading-snug">{job.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{job.client_org}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[job.status]}`}>
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.source === 'ภายในมหาวิทยาลัย' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {job.source === 'ภายในมหาวิทยาลัย' ? 'งานใน' : 'งานนอก'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex-1" />
                  {(job.income ?? 0) > 0 && (
                    <span className="text-sm font-semibold text-green-600">{fmt(job.income ?? 0)} ฿</span>
                  )}
                  {job.payment_status && job.payment_status !== 'unpaid' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_COLOR[job.payment_status]}`}>
                      {PAYMENT_LABEL[job.payment_status]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: table view */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">งาน</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">หน่วยงาน</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">วันที่</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">ทีม</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-500">รายได้</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-500">สถานะ</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {all.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {(job as any).job_number && (
                          <p className="text-xs font-mono font-semibold text-indigo-500 mb-0.5">{(job as any).job_number}</p>
                        )}
                        <p className="font-medium text-gray-800">{job.title}</p>
                        <p className="text-sm text-gray-400">{job.job_type}{(job as any).job_type_custom ? ` — ${(job as any).job_type_custom}` : ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-1 ${job.source === 'ภายในมหาวิทยาลัย' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {job.source === 'ภายในมหาวิทยาลัย' ? 'ใน' : 'นอก'}
                        </span>
                        {job.client_org}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-1">
                          {(job.job_assignments ?? []).slice(0, 3).map((a: { member_id: string; team_members: { name: string } | null }) => (
                            <div key={a.member_id}
                              className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                              title={a.team_members?.name ?? ''}>
                              {a.team_members?.name?.charAt(0) ?? '?'}
                            </div>
                          ))}
                          {(job.job_assignments ?? []).length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold">
                              +{(job.job_assignments ?? []).length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(job.income ?? 0)} ฿</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm px-2 py-0.5 rounded-full font-medium w-fit ${STATUS_COLOR[job.status]}`}>
                            {STATUS_LABEL[job.status]}
                          </span>
                          {job.payment_status && job.payment_status !== 'unpaid' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${PAYMENT_COLOR[job.payment_status]}`}>
                              {PAYMENT_LABEL[job.payment_status]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/jobs/${job.id}`} className="text-indigo-500 hover:underline text-sm">ดู</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
