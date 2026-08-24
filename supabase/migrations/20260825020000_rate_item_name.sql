-- ============================================================
-- Tên riêng cho từng dòng bảng giá
--
-- Ảnh Productive cho thấy bảng dòng giá có HAI cột tách bạch:
--   Name         -- tên do người dùng đặt, ví dụ "Senior Design"
--   Service type -- nhãn phân loại, ví dụ "Design"
--
-- Trước đây tôi hiển thị dòng giá bằng chính tên loại dịch vụ, nên một loại
-- chỉ có được đúng một dòng giá — code còn chủ động lọc bỏ loại đã dùng.
-- Hệ quả là không bán được "Senior Design 300k/h" và "Junior Design 150k/h"
-- cùng lúc, trong khi đó là cách bán phổ biến nhất.
--
-- Cho phép null để dòng cũ không vỡ: null thì hiển thị lùi về tên loại dịch vụ.
-- ============================================================

alter table public.rate_card_items
  add column if not exists name text;

-- Điền tên cho các dòng đã có, lấy từ loại dịch vụ đang trỏ tới
update public.rate_card_items i
set    name = t.name
from   public.service_types t
where  i.service_type_id = t.id
  and  i.name is null;
