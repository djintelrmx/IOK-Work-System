import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const email = data.user.email ?? ''

      // ตรวจว่าอีเมลนี้อยู่ในทีมไหม
      const { data: member } = await supabase
        .from('team_members')
        .select('id, is_active')
        .eq('email', email)
        .single()

      if (!member || !member.is_active) {
        // ไม่มีสิทธิ์ → logout แล้วส่งไปหน้า login พร้อม error
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=no_access', origin))
      }

      return NextResponse.redirect(new URL('/', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
