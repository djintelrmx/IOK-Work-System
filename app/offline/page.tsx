export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Sarabun, sans-serif',
      background: '#f8fafc', color: '#1e293b', textAlign: 'center', padding: '24px',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📡</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ไม่มีสัญญาณอินเทอร์เน็ต</h1>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>
        กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#4338ca', color: 'white', border: 'none',
          padding: '12px 28px', borderRadius: 10, fontSize: 15,
          cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
        }}
      >
        ลองใหม่
      </button>
    </div>
  )
}
