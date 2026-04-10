import { supabase } from '@/lib/supabase'
import type { QuotationWithItems } from '@/types/database'
import { notFound } from 'next/navigation'

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
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <title>ใบเสนอราคา {qt.quotation_number}</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Sarabun', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
          body { background: white; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 18mm 14mm; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3730a3; padding-bottom: 16px; margin-bottom: 24px; }
          .logo-box { display: flex; align-items: center; gap: 14px; }
          .logo-img { width: 64px; height: 64px; object-fit: contain; }
          .org-name strong { font-size: 15px; color: #1e293b; display: block; }
          .org-name span { font-size: 11px; color: #64748b; display: block; }
          .doc-box { text-align: right; }
          .doc-type { font-size: 22px; font-weight: 700; color: #3730a3; }
          .doc-sub  { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 1px; }
          .doc-ref  { font-size: 12px; color: #64748b; margin-top: 4px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 20px; }
          .party-label { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px; }
          .party-name  { font-size: 14px; font-weight: 600; }
          .party-sub   { font-size: 12px; color: #64748b; }
          .subject-box { background: #f8fafc; border-left: 3px solid #3730a3; padding: 10px 14px; margin-bottom: 20px; font-size: 13px; }
          .subject-box strong { display: block; font-size: 14px; color: #1e293b; }
          table.items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          table.items th { background: #3730a3; color: white; padding: 8px 10px; font-size: 12px; font-weight: 600; text-align: left; }
          table.items td { padding: 7px 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .num { text-align: right; }
          .totals { margin-left: auto; width: 260px; font-size: 13px; }
          .total-row  { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
          .total-final { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 8px 0; margin-top: 4px; color: #3730a3; border-top: 2px solid #3730a3; }
          .note-box { background: #f8fafc; border-left: 3px solid #e2e8f0; padding: 10px 14px; margin-top: 20px; font-size: 12px; color: #475569; }
          .validity { margin-top: 12px; font-size: 12px; color: #64748b; }
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 56px; font-size: 13px; font-weight: 500; }
          .sig-sub  { font-size: 11px; color: #64748b; margin-top: 2px; }
          .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
            .page { padding: 14mm 14mm 10mm; }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ background: '#f8fafc', padding: '12px 20px', display: 'flex', gap: '10px' }}>
          <button id="btn-print" style={{ background: '#3730a3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            🖨️ พิมพ์ / บันทึก PDF
          </button>
          <button id="btn-close" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            ✕ ปิด
          </button>
        </div>

        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="logo-box">
              <img src="https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.png" alt="IOK" className="logo-img" onError={(e: any) => { e.target.style.display = 'none' }} />
              <div className="org-name">
                <strong>IOK — Institute of KBU Creative Media</strong>
                <span>มหาวิทยาลัยเกษมบัณฑิต</span>
                <span>1761 ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ กทม. 10240</span>
              </div>
            </div>
            <div className="doc-box">
              <div className="doc-type">ใบเสนอราคา</div>
              <div className="doc-sub">QUOTATION</div>
              <div className="doc-ref">เลขที่: <strong>{qt.quotation_number}</strong></div>
              <div className="doc-ref">วันที่: {fmtDate(qt.issue_date)}</div>
              {qt.valid_until && <div className="doc-ref">มีผลถึง: {fmtDate(qt.valid_until)}</div>}
              {qt.jobs && (
                <div className="doc-ref" style={{ marginTop: '4px', color: '#3730a3', fontWeight: 600 }}>
                  อ้างอิงงาน: {qt.jobs.job_number ?? qt.jobs.id.slice(0, 8)}
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="parties">
            <div>
              <div className="party-label">ผู้เสนอราคา</div>
              <div className="party-name">IOK Creative Media Unit</div>
              <div className="party-sub">มหาวิทยาลัยเกษมบัณฑิต</div>
              <div className="party-sub">โทร. — | อีเมล: iok@kbu.ac.th</div>
            </div>
            <div>
              <div className="party-label">เสนอให้แก่</div>
              <div className="party-name">{qt.client_org}</div>
              {qt.client_contact && <div className="party-sub">ผู้ติดต่อ: {qt.client_contact}</div>}
            </div>
          </div>

          {/* Subject */}
          <div className="subject-box">
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>เรื่อง: </span>
            <strong>{qt.subject}</strong>
            {qt.jobs && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                อ้างอิงงาน: {qt.jobs.job_number} — {qt.jobs.title}
              </div>
            )}
          </div>

          {/* Items table */}
          <table className="items">
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
              {/* Padding rows for short lists */}
              {sortedItems.length < 5 && Array.from({ length: 5 - sortedItems.length }).map((_, i) => (
                <tr key={`pad-${i}`}><td colSpan={6} style={{ height: '28px' }}></td></tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="total-row"><span>ราคาก่อนภาษี</span><span>{fmt(subtotal)} บาท</span></div>
            {(qt.discount ?? 0) > 0 && (
              <div className="total-row"><span>ส่วนลด</span><span>-{fmt(qt.discount)} บาท</span></div>
            )}
            <div className="total-row"><span>ภาษีมูลค่าเพิ่ม {qt.vat_percent}%</span><span>{fmt(vatAmt)} บาท</span></div>
            <div className="total-final"><span>ยอดรวมทั้งสิ้น</span><span>{fmt(grand)} บาท</span></div>
          </div>

          {/* Validity & note */}
          <div className="validity">
            ใบเสนอราคานี้มีผลภายใน {qt.valid_until ? `วันที่ ${fmtDate(qt.valid_until)}` : '30 วัน'} นับจากวันที่ออกเอกสาร
          </div>
          {qt.note && (
            <div className="note-box">
              <strong>หมายเหตุ:</strong> {qt.note}
            </div>
          )}

          {/* Signatures */}
          <div className="sig-grid">
            <div className="sig-box">
              <div className="sig-line">ผู้เสนอราคา</div>
              <div className="sig-sub">IOK Work System</div>
              <div className="sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
            </div>
            <div className="sig-box">
              <div className="sig-line">ผู้อนุมัติ / ผู้มีอำนาจ</div>
              <div className="sig-sub">............................................</div>
              <div className="sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
            </div>
          </div>

          <div className="footer">
            <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต | ปี พ.ศ. {year}</span>
            <span>{qt.quotation_number}</span>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('btn-print').onclick = function(){ window.print(); };
          document.getElementById('btn-close').onclick = function(){ window.close(); };
        `}} />
      </body>
    </html>
  )
}
