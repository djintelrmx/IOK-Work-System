import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase-server'
import { getAccessLevel } from '@/lib/access'

export const metadata: Metadata = {
  title: 'IOK Work System — KBU',
  description: 'ระบบจัดการงาน IOK มหาวิทยาลัยเกษมบัณฑิต',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ดึงชื่อและสิทธิ์จาก team_members
  let memberName: string | undefined
  let accessLevel: 'admin' | 'staff' | 'viewer' = 'staff'
  if (user?.email) {
    const { data } = await supabase
      .from('team_members')
      .select('name, access_level')
      .eq('email', user.email)
      .single()
    memberName = data?.name
    accessLevel = (data?.access_level as typeof accessLevel) ?? 'staff'
  }

  return (
    <html lang="th">
      <body>
        {user ? (
          <AppShell
            userName={memberName ?? user.user_metadata?.full_name ?? user.email}
            userEmail={user.email}
            accessLevel={accessLevel}
          >
            {children}
          </AppShell>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  )
}
