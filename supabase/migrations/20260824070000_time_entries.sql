-- ============================================================
-- BÀI 9 — Ghi nhận giờ
--
-- Giờ gắn vào HẠNG MỤC (nơi có giá), không gắn vào ticket.
-- Ticket nối sẵn tới hạng mục để nhân viên không phải nghĩ về tài chính:
-- họ chỉ log giờ trên việc mình làm, giờ tự chảy về đúng chỗ tính tiền.
--
--   Chi phí = số giờ x giá vốn của người log
--   Doanh thu = giờ tính tiền x đơn giá bán của hạng mục
-- ============================================================

-- Nối ticket với hạng mục bán. Gán một lần, log giờ tự điền sẵn.
alter table public.tickets
  add column if not exists budget_service_id uuid
    references public.budget_services(id) on delete set null;
create index if not exists tickets_budget_service_idx
  on public.tickets (budget_service_id);

create table public.time_entries (
  id            uuid primary key default gen_random_uuid(),
  namespace_id  uuid not null references public.namespaces(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  -- Nơi tính tiền. Bắt buộc: giờ không gắn hạng mục thì không ra tiền được.
  service_id    uuid not null references public.budget_services(id) on delete cascade,
  -- Việc đang làm. Không bắt buộc: có thể log thẳng vào hạng mục.
  ticket_id     uuid references public.tickets(id) on delete set null,

  date          date not null default current_date,
  minutes       integer not null default 0 check (minutes >= 0),
  -- Phần được tính tiền cho khách. Thường bằng minutes, nhưng có thể ít hơn
  -- khi làm quá tay mà không muốn tính hết cho khách.
  billable_minutes integer not null default 0 check (billable_minutes >= 0),
  note          text,

  -- CHỤP giá vốn lúc log, KHÔNG tính động.
  -- Nếu tính động, sau này tăng lương sẽ làm đổi luôn chi phí của những giờ
  -- đã log tháng trước — báo cáo tài chính quá khứ tự nhiên khác đi.
  cost_rate_snapshot numeric(14,2) not null default 0,

  approved_at   timestamptz,
  approved_by   uuid references public.users(id) on delete set null,

  created_at    timestamptz not null default now()
);
create index on public.time_entries (namespace_id);
create index on public.time_entries (user_id, date);
create index on public.time_entries (service_id);
create index on public.time_entries (ticket_id);

alter table public.time_entries enable row level security;
create policy "public read"  on public.time_entries for select using (true);
create policy "public write" on public.time_entries for all    using (true) with check (true);
