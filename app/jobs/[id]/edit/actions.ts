'use server'
import { createClient } from '@/lib/supabase-server'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateJob(jobId: string, formData: FormData) {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const supabase = await createClient()

  const orderType = formData.get('order_type') as string

  await supabase.from('jobs').update({
    title:          formData.get('title') as string,
    job_type:       formData.get('job_type') as string,
    source:         formData.get('source') as string,
    client_org:     formData.get('client_org') as string,
    location:       (formData.get('location') as string) || null,
    job_date:       formData.get('job_date') as string,
    job_time_start: (formData.get('job_time_start') as string) || null,
    job_time_end:   (formData.get('job_time_end') as string) || null,
    order_type:     orderType as any,
    doc_number:     (formData.get('doc_number') as string) || null,
    doc_date:       (formData.get('doc_date') as string) || null,
    signer_name:    (formData.get('signer_name') as string) || null,
    approver_name:  (formData.get('approver_name') as string) || null,
    supervisor_name:(formData.get('supervisor_name') as string) || null,
    income:         Number(formData.get('income') ?? 0),
    expense:        Number(formData.get('expense') ?? 0),
  } as any).eq('id', jobId)

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/jobs')
  redirect(`/jobs/${jobId}`)
}
