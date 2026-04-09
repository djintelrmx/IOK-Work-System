'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('เกิดข้อผิดพลาด กรุณาลองใหม่'); setLoading(false); return }

    router.push('/login?success=password_reset')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-indigo-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">IOK</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-sm text-gray-400 text-center mb-6">กรอกรหัสผ่านใหม่ของคุณ</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">รหัสผ่านใหม่</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">ยืนยันรหัสผ่าน</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  )
}
