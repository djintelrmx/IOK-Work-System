'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, CalendarDays, Users,
  Images, Coins, FileBarChart2, LogOut
} from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'ใบสั่งงาน', href: '/jobs', icon: FileText },
  { label: 'ปฏิทินงาน', href: '/calendar', icon: CalendarDays },
  { label: 'ทีมงาน', href: '/team', icon: Users },
  { label: 'หลักฐาน / ผลงาน', href: '/evidence', icon: Images },
]
const navFinance = [
  { label: 'รายได้ - รายจ่าย', href: '/finance', icon: Coins },
  { label: 'รายงานประจำปี', href: '/report', icon: FileBarChart2 },
]
const navAdmin = [
  { label: 'จัดการผู้ใช้งาน', href: '/admin/users', icon: Users },
]

interface SidebarProps {
  userName?: string
  userEmail?: string
  onClose?: () => void
}

export default function Sidebar({ userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-5 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-800 font-bold text-sm">IOK</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">IOK Work System</p>
            <p className="text-indigo-300 text-xs">มหาวิทยาลัยเกษมบัณฑิต</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-indigo-300 hover:text-white p-1 -mr-1" aria-label="ปิดเมนู">
              ✕
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-indigo-400 text-xs font-semibold px-3 pt-3 pb-2 uppercase tracking-wider">หลัก</p>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active ? 'bg-white/15 border-l-2 border-white pl-[10px]' : 'hover:bg-white/10'
              )}>
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        <p className="text-indigo-400 text-xs font-semibold px-3 pt-5 pb-2 uppercase tracking-wider">ผู้ดูแล</p>
        {navAdmin.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={onClose}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active ? 'bg-white/15 border-l-2 border-white pl-[10px]' : 'hover:bg-white/10')}>
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {userName?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName ?? 'ผู้ใช้งาน'}</p>
            <p className="text-indigo-400 text-xs truncate">{userEmail ?? ''}</p>
          </div>
          <form action="/auth/logout" method="POST">
            <button type="submit" title="ออกจากระบบ"
              className="text-indigo-400 hover:text-white transition-colors p-1">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
