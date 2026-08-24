-- ============================================================
-- Gán nhân sự vào loại dịch vụ
--
-- Productive cho gán người vào từng loại dịch vụ để HẠN CHẾ chấm giờ: một bạn
-- Kiểm thử thì chỉ log được vào loại Kiểm thử, không log nhầm sang Phát triển.
-- Cột phụ trên danh sách loại dịch vụ hiển thị "N người" chính là số này.
--
-- Trước đây tôi hiển thị số BẢNG GIÁ đang dùng loại đó — một chỉ số khác hẳn,
-- không liên quan gì tới việc ai được chấm giờ vào đâu.
--
-- Không gán ai = mọi người đều log được. Đây là mặc định, vì tổ chức nhỏ
-- thường không cần hạn chế, và bắt gán trước mới dùng được thì quá phiền.
-- ============================================================

create table if not exists public.service_type_people (
  id              uuid primary key default gen_random_uuid(),
  namespace_id    uuid not null,
  service_type_id uuid not null references public.service_types (id) on delete cascade,
  user_id         uuid not null,
  created_at      timestamptz not null default now(),

  -- Một người chỉ gán một lần vào mỗi loại
  unique (service_type_id, user_id)
);

create index if not exists service_type_people_type_idx
  on public.service_type_people (service_type_id);

create index if not exists service_type_people_user_idx
  on public.service_type_people (user_id);

alter table public.service_type_people enable row level security;

drop policy if exists "public read" on public.service_type_people;
create policy "public read" on public.service_type_people for select using (true);

drop policy if exists "public write" on public.service_type_people;
create policy "public write" on public.service_type_people for all using (true) with check (true);
