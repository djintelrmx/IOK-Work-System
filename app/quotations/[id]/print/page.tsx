import { supabase } from '@/lib/supabase'
import type { QuotationWithItems } from '@/types/database'
import { notFound } from 'next/navigation'
import PrintControls from '@/components/PrintControls'

const LOGO = 'https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function QuotationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: raw } = await (supabase as any)
    .from('quotations')
    .select('*, quotation_items(*), jobs(id, job_number, title)')
    .eq('id', id)
    .single()

  if (!raw) notFound()
  const qt = raw as QuotationWithItems

  const sortedItems = [...qt.quotation_items].sort((a, b) => a.sort_order - b.sort_order)
  const subtotal = sortedItems.reduce((s, i) => s + (i.amount ?? 0), 0)
  const afterDiscount = subtotal - (qt.discount ?? 0)
  const vatAmt = Math.round(afterDiscount * (qt.vat_percent ?? 7) / 100)
  const grand = afterDiscount + vatAmt
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const year = new Date().getFullYear() + 543

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif !important; box-sizing: border-box; }
        body { background: white !important; color: #1e293b; font-size: 14px; line-height: 1.6; }
        .qt-page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 18mm 14mm; }
        .qt-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3730a3; padding-bottom: 16px; margin-bottom: 24px; }
        .qt-logo-box { display: flex; align-items: center; gap: 14px; }
        .qt-logo { width: 64px; height: 64px; object-fit: contain; }
        .qt-org strong { font-size: 15px; color: #1e293b; display: block; }
        .qt-org span { font-size: 11px; color: #64748b; display: block; }
        .qt-doc-box { text-align: right; }
        .qt-doc-type { font-size: 22px; font-weight: 700; color: #3730a3; }
        .qt-doc-sub { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 1px; }
        .qt-doc-ref { font-size: 12px; color: #64748b; margin-top: 4px; }
        .qt-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 20px; }
        .qt-party-label { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px; }
        .qt-party-name { font-size: 14px; font-weight: 600; }
        .qt-party-sub { font-size: 12px; color: #64748b; }
        .qt-subject { background: #f8fafc; border-left: 3px solid #3730a3; padding: 10px 14px; margin-bottom: 20px; }
        .qt-subject strong { display: block; font-size: 14px; }
        .qt-subject span { font-size: 11px; color: #64748b; }
        table.qt-items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.qt-items th { background: #3730a3; color: white; padding: 8px 10px; font-size: 12px; font-weight: 600; text-align: left; }
        table.qt-items td { padding: 7px 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        table.qt-items tr.pad td { height: 28px; }
        .num { text-align: right; }
        .qt-totals { margin-left: auto; width: 260px; font-size: 13px; }
        .qt-total-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
        .qt-total-final { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 8px 0; margin-top: 4px; color: #3730a3; border-top: 2px solid #3730a3; }
        .qt-validity { margin-top: 12px; font-size: 12px; color: #64748b; }
        .qt-note { background: #f8fafc; border-left: 3px solid #e2e8f0; padding: 10px 14px; margin-top: 20px; font-size: 12px; color: #475569; }
        .qt-sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
        .qt-sig-box { text-align: center; }
        .qt-sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 56px; font-size: 13px; font-weight: 500; }
        .qt-sig-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
        .qt-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .qt-page { padding: 14mm 14mm 10mm; }
        }
      `}} />

      <PrintControls />

      <div className="qt-page">
        <div className="qt-header">
          <div className="qt-logo-box">
            <img src={LOGO} alt="IOK" className="qt-logo" />
            <div className="qt-org">
              <strong>IOK — Institute of KBU Creative Media</strong>
              <span>มหาวิทยาลัยเกษมบัณฑิต</span>
              <span>1761 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250</span>
              <span>โทร. 02-320-2777 | โทรสาร. 02-321-4444</span>
            </div>
          </div>
          <div className="qt-doc-box">
            <div className="qt-doc-type">ใบเสนอราคา</div>
            <div className="qt-doc-sub">QUOTATION</div>
            <div className="qt-doc-ref">เลขที่: <strong>{qt.quotation_number}</strong></div>
            <div className="qt-doc-ref">วันที่: {fmtDate(qt.issue_date)}</div>
            {qt.valid_until && <div className="qt-doc-ref">มีผลถึง: {fmtDate(qt.valid_until)}</div>}
            {qt.jobs && (
              <div className="qt-doc-ref" style={{ marginTop: '4px', color: '#3730a3', fontWeight: 600 }}>
                อ้างอิงงาน: {qt.jobs.job_number ?? qt.jobs.id.slice(0, 8)}
              </div>
            )}
          </div>
        </div>

        <div className="qt-parties">
          <div>
            <div className="qt-party-label">ผู้เสนอราคา</div>
            <div className="qt-party-name">IOK Creative Media Unit</div>
            <div className="qt-party-sub">มหาวิทยาลัยเกษมบัณฑิต</div>
            <div className="qt-party-sub">โทร. 02-320-2777 | อีเมล: iok@kbu.ac.th</div>
          </div>
          <div>
            <div className="qt-party-label">เสนอให้แก่</div>
            <div className="qt-party-name">{qt.client_org}</div>
            {qt.client_contact && <div className="qt-party-sub">ผู้ติดต่อ: {qt.client_contact}</div>}
          </div>
        </div>

        <div className="qt-subject">
          <span>เรื่อง: </span>
          <strong>{qt.subject}</strong>
          {qt.jobs && <span>อ้างอิงงาน: {qt.jobs.job_number} — {qt.jobs.title}</span>}
        </div>

        <table className="qt-items">
          <thead>
            <tr>
              <th style={{ width: '30px' }}>#</th>
              <th>รายการ</th>
              <th className="num" style={{ width: '70px' }}>จำนวน</th>
              <th style={{ width: '60px' }}>หน่วย</th>
              <th className="num" style={{ width: '110px' }}>ราคา/หน่วย (บาท)</th>
              <th className="num" style={{ width: '110px' }}>จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, i) => (
              <tr key={item.id}>
                <td style={{ color: '#94a3b8', textAlign: 'center' }}>{i + 1}</td>
                <td>{item.description}</td>
                <td className="num">{item.qty}</td>
                <td style={{ color: '#64748b', fontSize: '12px' }}>{item.unit}</td>
                <td className="num">{fmt(item.unit_price)}</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
            {sortedItems.length < 5 && Array.from({ length: 5 - sortedItems.length }).map((_, i) => (
              <tr key={`pad-${i}`} className="pad"><td colSpan={6}></td></tr>
            ))}
          </tbody>
        </table>

        <div className="qt-totals">
          <div className="qt-total-row"><span>ราคาก่อนภาษี</span><span>{fmt(subtotal)} บาท</span></div>
          {(qt.discount ?? 0) > 0 && (
            <div className="qt-total-row"><span>ส่วนลด</span><span>-{fmt(qt.discount)} บาท</span></div>
          )}
          <div className="qt-total-row"><span>ภาษีมูลค่าเพิ่ม {qt.vat_percent}%</span><span>{fmt(vatAmt)} บาท</span></div>
          <div className="qt-total-final"><span>ยอดรวมทั้งสิ้น</span><span>{fmt(grand)} บาท</span></div>
        </div>

        <div className="qt-validity">
          ใบเสนอราคานี้มีผลภายใน {qt.valid_until ? `วันที่ ${fmtDate(qt.valid_until)}` : '30 วัน'} นับจากวันที่ออกเอกสาร
        </div>

        {qt.note && <div className="qt-note"><strong>หมายเหตุ:</strong> {qt.note}</div>}

        <div className="qt-sig-grid">
          <div className="qt-sig-box">
            <div className="qt-sig-line">ผู้เสนอราคา</div>
            <div className="qt-sig-sub">IOK Work System</div>
            <div className="qt-sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
          </div>
          <div className="qt-sig-box">
            <div className="qt-sig-line">ผู้อนุมัติ / ผู้มีอำนาจ</div>
            <div className="qt-sig-sub">............................................</div>
            <div className="qt-sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
          </div>
        </div>

        <div className="qt-footer">
          <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต | ปี พ.ศ. {year}</span>
          <span>{qt.quotation_number}</span>
        </div>
      </div>
    </>
  )
}
