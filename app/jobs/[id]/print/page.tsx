import { supabase } from '@/lib/supabase'
import type { Job, TeamMember } from '@/types/database'
import { notFound } from 'next/navigation'
import PrintControls from '@/components/PrintControls'
import { headers } from 'next/headers'

const ORDER_LABEL: Record<string, string> = {
  letter: 'ผ่านหนังสือราชการ',
  direct: 'หัวหน้าสั่งโดยตรง',
  other: 'อื่นๆ',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังดำเนินการ',
  done: 'เสร็จสิ้น',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':')
  return `${parseInt(h)}.${m}`
}

const LOGO = 'https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg'

export default async function PrintJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: raw } = await supabase
    .from('jobs')
    .select('*, job_assignments(role_in_job, team_members(name, role))')
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = host.includes('localhost') ? 'http' : 'https'
  const jobUrl = `${proto}://${host}/jobs/${id}`

  const job = raw as Job & {
    job_assignments: { role_in_job: string | null; team_members: Pick<TeamMember, 'name' | 'role'> }[]
  }

  const jobRef = job.job_number ?? `IOK-${id.slice(0, 8).toUpperCase()}`
  const profit = (job.income ?? 0) - (job.expense ?? 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const statusBg = job.status === 'done' ? '#dcfce7' : job.status === 'in_progress' ? '#fef9c3' : '#f1f5f9'
  const statusColor = job.status === 'done' ? '#166534' : job.status === 'in_progress' ? '#854d0e' : '#475569'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif !important; box-sizing: border-box; }
        body { background: white !important; color: #1e293b; font-size: 14px; line-height: 1.6; }
        .print-page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 15mm; }
        .p-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 20px; }
        .p-logo-box { display: flex; align-items: center; gap: 12px; }
        .p-logo { width: 60px; height: 60px; object-fit: contain; }
        .p-org strong { font-size: 14px; color: #1e293b; display: block; }
        .p-org span { font-size: 11px; color: #64748b; }
        .p-doc-box { text-align: right; }
        .p-doc-title { font-size: 20px; font-weight: 700; color: #3730a3; }
        .p-doc-ref { font-size: 12px; color: #64748b; margin-top: 2px; }
        .p-section { margin-bottom: 16px; }
        .p-section-title { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
        table.p-info { width: 100%; border-collapse: collapse; }
        table.p-info td { padding: 5px 8px; font-size: 13px; vertical-align: top; }
        table.p-info td:first-child { width: 38%; color: #64748b; font-weight: 500; white-space: nowrap; }
        table.p-info td:last-child { border-bottom: 1px dotted #e2e8f0; }
        table.p-finance { width: 100%; border-collapse: collapse; }
        table.p-finance th { background: #3730a3; color: white; padding: 7px 10px; font-size: 12px; text-align: left; }
        table.p-finance td { padding: 6px 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        table.p-finance .num { text-align: right; }
        table.p-finance .total { background: #f8fafc; font-weight: 700; }
        .p-team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .p-team-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 12px; }
        .p-team-name { font-weight: 600; }
        .p-team-role { color: #64748b; font-size: 11px; }
        .p-sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
        .p-sig-box { text-align: center; }
        .p-sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 50px; font-size: 12px; }
        .p-sig-label { font-size: 11px; color: #64748b; }
        .p-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        .no-print { }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { padding: 15mm 15mm 10mm; }
          .no-print { display: none !important; }
        }
      `}} />

      <PrintControls />

      <div className="print-page">
        <div className="p-header">
          <div className="p-logo-box">
            <img src={LOGO} alt="IOK Logo" className="p-logo" />
            <div className="p-org">
              <strong>IOK — Institute of KBU Creative Media</strong>
              <span>มหาวิทยาลัยเกษมบัณฑิต</span>
              <span>1761 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250</span>
              <span>โทร. 02-320-2777 | โทรสาร. 02-321-4444</span>
            </div>
          </div>
          <div className="p-doc-box">
            <div className="p-doc-title">ใบสั่งงาน</div>
            <div className="p-doc-ref">เลขที่ {jobRef}</div>
            <div className="p-doc-ref">วันที่พิมพ์ {fmtDate(new Date().toISOString().split('T')[0])}</div>
          </div>
        </div>

        <div className="p-section">
          <div className="p-section-title">ข้อมูลงาน</div>
          <table className="p-info"><tbody>
            <tr><td>ชื่องาน / เรื่อง</td><td><strong>{job.title}</strong></td></tr>
            <tr><td>ประเภทงาน</td><td>{job.job_type}</td></tr>
            <tr><td>หน่วยงาน / ผู้ว่าจ้าง</td><td>{job.client_org}</td></tr>
            <tr><td>แหล่งที่มาของงาน</td><td>{job.source}</td></tr>
            <tr><td>วันที่ปฏิบัติงาน</td><td>{fmtDate(job.job_date)}</td></tr>
            {job.job_time_start && <tr><td>เวลา</td><td>{fmtTime(job.job_time_start)}{job.job_time_end ? ` - ${fmtTime(job.job_time_end)}` : ''} น.</td></tr>}
            {job.location && <tr><td>สถานที่</td><td>{job.location}</td></tr>}
            <tr><td>สถานะ</td><td><span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:statusBg, color:statusColor }}>{STATUS_LABEL[job.status]}</span></td></tr>
          </tbody></table>
        </div>

        <div className="p-section">
          <div className="p-section-title">รูปแบบการสั่งงาน</div>
          <table className="p-info"><tbody>
            <tr><td>ประเภทการสั่งงาน</td><td>{ORDER_LABEL[job.order_type]}</td></tr>
            {job.doc_number && <tr><td>เลขที่หนังสือ</td><td>{job.doc_number}</td></tr>}
            {job.doc_date && <tr><td>วันที่หนังสือ</td><td>{fmtDate(job.doc_date)}</td></tr>}
            {job.signer_name && <tr><td>ผู้ลงนาม / ผู้สั่งงาน</td><td>{job.signer_name}</td></tr>}
            {job.approver_name && <tr><td>ผู้อนุมัติงาน</td><td>{job.approver_name}</td></tr>}
            {job.supervisor_name && <tr><td>หัวหน้างานผู้จ่ายงาน</td><td>{job.supervisor_name}</td></tr>}
          </tbody></table>
        </div>

        {job.job_assignments.length > 0 && (
          <div className="p-section">
            <div className="p-section-title">ทีมงานผู้ปฏิบัติงาน ({job.job_assignments.length} คน)</div>
            <div className="p-team-grid">
              {job.job_assignments.map((a, i) => (
                <div key={i} className="p-team-card">
                  <div className="p-team-name">{a.team_members?.name}</div>
                  <div className="p-team-role">{a.role_in_job || a.team_members?.role || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-section">
          <div className="p-section-title">สรุปการเงิน</div>
          <table className="p-finance">
            <thead><tr><th>รายการ</th><th className="num">จำนวน (บาท)</th></tr></thead>
            <tbody>
              <tr><td>รายได้ / ค่าตอบแทน</td><td className="num" style={{color:'#166534',fontWeight:600}}>{fmt(job.income ?? 0)}</td></tr>
              <tr><td>รายจ่าย / ค่าใช้จ่าย</td><td className="num" style={{color:'#991b1b'}}>{fmt(job.expense ?? 0)}</td></tr>
              <tr className="total"><td>กำไรสุทธิ</td><td className="num" style={{color:profit>=0?'#166534':'#991b1b'}}>{fmt(profit)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="p-sig-grid">
          {['ผู้รับงาน','หัวหน้างาน','ผู้อนุมัติ'].map((label, i) => (
            <div key={i} className="p-sig-box">
              <div className="p-sig-line">{label}</div>
              <div className="p-sig-label">วันที่ ............./............./.............</div>
            </div>
          ))}
        </div>

        <div className="p-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(jobUrl)}`}
              alt="QR" style={{ width: '64px', height: '64px' }}
            />
            <span>{jobRef}</span>
          </div>
        </div>
      </div>
    </>
  )
}
