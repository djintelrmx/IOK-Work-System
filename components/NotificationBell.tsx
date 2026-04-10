'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Notification } from '@/types/database'

interface Props {
  userEmail: string
}

export default function NotificationBell({ userEmail }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // หา member_id จาก email
  useEffect(() => {
    if (!userEmail) return
    ;(supabase as any)
      .from('team_members')
      .select('id')
      .eq('email', userEmail)
      .single()
      .then(({ data }: any) => {
        if (data?.id) setMemberId(data.id)
      })
  }, [userEmail])

  // โหลด notifications
  useEffect(() => {
    if (!memberId) return
    loadNotifications()

    // realtime subscription
    const channel = (supabase as any)
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `member_id=eq.${memberId}`,
      }, (payload: any) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => { (supabase as any).removeChannel(channel) }
  }, [memberId])

  async function loadNotifications() {
    const { data } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  async function markRead(id: string) {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllRead() {
    if (!memberId) return
    await (supabase as any).from('notifications').update({ is_read: true }).eq('member_id', memberId).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  // ปิดเมื่อคลิกนอก
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.is_read).length
  const fmtTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'เมื่อกี้'
    if (m < 60) return `${m} นาทีที่แล้ว`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  }

  if (!memberId) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">การแจ้งเตือน</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">ยังไม่มีการแจ้งเตือน</div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => { markRead(n.id); setOpen(false) }}>
                  <div className="flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{n.title}</p>
                      {n.body && <p className="text-sm text-gray-500 mt-0.5 truncate">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1">{fmtTime(n.created_at)}</p>
                    </div>
                    {n.job_id && (
                      <Link href={`/jobs/${n.job_id}`}
                        className="text-xs text-indigo-500 hover:underline flex-shrink-0"
                        onClick={e => e.stopPropagation()}>
                        ดูงาน
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
