import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const level = await getAccessLevel()
  if (level !== 'admin') redirect('/')

  const sp = await searchParams
  const now = new Date()
  const year = sp.year ? parseInt(sp.year) : now.getFullYear()

  // สร้าง list ปีให้เลือก (5 ปีย้อนหลัง + ปีนี้ + ปีหน้า)
  const yearOptions = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 5 + i)

  const { data: raw } = await supabase
    .from('jobs')
    .select('id, job_number, title, job_type, job_type_custom, source, client_org, job_date, income, expense, status, payment_status')
    .gte('job_date', `${year}-01-01`)
    .lte('job_date', `${year}-12-31`)
    .order('job_date')

  const jobs = (raw ?? []) as Job[]
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const totalExpense = jobs.reduce((s, j) => s + (j.expense ?? 0), 0)
  const totalProfit = totalIncome - totalExpense
  const inner = jobs.filter(j => j.source === 'ภายในมหาวิทยาลัย').length
  const outer = jobs.filter(j => j.source === 'ภายนอกมหาวิทยาลัย').length
  const done = jobs.filter(j => j.status === 'done').length
  const paid = jobs.filter(j => (j as any).payment_status === 'paid').length
  const unpaid = jobs.filter(j => (j as any).payment_status !== 'paid').length

  // สรุปตามประเภทงาน
  const byType = jobs.reduce<Record<string, { count: number; income: number }>>((acc, j) => {
    const type = j.job_type === 'อื่นๆ' && (j as any).job_type_custom ? `อื่นๆ (${(j as any).job_type_custom})` : j.job_type
    if (!acc[type]) acc[type] = { count: 0, income: 0 }
    acc[type].count++
    acc[type].income += j.income ?? 0
    return acc
  }, {})

  // สรุปรายเดือน
  const byMonth = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    label: MONTH_NAMES[i],
    count: 0, income: 0, expense: 0,
  }))
  for (const j of jobs) {
    const m = parseInt(j.job_date.slice(5, 7)) - 1
    byMonth[m].count++
    byMonth[m].income += j.income ?? 0
    byMonth[m].expense += j.expense ?? 0
  }
  const maxIncome = Math.max(...byMonth.map(m => m.income), 1)

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">รายงานผลการปฏิบัติงาน IOK</h1>
          <p className="text-sm text-gray-400">มหาวิทยาลัยเกษมบัณฑิต · ปี พ.ศ. {year + 543}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {yearOptions.map(y => (
              <Link key={y} href={`/report?year=${y}`}
                className={`px-3 py-1.5 transition-colors ${y === year ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {y + 543}
              </Link>
            ))}
          </div>
          <a href={`/jobs/export?year=${year}`}
            className="border border-green-200 text-green-700 hover:bg-green-50 text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            📊 Export CSV
          </a>
          <Link href={`/report/print?year=${year}`} target="_blank"
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            🖨️ พิมพ์รายงาน
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'งานทั้งหมด', value: jobs.length, unit: 'งาน', bg: 'bg-indigo-50', color: 'text-indigo-700' },
          { label: 'งานเสร็จแล้ว', value: `${done}/${jobs.length}`, unit: 'งาน', bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'รายได้รวม', value: fmt(totalIncome), unit: 'บาท', bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'กำไรสุทธิ', value: fmt(totalProfit), unit: 'บาท', bg: 'bg-purple-50', color: `${totalProfit >= 0 ? 'text-purple-700' : 'text-red-600'}` },
        ].map(({ label, value, unit, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
            <p className="text-xs text-gray-400">{unit}</p>
          </div>
        ))}
      </div>

      {/* กราฟ bar รายเดือน (CSS) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">รายได้รายเดือน ปี {year + 543}</h2>
        <div className="flex items-end gap-1 h-32">
          {byMonth.map(m => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                {m.income > 0 && (
                  <div
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ height: `${Math.round((m.income / maxIncome) * 100)}%`, minHeight: m.income > 0 ? '4px' : '0' }}
                    title={`${m.label}: ${fmt(m.income)} ฿`}
                  />
                )}
              </div>
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" />รายได้</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* แหล่งงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">แหล่งที่มาของงาน</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${jobs.length ? inner / jobs.length * 100 : 0}%` }} />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />ภายในมหาวิทยาลัย</span>
              <span className="font-semibold">{inner} งาน ({jobs.length ? Math.round(inner / jobs.length * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />ภายนอกมหาวิทยาลัย</span>
              <span className="font-semibold">{outer} งาน ({jobs.length ? Math.round(outer / jobs.length * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* สถานะการชำระเงิน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">สถานะการชำระเงิน</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${jobs.length ? paid / jobs.length * 100 : 0}%` }} />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />ชำระแล้ว</span>
              <span className="font-semibold">{paid} งาน</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />ยังไม่ชำระ</span>
              <span className="font-semibold">{unpaid} งาน</span>
            </div>
          </div>
        </div>
      </div>

      {/* ประเภทงาน */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">สรุปตามประเภทงาน</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">ประเภทงาน</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">จำนวน</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">รายได้รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(byType).sort((a, b) => b[1].count - a[1].count).map(([type, data]) => (
                <tr key={type} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-700">{type}</td>
                  <td className="py-2 text-right font-medium">{data.count} งาน</td>
                  <td className="py-2 text-right text-green-600 font-medium">{fmt(data.income)} ฿</td>
                </tr>
              ))}
              {Object.keys(byType).length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400">ไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ตารางรายเดือน */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">สรุปรายเดือน ปี {year + 543}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">เดือน</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">จำนวนงาน</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">รายได้</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">รายจ่าย</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">กำไร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byMonth.map(m => {
                const profit = m.income - m.expense
                return (
                  <tr key={m.month} className={`hover:bg-gray-50 ${m.count === 0 ? 'opacity-40' : ''}`}>
                    <td className="py-2 font-medium text-gray-700">{MONTH_NAMES[m.month]}</td>
                    <td className="py-2 text-right text-gray-500">{m.count > 0 ? `${m.count} งาน` : '—'}</td>
                    <td className="py-2 text-right text-green-600 font-medium">{m.income > 0 ? fmt(m.income) : '—'}</td>
                    <td className="py-2 text-right text-red-500">{m.expense > 0 ? fmt(m.expense) : '—'}</td>
                    <td className={`py-2 text-right font-semibold ${profit > 0 ? 'text-indigo-600' : profit < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {m.count > 0 ? fmt(profit) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="py-2.5 px-0 font-bold text-gray-700">รวมทั้งปี</td>
                <td className="py-2.5 text-right font-bold text-gray-700">{jobs.length} งาน</td>
                <td className="py-2.5 text-right font-bold text-green-600">{fmt(totalIncome)}</td>
                <td className="py-2.5 text-right font-bold text-red-500">{fmt(totalExpense)}</td>
                <td className={`py-2.5 text-right font-bold ${totalProfit >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>{fmt(totalProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* รายการงาน */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">รายการงานทั้งหมดปี {year + 543} ({jobs.length} งาน)</h2>
        </div>
        <div className="overflow-x-auto">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">ยังไม่มีข้อมูลในปีนี้</p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">งาน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">หน่วยงาน</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">สถานะ</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">รายได้</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">กำไร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job, i) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="hover:text-indigo-600">
                        {job.job_number && <span className="text-xs font-mono text-indigo-400 mr-1">{job.job_number}</span>}
                        <span className="font-medium">{job.title}</span>
                      </Link>
                      <p className="text-xs text-gray-400">{job.job_type}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{job.client_org}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(job.income ?? 0)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${((job.income ?? 0) - (job.expense ?? 0)) >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                      {fmt((job.income ?? 0) - (job.expense ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 font-bold text-gray-700">รวมทั้งหมด</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{fmt(totalIncome)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${totalProfit >= 0 ? 'text-indigo-700' : 'text-red-500'}`}>{fmt(totalProfit)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
