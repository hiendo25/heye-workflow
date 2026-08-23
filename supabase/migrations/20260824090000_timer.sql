-- ============================================================
-- Bấm giờ (Timer)
--
-- Productive cho bấm play trên một dòng giờ đang có, đồng hồ đếm tiếp
-- từ số phút đã ghi. Ràng buộc theo tài liệu:
--   - Chỉ bấm được cho NGÀY HÔM NAY
--   - Mỗi người tại một thời điểm chỉ chạy MỘT đồng hồ
--   - 8 giờ không thao tác thì nhắc, 24 giờ thì tự dừng
--   - Dừng lúc lẻ >= 30 giây thì làm tròn lên phút, < 30 giây làm tròn xuống
-- ============================================================

alter table public.time_entries
  -- Mốc bắt đầu của lần bấm hiện tại. NULL = không chạy.
  add column if not exists timer_started_at timestamptz;

-- Mỗi người chỉ một đồng hồ đang chạy.
create unique index if not exists time_entries_one_running_timer
  on public.time_entries (user_id)
  where timer_started_at is not null;

-- Nhật ký từng lần bấm play/stop, để đối chiếu khi cần.
create table public.timer_logs (
  id            uuid primary key default gen_random_uuid(),
  time_entry_id uuid not null references public.time_entries(id) on delete cascade,
  started_at    timestamptz not null,
  stopped_at    timestamptz,
  minutes       integer not null default 0,
  -- true khi hệ thống tự dừng sau 24 giờ, không phải người dùng bấm
  auto_stopped  boolean not null default false
);
create index on public.timer_logs (time_entry_id);

alter table public.timer_logs enable row level security;
create policy "public read"  on public.timer_logs for select using (true);
create policy "public write" on public.timer_logs for all    using (true) with check (true);
