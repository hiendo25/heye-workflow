-- ============================================================
-- Nộp bảng chấm công + khoá kỳ, theo đúng Productive
--
-- Đây là HAI TẦNG ĐỘC LẬP, đừng lẫn:
--
--   Tầng 1 — NỘP (tuỳ chọn): nhân viên nộp bảng chấm công theo tuần.
--            Not submitted -> Partially submitted -> Submitted
--            Tài liệu ghi rõ: cần có dòng cho ĐỦ 7 ngày, kể cả cuối tuần.
--
--   Tầng 2 — DUYỆT (luật của hợp đồng): duyệt từng dòng giờ.
--            Nộp không thay thế duyệt, chỉ thêm một bước trước đó.
-- ============================================================

create table public.timesheet_submissions (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  -- Thứ Hai của tuần được nộp
  week_start   date not null,
  status       text not null default 'submitted'
               check (status in ('submitted','partial','changes_requested')),
  submitted_at timestamptz not null default now(),
  -- Người quản lý nộp hộ (Company Time). NULL = tự nộp.
  submitted_by uuid references public.users(id) on delete set null,
  note         text,
  unique (user_id, week_start)
);
create index on public.timesheet_submissions (namespace_id);
create index on public.timesheet_submissions (user_id, week_start);

-- Yêu cầu sửa lại một dòng giờ đã nộp.
alter table public.time_entries
  add column if not exists change_requested_at timestamptz,
  add column if not exists change_request_note text,
  -- Khoá cứng: hết kỳ thì không sửa được nữa, kể cả chưa duyệt.
  add column if not exists locked_at timestamptz;

-- Cấu hình chung cho cả tổ chức.
create table public.time_settings (
  id            uuid primary key default gen_random_uuid(),
  namespace_id  uuid not null references public.namespaces(id) on delete cascade unique,
  -- Bắt duyệt giờ trước khi tính doanh thu
  require_approval   boolean not null default true,
  -- Bật bước nộp bảng chấm công trước khi duyệt
  require_submission boolean not null default false,
  -- Tự khoá bảng chấm công sau mỗi kỳ: không khoá / ngày / tuần / tháng
  lock_period   text not null default 'none'
                check (lock_period in ('none','daily','weekly','monthly')),
  -- Giới hạn số giờ log trong một ngày (chính sách chấm công)
  max_hours_per_day numeric(4,1) not null default 24
);

alter table public.timesheet_submissions enable row level security;
alter table public.time_settings         enable row level security;

create policy "public read"  on public.timesheet_submissions for select using (true);
create policy "public write" on public.timesheet_submissions for all    using (true) with check (true);
create policy "public read"  on public.time_settings         for select using (true);
create policy "public write" on public.time_settings         for all    using (true) with check (true);
