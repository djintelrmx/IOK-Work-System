import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { items, ...quotationData } = body

  const { data: qt, error } = await (supabase as any)
    .from('quotations')
    .insert(quotationData)
    .select('id, quotation_number')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (items?.length) {
    const rows = items.map((item: any, i: number) => ({
      quotation_id: qt.id,
      sort_order: i,
      description: item.description,
      qty: item.qty,
      unit: item.unit,
      unit_price: item.unit_price,
    }))
    const { error: itemErr } = await (supabase as any).from('quotation_items').insert(rows)
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 })
  }

  return NextResponse.json({ quotationId: qt.id, quotationNumber: qt.quotation_number }, { status: 201 })
}
