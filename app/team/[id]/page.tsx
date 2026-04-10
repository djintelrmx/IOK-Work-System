import { supabase } from '@/lib/supabase'
import type { TeamMember, Job } from '@/types/database'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export default async function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: raw }, { data: assignments }] = await Promise.all([
    supabase.from('team_members').select('*').eq('id', id).single(),
    supabase
      .from('job_assignments')
      .select('role_in_job, jobs(id, title, job_type, job_date, status, client_org, income, expense)')
      .eq('member_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!raw) notFound()

  const member = raw as TeamMember
  const jobs = (assignments ?? []).map((a: any) => ({
    role_in_job: a.role_in_job as string | null,
    job: a.jobs as Job,
  })).filter(a => a.job)

  const totalJobs = jobs.length
  const doneJobs = jobs.filter(a => a.job.status === 'done').length
  const totalIncome = jobs.reduce((s, a) => s + (a.job.income ?? 0), 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  const initials = member.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <Link href="/team" className="text-sm text-indigo-500 hover:underline">← กลับรายชื่อทีมงาน</Link>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-5 flex-wrap">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.name}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800">{member.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{member.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.role && (
                <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                  {member.role}
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {member.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalJobs}</p>
            <p className="text-xs text-gray-400 mt-0.5">งานทั้งหมด</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{doneJobs}</p>
            <p className="text-xs text-gray-400 mt-0.5">งานเสร็จแล้ว</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{fmt(totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-0.5">รายได้รวม (บาท)</p>
          </div>
        </div>
      </div>

      {/* Job history */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">ประวัติงาน ({totalJobs} งาน)</h2>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">ยังไม่มีประวัติการทำงาน</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.map(({ role_in_job, job }, i) => (
              <Link key={i} href={`/jobs/${job.id}`}
                className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.client_org} · {fmtDate(job.job_date)}</p>
                  {role_in_job && (
                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full mt-1 inline-block">
                      {role_in_job}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                    {STATUS_LABEL[job.status]}
                  </span>
                  {job.income ? (
                    <span className="text-xs text-green-600 font-medium">{fmt(job.income)} บาท</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
