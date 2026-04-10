import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = { pending: 'รอดำเนินการ', in_progress: 'กำลังทำ', done: 'เสร็จแล้ว' }
const STATUS_COLOR: Record<string, string> = { pending: 'bg-gray-400', in_progress: 'bg-amber-500', done: 'bg-green-500' }
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ y?: string; m?: string; view?: string; source?: string }> }) {
  const sp = await searchParams
  const now = new Date()
  const year = sp.y ? parseInt(sp.y) : now.getFullYear()
  const month = sp.m ? parseInt(sp.m) - 1 : now.getMonth()
  const view = sp.view ?? 'calendar'
  const source = sp.source ?? 'all'

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let query = supabase
    .from('jobs')
    .select('id, title, job_date, status, job_type, source, income, client_org')
    .gte('job_date', firstDay.toISOString().split('T')[0])
    .lte('job_date', lastDay.toISOString().split('T')[0])
    .order('job_date', { ascending: true })

  if (source === 'internal') query = (query as any).eq('source', 'ภายในมหาวิทยาลัย')
  if (source === 'external') query = (query as any).eq('source', 'ภายนอกมหาวิทยาลัย')

  const { data: raw } = await query
  const jobs = (raw ?? []) as (Pick<Job, 'id' | 'title' | 'job_date' | 'status' | 'job_type' | 'source' | 'income'> & { client_org: string })[]

  const jobMap: Record<string, typeof jobs> = {}
  jobs.forEach(j => {
    if (!jobMap[j.job_date]) jobMap[j.job_date] = []
    jobMap[j.job_date].push(j)
  })

  const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const todayStr = now.toISOString().split('T')[0]
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const prevDate = new Date(year, month - 1, 1)
  const nextDate = new Date(year, month + 1, 1)
  const buildHref = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({ y: String(year), m: String(month + 1), view, source, ...overrides })
    return `/calendar?${p}`
  }

  // ---- RENDER ----
  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ปฏิทินงาน</h1>
          <p className="text-sm text-gray-400">{monthNames[month]} {year + 543} · {jobs.length} งาน</p>
        </div>
        <Link href="/jobs/new" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          + บันทึกรับงาน
        </Link>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Month nav */}
        <Link href={buildHref({ y: String(prevDate.getFullYear()), m: String(prevDate.getMonth() + 1) })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">← ก่อนหน้า</Link>
        {!isCurrentMonth && (
          <Link href={buildHref({ y: String(now.getFullYear()), m: String(now.getMonth() + 1) })}
            className="px-3 py-1.5 rounded-lg border border-indigo-200 text-sm text-indigo-600 hover:bg-indigo-50">เดือนนี้</Link>
        )}
        <Link href={buildHref({ y: String(nextDate.getFullYear()), m: String(nextDate.getMonth() + 1) })}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">ถัดไป →</Link>

        <div className="flex-1" />

        {/* Source filter */}
        {(['all', 'internal', 'external'] as const).map(s => {
          const labels = { all: 'ทั้งหมด', internal: 'งานใน', external: 'งานนอก' }
          const active = source === s
          return (
            <Link key={s} href={buildHref({ source: s })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {labels[s]}
            </Link>
          )
        })}

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <Link href={buildHref({ view: 'calendar' })}
            className={`px-3 py-1.5 text-sm transition-colors ${view === 'calendar' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            📅 ปฏิทิน
          </Link>
          <Link href={buildHref({ view: 'list' })}
            className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-200 ${view === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            📋 รายการ
          </Link>
        </div>
      </div>

      {/* ---- CALENDAR VIEW ---- */}
      {view === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-5">
          <div className="grid grid-cols-7 mb-2">
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const startPad = firstDay.getDay()
              const daysInMonth = lastDay.getDate()
              const cells: (number | null)[] = [
                ...Array.from({ length: startPad }, () => null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ]
              while (cells.length % 7 !== 0) cells.push(null)
              return cells.map((day, i) => {
                if (!day) return <div key={i} className="h-16 md:h-24 rounded-lg" />
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayJobs = jobMap[dateStr] ?? []
                const isToday = dateStr === todayStr
                const isSun = i % 7 === 0
                return (
                  <div key={i} className={`h-16 md:h-24 p-1 md:p-1.5 rounded-lg text-xs border transition-colors ${isToday ? 'bg-indigo-50 border-indigo-200' : dayJobs.length ? 'border-gray-100' : 'border-transparent hover:bg-gray-50'}`}>
                    <span className={`font-semibold text-xs ${isToday ? 'text-indigo-600' : isSun ? 'text-red-400' : 'text-gray-600'}`}>{day}</span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayJobs.slice(0, 2).map(j => (
                        <Link key={j.id} href={`/jobs/${j.id}`}
                          className={`hidden md:block text-white rounded px-1 py-0.5 truncate text-xs ${STATUS_COLOR[j.status]}`}>
                          {j.title}
                        </Link>
                      ))}
                      {dayJobs.length > 0 && (
                        <span className={`md:hidden block w-2 h-2 rounded-full mx-auto mt-1 ${STATUS_COLOR[dayJobs[0].status]}`} />
                      )}
                      {dayJobs.length > 2 && (
                        <p className="hidden md:block text-gray-400 text-xs">+{dayJobs.length - 2} งาน</p>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* ---- LIST VIEW ---- */}
      {view === 'list' && (
        <div className="space-y-3">
          {Object.keys(jobMap).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
              ไม่มีงานในเดือนนี้
            </div>
          ) : (
            Object.entries(jobMap).map(([date, dayJobs]) => {
              const d = new Date(date)
              const dayName = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][d.getDay()]
              const isToday = date === todayStr
              return (
                <div key={date} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className={`px-4 py-2 flex items-center gap-3 ${isToday ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold w-10 text-center ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                      {d.getDate()}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                        วัน{dayName} {isToday && <span className="text-xs font-normal text-indigo-400 ml-1">วันนี้</span>}
                      </p>
                      <p className="text-xs text-gray-400">{d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{dayJobs.length} งาน</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dayJobs.map(j => (
                      <Link key={j.id} href={`/jobs/${j.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLOR[j.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{j.title}</p>
                          <p className="text-xs text-gray-400">{j.client_org} · {j.job_type}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[j.status]}`}>
                            {STATUS_LABEL[j.status]}
                          </span>
                          {(j.income ?? 0) > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-0.5">{(j.income ?? 0).toLocaleString('th-TH')} ฿</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500 pb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block" />รอดำเนินการ</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />กำลังทำ</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" />เสร็จแล้ว</span>
      </div>
    </div>
  )
}
