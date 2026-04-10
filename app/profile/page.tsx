import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProfileEditor from '@/components/ProfileEditor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('team_members')
    .select('id, name, email, role, avatar_url, phone')
    .eq('email', user.email!)
    .single()

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-gray-400 mt-0.5">แก้ไขข้อมูลส่วนตัว</p>
      </div>
      <ProfileEditor member={member} userEmail={user.email!} />
    </div>
  )
}
