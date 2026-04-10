import { createClient } from '@/lib/supabase-server'
import { getAccessLevel } from '@/lib/access'

export async function GET() {
  const level = await getAccessLevel()
  if (level !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  const supabase = await createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('title, job_date, source, client_org, income, expense, status')
    .order('job_date')

  if (!jobs) return new Response('No data', { status: 404 })

  const STATUS: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }

  const rows = [
    ['ลำดับ', 'ชื่องาน', 'วันที่', 'หน่วยงาน', 'แหล่งที่มา', 'รายได้ (บาท)', 'รายจ่าย (บาท)', 'กำไร (บาท)', 'สถานะ'],
    ...jobs.map((j, i) => [
      i + 1,
      j.title,
      new Date(j.job_date).toLocaleDateString('th-TH'),
      j.client_org,
      j.source,
      j.income ?? 0,
      j.expense ?? 0,
      (j.income ?? 0) - (j.expense ?? 0),
      STATUS[j.status] ?? j.status,
    ]),
  ]

  const totalIncome  = jobs.reduce((s, j) => s + (j.income  ?? 0), 0)
  const totalExpense = jobs.reduce((s, j) => s + (j.expense ?? 0), 0)
  rows.push(['', 'รวมทั้งหมด', '', '', '', totalIncome, totalExpense, totalIncome - totalExpense, ''])

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const bom = '\uFEFF' // UTF-8 BOM for Excel Thai support

  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="iok-finance-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
