'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import Sidebar from './Sidebar'

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
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar userName={userName} userEmail={userEmail} accessLevel={accessLevel} />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-60">
            <Sidebar
              userName={userName}
              userEmail={userEmail}
              accessLevel={accessLevel}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-2.5 bg-indigo-800 text-white sticky top-0 z-40 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-1 -ml-1" aria-label="เปิดเมนู">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
              <Image src="https://pjxtmumrlgtouejahrlz.supabase.co/storage/v1/object/public/logo/logo%20iok.png" alt="IOK Logo" width={28} height={28} className="object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">IOK Work System</p>
              <p className="text-indigo-300 text-xs leading-tight">Institute of KBU Creative Media</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
