'use server'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'ไม่พบผู้ใช้' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const avatar_url = formData.get('avatar_url') as string

  const updates: Record<string, string> = {}
  if (name) updates.name = name
  if (phone !== undefined) updates.phone = phone
  if (avatar_url) updates.avatar_url = avatar_url

  const { error } = await (supabase as any)
    .from('team_members')
    .update(updates)
    .eq('email', user.email)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/team')
  return { success: true }
}
