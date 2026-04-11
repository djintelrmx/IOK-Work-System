import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const { ids, status } = await req.json()
  if (!Array.isArray(ids) || !ids.length || !status) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  const { error } = await (supabase as any)
    .from('jobs')
    .update({ status })
    .in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, updated: ids.length })
}
