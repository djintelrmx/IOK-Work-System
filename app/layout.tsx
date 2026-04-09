import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'IOK Work System — KBU',
  description: 'ระบบจัดการงาน IOK มหาวิทยาลัยเกษมบัณฑิต',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ดึงชื่อจาก team_members ตามอีเมล
  let memberName: string | undefined
  if (user?.email) {
    const { data } = await supabase
      .from('team_members')
      .select('name')
      .eq('email', user.email)
      .single()
    memberName = data?.name
  }

  const isLoginPage = false // middleware จัดการ redirect แล้ว

  return (
    <html lang="th">
      <body>
        {user ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              userName={memberName ?? user.user_metadata?.full_name ?? user.email}
              userEmail={user.email}
            />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  )
}
