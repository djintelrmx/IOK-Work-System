import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import type { QuotationWithItems } from '@/types/database'
import Link from 'next/link'
import QuotationStatusForm from '@/components/QuotationStatusForm'

const STATUS_LABEL: Record<string, string> = {
  draft: 'ร่าง', sent: 'ส่งแล้ว', approved: 'อนุมัติ', rejected: 'ปฏิเสธ', cancelled: 'ยกเลิก',
}
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400',
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { id } = await params
  const { data: raw } = await (supabase as any)
    .from('quotations')
    .select('*, quotation_items(*), jobs(id, job_number, title)')
    .eq('id', id)
    .single()

  if (!raw) notFound()
  const qt = raw as QuotationWithItems

  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  const subtotal = qt.quotation_items.reduce((s, i) => s + (i.amount ?? 0), 0)
  const afterDiscount = subtotal - (qt.discount ?? 0)
  const vatAmt = Math.round(afterDiscount * (qt.vat_percent ?? 7) / 100)
  const grand = afterDiscount + vatAmt

  const sortedItems = [...qt.quotation_items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <Link href="/quotations" className="text-sm text-indigo-500 hover:underline">← กลับรายการ</Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-xs font-mono text-indigo-600 font-semibold mb-1">{qt.quotation_number}</p>
            <h1 className="text-xl font-bold text-gray-800">{qt.subject}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{qt.client_org}{qt.client_contact ? ` · ${qt.client_contact}` : ''}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[qt.status]}`}>
            {STATUS_LABEL[qt.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-gray-50 pt-4">
          <div><p className="text-xs text-gray-400">วันที่ออก</p><p className="font-medium">{fmtDate(qt.issue_date)}</p></div>
          {qt.valid_until && <div><p className="text-xs text-gray-400">มีผลถึง</p><p className="font-medium">{fmtDate(qt.valid_until)}</p></div>}
          {qt.jobs && <div><p className="text-xs text-gray-400">งานที่เชื่อม</p>
            <Link href={`/jobs/${qt.jobs.id}`} className="font-medium text-indigo-600 hover:underline">
              {qt.jobs.job_number ?? qt.jobs.id.slice(0, 8)} — {qt.jobs.title}
            </Link>
          </div>}
        </div>

        {/* Status changer */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium mb-2">เปลี่ยนสถานะ</p>
          <QuotationStatusForm quotationId={id} currentStatus={qt.status} />
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">รายการบริการ</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs text-gray-500 font-semibold">#</th>
              <th className="text-left py-2 text-xs text-gray-500 font-semibold">รายการ</th>
              <th className="text-right py-2 text-xs text-gray-500 font-semibold">จำนวน</th>
              <th className="text-left py-2 px-2 text-xs text-gray-500 font-semibold">หน่วย</th>
              <th className="text-right py-2 text-xs text-gray-500 font-semibold">ราคา/หน่วย</th>
              <th className="text-right py-2 text-xs text-gray-500 font-semibold">รวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedItems.map((item, i) => (
              <tr key={item.id}>
                <td className="py-2.5 text-gray-400 text-xs">{i + 1}</td>
                <td className="py-2.5 text-gray-800">{item.description}</td>
                <td className="py-2.5 text-right text-gray-600">{item.qty}</td>
                <td className="py-2.5 px-2 text-gray-500 text-xs">{item.unit}</td>
                <td className="py-2.5 text-right text-gray-600">{fmt(item.unit_price)}</td>
                <td className="py-2.5 text-right font-semibold text-gray-800">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>ยอดก่อนส่วนลด</span><span>{fmt(subtotal)} บาท</span></div>
            {qt.discount > 0 && <div className="flex justify-between text-gray-600"><span>ส่วนลด</span><span>-{fmt(qt.discount)} บาท</span></div>}
            <div className="flex justify-between text-gray-600"><span>VAT {qt.vat_percent}%</span><span>{fmt(vatAmt)} บาท</span></div>
            <div className="flex justify-between font-bold text-base text-indigo-700 border-t border-gray-200 pt-2">
              <span>ยอดรวมทั้งสิ้น</span><span>{fmt(grand)} บาท</span>
            </div>
          </div>
        </div>

        {qt.note && (
          <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
            <span className="font-medium text-gray-700">หมายเหตุ: </span>{qt.note}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-6">
        <Link href={`/quotations/${id}/print`} target="_blank"
          className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2.5 rounded-xl font-medium transition-colors min-w-[120px]">
          🖨️ พิมพ์ / PDF
        </Link>
        <Link href="/quotations"
          className="flex-1 text-center border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm py-2.5 rounded-xl transition-colors font-medium min-w-[100px]">
          กลับรายการ
        </Link>
      </div>
    </div>
  )
}
