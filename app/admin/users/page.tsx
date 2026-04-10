import { createClient } from '@/lib/supabase-server'
import { approveUser, rejectUser, activateUser, deleteUser, updateRole, updateName, addUser, resetPassword } from './actions'
import RoleSelect from '@/components/RoleSelect'

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
  const active  = all.filter(m => m.status === 'active')
  const inactive = all.filter(m => m.status === 'inactive')

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-gray-400">
            รออนุมัติ <span className="font-semibold text-amber-600">{pending.length} คน</span>
            {' · '}ทั้งหมด {all.length} คน
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{active.length}</p>
          <p className="text-xs text-green-700 font-medium mt-0.5">ใช้งานได้</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5">รออนุมัติ</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{inactive.length}</p>
          <p className="text-xs text-red-600 font-medium mt-0.5">ถูกระงับ</p>
        </div>
      </div>

      {/* เพิ่มผู้ใช้ */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">+ เพิ่มผู้ใช้งานใหม่</h2>
        <form action={addUser} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1">ชื่อ-นามสกุล</label>
            <input name="name" required placeholder="ชื่อ นามสกุล"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1">อีเมล</label>
            <input name="email" type="email" required placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 block mb-1">บทบาท</label>
            <RoleSelect name="role" />
          </div>
          <button type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">
            เพิ่มผู้ใช้
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">* ผู้ใช้ที่เพิ่มจะสามารถตั้งรหัสผ่านได้โดยไปสมัครที่หน้า <span className="font-mono">/signup</span> ด้วยอีเมลเดียวกัน</p>
      </div>

      {/* รออนุมัติ */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-700 mb-4">⏳ รออนุมัติ ({pending.length} คน)</p>
          <div className="space-y-3">
            {pending.map(m => (
              <div key={m.id} className="bg-white rounded-xl border border-amber-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    {m.name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <form action={approveUser.bind(null, m.id)} className="flex flex-wrap gap-2 items-start flex-1">
                    <div className="flex-1 min-w-[160px]">
                      <RoleSelect name="role" />
                    </div>
                    <button type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium mt-0.5">
                      ✓ อนุมัติ
                    </button>
                  </form>
                  <form action={rejectUser.bind(null, m.id)}>
                    <button type="submit"
                      className="border border-red-200 text-red-500 hover:bg-red-50 text-sm px-4 py-2 rounded-lg transition-colors">
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
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">รายชื่อผู้ใช้ทั้งหมด</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {all.map(m => (
            <div key={m.id} className="p-4 hover:bg-gray-50">
              {/* แถวบน: avatar + ชื่อ + อีเมล + สถานะ */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {m.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  {/* ชื่อ — แก้ไขได้ inline */}
                  <form action={updateName.bind(null, m.id)} className="flex items-center gap-2 mb-0.5">
                    <input name="name" defaultValue={m.name}
                      className="font-medium text-gray-800 text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none w-full max-w-[200px] py-0.5" />
                    <button type="submit" className="text-xs text-gray-400 hover:text-indigo-500 flex-shrink-0">บันทึก</button>
                  </form>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLE[m.status ?? 'active']}`}>
                  {STATUS_LABEL[m.status ?? 'active']}
                </span>
              </div>

              {/* แถวกลาง: บทบาท */}
              <form action={updateRole.bind(null, m.id)} className="flex items-start gap-2 mb-3">
                <label className="text-xs text-gray-400 flex-shrink-0 mt-2">บทบาท:</label>
                <div className="flex-1 max-w-[220px]">
                  <RoleSelect name="role" defaultValue={m.role} />
                </div>
                <button type="submit" className="text-xs text-gray-400 hover:text-indigo-500 mt-2 flex-shrink-0">บันทึก</button>
              </form>

              {/* แถวล่าง: Action buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Reset รหัสผ่าน */}
                <form action={resetPassword.bind(null, m.email)}>
                  <button type="submit"
                    className="text-xs border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 px-3 py-1.5 rounded-lg transition-colors">
                    🔑 Reset รหัสผ่าน
                  </button>
                </form>

                {/* ระงับ / เปิดใช้งาน */}
                {m.status === 'active' && (
                  <form action={rejectUser.bind(null, m.id)}>
                    <button type="submit"
                      className="text-xs border border-amber-200 hover:bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg transition-colors">
                      🚫 ระงับการใช้งาน
                    </button>
                  </form>
                )}
                {m.status === 'inactive' && (
                  <form action={activateUser.bind(null, m.id)}>
                    <button type="submit"
                      className="text-xs border border-green-200 hover:bg-green-50 text-green-600 px-3 py-1.5 rounded-lg transition-colors">
                      ✓ เปิดใช้งาน
                    </button>
                  </form>
                )}
                {m.status === 'pending' && (
                  <form action={approveUser.bind(null, m.id)}>
                    <input type="hidden" name="role" value="" />
                    <button type="submit"
                      className="text-xs border border-green-200 hover:bg-green-50 text-green-600 px-3 py-1.5 rounded-lg transition-colors">
                      ✓ อนุมัติ
                    </button>
                  </form>
                )}

                {/* ลบ */}
                <form action={deleteUser.bind(null, m.id)}>
                  <button type="submit"
                    className="text-xs border border-red-200 hover:bg-red-50 text-red-500 px-3 py-1.5 rounded-lg transition-colors">
                    🗑 ลบผู้ใช้
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
