'use server'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function approveUser(memberId: string, formData: FormData) {
  const role = (formData.get('role') as string) || null
  const supabase = await createClient()
  await supabase
    .from('team_members')
    .update({ status: 'active', is_active: true, ...(role ? { role } : {}) })
    .eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function rejectUser(memberId: string) {
  const supabase = await createClient()
  await supabase
    .from('team_members')
    .update({ status: 'inactive', is_active: false })
    .eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function activateUser(memberId: string) {
  const supabase = await createClient()
  await supabase
    .from('team_members')
    .update({ status: 'active', is_active: true })
    .eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function deleteUser(memberId: string) {
  const supabase = await createClient()
  await supabase.from('team_members').delete().eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function updateRole(memberId: string, formData: FormData) {
  const role = formData.get('role') as string
  const supabase = await createClient()
  await supabase.from('team_members').update({ role }).eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function updateName(memberId: string, formData: FormData) {
  const name = formData.get('name') as string
  const supabase = await createClient()
  await supabase.from('team_members').update({ name }).eq('id', memberId)
  revalidatePath('/admin/users')
}

export async function addUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = (formData.get('role') as string) || null
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('email', email)
    .single()

  if (!existing) {
    await supabase.from('team_members').insert({
      name,
      email,
      role,
      status: 'active',
      is_active: true,
    })
  }
  revalidatePath('/admin/users')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://iokwork.metaallsolution.com/reset-password',
  })
  revalidatePath('/admin/users')
}
