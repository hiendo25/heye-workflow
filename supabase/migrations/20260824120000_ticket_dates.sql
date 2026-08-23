-- Ngày bắt đầu trên công việc, để tạo lịch xếp thẳng từ công việc.
--
-- Productive có ba cách lập kế hoạch, không phải một:
--   Workload          - rải đều việc giữa ngày bắt đầu và hạn, không cần tài chính
--   Xếp theo hạng mục - chốt người trước, bóc việc sau
--   Xếp theo công việc - bóc việc trước, rồi xếp người TỪ công việc đó
--
-- Cách thứ ba cần công việc có đủ khoảng ngày để điền sẵn vào lịch xếp.
-- Lịch xếp vẫn là bảng riêng vì công việc thiếu hai thứ: số giờ mỗi ngày,
-- và khả năng nhiều người cùng một việc với mức giờ khác nhau.
alter table public.tickets
  add column if not exists start_date date;

-- Nối lịch xếp về công việc đã có sẵn cột ticket_id, chỉ cần đánh chỉ mục.
create index if not exists bookings_ticket_idx on public.bookings (ticket_id);
