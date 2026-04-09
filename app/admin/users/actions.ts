'use server'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function approveUser(memberId: string) {
  const supabase = await createClient()
  await supabase
    .from('team_members')
    .update({ status: 'active', is_active: true })
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

export async function resetPassword(email: string) {
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })
  revalidatePath('/admin/users')
}
