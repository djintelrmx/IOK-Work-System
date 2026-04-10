import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { assignments, ...jobData } = body

  const { error } = await supabase.from('jobs').update(jobData).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // อัปเดต assignments: ลบเก่า แล้วใส่ใหม่
  if (assignments !== undefined) {
    await supabase.from('job_assignments').delete().eq('job_id', id)
    if (assignments.length > 0) {
      const rows = assignments.map((a: { member_id: string; role_in_job: string }) => ({
        job_id: id, member_id: a.member_id, role_in_job: a.role_in_job,
      }))
      await supabase.from('job_assignments').insert(rows)
    }
  }

  return NextResponse.json({ ok: true })
}
