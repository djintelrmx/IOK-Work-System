-- เพิ่ม column status ใน team_members
alter table team_members
  add column if not exists status text not null default 'active';

-- คนที่มีอยู่แล้วให้เป็น active ทั้งหมด
update team_members set status = 'active' where status = 'active';

-- เพิ่ม column auth_id เพื่อเชื่อมกับ Supabase Auth
alter table team_members
  add column if not exists auth_id uuid references auth.users(id) on delete set null;
