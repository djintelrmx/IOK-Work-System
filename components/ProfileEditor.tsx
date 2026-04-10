'use client'
import { useState, useRef, useTransition } from 'react'
import { updateProfile } from '@/app/profile/actions'
import { supabase } from '@/lib/supabase'

interface Member {
  id?: string | null
  name?: string | null
  email?: string | null
  role?: string | null
  avatar_url?: string | null
  phone?: string | null
}

export default function ProfileEditor({ member, userEmail }: { member: Member | null; userEmail: string }) {
  const [name, setName] = useState(member?.name ?? '')
  const [phone, setPhone] = useState((member as any)?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : (userEmail[0] ?? 'U').toUpperCase()

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${member?.id ?? userEmail.replace('@', '_')}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch (e: any) {
      setError('อัปโหลดรูปไม่สำเร็จ: ' + (e.message ?? 'กรุณาสร้าง bucket "avatars" ใน Supabase Storage'))
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError('')
    const fd = new FormData()
    fd.set('name', name)
    fd.set('phone', phone)
    if (avatarUrl) fd.set('avatar_url', avatarUrl)
    startTransition(async () => {
      const res = await updateProfile(fd)
      if (res?.error) setError(res.error)
      else setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
            {uploading ? '...' : 'เปลี่ยน'}
          </div>
        </button>
        <div>
          <p className="text-sm font-medium text-gray-700">รูปโปรไฟล์</p>
          <p className="text-xs text-gray-400 mt-0.5">คลิกที่รูปเพื่อเปลี่ยน (JPG, PNG)</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }} />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="ชื่อของคุณ" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
          <input value={userEmail} disabled
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">เบอร์โทรศัพท์</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="0XX-XXX-XXXX" />
        </div>
        {member?.role && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">บทบาท</label>
            <input value={member.role ?? ''} disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-green-600">บันทึกสำเร็จแล้ว</p>}

      <button type="submit" disabled={isPending || uploading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
        {isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
      </button>
    </form>
  )
}
