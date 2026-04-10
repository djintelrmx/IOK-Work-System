'use server'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function addTeamMember(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = (formData.get('role') as string) || null

  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    redirect('/team/new?error=duplicate')
  }

  await supabase.from('team_members').insert({
    name,
    email,
    role,
    status: 'active',
    is_active: true,
  })

  redirect('/team')
}
