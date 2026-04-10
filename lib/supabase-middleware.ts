import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // หน้าที่ไม่ต้อง login
  const publicPaths = ['/login', '/signup', '/auth', '/forgot-password', '/reset-password']
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p))

  // [TEST MODE] ปิดการ redirect ชั่วคราว — เปิดให้เข้าได้ทุกหน้าโดยไม่ต้อง login
  // หลังทดสอบเสร็จ ให้ uncomment 5 บรรทัดด้านล่างกลับ
  // if (!user && !isPublic) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  // if (user && pathname === '/login') {
  //   return NextResponse.redirect(new URL('/', request.url))
  // }

  return supabaseResponse
}
