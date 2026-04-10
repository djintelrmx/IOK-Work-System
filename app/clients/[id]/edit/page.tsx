'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', org_type: 'internal', contact_person: '', phone: '', email: '', address: '', notes: '',
  })

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(data => {
      if (data) setForm({
        name: data.name ?? '',
        org_type: data.org_type ?? 'internal',
        contact_person: data.contact_person ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        notes: data.notes ?? '',
      })
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        org_type: form.org_type,
        contact_person: form.contact_person || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        notes: form.notes || null,
      }),
    })
    router.push(`/clients/${id}`)
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300'
  const labelCls = 'text-sm font-semibold text-gray-600 block mb-1'

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">แก้ไขข้อมูลหน่วยงาน</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className={labelCls}>ชื่อหน่วยงาน *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ประเภท</label>
            <select value={form.org_type} onChange={e => setForm(f => ({ ...f, org_type: e.target.value }))} className={inputCls}>
              <option value="internal">ภายในมหาวิทยาลัย</option>
              <option value="external">ภายนอกมหาวิทยาลัย</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ผู้ติดต่อ</label>
              <input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>โทรศัพท์</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>อีเมล</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ที่อยู่</label>
            <textarea rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>หมายเหตุ</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => router.back()}
            className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {saving ? 'กำลังบันทึก...' : '✓ บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </div>
  )
}
