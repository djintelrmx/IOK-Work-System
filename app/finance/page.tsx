import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import PrintButton from '@/components/PrintButton'

export default async function FinancePage() {
  const level = await getAccessLevel()
  if (level !== 'admin') redirect('/')

  const { data: raw } = await supabase
    .from('jobs')
    .select('id, title, job_date, income, expense, status, source')
    .order('job_date', { ascending: false })

  const jobs = (raw ?? []) as Pick<Job, 'id' | 'title' | 'job_date' | 'income' | 'expense' | 'status' | 'source'>[]
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const totalExpense = jobs.reduce((s, j) => s + (j.expense ?? 0), 0)
  const totalProfit = totalIncome - totalExpense

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">รายได้ - รายจ่าย</h1>
          <p className="text-sm text-gray-400">สรุปการเงินทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="🖨️ PDF" className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg transition-colors" />
          <a href="/api/export/finance"
            className="border border-green-200 text-green-700 hover:bg-green-50 text-sm px-4 py-2 rounded-lg transition-colors font-medium">
            📊 Excel (CSV)
          </a>
        </div>
      </div>

      {/* สรุป */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5">
          <p className="text-green-100 text-sm mb-1">รายได้รวม</p>
          <p className="text-3xl font-bold">{fmt(totalIncome)}</p>
          <p className="text-green-200 text-xs mt-1">บาท</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl p-5">
          <p className="text-red-100 text-sm mb-1">รายจ่ายรวม</p>
          <p className="text-3xl font-bold">{fmt(totalExpense)}</p>
          <p className="text-red-200 text-xs mt-1">บาท</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-5">
          <p className="text-indigo-100 text-sm mb-1">กำไรสุทธิ</p>
          <p className="text-3xl font-bold">{fmt(totalProfit)}</p>
          <p className="text-indigo-200 text-xs mt-1">
            บาท {totalIncome > 0 ? `(${Math.round(totalProfit / totalIncome * 100)}%)` : ''}
          </p>
        </div>
      </div>

      {/* รายละเอียด */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">ยังไม่มีข้อมูลงาน</p>
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">งาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รายได้</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รายจ่าย</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">กำไร</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map(job => {
                const profit = (job.income ?? 0) - (job.expense ?? 0)
                const pct = job.income ? Math.round(profit / job.income * 100) : 0
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{job.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${job.source === 'ภายในมหาวิทยาลัย' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {job.source === 'ภายในมหาวิทยาลัย' ? 'ใน' : 'นอก'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{fmt(job.income ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-red-500">{fmt(job.expense ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{fmt(profit)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pct >= 50 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  )
}
