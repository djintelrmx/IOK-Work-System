'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
}

export default function AppShell({ children, userName, userEmail }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar userName={userName} userEmail={userEmail} />
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
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-indigo-800 text-white sticky top-0 z-40 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-1 -ml-1" aria-label="เปิดเมนู">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-800 font-bold text-xs">IOK</span>
            </div>
            <span className="font-bold text-sm">IOK Work System</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
