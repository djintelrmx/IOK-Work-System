import { loginWithGoogle } from './actions'
import { loginWithEmail } from '../signup/actions'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params?.error

  const ERROR_MSG: Record<string, string> = {
    no_access: 'อีเมลนี้ไม่มีสิทธิ์เข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
    auth_failed: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
    invalid_credentials: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    pending: 'บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ',
    inactive: 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-indigo-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">IOK</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">IOK Work System</h1>
        <p className="text-sm text-gray-400 text-center mb-6">มหาวิทยาลัยเกษมบัณฑิต</p>

        {error && ERROR_MSG[error] && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {ERROR_MSG[error]}
          </div>
        )}

        {/* Google Login */}
        <form action={loginWithGoogle} className="mb-4">
          <button type="submit"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google (@kbu.ac.th)
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">หรือ</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Email/Password Login */}
        <form action={loginWithEmail} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">อีเมล</label>
            <input name="email" type="email" required placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">รหัสผ่าน</label>
            <input name="password" type="password" required placeholder="รหัสผ่าน"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          </div>
          <button type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="text-center mt-5 space-y-1">
          <p className="text-xs text-gray-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/signup" className="text-indigo-500 hover:underline">สมัครเข้าใช้งาน</Link>
          </p>
          <p className="text-xs text-gray-400">
            <Link href="/forgot-password" className="text-gray-400 hover:text-indigo-500 hover:underline">ลืมรหัสผ่าน?</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
