'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      org_type: fd.get('org_type'),
      contact_person: fd.get('contact_person') || null,
      phone: fd.get('phone') || null,
      email: fd.get('email') || null,
      address: fd.get('address') || null,
      notes: fd.get('notes') || null,
    }
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const { id } = await res.json()
      router.push(`/clients/${id}`)
    } else {
      alert('เกิดข้อผิดพลาด')
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-300'
  const labelCls = 'text-sm font-semibold text-gray-600 block mb-1'

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">เพิ่มหน่วยงาน / ลูกค้า</h1>
        <p className="text-sm text-gray-400 mt-0.5">เพิ่มข้อมูลหน่วยงานสำหรับอ้างอิงในใบงาน</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">ข้อมูลหน่วยงาน</p>
          <div>
            <label className={labelCls}>ชื่อหน่วยงาน / องค์กร <span className="text-red-400">*</span></label>
            <input name="name" required placeholder="เช่น คณะบริหารธุรกิจ, บริษัท ABC จำกัด" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ประเภท</label>
            <select name="org_type" className={inputCls}>
              <option value="internal">ภายในมหาวิทยาลัย</option>
              <option value="external">ภายนอกมหาวิทยาลัย</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ผู้ติดต่อ</label>
              <input name="contact_person" placeholder="ชื่อผู้ประสานงาน" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>โทรศัพท์</label>
              <input name="phone" placeholder="02-xxx-xxxx" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>อีเมล</label>
            <input name="email" type="email" placeholder="email@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ที่อยู่</label>
            <textarea name="address" rows={2} placeholder="ที่อยู่หน่วยงาน" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>หมายเหตุ</label>
            <textarea name="notes" rows={2} placeholder="ข้อมูลเพิ่มเติม..." className={inputCls} />
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <button type="button" onClick={() => router.back()}
            className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            {saving ? 'กำลังบันทึก...' : '✓ บันทึกหน่วยงาน'}
          </button>
        </div>
      </form>
    </div>
  )
}
