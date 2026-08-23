-- ============================================================
-- Tách chi phí gián tiếp làm 2 loại, theo đúng Overhead Cost của Productive
--
--   Chi phí mặt bằng mỗi giờ = Chi phí mặt bằng / TỔNG giờ làm việc
--   Chi phí nội bộ mỗi giờ   = Chi phí nội bộ   / Giờ làm CHO KHÁCH
--   Tổng gián tiếp mỗi giờ   = hai cái trên cộng lại
--
-- Vì sao phải tách:
--   Giờ log vào hợp đồng KHÁCH   -> cộng đủ cả hai
--   Giờ log vào hợp đồng NỘI BỘ  -> chỉ cộng chi phí mặt bằng
--
-- Nếu hợp đồng nội bộ cũng cộng chi phí nội bộ thì thành TÍNH TRÙNG:
-- bản thân giờ nội bộ chính là thứ tạo ra chi phí nội bộ.
--
-- Chú ý mẫu số khác nhau: mặt bằng chia cho TỔNG giờ (ai làm gì cũng
-- ngồi văn phòng), còn chi phí nội bộ chia cho GIỜ LÀM KHÁCH (vì chỉ
-- giờ làm khách mới sinh doanh thu để gánh phần chi phí không ra tiền).
-- ============================================================

alter table public.overhead_settings
  -- Thuê văn phòng, điện nước, thiết bị, bản quyền phần mềm dùng chung
  add column if not exists facility_cost numeric(14,2) not null default 0,
  -- Tổng giờ làm việc của cả công ty trong tháng
  add column if not exists total_hours   numeric(14,2) not null default 0,
  -- Giờ làm cho khách (không tính giờ nội bộ, nghỉ phép)
  add column if not exists client_hours  numeric(14,2) not null default 0,
  -- Chi phí nội bộ. Productive tự tính từ giờ log vào hợp đồng nội bộ +
  -- expense nội bộ + nghỉ phép. HeyE chưa có dữ liệu giờ nên tạm nhập tay,
  -- tự tính được sau khi có bài 9 (ghi nhận giờ).
  add column if not exists internal_cost numeric(14,2) not null default 0,
  add column if not exists internal_is_auto boolean not null default false;

-- Chuyển dữ liệu từ 2 cột cũ sang cấu trúc mới
update public.overhead_settings
   set facility_cost = coalesce(nullif(facility_cost, 0), monthly_cost),
       total_hours   = coalesce(nullif(total_hours, 0), monthly_hours),
       client_hours  = coalesce(nullif(client_hours, 0), monthly_hours)
 where monthly_cost > 0 or monthly_hours > 0;
