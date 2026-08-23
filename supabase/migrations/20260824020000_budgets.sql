-- ============================================================
-- BÀI 7 — Hợp đồng & Hạng mục bán
--
-- Bảng giá chỉ có ĐƠN GIÁ. Hợp đồng thêm SỐ LƯỢNG → ra TỔNG TIỀN.
-- Và hợp đồng là nơi duy nhất log giờ / ghi chi phí vào được.
--
-- Một dự án có thể có NHIỀU hợp đồng (chia theo giai đoạn), vì mỗi
-- hợp đồng tính lời lỗ riêng.
-- ============================================================

create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  client_id    uuid not null references public.client_companies(id) on delete restrict,
  project_id   uuid references public.projects(id) on delete set null,
  name         text not null,
  code         text,                                   -- số hợp đồng
  currency     text not null default 'VND',
  start_date   date,
  end_date     date,
  owner_id     uuid references public.users(id) on delete set null,
  -- Chỉ 2 trạng thái: đang chạy -> đã bàn giao (khoá, không log thêm được).
  status       text not null default 'open' check (status in ('open','delivered')),
  is_internal  boolean not null default false,         -- budget nội bộ: không bán cho ai
  note         text,
  created_at   timestamptz not null default now()
);
create index on public.budgets (namespace_id);
create index on public.budgets (client_id);
create index on public.budgets (project_id);

-- Nhóm hạng mục trong hợp đồng: "Giai đoạn 1", "Mở tài khoản"...
-- Chỉ để gom cho dễ nhìn, không mang giá.
create table public.budget_sections (
  id         uuid primary key default gen_random_uuid(),
  budget_id  uuid not null references public.budgets(id) on delete cascade,
  name       text not null,
  position   integer not null default 0
);
create index on public.budget_sections (budget_id);

-- Hạng mục bán — ĐƠN VỊ NHỎ NHẤT MANG GIÁ.
-- Đây là nơi log giờ và ghi chi phí vào.
create table public.budget_services (
  id              uuid primary key default gen_random_uuid(),
  budget_id       uuid not null references public.budgets(id) on delete cascade,
  section_id      uuid references public.budget_sections(id) on delete set null,
  service_type_id uuid not null references public.service_types(id) on delete restrict,
  name            text not null,

  -- Cách tính tiền:
  --   tm         Theo giờ thực tế — khách chịu rủi ro vượt
  --   fixed      Trọn gói — TA chịu rủi ro vượt
  --   non_billable  Không thu tiền nhưng VẪN tính chi phí (họp, đào tạo)
  billing_type    text not null default 'tm'
                  check (billing_type in ('tm','fixed','non_billable')),

  unit            text not null default 'hour' check (unit in ('hour','day','piece')),
  quantity        numeric(14,2) not null default 0,     -- số lượng BÁN cho khách
  price           numeric(14,2) not null default 0,     -- đơn giá bán (rút từ bảng giá)
  -- Ước tính làm hết bao nhiêu. Với 'fixed' có thể KHÁC quantity:
  -- bán 200h nhưng ước tính làm 190h thì 10h chênh là lãi dự kiến.
  estimate        numeric(14,2),

  -- Công tắc: hạng mục này cho làm gì.
  -- Bán trọn gói vẫn nên bật log giờ để biết tốn bao nhiêu công.
  allow_time      boolean not null default true,
  allow_expense   boolean not null default false,

  position        integer not null default 0
);
create index on public.budget_services (budget_id);
create index on public.budget_services (section_id);

alter table public.budgets          enable row level security;
alter table public.budget_sections  enable row level security;
alter table public.budget_services  enable row level security;

create policy "public read"  on public.budgets         for select using (true);
create policy "public write" on public.budgets         for all    using (true) with check (true);
create policy "public read"  on public.budget_sections for select using (true);
create policy "public write" on public.budget_sections for all    using (true) with check (true);
create policy "public read"  on public.budget_services for select using (true);
create policy "public write" on public.budget_services for all    using (true) with check (true);
