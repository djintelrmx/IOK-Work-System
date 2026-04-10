import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export default async function BillingPage() {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { data: raw } = await supabase
    .from('jobs')
    .select('id, job_number, title, job_date, client_org, source, income, expense, status')
    .order('job_date', { ascending: false })

  const jobs = (raw ?? []) as (Pick<Job, 'id' | 'job_number' | 'title' | 'job_date' | 'client_org' | 'source' | 'income' | 'expense' | 'status'>)[]
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ระบบออกบิล</h1>
          <p className="text-sm text-gray-400">จัดการใบแจ้งหนี้และใบเสร็จรับเงิน</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{jobs.length}</p>
          <p className="text-xs text-indigo-500 mt-1">งานทั้งหมด</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{fmt(totalIncome)}</p>
          <p className="text-xs text-green-500 mt-1">รายได้รวม (บาท)</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{jobs.filter(j => j.status !== 'done').length}</p>
          <p className="text-xs text-amber-500 mt-1">งานรอดำเนินการ</p>
        </div>
      </div>

      {/* Job list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">รายการงาน</h2>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">ยังไม่มีข้อมูลงาน</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">งาน / หน่วยงาน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ยอดเงิน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">สถานะ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job, i) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      {job.job_number && (
                        <p className="text-xs font-mono font-semibold text-indigo-500 mb-0.5">{job.job_number}</p>
                      )}
                      <p className="font-medium text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.client_org}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(job.job_date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{fmt(job.income ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Link href={`/jobs/${job.id}`}
                          className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap">
                          📋 ดูใบงาน
                        </Link>
                        <Link href={`/billing/${job.id}`} target="_blank"
                          className="text-xs px-2.5 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium transition-colors whitespace-nowrap">
                          🖨️ พิมพ์บิล
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
