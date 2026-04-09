import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'

export default async function ReportPage() {
  const year = new Date().getFullYear()
  const { data: raw } = await supabase
    .from('jobs')
    .select('*')
    .gte('job_date', `${year}-01-01`)
    .lte('job_date', `${year}-12-31`)
    .order('job_date')

  const jobs = (raw ?? []) as Job[]
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const totalExpense = jobs.reduce((s, j) => s + (j.expense ?? 0), 0)
  const inner = jobs.filter(j => j.source === 'ภายในมหาวิทยาลัย').length
  const outer = jobs.filter(j => j.source === 'ภายนอกมหาวิทยาลัย').length
  const done = jobs.filter(j => j.status === 'done').length

  const byType = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.job_type] = (acc[j.job_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">รายงานผลการปฏิบัติงาน IOK</h1>
          <p className="text-sm text-gray-400">ปีการศึกษา {year} | มหาวิทยาลัยเกษมบัณฑิต</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
          onClick={() => window.print()}>
          🖨️ พิมพ์ / Export PDF
        </button>
      </div>

      {/* สรุปตัวเลข */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'งานทั้งหมด', value: jobs.length, unit: 'งาน', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'งานเสร็จแล้ว', value: done, unit: 'งาน', color: 'bg-green-50 text-green-600' },
          { label: 'รายได้รวม', value: fmt(totalIncome), unit: 'บาท', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'กำไรสุทธิ', value: fmt(totalIncome - totalExpense), unit: 'บาท', color: 'bg-purple-50 text-purple-600' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
            <p className="text-xs opacity-70">{unit}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* แหล่งงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">แหล่งที่มาของงาน</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                <span className="text-sm">ภายในมหาวิทยาลัย</span>
              </div>
              <span className="font-semibold">{inner} งาน ({jobs.length ? Math.round(inner / jobs.length * 100) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
                <span className="text-sm">ภายนอกมหาวิทยาลัย</span>
              </div>
              <span className="font-semibold">{outer} งาน ({jobs.length ? Math.round(outer / jobs.length * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* ประเภทงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">ประเภทงาน</h2>
          <div className="space-y-2">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{type}</span>
                <span className="font-semibold">{count} งาน</span>
              </div>
            ))}
            {Object.keys(byType).length === 0 && <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>}
          </div>
        </div>
      </div>

      {/* รายการงาน */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">รายการงานทั้งหมดปี {year}</h2>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">ยังไม่มีข้อมูล</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">งาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">หน่วยงาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">วันที่</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">รายได้</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">รายจ่าย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job, i) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.job_type}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.client_org}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(job.income ?? 0)}</td>
                  <td className="px-4 py-3 text-right text-red-500">{fmt(job.expense ?? 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="px-4 py-3 font-bold text-gray-700">รวมทั้งหมด</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{fmt(totalIncome)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-500">{fmt(totalExpense)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
