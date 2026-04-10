import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import type { Quotation } from '@/types/database'
import Link from 'next/link'

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

export default async function QuotationsPage() {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { data: raw } = await (supabase as any)
    .from('quotations')
    .select('*, quotation_items(amount)')
    .order('created_at', { ascending: false })

  const quotations = (raw ?? []) as (Quotation & { quotation_items: { amount: number }[] })[]
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ใบเสนอราคา</h1>
          <p className="text-sm text-gray-400">ทั้งหมด {quotations.length} ใบ</p>
        </div>
        <Link href="/quotations/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors">
          + สร้างใบเสนอราคา
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">ยังไม่มีใบเสนอราคา</p>
          <Link href="/quotations/new" className="mt-3 inline-block text-sm text-indigo-500 hover:underline">
            สร้างใบแรก →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">เลขที่</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">หน่วยงาน / หัวข้อ</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">วันที่</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ยอดรวม</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">สถานะ</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotations.map(qt => {
                  const subtotal = qt.quotation_items.reduce((s, i) => s + (i.amount ?? 0), 0)
                  const afterDiscount = subtotal - (qt.discount ?? 0)
                  const vatAmt = Math.round(afterDiscount * (qt.vat_percent ?? 7) / 100)
                  const grand = afterDiscount + vatAmt
                  return (
                    <tr key={qt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-semibold">{qt.quotation_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{qt.subject}</p>
                        <p className="text-xs text-gray-400">{qt.client_org}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(qt.issue_date)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(grand)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[qt.status]}`}>
                          {STATUS_LABEL[qt.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/quotations/${qt.id}`}
                            className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                            ดู
                          </Link>
                          <Link href={`/quotations/${qt.id}/print`} target="_blank"
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                            🖨️
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
