# Sinh lại tài liệu DOCX

Tài liệu `HeyE-Kiem-soat-chi-phi-Huong-dan.docx` được sinh tự động từ các script
trong thư mục này, không sửa tay trong Word. Sửa tay thì lần sinh sau mất hết.

## Quy trình hai bước

**Bước 1 — chụp ảnh có đánh số**

Cần app đang chạy ở `localhost:5199` và Playwright cài toàn cục:

```
npx vite dev --config vite.config.local.ts --port 5199
node _docshots.mjs
```

Script mở từng màn, vẽ badge số tím lên đúng vị trí phần tử rồi mới chụp, nên
số trong ảnh luôn khớp với bảng giải thích trong tài liệu. Ảnh lưu ở
`%TEMP%/heye-doc`.

**Bước 2 — sinh tài liệu**

```
python docs/_gen/build_doc.py
```

## Cấu trúc script

| File | Nội dung |
|---|---|
| `gendoc.py` | Hàm dựng chung: heading, bảng, ảnh, khối ghi chú, phân trang |
| `part1.py` | Bìa, mục lục, bối cảnh, mô hình dữ liệu |
| `part2.py` | Hai trục tính tiền, màn Loại dịch vụ / Bảng giá / Giá vốn |
| `part3.py` | Màn Hợp đồng / Giờ / Chi phí |
| `part4.py` | Biểu đồ, quy tắc nghiệp vụ, danh mục case, việc còn tồn |

## Nguyên tắc khi sửa nội dung

Mọi số liệu trong tài liệu lấy từ DB thật, không bịa. Khi dữ liệu mẫu đổi thì
chạy lại truy vấn đối chiếu trước, rồi mới cập nhật số trong script — đừng để
tài liệu nói một đằng, app hiện một nẻo.
