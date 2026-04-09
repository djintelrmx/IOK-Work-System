'use server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function signupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createClient()

  // สมัคร auth account
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })

  if (error) redirect('/signup?error=signup_failed')

  // เพิ่มเข้า team_members ในสถานะ pending
  if (data.user) {
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', email)
      .single()

    if (!existing) {
      await supabase.from('team_members').insert({
        name,
        email,
        auth_id: data.user.id,
        status: 'pending',
        is_active: false,
      })
    }
  }

  redirect('/signup?success=1')
}

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/login?error=invalid_credentials')

  // ตรวจสิทธิ์
  const { data: member } = await supabase
    .from('team_members')
    .select('status, is_active')
    .eq('email', email)
    .single()

  if (!member) {
    await supabase.auth.signOut()
    redirect('/login?error=no_access')
  }
  if (member.status === 'pending') {
    await supabase.auth.signOut()
    redirect('/login?error=pending')
  }
  if (!member.is_active || member.status === 'inactive') {
    await supabase.auth.signOut()
    redirect('/login?error=inactive')
  }

  redirect('/')
}
