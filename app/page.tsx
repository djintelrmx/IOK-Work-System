import { supabase } from '@/lib/supabase'
import type { Job, TeamMember } from '@/types/database'
import { FileText, Loader, TrendingUp, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังทำ',
  done: 'เสร็จแล้ว',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const JOB_ICON: Record<string, string> = {
  'ไลฟ์สตรีม': '📡',
  'ถ่ายทอดสดภายใน': '📹',
  'ถ่ายภาพนิ่ง': '📷',
  'ผลิตวิดีโอ': '🎬',
  'ระบบเสียง': '🔊',
  'ระบบแสง / สี': '💡',
  'สื่อมัลติมีเดีย': '🖥',
  'อื่นๆ': '📋',
}

export default async function DashboardPage() {
  const [{ data: rawJobs }, { data: rawMembers }] = await Promise.all([
    supabase.from('jobs').select('*, job_assignments(*, team_members(*))').order('job_date', { ascending: false }).limit(5),
    supabase.from('team_members').select('*').eq('is_active', true),
  ])

  const allJobs = (rawJobs ?? []) as Job[]
  const members = (rawMembers ?? []) as TeamMember[]
  const totalIncome = allJobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const inProgress = allJobs.filter(j => j.status === 'in_progress').length
  const today = new Date().toISOString().split('T')[0]
  const upcoming = allJobs.filter(j => j.job_date >= today).length
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400">ภาพรวมการทำงาน IOK</p>
        </div>
        <Link href="/jobs/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          + บันทึกรับงาน
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={<FileText size={18} className="text-indigo-600" />} bg="bg-indigo-50"
          value={allJobs.length} label="งานทั้งหมด" sub="ปีนี้" />
        <StatCard icon={<Loader size={18} className="text-amber-500" />} bg="bg-amber-50"
          value={inProgress} label="งานในมือ" sub="กำลังทำ" />
        <StatCard icon={<TrendingUp size={18} className="text-green-600" />} bg="bg-green-50"
          value={`${fmt(totalIncome)} ฿`} label="รายได้รวม" sub="ปีนี้" />
        <StatCard icon={<CalendarCheck size={18} className="text-purple-600" />} bg="bg-purple-50"
          value={upcoming} label="งานที่กำลังจะมา" sub="วันนี้เป็นต้นไป" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* งานล่าสุด */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">งานล่าสุด</h2>
            <Link href="/jobs" className="text-indigo-600 text-xs hover:underline">ดูทั้งหมด →</Link>
          </div>
          {allJobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              ยังไม่มีข้อมูลงาน —{' '}
              <Link href="/jobs/new" className="text-indigo-500 underline">เพิ่มงานแรก</Link>
            </p>
          ) : (
            <div className="space-y-1">
              {allJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {JOB_ICON[job.job_type] ?? '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">
                      {job.client_org} •{' '}
                      {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600">{fmt(job.income ?? 0)} ฿</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                      {STATUS_LABEL[job.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ทีมงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">ทีมงาน</h2>
            <Link href="/team" className="text-indigo-600 text-xs hover:underline">จัดการ →</Link>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีทีมงาน</p>
          ) : (
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.role ?? m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, bg, value, label, sub }: {
  icon: React.ReactNode; bg: string; value: string | number; label: string; sub: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}
