'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function GlobalSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
  }, [q])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function go(href: string) {
    setOpen(false)
    setQ('')
    router.push(href)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && q.trim()) {
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setQ('')
    }
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          placeholder="ค้นหางาน, หน่วยงาน..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((r: any) => (
            <button key={`${r.type}-${r.id}`} onClick={() => go(r.href)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
              <span className="text-lg flex-shrink-0">{r.type === 'job' ? '📋' : r.type === 'client' ? '🏢' : '👤'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                <p className="text-xs text-gray-400 truncate">{r.sub}</p>
              </div>
            </button>
          ))}
          <button onClick={() => { router.push(`/search?q=${encodeURIComponent(q)}`); setOpen(false); setQ('') }}
            className="w-full px-4 py-2 text-xs text-indigo-600 hover:bg-indigo-50 text-center border-t border-gray-50 transition-colors">
            ดูผลลัพธ์ทั้งหมด →
          </button>
        </div>
      )}

      {open && q && results.length === 0 && !loading && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 px-4 py-3 text-sm text-gray-400 text-center">
          ไม่พบผลลัพธ์
        </div>
      )}
    </div>
  )
}
