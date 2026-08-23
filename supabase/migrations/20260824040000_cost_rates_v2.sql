-- ============================================================
-- BÀI 8 (làm lại) — Giá vốn nhân sự theo chuẩn Productive
--
-- Sai của bản trước: bắt nhập thẳng giá GIỜ. Thực tế kế toán chỉ biết
-- LƯƠNG THÁNG — không ai biết giá giờ là bao nhiêu.
--
-- Đúng phải là: nhập lương tháng + lịch làm việc → hệ thống TỰ TÍNH giá giờ
--
--   Giá vốn giờ = Lương kỳ / Số giờ làm việc trong kỳ
--   3.000 EUR/tháng ÷ 168 giờ = 17,86 EUR/giờ
-- ============================================================

drop table if exists public.cost_rates cascade;

create table public.cost_rates (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,

  -- Nhập lương theo kỳ nào: giờ / tuần / 2 tuần / tháng / năm
  rate_type    text not null default 'monthly'
               check (rate_type in ('hourly','weekly','biweekly','monthly','annual')),
  amount       numeric(14,2) not null default 0,   -- số tiền của kỳ đó
  currency     text not null default 'VND',

  -- Lịch làm việc: số giờ mỗi thứ (T2..CN). Đây là cơ sở tính ra giá giờ.
  hours_mon    numeric(4,1) not null default 8,
  hours_tue    numeric(4,1) not null default 8,
  hours_wed    numeric(4,1) not null default 8,
  hours_thu    numeric(4,1) not null default 8,
  hours_fri    numeric(4,1) not null default 8,
  hours_sat    numeric(4,1) not null default 0,
  hours_sun    numeric(4,1) not null default 0,

  -- Khoảng hiệu lực. end_date NULL = còn hiệu lực tới nay.
  -- Tăng lương thì đóng bản cũ và mở bản mới, chi phí giờ đã log không đổi.
  start_date   date not null default current_date,
  end_date     date,

  add_overhead boolean not null default true,
  note         text,
  created_at   timestamptz not null default now()
);
create index on public.cost_rates (namespace_id);
create index on public.cost_rates (user_id, start_date);

alter table public.cost_rates enable row level security;
create policy "public read"  on public.cost_rates for select using (true);
create policy "public write" on public.cost_rates for all    using (true) with check (true);
