import { supabase } from '@/lib/supabase'
import JobForm from '@/components/JobForm'

export default async function NewJobPage() {
  const { data: members } = await supabase.from('team_members').select('*').eq('is_active', true)
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">บันทึกรับงานใหม่</h1>
        <p className="text-sm text-gray-400">กรอกเฉพาะข้อมูลที่มี ไม่ต้องครบทุกช่อง</p>
      </div>
      <JobForm members={members ?? []} />
    </div>
  )
}
