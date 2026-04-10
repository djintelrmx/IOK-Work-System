import { supabase } from '@/lib/supabase'
import { getAccessLevel } from '@/lib/access'
import { redirect } from 'next/navigation'
import QuotationForm from '@/components/QuotationForm'
import type { Job } from '@/types/database'

export default async function NewQuotationPage() {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { data: raw } = await supabase
    .from('jobs')
    .select('id, job_number, title')
    .order('job_date', { ascending: false })

  const jobs = (raw ?? []) as Pick<Job, 'id' | 'job_number' | 'title'>[]

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">สร้างใบเสนอราคา</h1>
        <p className="text-sm text-gray-400">กรอกรายละเอียดและรายการบริการ</p>
      </div>
      <QuotationForm jobs={jobs} />
    </div>
  )
}
