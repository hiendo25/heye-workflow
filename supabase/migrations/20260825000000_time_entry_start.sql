-- ============================================================
-- Giờ bắt đầu trong ngày, để chế độ Lịch đặt block đúng chỗ
--
-- Chế độ Lịch của Productive là lưới giờ: trục dọc là các mốc 8h, 9h, 10h...,
-- mỗi dòng giờ vẽ thành một block đặt đúng vị trí bắt đầu và kéo dài theo
-- thời lượng. Muốn vậy phải biết dòng đó bắt đầu lúc mấy giờ.
--
-- Lưu bằng SỐ PHÚT TỪ NỬA ĐÊM chứ không phải kiểu time, vì:
--   - cộng trừ khi kéo thả chỉ là phép cộng số nguyên
--   - không dính múi giờ, vốn là chuyện của timestamptz chứ không phải
--     "8 giờ sáng theo lịch làm việc của người đó"
--
--   480  = 08:00     540 = 09:00     1020 = 17:00
--
-- Cho phép null: dòng nhập tay không kèm giờ cụ thể vẫn hợp lệ, Productive
-- xếp những dòng đó vào khu riêng phía trên lưới.
-- ============================================================

alter table public.time_entries
  add column if not exists start_min integer;

alter table public.time_entries
  drop constraint if exists time_entries_start_min_range;

alter table public.time_entries
  add constraint time_entries_start_min_range
  check (start_min is null or (start_min >= 0 and start_min < 1440));

create index if not exists time_entries_day_start_idx
  on public.time_entries (user_id, date, start_min);
