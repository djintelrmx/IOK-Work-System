'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-indigo-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">IOK</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">ลืมรหัสผ่าน</h1>
        <p className="text-sm text-gray-400 text-center mb-6">ระบบจะส่งลิงก์ reset ไปยังอีเมลของคุณ</p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <p className="font-semibold text-gray-700">ส่งอีเมลแล้ว</p>
            <p className="text-sm text-gray-400">กรุณาตรวจสอบอีเมล <strong>{email}</strong> แล้วกดลิงก์เพื่อตั้งรหัสผ่านใหม่</p>
            <Link href="/login" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2.5 rounded-xl text-sm font-medium transition-colors">
              กลับหน้า Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">อีเมล</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์ Reset รหัสผ่าน'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              <Link href="/login" className="text-indigo-500 hover:underline">← กลับหน้า Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
