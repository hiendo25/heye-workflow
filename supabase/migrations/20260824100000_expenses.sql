-- ============================================================
-- BÀI 11 — Chi phí (Expense)
--
-- Chi phí là nguồn thứ HAI sinh ra cost, bên cạnh giờ nhân sự:
-- thầu phụ, mua bản quyền, thiết bị, đi lại.
--
-- Ba điểm quan trọng theo tài liệu Productive:
--
-- 1. Chỉ ghi được vào hạng mục có đơn vị 'piece' và bật allow_expense.
--
-- 2. Thuế KHÔNG ảnh hưởng số tiền tính cho khách. Thuế là phần ta trả
--    nhà cung cấp; khi xuất hoá đơn cho khách thì áp thuế riêng.
--    Phụ giá (markup) tính trên giá TRƯỚC thuế.
--
-- 3. Trạng thái duyệt quyết định ghi nhận:
--      Đã duyệt   -> sinh CẢ chi phí lẫn doanh thu
--      Chờ duyệt  -> sinh CHI PHÍ, chưa sinh doanh thu
--      Từ chối    -> không sinh gì
--    Nguyên tắc thận trọng: ghi chi phí sớm nhất, doanh thu muộn nhất.
-- ============================================================

create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  namespace_id  uuid not null references public.namespaces(id) on delete cascade,
  -- Người nộp chi phí
  user_id       uuid not null references public.users(id) on delete cascade,
  -- Hạng mục bán mà chi phí này thuộc về (bắt buộc: nơi tính tiền)
  service_id    uuid not null references public.budget_services(id) on delete cascade,
  ticket_id     uuid references public.tickets(id) on delete set null,

  reference     text not null,                       -- nhãn ngắn để nhận ra
  date          date not null default current_date,
  due_date      date,
  currency      text not null default 'VND',
  vendor        text,                                -- nhà cung cấp
  note          text,
  attachment_name text,                              -- tên file đính kèm

  -- Phụ giá bán lại cho khách. Hai kiểu, theo đúng Productive:
  --   percent: cộng % lên giá vốn
  --   fixed  : ấn định thẳng số tiền bán (dùng cho chi phí giá vốn = 0)
  markup_type   text not null default 'percent' check (markup_type in ('percent','fixed')),
  markup_value  numeric(14,2) not null default 0,

  -- submitted: chờ duyệt · approved: đã duyệt
  -- changes_requested: bị trả lại · cancelled: đã huỷ
  status        text not null default 'submitted'
                check (status in ('submitted','approved','changes_requested','cancelled')),
  approved_at   timestamptz,
  approved_by   uuid references public.users(id) on delete set null,
  review_note   text,

  -- Đã thanh toán cho nhà cung cấp chưa
  is_paid       boolean not null default false,
  paid_at       date,
  -- Đã hoàn tiền cho người nộp chưa
  is_reimbursed boolean not null default false,

  created_at    timestamptz not null default now()
);
create index on public.expenses (namespace_id);
create index on public.expenses (service_id);
create index on public.expenses (user_id, date);
create index on public.expenses (status);

-- Một chi phí có nhiều dòng: vé máy bay + khách sạn + taxi trong một chuyến.
create table public.expense_items (
  id          uuid primary key default gen_random_uuid(),
  expense_id  uuid not null references public.expenses(id) on delete cascade,
  description text not null,
  unit_price  numeric(14,2) not null default 0,
  quantity    numeric(10,2) not null default 1,
  tax_rate    numeric(5,2) not null default 0,       -- phần trăm
  -- true: giá đã gồm thuế, cần bóc ngược ra
  tax_included boolean not null default false,
  position    integer not null default 0
);
create index on public.expense_items (expense_id);

alter table public.expenses      enable row level security;
alter table public.expense_items enable row level security;

create policy "public read"  on public.expenses      for select using (true);
create policy "public write" on public.expenses      for all    using (true) with check (true);
create policy "public read"  on public.expense_items for select using (true);
create policy "public write" on public.expense_items for all    using (true) with check (true);
