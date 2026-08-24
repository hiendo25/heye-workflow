# -*- coding: utf-8 -*-
"""Phần 1: bìa, mục lục, bối cảnh, mô hình dữ liệu, khái niệm cốt lõi."""
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def build(g):
    doc, h, p, rich, bullet, table, img, note, pagebreak = (
        g.doc, g.h, g.p, g.rich, g.bullet, g.table, g.img, g.note, g.pagebreak
    )
    BRAND, MUTED, INK, GOOD, BAD = g.BRAND, g.MUTED, g.INK, g.GOOD, g.BAD

    # ══════════════════ BÌA ══════════════════
    for _ in range(5):
        doc.add_paragraph()
    t = doc.add_paragraph()
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = t.add_run("HeyE — Kiểm soát chi phí")
    r.bold = True
    r.font.size = Pt(30)
    r.font.color.rgb = BRAND

    s_ = doc.add_paragraph()
    s_.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = s_.add_run("Hướng dẫn tính năng và cấu hình")
    r.font.size = Pt(14)
    r.font.color.rgb = MUTED

    for _ in range(7):
        doc.add_paragraph()

    tb = doc.add_table(rows=4, cols=2)
    tb.alignment = 1
    meta = [
        ("Phiên bản", "v1.0 — 24/08/2026"),
        ("Đối tượng đọc", "PM, BA, Sale, Kế toán, Dev, QC"),
        ("Phạm vi", "Module Tài chính — 8 màn hình"),
        ("Trạng thái", "Đang chạy trên bản demo"),
    ]
    for i, (k, v) in enumerate(meta):
        c0, c1 = tb.rows[i].cells
        c0.text = ""
        rr = c0.paragraphs[0].add_run(k)
        rr.bold = True
        rr.font.size = Pt(10)
        c1.text = ""
        rr = c1.paragraphs[0].add_run(v)
        rr.font.size = Pt(10)
        c0.width, c1.width = Cm(4.5), Cm(11.5)

    pagebreak()

    # ══════════════════ MỤC LỤC ══════════════════
    h("Mục lục", 1)
    toc = [
        ("1", "Mô hình dữ liệu — 5 khái niệm cốt lõi", "Hiểu đúng trước khi dùng"),
        ("2", "Hai trục tính tiền: Giá bán và Giá vốn", "Nền tảng của mọi con số"),
        ("3", "Màn 1 — Loại dịch vụ", "Danh mục gốc, khai một lần"),
        ("4", "Màn 2 — Bảng giá", "Đơn giá bán theo từng khách"),
        ("5", "Màn 3 — Giá vốn nhân sự", "Một giờ của mỗi người tốn bao nhiêu"),
        ("6", "Màn 4 — Hợp đồng", "Nơi ra lãi lỗ"),
        ("7", "Màn 5 — Giờ của tôi", "Nhân viên ghi giờ"),
        ("8", "Màn 6 — Giờ toàn công ty", "Quản lý duyệt và ghi hộ"),
        ("9", "Màn 7 — Chi phí", "Tiền chi ra ngoài lương"),
        ("10", "Màn 8 — Biểu đồ và báo cáo", "Đọc số ra quyết định"),
        ("11", "Quy tắc nghiệp vụ quan trọng", "Những điều dễ hiểu sai"),
        ("12", "Danh mục case dữ liệu mẫu", "Đối chiếu khi kiểm thử"),
    ]
    table(
        ["#", "Nội dung", "Tóm tắt"],
        [[a, f"**{b}**", c] for a, b, c in toc],
        widths=[1.2, 6.5, 8.7],
    )
    pagebreak()

    # ══════════════════ 2. MÔ HÌNH DỮ LIỆU ══════════════════
    h("1. Mô hình dữ liệu — 5 khái niệm cốt lõi", 1)
    p("Phần lớn lỗi nhập liệu đến từ nhầm lẫn giữa năm khái niệm này.")

    table(
        ["Khái niệm", "Là gì", "Ví dụ thật trong hệ thống", "Ai quản lý"],
        [
            [
                "**Loại dịch vụ**\nService type",
                "Danh mục LOẠI LAO ĐỘNG của công ty. Khai một lần, dùng cho mọi dự án.",
                "Thiết kế, Phát triển, Kiểm thử, Quản lý dự án, Triển khai, Phân tích yêu cầu, Bản quyền phần mềm",
                "Ban giám đốc",
            ],
            [
                "**Bảng giá**\nRate card",
                "ĐƠN GIÁ BÁN cho từng loại dịch vụ. Mỗi khách có thể có bảng riêng.",
                "Bảng giá Sacombank 2026 (7 dòng), Bảng giá OCB (6 dòng), Giá chuẩn công ty (6 dòng)",
                "Sale + Ban giám đốc",
            ],
            [
                "**Giá vốn**\nCost rate",
                "Một giờ của mỗi NGƯỜI tốn công ty bao nhiêu. Tính từ lương.",
                "Sơn: 39 triệu/tháng → 365.018 đ/giờ (đã gồm chi phí gián tiếp)",
                "Chỉ quản trị viên",
            ],
            [
                "**Hợp đồng**\nBudget",
                "Một lần bán cụ thể cho một khách. Chứa các HẠNG MỤC với số lượng và đơn giá.",
                "Phần mềm giao dịch STM — Giai đoạn 1 (Sacombank, 17 hạng mục, 4,88 tỷ)",
                "PM",
            ],
            [
                "**Hạng mục**\nService",
                "Một dòng bán trong hợp đồng. Đây là nơi DUY NHẤT ghi giờ và ghi chi phí vào được.",
                "Đọc chip CCCD qua NFC — 420 giờ × 750.000 đ = 315.000.000 đ",
                "PM",
            ],
        ],
        widths=[3.0, 4.3, 5.6, 3.5],
        small=True,
    )

    h("1.1 Quan hệ giữa chúng", 2)
    p("Không có bước trước thì không làm được bước sau:")
    note(
        "Loại dịch vụ  →  Bảng giá (gán đơn giá cho loại)  →  Hợp đồng  →  "
        "Hạng mục (rút giá từ bảng giá, thêm số lượng)  →  Ghi giờ / Ghi chi phí vào hạng mục",
        "info",
    )
    p(
        "Chiều ngược lại là chiều tính tiền: giờ ghi vào hạng mục sinh ra doanh thu "
        "theo đơn giá, đồng thời sinh ra chi phí theo giá vốn của người ghi. "
        "Chênh lệch giữa hai con số đó chính là lãi.",
        after=2,
    )

    h("1.2 Hai trục độc lập: Loại dịch vụ và Nhóm hạng mục", 2)
    p("Hai trục vuông góc nhau, không thay thế cho nhau:")
    table(
        ["", "Loại dịch vụ", "Nhóm hạng mục (Section)"],
        [
            ["Trả lời câu hỏi", "LÀM VIỆC GÌ", "THUỘC PHẦN NÀO của sản phẩm"],
            ["Phạm vi", "Toàn công ty, dùng lại cho mọi hợp đồng", "Riêng từng hợp đồng"],
            [
                "Ví dụ",
                "Phát triển, Kiểm thử, Thiết kế",
                "Định danh & xác thực (eKYC), Giao dịch tiền mặt",
            ],
            ["Dùng để", "Báo cáo mảng nào lãi, ai làm loại việc gì", "Chia nhỏ hợp đồng cho dễ đọc"],
        ],
        widths=[3.6, 6.4, 6.4],
    )
    note(
        "Một hạng mục luôn có ĐỒNG THỜI cả hai: 'Đọc chip CCCD qua NFC' thuộc nhóm "
        "'Định danh & xác thực (eKYC)' và có loại dịch vụ là 'Phát triển'. "
        "Nhờ vậy hỏi được cả hai chiều: nhóm eKYC tốn bao nhiêu, và mảng Phát triển "
        "toàn công ty lãi bao nhiêu.",
        "good",
    )
    pagebreak()
