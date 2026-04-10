import { createClient } from '@/lib/supabase-server'
import { approveUser, rejectUser, resetPassword } from './actions'

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'รออนุมัติ', active: 'ใช้งานได้', inactive: 'ถูกระงับ',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('status')
    .order('created_at', { ascending: false })

  const all = members ?? []
  const pending = all.filter(m => m.status === 'pending')

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
        <p className="text-sm text-gray-400">
          รออนุมัติ <span className="font-semibold text-amber-600">{pending.length} คน</span>
          {' · '}ทั้งหมด {all.length} คน
        </p>
      </div>

      {/* รออนุมัติ */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-700 mb-3">⏳ รออนุมัติ ({pending.length} คน)</p>
          <div className="space-y-2">
            {pending.map(m => (
              <div key={m.id} className="bg-white rounded-lg border border-amber-100 p-3 flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <form action={approveUser.bind(null, m.id)}>
                    <button type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      ✓ อนุมัติ
                    </button>
                  </form>
                  <form action={rejectUser.bind(null, m.id)}>
                    <button type="submit"
                      className="border border-red-200 text-red-500 hover:bg-red-50 text-xs px-3 py-1.5 rounded-lg transition-colors">
                      ✕ ปฏิเสธ
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* รายชื่อทั้งหมด */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">บทบาท</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {all.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span className="font-medium">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{m.email}</td>
                <td className="px-4 py-3 text-gray-500">{m.role ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[m.status ?? 'active']}`}>
                    {STATUS_LABEL[m.status ?? 'active']}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    {m.status === 'pending' && (
                      <form action={approveUser.bind(null, m.id)}>
                        <button className="text-green-600 hover:underline text-xs">อนุมัติ</button>
                      </form>
                    )}
                    {m.status === 'active' && (
                      <form action={rejectUser.bind(null, m.id)}>
                        <button className="text-red-400 hover:underline text-xs">ระงับ</button>
                      </form>
                    )}
                    {m.status === 'inactive' && (
                      <form action={approveUser.bind(null, m.id)}>
                        <button className="text-indigo-500 hover:underline text-xs">เปิดใช้งาน</button>
                      </form>
                    )}
                    <form action={resetPassword.bind(null, m.email)}>
                      <button className="text-gray-400 hover:underline text-xs">Reset รหัสผ่าน</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
