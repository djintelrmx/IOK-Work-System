import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { assignments, ...jobData } = body

  // บันทึกงาน
  const { data: job, error } = await supabase.from('jobs').insert(jobData).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // บันทึกการมอบหมายทีม
  const jobId = (job as { id: string } | null)?.id
  if (assignments?.length && jobId) {
    const rows = assignments.map((a: { member_id: string; role_in_job: string }) => ({
      job_id: jobId,
      member_id: a.member_id,
      role_in_job: a.role_in_job,
    }))
    await supabase.from('job_assignments').insert(rows)
  }

  return NextResponse.json({ jobId }, { status: 201 })
}
