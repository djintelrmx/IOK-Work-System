import { supabase } from '@/lib/supabase'
import type { Client, Job } from '@/types/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const PAYMENT_LABEL: Record<string, string> = { unpaid: 'ยังไม่ชำระ', partial: 'ชำระบางส่วน', paid: 'ชำระแล้ว' }
const PAYMENT_COLOR: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-600',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: raw } = await (supabase as any).from('clients').select('*').eq('id', id).single()
  if (!raw) notFound()
  const client = raw as Client

  // หางานที่ client_org ตรงกับชื่อหน่วยงาน
  const { data: rawJobs } = await supabase
    .from('jobs')
    .select('id, job_number, title, job_date, income, status, payment_status')
    .ilike('client_org', client.name)
    .order('job_date', { ascending: false })

  const jobs = (rawJobs ?? []) as (Pick<Job, 'id' | 'job_number' | 'title' | 'job_date' | 'income' | 'status'> & { payment_status: string })[]

  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <Link href="/clients" className="text-sm text-indigo-500 hover:underline">← กลับรายชื่อหน่วยงาน</Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl flex-shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{client.name}</h1>
              <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${client.org_type === 'internal' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {client.org_type === 'internal' ? 'ภายในมหาวิทยาลัย' : 'ภายนอกมหาวิทยาลัย'}
              </span>
            </div>
          </div>
          <Link href={`/clients/${id}/edit`}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            ✏️ แก้ไข
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-sm">
          {client.contact_person && (
            <div><p className="text-gray-400 text-xs font-medium">ผู้ติดต่อ</p><p className="text-gray-800 mt-0.5">👤 {client.contact_person}</p></div>
          )}
          {client.phone && (
            <div><p className="text-gray-400 text-xs font-medium">โทรศัพท์</p><p className="text-gray-800 mt-0.5">📞 {client.phone}</p></div>
          )}
          {client.email && (
            <div><p className="text-gray-400 text-xs font-medium">อีเมล</p><p className="text-gray-800 mt-0.5">✉️ {client.email}</p></div>
          )}
          {client.address && (
            <div className="sm:col-span-2"><p className="text-gray-400 text-xs font-medium">ที่อยู่</p><p className="text-gray-800 mt-0.5">📍 {client.address}</p></div>
          )}
          {client.notes && (
            <div className="sm:col-span-2"><p className="text-gray-400 text-xs font-medium">หมายเหตุ</p><p className="text-gray-600 mt-0.5">{client.notes}</p></div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{jobs.length}</p>
          <p className="text-sm text-indigo-500 mt-1">งานทั้งหมด</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{fmt(totalIncome)}</p>
          <p className="text-sm text-green-500 mt-1">รายได้รวม (บาท)</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{jobs.filter(j => j.status !== 'done').length}</p>
          <p className="text-sm text-amber-500 mt-1">งานค้าง</p>
        </div>
      </div>

      {/* Jobs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">ประวัติงาน ({jobs.length})</h2>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">ยังไม่มีงานที่อ้างอิงหน่วยงานนี้</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  {job.job_number && <p className="text-xs font-mono text-indigo-500 mb-0.5">{job.job_number}</p>}
                  <p className="font-medium text-gray-800 truncate">{job.title}</p>
                  <p className="text-sm text-gray-400">{fmtDate(job.job_date)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                    {STATUS_LABEL[job.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_COLOR[job.payment_status ?? 'unpaid']}`}>
                    {PAYMENT_LABEL[job.payment_status ?? 'unpaid']}
                  </span>
                  <span className="text-sm font-semibold text-green-600">{fmt(job.income ?? 0)} ฿</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
