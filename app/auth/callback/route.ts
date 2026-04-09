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

      const { data: member } = await supabase
        .from('team_members')
        .select('status, is_active')
        .eq('email', email)
        .single()

      // Google login — ถ้าไม่มีในระบบเลย เพิ่มเป็น pending
      if (!member) {
        await supabase.from('team_members').insert({
          name: data.user.user_metadata?.full_name ?? email,
          email,
          auth_id: data.user.id,
          status: 'pending',
          is_active: false,
        })
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=pending', origin))
      }

      if (member.status === 'pending') {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=pending', origin))
      }

      if (!member.is_active || member.status === 'inactive') {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login?error=inactive', origin))
      }

      return NextResponse.redirect(new URL('/', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
