import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IOK Work System',
    short_name: 'IOK Work',
    description: 'ระบบจัดการงาน IOK มหาวิทยาลัยเกษมบัณฑิต',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4338ca',
    orientation: 'portrait',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'บันทึกรับงาน',
        url: '/jobs/new',
        description: 'เพิ่มงานใหม่',
      },
      {
        name: 'ปฏิทินงาน',
        url: '/calendar',
        description: 'ดูปฏิทินงาน',
      },
      {
        name: 'รายการงาน',
        url: '/jobs',
        description: 'ดูงานทั้งหมด',
      },
    ],
  }
}
