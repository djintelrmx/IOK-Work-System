import { supabase } from '@/lib/supabase'
import type { Job } from '@/types/database'
import Link from 'next/link'

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ y?: string; m?: string }> }) {
  const sp = await searchParams
  const now = new Date()
  const year = sp.y ? parseInt(sp.y) : now.getFullYear()
  const month = sp.m ? parseInt(sp.m) - 1 : now.getMonth() // 0-indexed internally

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const { data: raw } = await supabase
    .from('jobs')
    .select('id, title, job_date, status, job_type')
    .gte('job_date', firstDay.toISOString().split('T')[0])
    .lte('job_date', lastDay.toISOString().split('T')[0])

  const jobs = (raw ?? []) as Pick<Job, 'id' | 'title' | 'job_date' | 'status' | 'job_type'>[]
  const jobMap: Record<string, typeof jobs> = {}
  jobs.forEach(j => {
    const d = j.job_date
    if (!jobMap[d]) jobMap[d] = []
    jobMap[d].push(j)
  })

  const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const startPad = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // prev / next month links
  const prevDate = new Date(year, month - 1, 1)
  const nextDate = new Date(year, month + 1, 1)
  const prevHref = `/calendar?y=${prevDate.getFullYear()}&m=${prevDate.getMonth() + 1}`
  const nextHref = `/calendar?y=${nextDate.getFullYear()}&m=${nextDate.getMonth() + 1}`
  const todayHref = `/calendar?y=${now.getFullYear()}&m=${now.getMonth() + 1}`

  const todayStr = now.toISOString().split('T')[0]
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-gray-400',
    in_progress: 'bg-amber-500',
    done: 'bg-green-500',
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ปฏิทินงาน</h1>
          <p className="text-sm text-gray-400">{monthNames[month]} {year + 543}</p>
        </div>
        <Link href="/jobs/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
          + บันทึกรับงาน
        </Link>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-2">
        <Link href={prevHref} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          ← ก่อนหน้า
        </Link>
        {!isCurrentMonth && (
          <Link href={todayHref} className="px-3 py-1.5 rounded-lg border border-indigo-200 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors">
            เดือนนี้
          </Link>
        )}
        <Link href={nextHref} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          ถัดไป →
        </Link>
        <span className="ml-2 text-sm font-semibold text-gray-700">{monthNames[month]} {year + 543}</span>
        {jobs.length > 0 && <span className="text-xs text-gray-400">({jobs.length} งาน)</span>}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-5">
        <div className="grid grid-cols-7 mb-2">
          {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="h-16 md:h-24 rounded-lg" />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayJobs = jobMap[dateStr] ?? []
            const isToday = dateStr === todayStr
            const isSun = i % 7 === 0
            return (
              <div key={i} className={`h-16 md:h-24 p-1 md:p-1.5 rounded-lg text-xs border transition-colors ${isToday ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-gray-50'}`}>
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
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block" />รอดำเนินการ</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />กำลังทำ</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" />เสร็จแล้ว</span>
      </div>
    </div>
  )
}
