import { signupWithEmail } from './actions'
import Link from 'next/link'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const error = params?.error
  const success = params?.success

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-indigo-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">IOK</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">สมัครเข้าใช้งาน</h1>
        <p className="text-sm text-gray-400 text-center mb-6">IOK Work System — KBU</p>

        {success === '1' ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <p className="font-semibold text-gray-700">สมัครสำเร็จแล้ว</p>
            <p className="text-sm text-gray-400">กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน แล้วกลับมา Login</p>
            <Link href="/login"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
              ไปหน้า Login
            </Link>
          </div>
        ) : (
          <>
            {error === 'no_access' && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                อีเมลนี้ไม่มีในระบบ<br/>
                <span className="text-xs text-red-400">กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์ก่อน</span>
              </div>
            )}
            {error === 'signup_failed' && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                เกิดข้อผิดพลาด กรุณาลองใหม่
              </div>
            )}

            <form action={signupWithEmail} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ชื่อ-นามสกุล</label>
                <input name="name" type="text" required placeholder="ชื่อจริง นามสกุล"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">อีเมล</label>
                <input name="email" type="email" required placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">รหัสผ่าน</label>
                <input name="password" type="password" required placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <button type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                สมัครเข้าใช้งาน
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-5">
              มีบัญชีแล้ว?{' '}
              <Link href="/login" className="text-indigo-500 hover:underline">เข้าสู่ระบบ</Link>
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              * ต้องได้รับสิทธิ์จากผู้ดูแลระบบก่อนจึงจะสมัครได้
            </p>
          </>
        )}
      </div>
    </div>
  )
}
