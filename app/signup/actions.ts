'use server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function signupWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createClient()

  // ตรวจว่าอีเมลนี้อยู่ในทีมไหม (admin ต้องเพิ่มก่อน)
  const { data: member } = await supabase
    .from('team_members')
    .select('id, is_active')
    .eq('email', email)
    .single()

  if (!member || !member.is_active) {
    redirect('/signup?error=no_access')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  })

  if (error) redirect('/signup?error=signup_failed')
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
    .select('id, is_active')
    .eq('email', email)
    .single()

  if (!member || !member.is_active) {
    await supabase.auth.signOut()
    redirect('/login?error=no_access')
  }

  redirect('/')
}
