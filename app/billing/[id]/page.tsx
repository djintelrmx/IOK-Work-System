import { supabase } from '@/lib/supabase'
import type { Job, TeamMember } from '@/types/database'
import { notFound } from 'next/navigation'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BillingInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { id } = await params
  const { data: raw } = await supabase
    .from('jobs')
    .select('*, job_assignments(role_in_job, team_members(name, role))')
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const job = raw as Job & {
    job_assignments: { role_in_job: string | null; team_members: Pick<TeamMember, 'name' | 'role'> }[]
  }

  const billRef = `IOK-INV-${id.slice(0, 8).toUpperCase()}`
  const today = new Date().toISOString().split('T')[0]
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const income = job.income ?? 0
  const expense = job.expense ?? 0
  const year = new Date().getFullYear() + 543

  // VAT 7%
  const vatAmt = Math.round(income * 7 / 107)
  const beforeVat = income - vatAmt

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <title>ใบแจ้งหนี้ {billRef}</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Sarabun', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
          body { background: white; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 15mm; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3730a3; padding-bottom: 16px; margin-bottom: 24px; }
          .logo-box { display: flex; align-items: center; gap: 14px; }
          .logo-img { width: 64px; height: 64px; object-fit: contain; }
          .org-name strong { font-size: 15px; color: #1e293b; display: block; margin-bottom: 2px; }
          .org-name span { font-size: 11px; color: #64748b; display: block; }
          .doc-box { text-align: right; }
          .doc-type { font-size: 22px; font-weight: 700; color: #3730a3; }
          .doc-ref { font-size: 12px; color: #64748b; margin-top: 4px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
          .party-box { }
          .party-label { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
          .party-name { font-size: 14px; font-weight: 600; color: #1e293b; }
          .party-sub { font-size: 12px; color: #64748b; }
          table.items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          table.items th { background: #3730a3; color: white; padding: 8px 12px; font-size: 12px; font-weight: 600; text-align: left; }
          table.items td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          table.items .num { text-align: right; }
          .totals { margin-left: auto; width: 260px; }
          .total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
          .total-final { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 8px 0; margin-top: 4px; color: #3730a3; border-top: 2px solid #3730a3; }
          .note-box { background: #f8fafc; border-left: 3px solid #3730a3; padding: 10px 14px; margin-top: 20px; font-size: 12px; color: #475569; }
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 56px; font-size: 13px; font-weight: 500; }
          .sig-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
          .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
            .page { padding: 15mm 15mm 10mm; }
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
              <img src="https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg" alt="IOK" className="logo-img" onError={(e: any) => { e.target.style.display = 'none' }} />
              <div className="org-name">
                <strong>IOK — Institute of KBU Creative Media</strong>
                <span>มหาวิทยาลัยเกษมบัณฑิต</span>
                <span>1761 ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ กทม. 10240</span>
              </div>
            </div>
            <div className="doc-box">
              <div className="doc-type">ใบแจ้งหนี้</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>INVOICE</div>
              <div className="doc-ref">เลขที่: {billRef}</div>
              <div className="doc-ref">วันที่: {fmtDate(today)}</div>
            </div>
          </div>

          {/* Parties */}
          <div className="parties">
            <div className="party-box">
              <div className="party-label">ผู้ออกใบแจ้งหนี้</div>
              <div className="party-name">IOK Creative Media Unit</div>
              <div className="party-sub">มหาวิทยาลัยเกษมบัณฑิต</div>
              <div className="party-sub">โทร. — | อีเมล: iok@kbu.ac.th</div>
            </div>
            <div className="party-box">
              <div className="party-label">ลูกค้า / ผู้ว่าจ้าง</div>
              <div className="party-name">{job.client_org}</div>
              <div className="party-sub">แหล่งงาน: {job.source}</div>
              {job.approver_name && <div className="party-sub">ผู้อนุมัติ: {job.approver_name}</div>}
            </div>
          </div>

          {/* Items */}
          <table className="items">
            <thead>
              <tr>
                <th style={{ width: '28px' }}>#</th>
                <th>รายการ</th>
                <th style={{ width: '90px' }}>วันที่</th>
                <th className="num" style={{ width: '100px' }}>จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>{job.title}</strong>
                  {job.description && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{job.description}</div>}
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ประเภท: {job.job_type}</div>
                  {job.location && <div style={{ fontSize: '11px', color: '#64748b' }}>สถานที่: {job.location}</div>}
                </td>
                <td>{fmtDate(job.job_date)}</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmt(beforeVat)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="total-row">
              <span style={{ color: '#64748b' }}>ราคาก่อน VAT</span>
              <span>{fmt(beforeVat)} บาท</span>
            </div>
            <div className="total-row">
              <span style={{ color: '#64748b' }}>VAT 7%</span>
              <span>{fmt(vatAmt)} บาท</span>
            </div>
            <div className="total-final">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>{fmt(income)} บาท</span>
            </div>
          </div>

          {/* Note */}
          <div className="note-box">
            <strong>หมายเหตุ:</strong> กรุณาโอนเงินภายใน 30 วัน นับจากวันที่ในใบแจ้งหนี้<br />
            {job.doc_number && <>อ้างอิงหนังสือเลขที่ {job.doc_number} {job.doc_date ? `ลงวันที่ ${fmtDate(job.doc_date)}` : ''}</>}
          </div>

          {/* Signatures */}
          <div className="sig-grid">
            <div className="sig-box">
              <div className="sig-line">ผู้รับเงิน / ผู้ออกบิล</div>
              <div className="sig-sub">IOK Work System</div>
              <div className="sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
            </div>
            <div className="sig-box">
              <div className="sig-line">ผู้อนุมัติ / ผู้บังคับบัญชา</div>
              <div className="sig-sub">{job.approver_name ?? '............................................'}</div>
              <div className="sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
            </div>
          </div>

          <div className="footer">
            <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต | ปี พ.ศ. {year}</span>
            <span>เลขอ้างอิง: {billRef}</span>
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
