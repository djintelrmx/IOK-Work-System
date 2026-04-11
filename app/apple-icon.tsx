import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180, height: 180,
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <div style={{
          color: 'white', fontSize: 78, fontWeight: 800,
          fontFamily: 'serif', letterSpacing: -2,
          display: 'flex',
        }}>
          IOK
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
