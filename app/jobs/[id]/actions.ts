'use server'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateJobStatus(jobId: string, status: 'pending' | 'in_progress' | 'done') {
  const supabase = await createClient()
  await supabase.from('jobs').update({ status }).eq('id', jobId)
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/jobs')
}
