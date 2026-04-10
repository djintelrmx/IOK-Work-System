import { supabase } from '@/lib/supabase'
import type { Client } from '@/types/database'
import Link from 'next/link'

const ORG_TYPE_LABEL: Record<string, string> = {
  internal: 'ภายในมหาวิทยาลัย',
  external: 'ภายนอกมหาวิทยาลัย',
}
const ORG_TYPE_COLOR: Record<string, string> = {
  internal: 'bg-blue-100 text-blue-700',
  external: 'bg-orange-100 text-orange-700',
}

export default async function ClientsPage() {
  const { data: raw } = await (supabase as any)
    .from('clients')
    .select('*')
    .order('name')

  const clients = (raw ?? []) as Client[]

  // นับงานต่อหน่วยงาน
  const { data: jobCounts } = await supabase
    .from('jobs')
    .select('client_org')

  const countMap: Record<string, number> = {}
  for (const j of (jobCounts ?? [])) {
    const key = (j as any).client_org
    countMap[key] = (countMap[key] ?? 0) + 1
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ฐานข้อมูลลูกค้า / หน่วยงาน</h1>
          <p className="text-sm text-gray-400">ทั้งหมด {clients.length} หน่วยงาน</p>
        </div>
        <Link href="/clients/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
          + เพิ่มหน่วยงาน
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลหน่วยงาน</p>
          <p className="text-sm text-gray-400 mt-1">เพิ่มหน่วยงานแรกได้เลย</p>
          <Link href="/clients/new"
            className="inline-block mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            + เพิ่มหน่วยงาน
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {clients.map(client => (
              <Link key={client.id} href={`/clients/${client.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{client.name}</p>
                    {client.org_type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORG_TYPE_COLOR[client.org_type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ORG_TYPE_LABEL[client.org_type] ?? client.org_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {client.contact_person && (
                      <span className="text-sm text-gray-400">👤 {client.contact_person}</span>
                    )}
                    {client.phone && (
                      <span className="text-sm text-gray-400">📞 {client.phone}</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {countMap[client.name] > 0 ? (
                    <span className="text-sm font-semibold text-indigo-600">{countMap[client.name]} งาน</span>
                  ) : (
                    <span className="text-sm text-gray-300">ยังไม่มีงาน</span>
                  )}
                </div>
                <div className="text-gray-300 flex-shrink-0">›</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
