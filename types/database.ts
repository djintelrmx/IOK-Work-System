export type JobType = 'ไลฟ์สตรีม' | 'ถ่ายทอดสดภายใน' | 'ถ่ายภาพนิ่ง' | 'ผลิตวิดีโอ' | 'ระบบเสียง' | 'ระบบแสง / สี' | 'สื่อมัลติมีเดีย' | 'อื่นๆ'
export type JobSource = 'ภายในมหาวิทยาลัย' | 'ภายนอกมหาวิทยาลัย'
export type OrderType = 'letter' | 'direct' | 'other'
export type JobStatus = 'pending' | 'in_progress' | 'done'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string | null
  avatar_url: string | null
  phone: string | null
  is_active: boolean
  status: string
  access_level: string
  auth_id: string | null
  created_at: string
}

export interface Job {
  id: string
  job_number: string | null
  title: string
  job_type: JobType
  source: JobSource
  client_org: string
  location: string | null
  job_date: string
  job_time_start: string | null
  job_time_end: string | null
  description: string | null
  order_type: OrderType
  doc_number: string | null
  doc_date: string | null
  signer_name: string | null
  approver_name: string | null
  supervisor_name: string | null
  income: number
  expense: number
  status: JobStatus
  created_at: string
  updated_at: string
}

export interface JobAssignment {
  id: string
  job_id: string
  member_id: string
  role_in_job: string | null
  created_at: string
  team_members?: TeamMember
}

export interface JobDocument {
  id: string
  job_id: string
  file_name: string
  file_url: string
  file_type: string | null
  created_at: string
}

export interface JobWithDetails extends Job {
  job_assignments: (JobAssignment & { team_members: TeamMember })[]
  job_documents: JobDocument[]
}

export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'cancelled'

export interface QuotationItem {
  id: string
  quotation_id: string
  sort_order: number
  description: string
  qty: number
  unit: string | null
  unit_price: number
  amount: number
  created_at: string
}

export interface Quotation {
  id: string
  quotation_number: string
  job_id: string | null
  client_org: string
  client_contact: string | null
  issue_date: string
  valid_until: string | null
  subject: string
  note: string | null
  discount: number
  vat_percent: number
  status: QuotationStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface QuotationWithItems extends Quotation {
  quotation_items: QuotationItem[]
  jobs?: Pick<Job, 'id' | 'job_number' | 'title'> | null
}

export interface QuotationItemDraft {
  sort_order: number
  description: string
  qty: number
  unit: string
  unit_price: number
}

export interface Database {
  public: {
    Tables: {
      team_members: { Row: TeamMember; Insert: Omit<TeamMember, 'id' | 'created_at'>; Update: Partial<TeamMember> }
      jobs: { Row: Job; Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Job> }
      job_assignments: { Row: JobAssignment; Insert: Omit<JobAssignment, 'id' | 'created_at'>; Update: Partial<JobAssignment> }
      job_documents: { Row: JobDocument; Insert: Omit<JobDocument, 'id' | 'created_at'>; Update: Partial<JobDocument> }
    }
  }
}
