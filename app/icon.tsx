import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512, height: 512,
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 96,
        }}
      >
        <div style={{
          color: 'white', fontSize: 220, fontWeight: 800,
          fontFamily: 'serif', letterSpacing: -8,
          display: 'flex',
        }}>
          IOK
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
