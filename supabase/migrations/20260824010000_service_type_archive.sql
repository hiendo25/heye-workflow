-- Lưu trữ (archive) loại dịch vụ.
--
-- Vì sao cần archive chứ không chỉ xoá: loại dịch vụ đã dùng trong hợp đồng cũ
-- vẫn phải hiện trong báo cáo lịch sử. Archive = ngừng cho chọn mới,
-- nhưng số liệu cũ giữ nguyên.
alter table public.service_types
  add column if not exists is_archived boolean not null default false;
