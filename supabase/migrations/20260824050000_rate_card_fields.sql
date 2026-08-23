-- Bổ sung các trường bảng giá cho khớp Productive.
--
-- Trên rate card của Productive, mỗi dòng giá mang sẵn cả cấu hình mặc định
-- (cách tính tiền, mô tả, giảm giá/phụ giá, giá vốn dự kiến). Khi rút vào
-- hợp đồng thì các giá trị này được điền sẵn, đỡ phải khai lại từng lần.
alter table public.rate_card_items
  add column if not exists description   text,
  add column if not exists billing_type  text not null default 'tm'
      check (billing_type in ('tm','fixed','non_billable')),
  -- Giảm giá / phụ giá theo phần trăm. Số âm = giảm, dương = cộng thêm.
  add column if not exists markup_pct    numeric(6,2) not null default 0,
  -- Giá vốn dự kiến của một đơn vị (mua license bao nhiêu, thuê ngoài bao nhiêu).
  -- Có số này mới ước lượng được lãi ngay lúc báo giá, chưa cần log giờ.
  add column if not exists cost_estimate numeric(14,2),
  add column if not exists allow_time    boolean not null default true,
  add column if not exists allow_expense boolean not null default false;
