import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ''

  if (!q) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400 text-sm">พิมพ์คำค้นหาในช่องค้นหาด้านบน</p>
      </div>
    )
  }

  const [{ data: jobs }, { data: clients }, { data: members }] = await Promise.all([
    (supabase as any)
      .from('jobs')
      .select('id, job_number, title, client_org, job_date, status, income')
      .or(`title.ilike.%${q}%,client_org.ilike.%${q}%,job_number.ilike.%${q}%,description.ilike.%${q}%`)
      .order('job_date', { ascending: false })
      .limit(20),
    (supabase as any)
      .from('clients')
      .select('id, name, org_type, contact_person, phone')
      .ilike('name', `%${q}%`)
      .limit(10),
    (supabase as any)
      .from('team_members')
      .select('id, name, role, email, is_active')
      .ilike('name', `%${q}%`)
      .limit(10),
  ])

  const total = (jobs?.length ?? 0) + (clients?.length ?? 0) + (members?.length ?? 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ผลการค้นหา</h1>
        <p className="text-sm text-gray-400">"{q}" — พบ {total} รายการ</p>
      </div>

      {/* งาน */}
      {(jobs?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>📋</span>
            <h2 className="font-semibold text-gray-700">ใบงาน ({jobs!.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(jobs ?? []).map((j: any) => (
              <Link key={j.id} href={`/jobs/${j.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  {j.job_number && <span className="text-xs font-mono text-indigo-400 mr-2">{j.job_number}</span>}
                  <span className="font-medium text-gray-800">{j.title}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{j.client_org} · {new Date(j.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[j.status]}`}>{STATUS_LABEL[j.status]}</span>
                  {j.income > 0 && <span className="text-xs text-green-600 font-medium">{fmt(j.income)} ฿</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* หน่วยงาน */}
      {(clients?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>🏢</span>
            <h2 className="font-semibold text-gray-700">หน่วยงาน ({clients!.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(clients ?? []).map((c: any) => (
              <Link key={c.id} href={`/clients/${c.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.org_type === 'internal' ? 'ภายในมหาวิทยาลัย' : 'ภายนอก'}{c.contact_person ? ` · ${c.contact_person}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ทีมงาน */}
      {(members?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>👤</span>
            <h2 className="font-semibold text-gray-700">ทีมงาน ({members!.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(members ?? []).map((m: any) => (
              <Link key={m.id} href={`/team/${m.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.role ?? m.email}</p>
                </div>
                {!m.is_active && <span className="text-xs text-gray-400">Inactive</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-gray-500">ไม่พบผลลัพธ์สำหรับ "{q}"</p>
          <p className="text-sm text-gray-400 mt-1">ลองใช้คำค้นหาอื่น</p>
        </div>
      )}
    </div>
  )
}
