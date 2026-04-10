import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import PrintControls from '@/components/PrintControls'

const LOGO = 'https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg'

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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif !important; box-sizing: border-box; }
        body { background: white !important; color: #1e293b; font-size: 13px; }
        .fp-page { width: 210mm; margin: 0 auto; padding: 15mm 15mm 10mm; }
        .fp-header { border-bottom: 2px solid #3730a3; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .fp-logo-box { display: flex; align-items: center; gap: 10px; }
        .fp-logo { width: 50px; height: 50px; object-fit: contain; }
        .fp-org strong { font-size: 13px; color: #1e293b; display: block; }
        .fp-org span { font-size: 11px; color: #64748b; }
        .fp-doc-title { font-size: 18px; font-weight: 700; color: #3730a3; text-align: right; }
        .fp-doc-sub { font-size: 11px; color: #64748b; text-align: right; }
        .fp-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .fp-card { border-radius: 8px; padding: 10px 14px; }
        .fp-card.income { background: #dcfce7; }
        .fp-card.expense { background: #fee2e2; }
        .fp-card.profit { background: #ede9fe; }
        .fp-card-label { font-size: 11px; font-weight: 600; color: #475569; }
        .fp-card-value { font-size: 20px; font-weight: 700; margin: 2px 0; }
        .fp-card.income .fp-card-value { color: #166534; }
        .fp-card.expense .fp-card-value { color: #991b1b; }
        .fp-card.profit .fp-card-value { color: #4c1d95; }
        .fp-card-unit { font-size: 11px; color: #64748b; }
        table.fp-table { width: 100%; border-collapse: collapse; }
        table.fp-table th { background: #3730a3; color: white; padding: 7px 8px; font-size: 11px; font-weight: 600; text-align: left; }
        table.fp-table td { padding: 5px 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        table.fp-table tr:nth-child(even) td { background: #f8fafc; }
        .num { text-align: right; }
        .income-val { color: #166534; font-weight: 600; }
        .expense-val { color: #991b1b; }
        .profit-val { font-weight: 700; }
        .fp-footer-row td { background: #1e293b !important; color: white; font-weight: 700; font-size: 13px; padding: 8px; }
        .badge-in { background: #dbeafe; color: #1e40af; padding: 1px 6px; border-radius: 10px; font-size: 10px; }
        .badge-out { background: #ffedd5; color: #c2410c; padding: 1px 6px; border-radius: 10px; font-size: 10px; }
        .fp-footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        .fp-sig-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 32px; }
        .fp-sig-line { border-top: 1px solid #94a3b8; margin-top: 44px; padding-top: 6px; text-align: center; font-size: 12px; }
        .fp-sig-sub { text-align: center; font-size: 11px; color: #64748b; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />

      <PrintControls />

      <div className="fp-page">
        <div className="fp-header">
          <div className="fp-logo-box">
            <img src={LOGO} alt="IOK" className="fp-logo" />
            <div className="fp-org">
              <strong>IOK — Institute of KBU Creative Media</strong>
              <span>มหาวิทยาลัยเกษมบัณฑิต</span>
              <span>1761 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250</span>
            </div>
          </div>
          <div>
            <div className="fp-doc-title">รายงานรายรับ-รายจ่าย</div>
            <div className="fp-doc-sub">ประจำปี พ.ศ. {year}</div>
            <div className="fp-doc-sub">วันที่พิมพ์ {fmtDate(new Date().toISOString().split('T')[0])}</div>
          </div>
        </div>

        <div className="fp-summary">
          <div className="fp-card income">
            <div className="fp-card-label">รายได้รวม</div>
            <div className="fp-card-value">{fmt(totalIncome)}</div>
            <div className="fp-card-unit">บาท</div>
          </div>
          <div className="fp-card expense">
            <div className="fp-card-label">รายจ่ายรวม</div>
            <div className="fp-card-value">{fmt(totalExpense)}</div>
            <div className="fp-card-unit">บาท</div>
          </div>
          <div className="fp-card profit">
            <div className="fp-card-label">กำไรสุทธิ</div>
            <div className="fp-card-value">{fmt(totalProfit)}</div>
            <div className="fp-card-unit">บาท ({totalIncome > 0 ? Math.round(totalProfit / totalIncome * 100) : 0}%)</div>
          </div>
        </div>

        <table className="fp-table">
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
                  <td><span className={j.source === 'ภายในมหาวิทยาลัย' ? 'badge-in' : 'badge-out'}>{j.source === 'ภายในมหาวิทยาลัย' ? 'ใน' : 'นอก'}</span></td>
                  <td>{fmtDate(j.job_date)}</td>
                  <td className="num income-val">{fmt(j.income ?? 0)}</td>
                  <td className="num expense-val">{fmt(j.expense ?? 0)}</td>
                  <td className={`num profit-val ${profit >= 0 ? 'income-val' : 'expense-val'}`}>{fmt(profit)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="fp-footer-row">
              <td colSpan={5}>รวมทั้งหมด ({all.length} งาน)</td>
              <td className="num">{fmt(totalIncome)}</td>
              <td className="num">{fmt(totalExpense)}</td>
              <td className="num">{fmt(totalProfit)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="fp-sig-grid">
          <div><div className="fp-sig-line">ผู้จัดทำรายงาน</div><div className="fp-sig-sub">IOK Work System</div></div>
          <div><div className="fp-sig-line">ผู้ตรวจสอบ / ผู้อนุมัติ</div><div className="fp-sig-sub">หัวหน้าหน่วย IOK</div></div>
        </div>

        <div className="fp-footer">
          <span>IOK Work System — มหาวิทยาลัยเกษมบัณฑิต</span>
          <span>พิมพ์วันที่ {new Date().toLocaleDateString('th-TH')}</span>
        </div>
      </div>
    </>
  )
}
