'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuotationItemDraft, Job } from '@/types/database'

interface Props {
  jobs: Pick<Job, 'id' | 'job_number' | 'title'>[]
}

const EMPTY_ITEM: QuotationItemDraft = { sort_order: 0, description: '', qty: 1, unit: 'ครั้ง', unit_price: 0 }

export default function QuotationForm({ jobs }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Header fields
  const [clientOrg, setClientOrg] = useState('')
  const [clientContact, setClientContact] = useState('')
  const [subject, setSubject] = useState('')
  const [jobId, setJobId] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [validDays, setValidDays] = useState(30)
  const [note, setNote] = useState('')
  const [discount, setDiscount] = useState(0)
  const [vatPercent, setVatPercent] = useState(7)

  // Line items
  const [items, setItems] = useState<QuotationItemDraft[]>([{ ...EMPTY_ITEM }])

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM, sort_order: prev.length }])
  }
  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateItem(i: number, field: keyof QuotationItemDraft, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  // Totals
  const subtotal = items.reduce((s, item) => s + item.qty * item.unit_price, 0)
  const afterDiscount = subtotal - discount
  const vatAmt = Math.round(afterDiscount * vatPercent / 100)
  const grand = afterDiscount + vatAmt
  const fmt = (n: number) => n.toLocaleString('th-TH')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientOrg.trim() || !subject.trim()) { setError('กรุณากรอกหน่วยงานและหัวข้อ'); return }
    if (items.every(item => !item.description.trim())) { setError('กรุณาเพิ่มรายการอย่างน้อย 1 รายการ'); return }
    setSaving(true)
    setError('')

    const validUntil = new Date(issueDate)
    validUntil.setDate(validUntil.getDate() + validDays)

    const body = {
      client_org: clientOrg,
      client_contact: clientContact || null,
      subject,
      job_id: jobId || null,
      issue_date: issueDate,
      valid_until: validUntil.toISOString().split('T')[0],
      note: note || null,
      discount,
      vat_percent: vatPercent,
      status: 'draft',
      items: items.filter(item => item.description.trim()).map((item, i) => ({ ...item, sort_order: i })),
    }

    const res = await fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'เกิดข้อผิดพลาด'); setSaving(false); return }
    router.push(`/quotations/${data.quotationId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">ข้อมูลใบเสนอราคา</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หน่วยงาน / ผู้ว่าจ้าง <span className="text-red-400">*</span></label>
            <input value={clientOrg} onChange={e => setClientOrg(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="ชื่อหน่วยงาน / บริษัท" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ผู้ติดต่อ</label>
            <input value={clientContact} onChange={e => setClientContact(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="ชื่อผู้ติดต่อ" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">หัวข้อ / เรื่อง <span className="text-red-400">*</span></label>
            <input value={subject} onChange={e => setSubject(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="เช่น ค่าบริการถ่ายทอดสดพิธีเปิดงาน..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เชื่อมกับงาน (ถ้ามี)</label>
            <select value={jobId} onChange={e => setJobId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">— ไม่ระบุ —</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.job_number ?? j.id.slice(0, 8)} — {j.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่ออกเอกสาร</label>
            <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ใบเสนอราคามีผล (วัน)</label>
            <input type="number" value={validDays} onChange={e => setValidDays(Number(e.target.value))} min={1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">รายการสินค้า / บริการ</h2>
          <button type="button" onClick={addItem}
            className="text-sm px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium transition-colors">
            + เพิ่มรายการ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-1 text-xs text-gray-500 font-semibold w-8">#</th>
                <th className="text-left py-2 px-1 text-xs text-gray-500 font-semibold">รายการ</th>
                <th className="text-right py-2 px-1 text-xs text-gray-500 font-semibold w-16">จำนวน</th>
                <th className="text-left py-2 px-1 text-xs text-gray-500 font-semibold w-20">หน่วย</th>
                <th className="text-right py-2 px-1 text-xs text-gray-500 font-semibold w-28">ราคา/หน่วย</th>
                <th className="text-right py-2 px-1 text-xs text-gray-500 font-semibold w-28">รวม</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 px-1 text-gray-400 text-center">{i + 1}</td>
                  <td className="py-2 px-1">
                    <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      placeholder="รายละเอียด..." />
                  </td>
                  <td className="py-2 px-1">
                    <input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', Number(e.target.value))} min={0} step="0.5"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                  </td>
                  <td className="py-2 px-1">
                    <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      placeholder="ครั้ง" />
                  </td>
                  <td className="py-2 px-1">
                    <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))} min={0}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                  </td>
                  <td className="py-2 px-1 text-right font-medium text-gray-700 whitespace-nowrap">
                    {fmt(item.qty * item.unit_price)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-end gap-8">
            <div className="space-y-1.5 w-64">
              <div className="flex justify-between text-sm text-gray-600">
                <span>ยอดก่อนหักส่วนลด</span>
                <span>{fmt(subtotal)} บาท</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>ส่วนลด (บาท)</span>
                <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0}
                  className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>VAT (%)</span>
                <input type="number" value={vatPercent} onChange={e => setVatPercent(Number(e.target.value))} min={0} max={100}
                  className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>ภาษีมูลค่าเพิ่ม {vatPercent}%</span>
                <span>{fmt(vatAmt)} บาท</span>
              </div>
              <div className="flex justify-between font-bold text-base text-indigo-700 border-t border-gray-200 pt-2">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{fmt(grand)} บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          placeholder="เงื่อนไขการชำระเงิน, หมายเหตุอื่นๆ..." />
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

      <div className="flex gap-3 pb-6">
        <button type="submit" disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 text-sm">
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกใบเสนอราคา'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm transition-colors">
          ยกเลิก
        </button>
      </div>
    </form>
  )
}
