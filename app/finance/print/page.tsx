import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'

export default async function FinancePrintPage() {
  const level = await getAccessLevel()
  if (level !== 'admin') redirect('/')

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, job_date, source, client_org, income, expense, status')
    .order('job_date')

  const all = (jobs ?? []) as any[]
  const totalIncome  = all.reduce((s, j) => s + (j.income  ?? 0), 0)
  const totalExpense = all.reduce((s, j) => s + (j.expense ?? 0), 0)
  const totalProfit  = totalIncome - totalExpense
  const fmt = (n: number) => n.toLocaleString('th-TH')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  const year = new Date().getFullYear() + 543

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <title>รายงานรายรับ-รายจ่าย IOK {year}</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          * { font-family: 'Sarabun', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
          body { background: white; color: #1e293b; font-size: 13px; }
          .page { width: 210mm; margin: 0 auto; padding: 15mm 15mm 10mm; }
          .header { border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo-box { display: flex; align-items: center; gap: 10px; }
          .logo-img { width: 50px; height: 50px; object-fit: contain; }
          .org { font-size: 11px; color: #64748b; }
          .org strong { font-size: 13px; color: #1e293b; display: block; }
          .doc-title { font-size: 18px; font-weight: 700; color: #3730a3; text-align: right; }
          .doc-sub { font-size: 11px; color: #64748b; text-align: right; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
          .sum-card { border-radius: 8px; padding: 10px 14px; }
          .sum-card.income  { background: #dcfce7; }
          .sum-card.expense { background: #fee2e2; }
          .sum-card.profit  { background: #ede9fe; }
          .sum-label { font-size: 11px; font-weight: 600; color: #475569; }
          .sum-value { font-size: 20px; font-weight: 700; margin: 2px 0; }
          .sum-card.income  .sum-value { color: #166534; }
          .sum-card.expense .sum-value { color: #991b1b; }
          .sum-card.profit  .sum-value { color: #4c1d95; }
          .sum-unit { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #3730a3; color: white; padding: 7px 8px; font-size: 11px; font-weight: 600; text-align: left; }
          td { padding: 5px 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .num { text-align: right; }
          .income-val { color: #166534; font-weight: 600; }
          .expense-val { color: #991b1b; }
          .profit-val { font-weight: 700; }
          .footer-row td { background: #1e293b !important; color: white; font-weight: 700; font-size: 13px; padding: 8px; }
          .badge-in  { background: #dbeafe; color: #1e40af; padding: 1px 6px; border-radius: 10px; font-size: 10px; }
          .badge-out { background: #ffedd5; color: #c2410c; padding: 1px 6px; border-radius: 10px; font-size: 10px; }
          .footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          .sig-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 32px; }
          .sig-line { border-top: 1px solid #94a3b8; margin-top: 44px; padding-top: 6px; text-align: center; font-size: 12px; }
          .sig-sub { text-align: center; font-size: 11px; color: #64748b; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none; }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ background: '#f8fafc', padding: '10px 16px', display: 'flex', gap: '10px' }}>
          <button id="btn-print" style={{ background: '#3730a3', color: 'white', border: 'none', padding: '7px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px' }}>
            🖨️ พิมพ์ / บันทึก PDF
          </button>
          <button id="btn-close" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '7px 18px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px' }}>
            ✕ ปิด
          </button>
        </div>

        <div className="page">
          <div className="header">
            <div className="logo-box">
              <img src="https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg" alt="IOK" className="logo-img" onError={(e: any) => { e.target.style.display='none' }} />
              <div className="org">
                <strong>IOK — Institute of KBU Creative Media</strong>
                มหาวิทยาลัยเกษมบัณฑิต
              </div>
            </div>
            <div>
              <div className="doc-title">รายงานรายรับ-รายจ่าย</div>
              <div className="doc-sub">ประจำปี พ.ศ. {year}</div>
              <div className="doc-sub">วันที่พิมพ์ {fmtDate(new Date().toISOString().split('T')[0])}</div>
            </div>
          </div>

          <div className="summary">
            <div className="sum-card income">
              <div className="sum-label">รายได้รวม</div>
              <div className="sum-value">{fmt(totalIncome)}</div>
              <div className="sum-unit">บาท</div>
            </div>
            <div className="sum-card expense">
              <div className="sum-label">รายจ่ายรวม</div>
              <div className="sum-value">{fmt(totalExpense)}</div>
              <div className="sum-unit">บาท</div>
            </div>
            <div className="sum-card profit">
              <div className="sum-label">กำไรสุทธิ</div>
              <div className="sum-value">{fmt(totalProfit)}</div>
              <div className="sum-unit">บาท ({totalIncome > 0 ? Math.round(totalProfit / totalIncome * 100) : 0}%)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{width:'28px'}}>#</th>
                <th>ชื่องาน</th>
                <th>หน่วยงาน</th>
                <th style={{width:'55px'}}>แหล่งที่มา</th>
                <th>วันที่</th>
                <th className="num">รายได้</th>
                <th className="num">รายจ่าย</th>
                <th className="num">กำไร</th>
              </tr>
            </thead>
            <tbody>
              {all.map((j, i) => {
                const profit = (j.income ?? 0) - (j.expense ?? 0)
                return (
                  <tr key={j.id}>
                    <td>{i + 1}</td>
                    <td>{j.title}</td>
                    <td>{j.client_org}</td>
                    <td>
                      <span className={j.source === 'ภายในมหาวิทยาลัย' ? 'badge-in' : 'badge-out'}>
                        {j.source === 'ภายในมหาวิทยาลัย' ? 'ใน' : 'นอก'}
                      </span>
                    </td>
                    <td>{fmtDate(j.job_date)}</td>
                    <td className="num income-val">{fmt(j.income ?? 0)}</td>
                    <td className="num expense-val">{fmt(j.expense ?? 0)}</td>
                    <td className={`num profit-val ${profit >= 0 ? 'income-val' : 'expense-val'}`}>{fmt(profit)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="footer-row">
                <td colSpan={5}>รวมทั้งหมด ({all.length} งาน)</td>
                <td className="num">{fmt(totalIncome)}</td>
                <td className="num">{fmt(totalExpense)}</td>
                <td className="num">{fmt(totalProfit)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="sig-grid">
            <div>
              <div className="sig-line">ผู้จัดทำรายงาน</div>
              <div className="sig-sub">IOK Work System</div>
            </div>
            <div>
              <div className="sig-line">ผู้ตรวจสอบ / ผู้อนุมัติ</div>
              <div className="sig-sub">หัวหน้าหน่วย IOK</div>
            </div>
          </div>

          <div className="footer">
            <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต</span>
            <span>พิมพ์วันที่ {new Date().toLocaleDateString('th-TH')}</span>
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
