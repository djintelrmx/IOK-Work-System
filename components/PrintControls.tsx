'use client'

export default function PrintControls() {
  return (
    <div className="no-print" style={{ background: '#f8fafc', padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button
        onClick={() => window.print()}
        style={{ background: '#3730a3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Sarabun, sans-serif' }}
      >
        🖨️ พิมพ์ / บันทึก PDF
      </button>
      <button
        onClick={() => window.close()}
        style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Sarabun, sans-serif' }}
      >
        ✕ ปิด
      </button>
    </div>
  )
}
