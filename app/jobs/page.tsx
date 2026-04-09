import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}
const ORDER_LABEL: Record<string, string> = { letter: 'ผ่านหนังสือ', direct: 'หัวหน้าสั่งตรง', other: 'อื่นๆ' }

export default async function JobsPage() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, job_assignments(*, team_members(id, name))')
    .order('job_date', { ascending: false })

  const all = jobs ?? []
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ใบสั่งงาน</h1>
          <p className="text-sm text-gray-400">ทั้งหมด {all.length} งาน</p>
        </div>
        <Link href="/jobs/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + บันทึกรับงาน
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {all.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">ยังไม่มีข้อมูลงาน</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">งาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">หน่วยงาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">การสั่งงาน</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ทีม</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รายได้</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {all.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.job_type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-1 ${job.source === 'ภายในมหาวิทยาลัย' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {job.source === 'ภายในมหาวิทยาลัย' ? 'ใน' : 'นอก'}
                    </span>
                    {job.client_org}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{ORDER_LABEL[job.order_type]}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(job.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-1">
                      {(job.job_assignments ?? []).slice(0, 3).map((a: { member_id: string; team_members: { name: string } | null }) => (
                        <div key={a.member_id}
                          className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                          title={a.team_members?.name ?? ''}>
                          {a.team_members?.name?.charAt(0) ?? '?'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(job.income ?? 0)} ฿</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                      {STATUS_LABEL[job.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="text-indigo-500 hover:underline text-xs">ดู</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
