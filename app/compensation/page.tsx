import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CompensationPage() {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  // ดึงทีมงานทั้งหมดพร้อมงานที่ทำ
  const { data: rawAssignments } = await supabase
    .from('job_assignments')
    .select('member_id, compensation, role_in_job, jobs(id, job_number, title, job_date, status, income), team_members(id, name, role)')
    .order('created_at', { ascending: false })

  const assignments = (rawAssignments ?? []) as any[]

  // รวม per member
  const memberMap: Record<string, {
    id: string; name: string; role: string | null;
    totalCompensation: number; jobCount: number;
    jobs: { id: string; job_number: string | null; title: string; job_date: string; status: string; income: number; compensation: number; role_in_job: string | null }[]
  }> = {}

  for (const a of assignments) {
    if (!a.team_members) continue
    const m = a.team_members
    if (!memberMap[m.id]) {
      memberMap[m.id] = { id: m.id, name: m.name, role: m.role, totalCompensation: 0, jobCount: 0, jobs: [] }
    }
    memberMap[m.id].totalCompensation += (a.compensation ?? 0)
    memberMap[m.id].jobCount++
    if (a.jobs) {
      memberMap[m.id].jobs.push({
        id: a.jobs.id,
        job_number: a.jobs.job_number,
        title: a.jobs.title,
        job_date: a.jobs.job_date,
        status: a.jobs.status,
        income: a.jobs.income ?? 0,
        compensation: a.compensation ?? 0,
        role_in_job: a.role_in_job,
      })
    }
  }

  const members = Object.values(memberMap).sort((a, b) => b.totalCompensation - a.totalCompensation)
  const totalAll = members.reduce((s, m) => s + m.totalCompensation, 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700',
  }
  const STATUS_LABEL: Record<string, string> = { pending: 'รอ', in_progress: 'กำลังทำ', done: 'เสร็จ' }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ค่าตอบแทนทีมงาน</h1>
          <p className="text-sm text-gray-400">สรุปค่าตอบแทนและภาระงานแต่ละคน</p>
        </div>
        <div className="bg-indigo-50 rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-indigo-500 font-medium">ค่าตอบแทนรวมทั้งหมด</p>
          <p className="text-xl font-bold text-indigo-700">{fmt(totalAll)} ฿</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-gray-500">ยังไม่มีข้อมูลค่าตอบแทน</p>
          <p className="text-sm text-gray-400 mt-1">กำหนดค่าตอบแทนได้ในหน้ารายละเอียดงาน</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Member header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                <Link href={`/team/${member.id}`}
                  className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 hover:bg-indigo-600 transition-colors">
                  {member.name.charAt(0)}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-400">{member.role ?? ''} · {member.jobCount} งาน</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-green-600">{fmt(member.totalCompensation)}</p>
                  <p className="text-xs text-gray-400">บาท</p>
                </div>
              </div>

              {/* Job list */}
              {member.jobs.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {member.jobs.slice(0, 5).map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        {job.job_number && <span className="text-xs font-mono text-indigo-400 mr-2">{job.job_number}</span>}
                        <span className="text-sm text-gray-700 truncate">{job.title}</span>
                        <span className="text-xs text-gray-400 ml-2">{fmtDate(job.job_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.role_in_job && (
                          <span className="text-xs text-gray-400">{job.role_in_job}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                          {STATUS_LABEL[job.status]}
                        </span>
                        {job.compensation > 0 && (
                          <span className="text-sm font-semibold text-green-600">{fmt(job.compensation)} ฿</span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {member.jobs.length > 5 && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      และอีก {member.jobs.length - 5} งาน
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
