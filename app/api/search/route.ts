import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (!q || q.length < 2) return NextResponse.json([])

  const [{ data: jobs }, { data: clients }, { data: members }] = await Promise.all([
    (supabase as any)
      .from('jobs')
      .select('id, title, client_org, job_date, status')
      .or(`title.ilike.%${q}%,client_org.ilike.%${q}%,job_number.ilike.%${q}%`)
      .order('job_date', { ascending: false })
      .limit(5),
    (supabase as any)
      .from('clients')
      .select('id, name, org_type')
      .ilike('name', `%${q}%`)
      .limit(3),
    (supabase as any)
      .from('team_members')
      .select('id, name, role')
      .ilike('name', `%${q}%`)
      .limit(3),
  ])

  const STATUS: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }

  const results = [
    ...(jobs ?? []).map((j: any) => ({
      type: 'job', id: j.id,
      title: j.title,
      sub: `${j.client_org} · ${STATUS[j.status] ?? j.status}`,
      href: `/jobs/${j.id}`,
    })),
    ...(clients ?? []).map((c: any) => ({
      type: 'client', id: c.id,
      title: c.name,
      sub: c.org_type === 'internal' ? 'ภายในมหาวิทยาลัย' : 'ภายนอกมหาวิทยาลัย',
      href: `/clients/${c.id}`,
    })),
    ...(members ?? []).map((m: any) => ({
      type: 'member', id: m.id,
      title: m.name,
      sub: m.role ?? 'ทีมงาน',
      href: `/team/${m.id}`,
    })),
  ]

  return NextResponse.json(results)
}
