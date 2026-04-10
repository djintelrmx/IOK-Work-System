import { supabase } from '@/lib/supabase'
import type { TeamMember } from '@/types/database'
import Link from 'next/link'

export default async function TeamPage() {
  const { data: raw } = await supabase.from('team_members').select('*').order('name')
  const members = (raw ?? []) as TeamMember[]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ทีมงาน</h1>
          <p className="text-sm text-gray-400">ทั้งหมด {members.length} คน</p>
        </div>
        <Link href="/team/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          + เพิ่มทีมงาน
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => (
          <Link key={m.id} href={`/team/${m.id}`}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all block">
            <div className="flex items-center gap-4 mb-4">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {m.role && (
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                {m.role}
              </span>
            )}
          </Link>
        ))}

        {members.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            ยังไม่มีทีมงาน —{' '}
            <Link href="/team/new" className="text-indigo-500 underline">เพิ่มคนแรก</Link>
          </div>
        )}
      </div>
    </div>
  )
}
