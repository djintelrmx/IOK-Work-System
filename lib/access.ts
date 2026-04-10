import { createClient } from '@/lib/supabase-server'

export type AccessLevel = 'admin' | 'staff' | 'viewer'

export async function getAccessLevel(): Promise<AccessLevel> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return 'viewer'
    const { data } = await supabase
      .from('team_members')
      .select('access_level')
      .eq('email', user.email)
      .single()
    return (data?.access_level as AccessLevel) ?? 'staff'
  } catch {
    return 'viewer'
  }
}

export function canEditJobs(level: AccessLevel) {
  return level === 'admin' || level === 'staff'
}

export function canViewFinance(level: AccessLevel) {
  return level === 'admin'
}
