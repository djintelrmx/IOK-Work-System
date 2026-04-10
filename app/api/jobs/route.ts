import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { assignments, ...jobData } = body

  // บันทึกงาน
  const { data: job, error } = await supabase.from('jobs').insert(jobData).select('id, title').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const jobId = (job as { id: string; title: string } | null)?.id
  const jobTitle = (job as { id: string; title: string } | null)?.title ?? ''

  // บันทึกการมอบหมายทีม
  if (assignments?.length && jobId) {
    const rows = assignments.map((a: { member_id: string; role_in_job: string }) => ({
      job_id: jobId,
      member_id: a.member_id,
      role_in_job: a.role_in_job,
    }))
    await supabase.from('job_assignments').insert(rows)

    // สร้าง notifications สำหรับทีมที่ถูกมอบหมาย
    const notifRows = assignments.map((a: { member_id: string; role_in_job: string }) => ({
      member_id: a.member_id,
      type: 'job_assigned',
      title: 'ถูกมอบหมายงานใหม่',
      body: jobTitle,
      job_id: jobId,
    }))
    await (supabase as any).from('notifications').insert(notifRows)
  }

  return NextResponse.json({ jobId }, { status: 201 })
}
