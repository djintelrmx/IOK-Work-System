import { addTeamMember } from '../actions'
import RoleSelect from '@/components/RoleSelect'
import Link from 'next/link'

export default async function NewTeamMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="mb-6">
        <Link href="/team" className="text-sm text-indigo-500 hover:underline">← กลับรายการทีมงาน</Link>
        <h1 className="text-xl font-bold text-gray-800 mt-3">เพิ่มทีมงานใหม่</h1>
        <p className="text-sm text-gray-400">ผู้ที่เพิ่มจะมีสถานะ "ใช้งานได้" ทันที</p>
      </div>

      {error === 'duplicate' && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          อีเมลนี้มีในระบบแล้ว
        </div>
      )}

      <form action={addTeamMember} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">ชื่อ-นามสกุล *</label>
          <input
            name="name"
            required
            placeholder="ชื่อ นามสกุล"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">อีเมล *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="email@example.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">บทบาท</label>
          <RoleSelect name="role" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2.5 rounded-xl transition-colors font-medium"
          >
            เพิ่มทีมงาน
          </button>
          <Link
            href="/team"
            className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
