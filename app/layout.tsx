import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase-server'
import { getAccessLevel } from '@/lib/access'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'IOK Work System — KBU',
  description: 'ระบบจัดการงาน IOK มหาวิทยาลัยเกษมบัณฑิต',
}

// Print routes ที่ไม่ต้องการ AppShell
function isPrintRoute(pathname: string) {
  return pathname.endsWith('/print') ||
    /\/billing\/[0-9a-f-]{36}$/.test(pathname)
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const bare = isPrintRoute(pathname)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let memberName: string | undefined
  if (user?.email) {
    const { data } = await supabase
      .from('team_members')
      .select('name')
      .eq('email', user.email)
      .single()
    memberName = data?.name
  }
  // ใช้ getAccessLevel() เพื่อให้สอดคล้องกับ TEST MODE
  const accessLevel = await getAccessLevel()

  return (
    <html lang="th">
      <body>
        {bare ? (
          // หน้า print — ไม่มี sidebar/header
          <main>{children}</main>
        ) : (
          // [TEST MODE] AppShell แสดงเสมอโดยไม่ต้อง login
          <AppShell
            userName={memberName ?? user?.user_metadata?.full_name ?? user?.email ?? 'ผู้ทดสอบ'}
            userEmail={user?.email ?? ''}
            accessLevel={accessLevel}
          >
            {children}
          </AppShell>
        )}
      </body>
    </html>
  )
}
