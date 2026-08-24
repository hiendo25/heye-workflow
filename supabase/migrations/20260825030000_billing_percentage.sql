-- ============================================================
-- Cho phép cách tính tiền PHẦN TRĂM
--
-- Ảnh Productive có hàng "Management Fee" chọn Billing type = Percentage,
-- Unit = percentage, Qty = 10 %, không có đơn giá, thành tiền tự tính từ các
-- hạng mục còn lại. Dùng cho phí quản lý dự án hoặc phí vận hành: hợp đồng to
-- thì phí to theo.
--
-- Tầng code đã hỗ trợ từ trước nhưng ràng buộc CHECK trong DB vẫn chỉ nhận ba
-- giá trị cũ, nên lưu xuống là bị chặn. Đây là lỗi bỏ sót migration.
-- ============================================================

alter table public.budget_services
  drop constraint if exists budget_services_billing_type_check;

alter table public.budget_services
  add constraint budget_services_billing_type_check
  check (billing_type in ('tm', 'fixed', 'percentage', 'non_billable'));

-- Dòng bảng giá cũng cần nhận giá trị này, vì hạng mục có thể rút từ bảng giá
alter table public.rate_card_items
  drop constraint if exists rate_card_items_billing_type_check;

alter table public.rate_card_items
  add constraint rate_card_items_billing_type_check
  check (billing_type in ('tm', 'fixed', 'percentage', 'non_billable'));
