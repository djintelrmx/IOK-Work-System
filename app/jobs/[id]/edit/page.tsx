import { supabase } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import { getAccessLevel } from '@/lib/access'
import { updateJob } from './actions'
import Link from 'next/link'
import type { Job } from '@/types/database'

const JOB_TYPES = ['ไลฟ์สตรีม','ถ่ายทอดสดภายใน','ถ่ายภาพนิ่ง','ผลิตวิดีโอ','ระบบเสียง','ระบบแสง / สี','สื่อมัลติมีเดีย','อื่นๆ']

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const level = await getAccessLevel()
  if (level === 'viewer') redirect('/')

  const { id } = await params
  const { data: raw } = await supabase.from('jobs').select('*').eq('id', id).single()
  if (!raw) notFound()

  const job = raw as Job
  const action = updateJob.bind(null, id)

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'
  const labelCls = 'text-xs font-semibold text-gray-600 block mb-1'

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-5">
      <div>
        <Link href={`/jobs/${id}`} className="text-sm text-indigo-500 hover:underline">← กลับรายละเอียดงาน</Link>
        <h1 className="text-xl font-bold text-gray-800 mt-3">แก้ไขใบสั่งงาน</h1>
      </div>

      <form action={action} className="space-y-5">
        {/* ข้อมูลงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">📋 ข้อมูลงาน</p>
          <div>
            <label className={labelCls}>ชื่องาน / เรื่อง *</label>
            <input name="title" required defaultValue={job.title} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ประเภทงาน *</label>
              <select name="job_type" required defaultValue={job.job_type} className={inputCls}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>แหล่งที่มาของงาน *</label>
              <select name="source" required defaultValue={job.source} className={inputCls}>
                <option>ภายในมหาวิทยาลัย</option>
                <option>ภายนอกมหาวิทยาลัย</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>หน่วยงาน / ผู้ว่าจ้าง *</label>
            <input name="client_org" required defaultValue={job.client_org} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>วันที่ปฏิบัติงาน *</label>
              <input name="job_date" type="date" required defaultValue={job.job_date} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>สถานที่</label>
              <input name="location" defaultValue={job.location ?? ''} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>เวลาเริ่ม</label>
              <input name="job_time_start" type="time" defaultValue={job.job_time_start ?? ''} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>เวลาสิ้นสุด</label>
              <input name="job_time_end" type="time" defaultValue={job.job_time_end ?? ''} className={inputCls} />
            </div>
          </div>
        </div>

        {/* การสั่งงาน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">📄 รูปแบบการสั่งงาน</p>
          <div>
            <label className={labelCls}>ประเภทการสั่งงาน</label>
            <select name="order_type" defaultValue={job.order_type} className={inputCls}>
              <option value="letter">ผ่านหนังสือ</option>
              <option value="direct">หัวหน้าสั่งโดยตรง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>เลขที่หนังสือ</label>
              <input name="doc_number" defaultValue={job.doc_number ?? ''} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>วันที่ในหนังสือ</label>
              <input name="doc_date" type="date" defaultValue={job.doc_date ?? ''} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>ผู้ลงนาม / ผู้สั่งงาน</label>
              <input name="signer_name" defaultValue={job.signer_name ?? ''} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ผู้อนุมัติงาน</label>
              <input name="approver_name" defaultValue={job.approver_name ?? ''} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>หัวหน้างานผู้จ่ายงานให้ทีม *</label>
            <input name="supervisor_name" required defaultValue={job.supervisor_name ?? ''} className={inputCls} />
          </div>
        </div>

        {/* การเงิน */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">💰 การเงิน</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>รายได้ (บาท)</label>
              <input name="income" type="number" min="0" defaultValue={job.income ?? 0} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>รายจ่าย (บาท)</label>
              <input name="expense" type="number" min="0" defaultValue={job.expense ?? 0} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <Link href={`/jobs/${id}`}
            className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            ยกเลิก
          </Link>
          <button type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
            ✓ บันทึกการแก้ไข
          </button>
        </div>
      </form>
    </div>
  )
}
