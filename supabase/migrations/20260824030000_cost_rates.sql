-- ============================================================
-- BÀI 8 — Giá vốn nhân sự
--
-- Đến giờ mọi con số đều là DOANH THU. Thiếu con số thứ hai:
-- công ty tốn bao nhiêu cho 1 giờ của mỗi người.
--
--   Lãi = (giá bán − giá vốn) × số giờ
--
-- Hai con số này gắn vào hai thực thể khác nhau:
--   giá bán  -> gắn vào HẠNG MỤC (Dev bán cho STB 750k/h)
--   giá vốn  -> gắn vào NGƯỜI    (anh A tốn 280k/h, đi đâu cũng vậy)
-- ============================================================

-- Giá vốn theo người, có hiệu lực theo thời gian.
-- Vì sao cần valid_from: tăng lương thì giá vốn đổi, nhưng chi phí
-- của những giờ đã log tháng trước KHÔNG được đổi theo.
create table public.cost_rates (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  rate         numeric(14,2) not null default 0,      -- giá vốn 1 giờ
  valid_from   date not null default current_date,
  -- Cộng thêm chi phí gián tiếp (mặt bằng, điện nước, quản lý) lên giá vốn.
  -- Bỏ qua overhead thì biên lợi nhuận luôn đẹp giả tạo.
  add_overhead boolean not null default true,
  note         text,
  created_at   timestamptz not null default now(),
  unique (user_id, valid_from)
);
create index on public.cost_rates (namespace_id);
create index on public.cost_rates (user_id);

-- Giá vốn RIÊNG cho một hợp đồng, đè lên giá mặc định của người đó.
-- Ví dụ thật: cùng một contractor tính $10/h ở dự án này, $15/h ở dự án khác.
create table public.budget_cost_rates (
  id        uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id   uuid not null references public.users(id) on delete cascade,
  rate      numeric(14,2) not null,
  note      text,
  unique (budget_id, user_id)
);
create index on public.budget_cost_rates (budget_id);

-- Chi phí gián tiếp toàn công ty, phân bổ lên mỗi giờ làm việc.
-- Overhead/giờ = tổng chi phí gián tiếp tháng / tổng giờ làm việc tháng
create table public.overhead_settings (
  id             uuid primary key default gen_random_uuid(),
  namespace_id   uuid not null references public.namespaces(id) on delete cascade unique,
  monthly_cost   numeric(14,2) not null default 0,   -- mặt bằng, điện nước, HR, kế toán...
  monthly_hours  numeric(14,2) not null default 0,   -- tổng giờ làm việc của công ty/tháng
  is_enabled     boolean not null default false,
  note           text
);

alter table public.cost_rates        enable row level security;
alter table public.budget_cost_rates enable row level security;
alter table public.overhead_settings enable row level security;

create policy "public read"  on public.cost_rates        for select using (true);
create policy "public write" on public.cost_rates        for all    using (true) with check (true);
create policy "public read"  on public.budget_cost_rates for select using (true);
create policy "public write" on public.budget_cost_rates for all    using (true) with check (true);
create policy "public read"  on public.overhead_settings for select using (true);
create policy "public write" on public.overhead_settings for all    using (true) with check (true);
