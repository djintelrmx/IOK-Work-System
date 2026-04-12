'use client'
import { useState } from 'react'
import Image from 'next/image'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import NotificationBell from '@/components/NotificationBell'
import GlobalSearch from '@/components/GlobalSearch'

interface AppShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  accessLevel?: 'admin' | 'staff' | 'viewer'
}

export default function AppShell({ children, userName, userEmail, accessLevel = 'staff' }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar userName={userName} userEmail={userEmail} accessLevel={accessLevel} />
      </div>

      {/* Mobile sidebar overlay (ยังเอาไว้สำหรับ full menu) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">
            <Sidebar userName={userName} userEmail={userEmail} accessLevel={accessLevel} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-2.5 bg-indigo-800 text-white sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
              <Image src="https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.jpg"
                alt="IOK Logo" width={28} height={28} className="object-contain" />
            </div>
            <p className="font-bold text-sm leading-tight">IOK Work System</p>
          </div>
          <NotificationBell userEmail={userEmail ?? ''} />
        </header>

        {/* Mobile search bar */}
        <div className="md:hidden px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0">
          <GlobalSearch />
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-indigo-900/10 border-b border-gray-100 flex-shrink-0">
          <GlobalSearch />
          <NotificationBell userEmail={userEmail ?? ''} />
        </div>

        {/* Content — pb-20 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
