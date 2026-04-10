import { supabase } from '@/lib/supabase'
import type { Job, TeamMember } from '@/types/database'
import { notFound } from 'next/navigation'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import PrintControls from '@/components/PrintControls'

const LOGO = 'https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg'

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

  const billRef = job.job_number ? `IOK-INV-${job.job_number}` : `IOK-INV-${id.slice(0, 8).toUpperCase()}`
  const today = new Date().toISOString().split('T')[0]
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const income = job.income ?? 0
  const year = new Date().getFullYear() + 543
  const vatAmt = Math.round(income * 7 / 107)
  const beforeVat = income - vatAmt

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif !important; box-sizing: border-box; }
        body { background: white !important; color: #1e293b; font-size: 14px; line-height: 1.6; }
        .inv-page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 15mm; }
        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3730a3; padding-bottom: 16px; margin-bottom: 24px; }
        .inv-logo-box { display: flex; align-items: center; gap: 14px; }
        .inv-logo { width: 64px; height: 64px; object-fit: contain; }
        .inv-org strong { font-size: 15px; color: #1e293b; display: block; margin-bottom: 2px; }
        .inv-org span { font-size: 11px; color: #64748b; display: block; }
        .inv-doc-box { text-align: right; }
        .inv-doc-type { font-size: 22px; font-weight: 700; color: #3730a3; }
        .inv-doc-ref { font-size: 12px; color: #64748b; margin-top: 4px; }
        .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
        .inv-party-label { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .inv-party-name { font-size: 14px; font-weight: 600; }
        .inv-party-sub { font-size: 12px; color: #64748b; }
        table.inv-items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.inv-items th { background: #3730a3; color: white; padding: 8px 12px; font-size: 12px; font-weight: 600; text-align: left; }
        table.inv-items td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .inv-totals { margin-left: auto; width: 260px; }
        .inv-total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
        .inv-total-final { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; padding: 8px 0; margin-top: 4px; color: #3730a3; border-top: 2px solid #3730a3; }
        .inv-note { background: #f8fafc; border-left: 3px solid #3730a3; padding: 10px 14px; margin-top: 20px; font-size: 12px; color: #475569; }
        .inv-sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
        .inv-sig-box { text-align: center; }
        .inv-sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 56px; font-size: 13px; font-weight: 500; }
        .inv-sig-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
        .inv-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        .num { text-align: right; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .inv-page { padding: 15mm 15mm 10mm; }
        }
      `}} />

      <PrintControls />

      <div className="inv-page">
        <div className="inv-header">
          <div className="inv-logo-box">
            <img src={LOGO} alt="IOK" className="inv-logo" />
            <div className="inv-org">
              <strong>IOK — Institute of KBU Creative Media</strong>
              <span>มหาวิทยาลัยเกษมบัณฑิต</span>
              <span>1761 ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ กทม. 10240</span>
            </div>
          </div>
          <div className="inv-doc-box">
            <div className="inv-doc-type">ใบแจ้งหนี้</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>INVOICE</div>
            <div className="inv-doc-ref">เลขที่: {billRef}</div>
            <div className="inv-doc-ref">วันที่: {fmtDate(today)}</div>
          </div>
        </div>

        <div className="inv-parties">
          <div>
            <div className="inv-party-label">ผู้ออกใบแจ้งหนี้</div>
            <div className="inv-party-name">IOK Creative Media Unit</div>
            <div className="inv-party-sub">มหาวิทยาลัยเกษมบัณฑิต</div>
            <div className="inv-party-sub">โทร. — | อีเมล: iok@kbu.ac.th</div>
          </div>
          <div>
            <div className="inv-party-label">ลูกค้า / ผู้ว่าจ้าง</div>
            <div className="inv-party-name">{job.client_org}</div>
            <div className="inv-party-sub">แหล่งงาน: {job.source}</div>
            {job.approver_name && <div className="inv-party-sub">ผู้อนุมัติ: {job.approver_name}</div>}
          </div>
        </div>

        <table className="inv-items">
          <thead>
            <tr>
              <th style={{ width: '28px' }}>#</th>
              <th>รายการ</th>
              <th style={{ width: '90px' }}>วันที่</th>
              <th className="num" style={{ width: '120px' }}>จำนวนเงิน (บาท)</th>
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

        <div className="inv-totals">
          <div className="inv-total-row"><span>ราคาก่อน VAT</span><span>{fmt(beforeVat)} บาท</span></div>
          <div className="inv-total-row"><span>VAT 7%</span><span>{fmt(vatAmt)} บาท</span></div>
          <div className="inv-total-final"><span>ยอดรวมทั้งสิ้น</span><span>{fmt(income)} บาท</span></div>
        </div>

        <div className="inv-note">
          <strong>หมายเหตุ:</strong> กรุณาโอนเงินภายใน 30 วัน นับจากวันที่ในใบแจ้งหนี้<br />
          {job.doc_number && <>อ้างอิงหนังสือเลขที่ {job.doc_number}{job.doc_date ? ` ลงวันที่ ${fmtDate(job.doc_date)}` : ''}</>}
        </div>

        <div className="inv-sig-grid">
          <div className="inv-sig-box">
            <div className="inv-sig-line">ผู้รับเงิน / ผู้ออกบิล</div>
            <div className="inv-sig-sub">IOK Work System</div>
            <div className="inv-sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
          </div>
          <div className="inv-sig-box">
            <div className="inv-sig-line">ผู้อนุมัติ / ผู้บังคับบัญชา</div>
            <div className="inv-sig-sub">{job.approver_name ?? '............................................'}</div>
            <div className="inv-sig-sub" style={{ marginTop: '4px' }}>วันที่ ............/............/.............</div>
          </div>
        </div>

        <div className="inv-footer">
          <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต | ปี พ.ศ. {year}</span>
          <span>เลขอ้างอิง: {billRef}</span>
        </div>
      </div>
    </>
  )
}
