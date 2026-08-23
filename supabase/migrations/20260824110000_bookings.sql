-- ============================================================
-- BÀI 13 — Xếp lịch nhân sự (Resource Planner) & dự báo
--
-- Đây là NGUỒN DỮ LIỆU TƯƠNG LAI duy nhất. Không có nó thì biểu đồ
-- chỉ vẽ được phần quá khứ, đường đứt không có gì để nối.
--
-- Tài liệu Productive nói thẳng: muốn dùng biểu đồ dự báo thì trước hết
-- phải xếp lịch cho người trong Resource Planner. Dự báo KHÔNG phải phép
-- ngoại suy toán học kiểu "tháng trước tiêu 10 thì tháng sau tiêu 10",
-- mà đọc từ lịch đã xếp thật.
--
-- Booking tạm tính (tentative): giữ chỗ cho hợp đồng chưa chốt.
-- Khác booking chắc chắn ở chỗ KHÔNG cộng vào tổng giờ đã xếp của người đó,
-- để không làm phồng khối lượng công việc một cách giả tạo.
-- ============================================================

create table public.bookings (
  id           uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.namespaces(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  -- Xếp vào hạng mục nào — nơi có giá, để dự báo ra tiền
  service_id   uuid not null references public.budget_services(id) on delete cascade,
  ticket_id    uuid references public.tickets(id) on delete set null,

  start_date   date not null,
  end_date     date not null,
  -- Số giờ mỗi NGÀY LÀM VIỆC trong khoảng trên
  hours_per_day numeric(4,1) not null default 8,

  -- Tạm tính: giữ chỗ cho việc chưa chắc. Không cộng vào tổng giờ đã xếp.
  is_tentative boolean not null default false,
  -- Tự sinh dòng giờ từ lịch đã xếp, cho việc chạy đều theo kế hoạch
  auto_track   boolean not null default false,
  note         text,

  created_at   timestamptz not null default now()
);
create index on public.bookings (namespace_id);
create index on public.bookings (user_id, start_date);
create index on public.bookings (service_id);

alter table public.bookings enable row level security;
create policy "public read"  on public.bookings for select using (true);
create policy "public write" on public.bookings for all    using (true) with check (true);
