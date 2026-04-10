import { supabase } from '@/lib/supabase'
import type { Job, TeamMember } from '@/types/database'
import { notFound } from 'next/navigation'
import Image from 'next/image'

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
  return new Date(d).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
function fmtTime(t: string) {
  const [h, m] = t.split(':')
  return `${parseInt(h)}.${m}`
}

export default async function PrintJobPage({ params }: { params: Promise<{ id: string }> }) {
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

  const jobRef = `IOK-${id.slice(0, 8).toUpperCase()}`
  const profit = (job.income ?? 0) - (job.expense ?? 0)
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <title>ใบสั่งงาน {jobRef}</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Sarabun', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
          body { background: white; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 15mm; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 20px; }
          .logo-box { display: flex; align-items: center; gap: 12px; }
          .logo-img { width: 60px; height: 60px; object-fit: contain; }
          .org-name { font-size: 11px; color: #64748b; line-height: 1.4; }
          .org-name strong { font-size: 14px; color: #1e293b; display: block; }
          .doc-box { text-align: right; }
          .doc-title { font-size: 20px; font-weight: 700; color: #3730a3; }
          .doc-ref { font-size: 12px; color: #64748b; margin-top: 2px; }
          .section { margin-bottom: 16px; }
          .section-title { font-size: 11px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
          table.info { width: 100%; border-collapse: collapse; }
          table.info td { padding: 5px 8px; font-size: 13px; vertical-align: top; }
          table.info td:first-child { width: 38%; color: #64748b; font-weight: 500; white-space: nowrap; }
          table.info td:last-child { font-weight: 400; border-bottom: 1px dotted #e2e8f0; }
          table.finance { width: 100%; border-collapse: collapse; }
          table.finance th { background: #3730a3; color: white; padding: 7px 10px; font-size: 12px; text-align: left; }
          table.finance td { padding: 6px 10px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          table.finance .num { text-align: right; }
          table.finance .total { background: #f8fafc; font-weight: 700; }
          .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .team-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 12px; }
          .team-name { font-weight: 600; }
          .team-role { color: #64748b; font-size: 11px; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
            background: ${job.status === 'done' ? '#dcfce7' : job.status === 'in_progress' ? '#fef9c3' : '#f1f5f9'};
            color: ${job.status === 'done' ? '#166534' : job.status === 'in_progress' ? '#854d0e' : '#475569'};
          }
          .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
          .sig-box { text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; margin-top: 50px; font-size: 12px; }
          .sig-label { font-size: 11px; color: #64748b; }
          .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 15mm 15mm 10mm; }
            .no-print { display: none; }
          }
        `}</style>
      </head>
      <body>
        {/* Print button — hidden when printing */}
        <div className="no-print" style={{ background: '#f8fafc', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => window.print()} style={{ background: '#3730a3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            🖨️ พิมพ์ / บันทึก PDF
          </button>
          <button onClick={() => window.close()} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            ✕ ปิด
          </button>
        </div>

        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="logo-box">
              <img src="/logo.png" alt="IOK Logo" className="logo-img" onError={(e: any) => { e.target.style.display='none' }} />
              <div className="org-name">
                <strong>IOK — Institute of KBU Creative Media</strong>
                มหาวิทยาลัยเกษมบัณฑิต
              </div>
            </div>
            <div className="doc-box">
              <div className="doc-title">ใบสั่งงาน</div>
              <div className="doc-ref">เลขที่ {jobRef}</div>
              <div className="doc-ref">วันที่พิมพ์ {fmtDate(new Date().toISOString().split('T')[0])}</div>
            </div>
          </div>

          {/* ข้อมูลงาน */}
          <div className="section">
            <div className="section-title">ข้อมูลงาน</div>
            <table className="info">
              <tbody>
                <tr><td>ชื่องาน / เรื่อง</td><td><strong>{job.title}</strong></td></tr>
                <tr><td>ประเภทงาน</td><td>{job.job_type}</td></tr>
                <tr><td>หน่วยงาน / ผู้ว่าจ้าง</td><td>{job.client_org}</td></tr>
                <tr><td>แหล่งที่มาของงาน</td><td>{job.source}</td></tr>
                <tr><td>วันที่ปฏิบัติงาน</td><td>{fmtDate(job.job_date)}</td></tr>
                {(job.job_time_start) && (
                  <tr><td>เวลา</td><td>{fmtTime(job.job_time_start)}{job.job_time_end ? ` - ${fmtTime(job.job_time_end)}` : ''} น.</td></tr>
                )}
                {job.location && <tr><td>สถานที่</td><td>{job.location}</td></tr>}
                <tr>
                  <td>สถานะ</td>
                  <td><span className="status-badge">{STATUS_LABEL[job.status]}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* การสั่งงาน */}
          <div className="section">
            <div className="section-title">รูปแบบการสั่งงาน</div>
            <table className="info">
              <tbody>
                <tr><td>ประเภทการสั่งงาน</td><td>{ORDER_LABEL[job.order_type]}</td></tr>
                {job.doc_number && <tr><td>เลขที่หนังสือ</td><td>{job.doc_number}</td></tr>}
                {job.doc_date && <tr><td>วันที่หนังสือ</td><td>{fmtDate(job.doc_date)}</td></tr>}
                {job.signer_name && <tr><td>ผู้ลงนาม / ผู้สั่งงาน</td><td>{job.signer_name}</td></tr>}
                {job.approver_name && <tr><td>ผู้อนุมัติงาน</td><td>{job.approver_name}</td></tr>}
                {job.supervisor_name && <tr><td>หัวหน้างานผู้จ่ายงาน</td><td>{job.supervisor_name}</td></tr>}
              </tbody>
            </table>
          </div>

          {/* ทีมงาน */}
          {job.job_assignments.length > 0 && (
            <div className="section">
              <div className="section-title">ทีมงานผู้ปฏิบัติงาน ({job.job_assignments.length} คน)</div>
              <div className="team-grid">
                {job.job_assignments.map((a, i) => (
                  <div key={i} className="team-card">
                    <div className="team-name">{a.team_members?.name}</div>
                    <div className="team-role">{a.role_in_job || a.team_members?.role || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* การเงิน */}
          <div className="section">
            <div className="section-title">สรุปการเงิน</div>
            <table className="finance">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th className="num">จำนวน (บาท)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>รายได้ / ค่าตอบแทน</td><td className="num" style={{color:'#166534',fontWeight:600}}>{fmt(job.income ?? 0)}</td></tr>
                <tr><td>รายจ่าย / ค่าใช้จ่าย</td><td className="num" style={{color:'#991b1b'}}>{fmt(job.expense ?? 0)}</td></tr>
                <tr className="total"><td>กำไรสุทธิ</td><td className="num" style={{color:profit>=0?'#166534':'#991b1b'}}>{fmt(profit)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* ลายเซ็น */}
          <div className="sig-grid">
            <div className="sig-box">
              <div className="sig-line">ผู้รับงาน</div>
              <div className="sig-label">วันที่ ............./............./.............</div>
            </div>
            <div className="sig-box">
              <div className="sig-line">หัวหน้างาน</div>
              <div className="sig-label">{job.supervisor_name ?? '............................................'}</div>
            </div>
            <div className="sig-box">
              <div className="sig-line">ผู้อนุมัติ</div>
              <div className="sig-label">{job.approver_name ?? '............................................'}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต</span>
            <span>เลขอ้างอิง: {jobRef}</span>
          </div>
        </div>
      </body>
    </html>
  )
}
