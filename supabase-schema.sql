-- IOK Work System — Supabase Schema
-- รันไฟล์นี้ใน Supabase SQL Editor

-- ทีมงาน
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- งาน
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),

  -- ข้อมูลงาน
  title text not null,
  job_type text not null, -- ไลฟ์สตรีม, ถ่ายภาพ, ฯลฯ
  source text not null,   -- ภายใน, ภายนอก
  client_org text not null, -- หน่วยงาน/ผู้ว่าจ้าง
  location text,
  job_date date not null,
  job_time_start time,
  job_time_end time,
  description text,

  -- รูปแบบการสั่งงาน
  order_type text not null, -- letter, direct, other
  doc_number text,          -- เลขที่หนังสือ
  doc_date date,
  signer_name text,         -- ผู้ลงนาม
  approver_name text,       -- ผู้อนุมัติ
  supervisor_name text,     -- หัวหน้าผู้จ่ายงาน

  -- การเงิน
  income numeric default 0,
  expense numeric default 0,

  -- สถานะ
  status text default 'pending', -- pending, in_progress, done

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- การมอบหมายงานให้ทีม
create table if not exists job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  member_id uuid references team_members(id) on delete cascade,
  role_in_job text, -- บทบาทในงานนั้น
  created_at timestamptz default now()
);

-- เอกสาร/หลักฐาน
create table if not exists job_documents (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text, -- pdf, image, video, link
  created_at timestamptz default now()
);

-- ดัชนีเพื่อเพิ่มความเร็ว
create index on jobs(job_date desc);
create index on jobs(status);
create index on job_assignments(job_id);
create index on job_documents(job_id);

-- RLS (Row Level Security) — เปิดไว้ก่อน ปรับได้ทีหลัง
alter table team_members enable row level security;
alter table jobs enable row level security;
alter table job_assignments enable row level security;
alter table job_documents enable row level security;

-- Policy ชั่วคราว: อนุญาตทุกคน (ปรับเป็น auth ทีหลัง)
do $$ begin
  create policy "allow all" on team_members for all using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all" on jobs for all using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all" on job_assignments for all using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all" on job_documents for all using (true);
exception when duplicate_object then null; end $$;

-- ข้อมูลทดสอบ (ใส่เฉพาะถ้ายังไม่มี)
insert into team_members (name, email, role)
values
  ('สมชาย ใจดี', 'somchai@kbu.ac.th', 'ช่างกล้อง'),
  ('สมหญิง รักงาน', 'somying@kbu.ac.th', 'ดูแลเสียง'),
  ('วิชัย เทคนิค', 'wichai@kbu.ac.th', 'ไลฟ์สตรีม')
on conflict (email) do nothing;
