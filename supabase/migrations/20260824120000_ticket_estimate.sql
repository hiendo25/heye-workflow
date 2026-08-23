-- ============================================================
-- Dự báo dựa trên CÔNG VIỆC, thay cho lịch xếp riêng
--
-- Productive có ba cách lập kế hoạch. Cách nhẹ nhất tên là Workload:
-- rải đều số giờ ước tính của công việc giữa ngày bắt đầu và hạn chót,
-- không cần bảng lịch xếp riêng.
--
--   Ước tính 40h, từ 01/08 đến 15/08 (11 ngày làm việc)
--   -> 40 / 11 ≈ 3.6 giờ mỗi ngày
--
-- Chọn cách này cho HeyE vì công việc ở đây thường 1-2 người, không phải
-- 5-10 người với mức giờ khác nhau. Đổi lại, mất khả năng đặt giờ riêng
-- cho từng người trên cùng một việc, và không giữ chỗ tạm tính được.
-- ============================================================

alter table public.tickets
  add column if not exists start_date     date,
  add column if not exists estimate_hours numeric(8,2);

create index if not exists tickets_dates_idx on public.tickets (start_date, deadline);
