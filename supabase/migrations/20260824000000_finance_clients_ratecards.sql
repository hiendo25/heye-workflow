-- ============================================================
-- BÀI 6 — Khách hàng & Bảng giá
--
-- Vì sao tách bảng giá khỏi hợp đồng:
-- cùng một loại lao động (Dev, QC, PM) bán cho mỗi khách một giá.
-- Bảng giá là "trí nhớ" của hệ thống về giá đã đàm phán với từng khách,
-- để mỗi lần ký hợp đồng mới không phải nhớ và gõ lại.
-- ============================================================

-- Khách hàng ------------------------------------------------
create table public.client_companies (
  id            uuid primary key default gen_random_uuid(),
  namespace_id  uuid not null references public.namespaces(id) on delete cascade,
  name          text not null,
  short_name    text,
  tax_id        text,                                  -- mã số thuế
  currency      text not null default 'VND',
  contact_name  text,
  contact_email text,
  contact_phone text,
  note          text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index on public.client_companies (namespace_id);

-- Loại dịch vụ (Service Type) -------------------------------
-- Đây là DANH MỤC của cả công ty, khai 1 lần dùng mãi.
-- Đóng vai trò "trung tâm lợi nhuận": nhờ nó mới gộp được báo cáo
-- "mảng QC của công ty lãi bao nhiêu" từ mọi dự án, mọi khách.
create table public.service_types (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  name         text not null,
  code         text,
  color        text not null default '#5B3DF5',
  position     integer not null default 0,
  is_active    boolean not null default true
);
create index on public.service_types (namespace_id);

-- Bảng giá --------------------------------------------------
-- client_id NULL  = bảng giá chuẩn của công ty (dùng cho mọi khách)
-- client_id có    = bảng giá riêng của khách đó
create table public.rate_cards (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  client_id    uuid references public.client_companies(id) on delete cascade,
  name         text not null,
  currency     text not null default 'VND',
  is_archived  boolean not null default false,
  note         text,
  created_at   timestamptz not null default now()
);
create index on public.rate_cards (namespace_id);
create index on public.rate_cards (client_id);

-- Dòng trong bảng giá: mỗi loại dịch vụ một ĐƠN GIÁ BÁN.
-- Chú ý: chỉ có giá, KHÔNG có số lượng. Số lượng thuộc về hợp đồng (bài 7).
create table public.rate_card_items (
  id              uuid primary key default gen_random_uuid(),
  rate_card_id    uuid not null references public.rate_cards(id) on delete cascade,
  service_type_id uuid not null references public.service_types(id) on delete cascade,
  unit            text not null default 'hour' check (unit in ('hour','day','piece')),
  price           numeric(14,2) not null default 0,
  position        integer not null default 0,
  unique (rate_card_id, service_type_id)
);
create index on public.rate_card_items (rate_card_id);

-- RLS (demo 1 tenant: cho phép đọc/ghi) ----------------------
alter table public.client_companies enable row level security;
alter table public.service_types    enable row level security;
alter table public.rate_cards       enable row level security;
alter table public.rate_card_items  enable row level security;

create policy "public read"  on public.client_companies for select using (true);
create policy "public write" on public.client_companies for all    using (true) with check (true);
create policy "public read"  on public.service_types    for select using (true);
create policy "public write" on public.service_types    for all    using (true) with check (true);
create policy "public read"  on public.rate_cards       for select using (true);
create policy "public write" on public.rate_cards       for all    using (true) with check (true);
create policy "public read"  on public.rate_card_items  for select using (true);
create policy "public write" on public.rate_card_items  for all    using (true) with check (true);

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================
do $$
declare
  ns      uuid;
  c_bx    uuid;
  c_by    uuid;
  c_sky   uuid;
  st_dev  uuid;
  st_qc   uuid;
  st_pm   uuid;
  st_uat  uuid;
  st_ba   uuid;
  st_ops  uuid;
  rc_std  uuid;
  rc_bx   uuid;
  rc_by   uuid;
begin
  select id into ns from public.namespaces order by created_at limit 1;
  if ns is null then
    raise exception 'Chưa có namespace nào — chạy migration gốc trước.';
  end if;

  -- Khách hàng
  insert into public.client_companies (namespace_id, name, short_name, tax_id, contact_name, contact_email)
  values (ns,'Ngân hàng Thương mại X','Bank X','0100112233','Chị Hương','huong@bankx.vn')
  returning id into c_bx;

  insert into public.client_companies (namespace_id, name, short_name, tax_id, contact_name, contact_email)
  values (ns,'Ngân hàng Thương mại Y','Bank Y','0100445566','Anh Tuấn','tuan@banky.vn')
  returning id into c_by;

  insert into public.client_companies (namespace_id, name, short_name, tax_id, contact_name, contact_email)
  values (ns,'Công ty CP Sky Realty','Sky Realty','0312778899','Anh Dũng','dung@skyrealty.vn')
  returning id into c_sky;

  -- Loại dịch vụ (danh mục công ty)
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Phát triển','DEV','#2563EB',1) returning id into st_dev;
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Kiểm thử','QC','#7C3AED',2) returning id into st_qc;
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Quản lý dự án','PM','#0E9F6E',3) returning id into st_pm;
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Hỗ trợ UAT','UAT','#D97706',4) returning id into st_uat;
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Phân tích nghiệp vụ','BA','#DB2777',5) returning id into st_ba;
  insert into public.service_types (namespace_id,name,code,color,position)
  values (ns,'Vận hành hệ thống','OPS','#0891B2',6) returning id into st_ops;

  -- Bảng giá chuẩn công ty (client_id NULL)
  insert into public.rate_cards (namespace_id, client_id, name, note)
  values (ns, null, 'Giá chuẩn công ty', 'Áp dụng khi khách không có bảng giá riêng')
  returning id into rc_std;

  insert into public.rate_card_items (rate_card_id, service_type_id, unit, price, position) values
    (rc_std, st_dev,'hour',600000,1), (rc_std, st_qc,'hour',400000,2),
    (rc_std, st_pm ,'hour',800000,3), (rc_std, st_uat,'hour',450000,4),
    (rc_std, st_ba ,'hour',700000,5), (rc_std, st_ops,'hour',500000,6);

  -- Bảng giá riêng Bank X (khách lớn, giá cao hơn)
  insert into public.rate_cards (namespace_id, client_id, name, note)
  values (ns, c_bx, 'Bảng giá Bank X 2026', 'Đàm phán tháng 12/2025, áp dụng cả năm 2026')
  returning id into rc_bx;

  insert into public.rate_card_items (rate_card_id, service_type_id, unit, price, position) values
    (rc_bx, st_dev,'hour',700000,1), (rc_bx, st_qc,'hour',450000,2),
    (rc_bx, st_pm ,'hour',900000,3), (rc_bx, st_uat,'hour',500000,4),
    (rc_bx, st_ba ,'hour',800000,5);

  -- Bảng giá riêng Bank Y (đàm phán mạnh, giá thấp hơn chuẩn)
  insert into public.rate_cards (namespace_id, client_id, name, note)
  values (ns, c_by, 'Bảng giá Bank Y', 'Hợp đồng khung 3 năm, đổi lại giá thấp')
  returning id into rc_by;

  insert into public.rate_card_items (rate_card_id, service_type_id, unit, price, position) values
    (rc_by, st_dev,'hour',550000,1), (rc_by, st_qc,'hour',380000,2),
    (rc_by, st_pm ,'hour',750000,3), (rc_by, st_uat,'hour',420000,4);
end $$;
