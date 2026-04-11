import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year')

  let query = supabase
    .from('jobs')
    .select('job_number, title, job_type, job_type_custom, source, client_org, job_date, income, expense, status, payment_status, supervisor_name, order_type')
    .order('job_date', { ascending: false })

  if (year) {
    query = (query as any)
      .gte('job_date', `${year}-01-01`)
      .lte('job_date', `${year}-12-31`)
  }

  const { data: rawJobs } = await query
  const jobs = (rawJobs ?? []) as any[]

  const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
  const PAYMENT_LABEL: Record<string, string> = { unpaid: 'ยังไม่ชำระ', partial: 'ชำระบางส่วน', paid: 'ชำระแล้ว' }
  const ORDER_LABEL: Record<string, string> = { letter: 'ผ่านหนังสือ', direct: 'หัวหน้าสั่งตรง', other: 'อื่นๆ' }

  const headers = ['เลขที่งาน', 'ชื่องาน', 'ประเภทงาน', 'แหล่งงาน', 'หน่วยงาน', 'วันที่', 'รายได้', 'รายจ่าย', 'กำไร', 'สถานะ', 'ชำระเงิน', 'การสั่งงาน', 'ผู้ควบคุม']

  const rows = jobs.map(j => [
    j.job_number ?? '',
    j.title ?? '',
    j.job_type === 'อื่นๆ' && j.job_type_custom ? `อื่นๆ (${j.job_type_custom})` : (j.job_type ?? ''),
    j.source ?? '',
    j.client_org ?? '',
    j.job_date ?? '',
    j.income ?? 0,
    j.expense ?? 0,
    (j.income ?? 0) - (j.expense ?? 0),
    STATUS_LABEL[j.status] ?? j.status ?? '',
    PAYMENT_LABEL[j.payment_status ?? 'unpaid'] ?? '',
    ORDER_LABEL[j.order_type] ?? j.order_type ?? '',
    j.supervisor_name ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF'
  const filename = year ? `jobs_${year}.csv` : `jobs_${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
