'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, CalendarDays, Users, MoreHorizontal, Plus } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const mainNav = [
  { href: '/', icon: LayoutDashboard, label: 'หน้าหลัก' },
  { href: '/jobs', icon: FileText, label: 'งาน' },
  { href: '/calendar', icon: CalendarDays, label: 'ปฏิทิน' },
  { href: '/team', icon: Users, label: 'ทีม' },
]

const moreNav = [
  { href: '/evidence', label: '📸 หลักฐาน/ผลงาน' },
  { href: '/clients', label: '🏢 หน่วยงาน' },
  { href: '/compensation', label: '💰 ค่าตอบแทน' },
  { href: '/finance', label: '📊 รายได้-รายจ่าย' },
  { href: '/report', label: '📋 รายงานประจำปี' },
  { href: '/quotations', label: '📝 ใบเสนอราคา' },
  { href: '/billing', label: '🧾 ออกบิล' },
  { href: 'https://iok.metaallsolution.com', label: '📦 ยืม-คืนอุปกรณ์', external: true },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* More drawer overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-4 pb-safe">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">เมนูเพิ่มเติม</p>
            <div className="grid grid-cols-2 gap-2">
              {moreNav.map(item => (
                item.external ? (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-colors',
                      pathname.startsWith(item.href) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    )}>
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center h-16 px-1 safe-area-inset-bottom">
        {mainNav.slice(0, 2).map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={clsx('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600')}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}

        {/* FAB — เพิ่มงาน */}
        <Link href="/jobs/new"
          className="flex-shrink-0 w-14 h-14 -mt-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 mx-1 active:scale-95 transition-transform">
          <Plus size={26} strokeWidth={2.5} className="text-white" />
        </Link>

        {mainNav.slice(2).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={clsx('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600')}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}

        <button onClick={() => setShowMore(v => !v)}
          className={clsx('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-colors',
            showMore ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600')}>
          <MoreHorizontal size={22} strokeWidth={showMore ? 2.5 : 1.8} />
          <span className="text-xs font-medium">เพิ่มเติม</span>
        </button>
      </nav>
    </>
  )
}
