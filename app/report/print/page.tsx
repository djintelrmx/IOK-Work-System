import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'

const LOGO = 'https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg'
const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }

export default async function ReportPrintPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const level = await getAccessLevel()
  if (level !== 'admin') redirect('/')

  const sp = await searchParams
  const now = new Date()
  const year = sp.year ? parseInt(sp.year) : now.getFullYear()

  const { data: raw } = await supabase
    .from('jobs')
    .select('*')
    .gte('job_date', `${year}-01-01`)
    .lte('job_date', `${year}-12-31`)
    .order('job_date')

  const jobs = (raw ?? []) as Job[]
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const totalIncome = jobs.reduce((s, j) => s + (j.income ?? 0), 0)
  const totalExpense = jobs.reduce((s, j) => s + (j.expense ?? 0), 0)
  const totalProfit = totalIncome - totalExpense
  const inner = jobs.filter(j => j.source === 'ภายในมหาวิทยาลัย').length
  const outer = jobs.filter(j => j.source === 'ภายนอกมหาวิทยาลัย').length
  const done = jobs.filter(j => j.status === 'done').length

  const byType = jobs.reduce<Record<string, { count: number; income: number }>>((acc, j) => {
    if (!acc[j.job_type]) acc[j.job_type] = { count: 0, income: 0 }
    acc[j.job_type].count++
    acc[j.job_type].income += j.income ?? 0
    return acc
  }, {})

  const byMonth = Array.from({ length: 12 }, (_, i) => ({ label: MONTH_NAMES[i], count: 0, income: 0, expense: 0 }))
  for (const j of jobs) {
    const m = parseInt(j.job_date.slice(5, 7)) - 1
    byMonth[m].count++
    byMonth[m].income += j.income ?? 0
    byMonth[m].expense += j.expense ?? 0
  }

  const printDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif !important; box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; color: #1e293b; font-size: 13px; line-height: 1.6; }
        .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 18mm 14mm; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 18px; }
        .logo { width: 55px; height: 55px; object-fit: contain; }
        .org strong { font-size: 13px; color: #1e293b; display: block; }
        .org span { font-size: 10px; color: #64748b; display: block; }
        .doc-title { font-size: 18px; font-weight: 700; color: #3730a3; text-align: right; }
        .doc-sub { font-size: 11px; color: #64748b; text-align: right; margin-top: 2px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 10px; font-weight: 700; color: #3730a3; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 8px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .stat-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; }
        .stat-val { font-size: 18px; font-weight: 700; color: #3730a3; }
        .stat-label { font-size: 10px; color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #3730a3; color: white; padding: 6px 8px; text-align: left; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .num { text-align: right; }
        .total-row td { font-weight: 700; background: #f8fafc; border-top: 2px solid #cbd5e1; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { padding: 12mm; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="no-print" style={{ padding: '16px', display: 'flex', gap: '8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          🖨️ พิมพ์รายงาน
        </button>
        <a href={`/report?year=${year}`} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: '#374151', fontSize: '14px' }}>
          ← กลับ
        </a>
      </div>

      <div className="page">
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={LOGO} alt="IOK" className="logo" />
            <div className="org">
              <strong>IOK — Institute of KBU Creative Media</strong>
              <span>มหาวิทยาลัยเกษมบัณฑิต</span>
              <span>1761 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250</span>
            </div>
          </div>
          <div>
            <div className="doc-title">รายงานผลการปฏิบัติงาน</div>
            <div className="doc-sub">ปีการศึกษา {year + 543}</div>
            <div className="doc-sub">พิมพ์เมื่อ {printDate}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'งานทั้งหมด', val: `${jobs.length} งาน` },
            { label: 'งานเสร็จแล้ว', val: `${done} งาน (${jobs.length ? Math.round(done/jobs.length*100) : 0}%)` },
            { label: 'รายได้รวม', val: `${fmt(totalIncome)} ฿` },
            { label: 'กำไรสุทธิ', val: `${fmt(totalProfit)} ฿` },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div className="stat-val">{s.val.split(' ')[0]}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Monthly table */}
        <div className="section">
          <div className="section-title">สรุปรายเดือน</div>
          <table>
            <thead>
              <tr>
                <th>เดือน</th>
                <th className="num">จำนวนงาน</th>
                <th className="num">รายได้ (฿)</th>
                <th className="num">รายจ่าย (฿)</th>
                <th className="num">กำไร (฿)</th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map((m, i) => (
                <tr key={i} style={{ opacity: m.count === 0 ? 0.4 : 1 }}>
                  <td>{m.label}</td>
                  <td className="num">{m.count > 0 ? m.count : '—'}</td>
                  <td className="num" style={{ color: '#166534' }}>{m.income > 0 ? fmt(m.income) : '—'}</td>
                  <td className="num" style={{ color: '#991b1b' }}>{m.expense > 0 ? fmt(m.expense) : '—'}</td>
                  <td className="num" style={{ fontWeight: 600, color: m.income - m.expense >= 0 ? '#3730a3' : '#991b1b' }}>
                    {m.count > 0 ? fmt(m.income - m.expense) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td>รวมทั้งปี</td>
                <td className="num">{jobs.length}</td>
                <td className="num" style={{ color: '#166534' }}>{fmt(totalIncome)}</td>
                <td className="num" style={{ color: '#991b1b' }}>{fmt(totalExpense)}</td>
                <td className="num" style={{ color: '#3730a3' }}>{fmt(totalProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Type + Source */}
        <div className="two-col">
          <div className="section">
            <div className="section-title">ประเภทงาน</div>
            <table>
              <thead><tr><th>ประเภท</th><th className="num">งาน</th><th className="num">รายได้ (฿)</th></tr></thead>
              <tbody>
                {Object.entries(byType).sort((a, b) => b[1].count - a[1].count).map(([type, d]) => (
                  <tr key={type}><td>{type}</td><td className="num">{d.count}</td><td className="num" style={{ color: '#166534' }}>{fmt(d.income)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section">
            <div className="section-title">แหล่งที่มา</div>
            <table>
              <thead><tr><th>แหล่งงาน</th><th className="num">จำนวน</th><th className="num">%</th></tr></thead>
              <tbody>
                <tr><td>ภายในมหาวิทยาลัย</td><td className="num">{inner}</td><td className="num">{jobs.length ? Math.round(inner/jobs.length*100) : 0}%</td></tr>
                <tr><td>ภายนอกมหาวิทยาลัย</td><td className="num">{outer}</td><td className="num">{jobs.length ? Math.round(outer/jobs.length*100) : 0}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Job list */}
        <div className="section">
          <div className="section-title">รายการงานทั้งหมด ({jobs.length} งาน)</div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>ชื่องาน</th><th>หน่วยงาน</th><th>วันที่</th><th>สถานะ</th>
                <th className="num">รายได้</th><th className="num">กำไร</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, i) => (
                <tr key={j.id}>
                  <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td><div style={{ fontWeight: 500 }}>{j.title}</div><div style={{ fontSize: '10px', color: '#94a3b8' }}>{j.job_type}</div></td>
                  <td style={{ fontSize: '11px' }}>{j.client_org}</td>
                  <td style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(j.job_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ fontSize: '10px' }}>{STATUS_LABEL[j.status]}</td>
                  <td className="num" style={{ color: '#166534', fontWeight: 500 }}>{fmt(j.income ?? 0)}</td>
                  <td className="num" style={{ color: (j.income ?? 0) - (j.expense ?? 0) >= 0 ? '#3730a3' : '#991b1b', fontWeight: 500 }}>
                    {fmt((j.income ?? 0) - (j.expense ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={5}>รวม</td>
                <td className="num" style={{ color: '#166534' }}>{fmt(totalIncome)}</td>
                <td className="num" style={{ color: '#3730a3' }}>{fmt(totalProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
          {['ผู้จัดทำรายงาน', 'ผู้อำนวยการ IOK'].map(label => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', marginTop: '50px', fontSize: '12px' }}>{label}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>วันที่ ............./............./.............</div>
            </div>
          ))}
        </div>

        <div className="footer">
          <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต</span>
          <span>รายงานประจำปี พ.ศ. {year + 543}</span>
        </div>
      </div>
    </>
  )
}
