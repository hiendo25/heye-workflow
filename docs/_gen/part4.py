# -*- coding: utf-8 -*-
"""Phần 4: biểu đồ, quy tắc nghiệp vụ, danh mục case, việc còn tồn."""


def build(g):
    doc, h, p, bullet, table, img, note, pagebreak = (
        g.doc, g.h, g.p, g.bullet, g.table, g.img, g.note, g.pagebreak
    )

    # ══════════════════ 11. BIỂU ĐỒ ══════════════════
    h("10. Màn 8 — Biểu đồ và báo cáo", 1)
    p(
        "Nằm ở tab Tổng quan của hợp đồng. Đây là nơi đọc số ra quyết định, "
        "nên cần hiểu đúng từng thành phần."
    )
    img("07-hd-tong-quan.png", "Hình 17 — Biểu đồ diễn biến (xem lại Hình 7)")

    h("10.1 Bốn nhóm điều khiển", 2)
    table(
        ["Nhóm", "Lựa chọn", "Đổi cái gì"],
        [
            [
                "**Góc nhìn**",
                "Ngân sách · Lợi nhuận",
                "Ngân sách = đối ngoại (còn bao nhiêu tiền). Lợi nhuận = đối nội (lãi bao nhiêu)",
            ],
            [
                "**Độ chi tiết**",
                "Năm · Quý · Tháng · Tuần",
                "Hợp đồng dài vài năm thì xem theo Quý, hợp đồng ngắn xem theo Tuần",
            ],
            [
                "**Cách cộng**",
                "Cộng dồn · Theo kỳ",
                "Cộng dồn = nhìn xu hướng và chỗ chạm trần. Theo kỳ = nhìn kỳ nào nặng nhẹ",
            ],
            [
                "**Chọn kỳ**",
                "Hôm nay · từng kỳ cụ thể",
                "Chọn một kỳ thì BA Ô SỐ LIỆU bên dưới đổi theo, kể cả kỳ tương lai (số dự báo)",
            ],
        ],
        widths=[3.0, 4.4, 8.8],
    )

    h("10.2 Đọc biểu đồ", 2)
    table(
        ["Ký hiệu", "Là gì", "Đọc thế nào"],
        [
            ["Cột cam đậm", "Giờ tính tiền / Giờ đã làm", "Giờ thực tế đã ghi"],
            ["Cột cam nhạt", "Giờ đã xếp lịch", "Giờ dự kiến theo kế hoạch công việc"],
            ["Cột sọc chéo", "Giờ xếp lịch tương lai", "Kỳ chưa tới — mới là dự kiến"],
            ["Đường đỏ ngang", "Tổng ngân sách", "Trần hợp đồng, chạm là hết tiền"],
            ["Đường xanh liền", "Đã dùng", "Doanh thu đã ghi nhận tới kỳ đó"],
            ["Đường xanh đứt", "Đã dùng, dự báo", "Dự báo theo lịch đã xếp"],
            ["Vạch xám đứt", "Kỳ hiện tại", "Mốc hôm nay"],
            ["Vạch tím đặc", "Kỳ đang chọn", "Kỳ vừa bấm chọn"],
        ],
        widths=[3.4, 4.4, 8.4],
        small=True,
    )
    note(
        "Chỗ đường xanh cắt đường đỏ chính là lúc ngân sách cạn. Hệ thống tự tính "
        "và hiện cảnh báo đỏ phía trên biểu đồ, ví dụ: “ngân sách sẽ cạn vào "
        "25/08/2026 và vượt 101.617.083 đ — trong khi hợp đồng còn tới 31/08/2026”.",
        "warn",
    )

    h("10.3 Ba ô số liệu", 2)
    table(
        ["Ô", "Tab Ngân sách", "Tab Lợi nhuận"],
        [
            [
                "**Thời gian**\nTime",
                "Giờ đã bán · Giờ tính tiền · Còn lại",
                "Giờ ước tính · Giờ đã làm · Còn lại",
            ],
            [
                "**Giữa**",
                "Tổng hợp đồng · Đã dùng · Còn lại",
                "Doanh thu · Chi phí · Lợi nhuận (%)",
            ],
            [
                "**Chi phí**\nCost",
                "Lương nhân sự · Chi phí phát sinh · Giờ không ra tiền",
                "Giống bên trái",
            ],
        ],
        widths=[3.4, 6.4, 6.4],
    )

    h("10.4 Vì sao “Đã dùng” có thể VƯỢT tổng hợp đồng", 2)
    p(
        "Số Đã dùng có thể lớn hơn Tổng hợp đồng, làm ô Còn lại ra số âm. "
        "Đây KHÔNG phải lỗi tính."
    )
    note(
        "Ví dụ thật — hợp đồng Sacombank:\n"
        "   Doanh thu từ giờ công       3.719.675.000 đ  (vẫn dưới trần)\n"
        "   Chi phí tính lại cho khách    860.850.000 đ  (NGOÀI hợp đồng gốc)\n"
        "   ────────────────────────────────────────────\n"
        "   Đã dùng                     4.580.525.000 đ\n"
        "   Tổng hợp đồng               4.517.600.000 đ\n"
        "   Còn lại                       −62.925.000 đ  (−1%)\n\n"
        "Phần vượt là chi phí mua ngoài tính lại cho khách — khoản thu THÊM, không "
        "nằm trong giá trị hợp đồng ban đầu. Hệ thống ghi rõ câu giải thích ngay "
        "dưới thanh tiến độ.",
        "info",
    )

    h("10.5 Trần giờ ghi nhận", 2)
    p(
        "Log vượt số lượng đã bán thì phần vượt KHÔNG ra doanh thu. Bán 100 giờ mà "
        "làm 120 giờ thì chỉ 100 giờ được ghi nhận, 20 giờ còn lại là làm không "
        "công — hiện ở dòng “Giờ không ra tiền” trong ô Chi phí."
    )
    pagebreak()

    # ══════════════════ 12. QUY TẮC NGHIỆP VỤ ══════════════════
    h("11. Quy tắc nghiệp vụ quan trọng", 1)
    p("Những điều dễ hiểu sai nhất, tập trung một chỗ để tra nhanh.")

    h("11.1 Doanh thu tính trên giờ TÍNH TIỀN, chi phí tính trên giờ ĐÃ LÀM", 2)
    note(
        "Đây là bất đối xứng CỐ Ý, đừng “sửa” cho đều.\n\n"
        "Làm 8 giờ nhưng chỉ tính khách 6 giờ:\n"
        "   Doanh thu = 6 giờ × đơn giá bán\n"
        "   Chi phí   = 8 giờ × giá vốn\n\n"
        "Vẫn phải trả lương đủ 8 giờ dù chỉ thu tiền 6 giờ. Chênh lệch chính là "
        "chỗ lợi nhuận rò rỉ — nếu tính đều hai bên thì mất luôn tín hiệu này.",
        "warn",
    )

    h("11.2 Chỉ giờ ĐÃ DUYỆT mới ra doanh thu", 2)
    p(
        "Khi tổ chức bật yêu cầu duyệt giờ, dòng chưa duyệt không tính vào doanh "
        "thu. Vẫn tính vào chi phí — cùng nguyên tắc thận trọng như chi phí."
    )

    h("11.3 Giá vốn chốt tại thời điểm ghi giờ", 2)
    p(
        "Mỗi dòng giờ lưu lại giá vốn tại đúng thời điểm ghi. Tăng lương sau đó "
        "không làm đổi chi phí của những giờ đã ghi trước — báo cáo tháng cũ không "
        "bị nhảy số."
    )

    h("11.4 Bốn quy tắc còn lại", 2)
    table(
        ["Quy tắc", "Nội dung"],
        [
            [
                "**Cộng tác viên không cộng gián tiếp**",
                "Họ không dùng văn phòng, không chia chi phí mặt bằng",
            ],
            [
                "**Phụ giá tính trên số trước thuế**",
                "Không tính trên số đã gồm thuế, tránh tính phụ giá lên thuế",
            ],
            [
                "**Hạng mục phần trăm tính hai vòng**",
                "Vòng một cộng hạng mục độc lập, vòng hai mới nhân tỷ lệ",
            ],
            [
                "**Xoá loại dịch vụ phải gộp trước**",
                "Chuyển dữ liệu sang loại khác rồi mới xoá, không cho mất lịch sử",
            ],
        ],
        widths=[5.4, 10.8],
    )
    pagebreak()

    # ══════════════════ 13. DANH MỤC CASE ══════════════════
    h("12. Danh mục case dữ liệu mẫu", 1)
    p(
        "Bản demo đã cài sẵn dữ liệu phủ đủ các trường hợp dưới đây. Dùng bảng này "
        "khi kiểm thử để biết vào đâu xem được case nào."
    )

    h("12.1 Hạng mục — cách tính tiền và đơn vị", 2)
    table(
        ["Case", "Số lượng", "Xem ở đâu"],
        [
            ["Theo giờ (T&M)", "31 hạng mục", "Mọi hợp đồng"],
            ["Trọn gói (Fixed)", "10 hạng mục", "Dòng bản quyền, triển khai"],
            ["Phần trăm (Percentage)", "1 hạng mục", "Hợp đồng Sacombank — Phí quản lý dự án 8%"],
            ["Không tính tiền (Non-billable)", "21 hạng mục", "Hợp đồng STM Admin tặng kèm"],
            ["Đơn vị: giờ", "46 hạng mục", "Phần lớn hạng mục nhân công"],
            ["Đơn vị: ngày", "14 hạng mục", "Hợp đồng OCB, VIB"],
            ["Đơn vị: gói", "3 hạng mục", "Dòng bản quyền phần mềm"],
            ["Cho ghi giờ + chi phí", "2 hạng mục", "Dòng bản quyền STM 40 máy"],
            ["Không theo dõi gì", "1 hạng mục", "Bản quyền STM mini 25 máy"],
        ],
        widths=[6.0, 3.4, 6.8],
    )

    h("12.2 Giá vốn — đủ 5 kỳ lương", 2)
    table(
        ["Kỳ lương", "Người", "Số tiền", "Ghi chú"],
        [
            ["Theo giờ", "An", "220.000 đ/giờ", "Cộng tác viên — KHÔNG cộng gián tiếp"],
            ["Theo tuần", "Vy", "6.000.000 đ/tuần", "Hiệu lực từ 01/09/2026"],
            ["Hai tuần một lần", "An", "11.000.000 đ/kỳ", "Hiệu lực từ 01/09/2026"],
            ["Theo tháng", "Sơn, Linh, Nam, Trang, Cường, Vy", "21–42 triệu", "Phổ biến nhất"],
            ["Theo năm", "Cường", "320.000.000 đ/năm", "Hiệu lực từ 01/09/2026"],
            [
                "**Có lịch sử tăng lương**",
                "Sơn",
                "35tr → 39tr",
                "Đổi từ 01/07/2026 — xem biểu đồ bậc thang",
            ],
        ],
        widths=[3.4, 4.4, 3.6, 4.8],
        small=True,
    )

    h("12.3 Chi phí — đủ 4 trạng thái duyệt", 2)
    table(
        ["Trạng thái", "Phiếu ví dụ", "Đặc điểm"],
        [
            [
                "Chờ duyệt",
                "Bản quyền nền tảng lõi — đợt 2",
                "360tr, phụ giá 95% — số Tính khách hiện MỜ",
            ],
            ["Đã duyệt", "Thuê thầu phụ tích hợp NFC", "85tr, phụ giá 25%, thuế 10%"],
            ["Cần sửa lại", "Thiết bị đo thử nghiệm", "12tr — không có nút duyệt"],
            ["Đã huỷ", "Vé máy bay khảo sát Đà Nẵng", "Chuyến bị huỷ, không phát sinh thật"],
        ],
        widths=[3.4, 5.4, 7.4],
    )

    h("12.4 Chi phí — các biến thể khác", 2)
    table(
        ["Case", "Phiếu ví dụ", "Đặc điểm"],
        [
            ["Đã trả tiền", "Bản quyền nền tảng lõi — đợt 1", "Đã trả 12/03/2026"],
            [
                "Hoàn ứng cho nhân viên",
                "Taxi và ăn trưa công tác Cần Thơ",
                "Nhân viên ứng trước — nhãn đổi thành “Đã hoàn”",
            ],
            [
                "Phụ giá dạng SỐ TIỀN",
                "Hạ tầng máy chủ do khách tự mua",
                "Chi ra 0 đ, tính khách 40tr — khách tự mua, mình tính công",
            ],
            ["Nhiều dòng chi", "Công tác lắp đặt Cần Thơ", "3 dòng: vé, khách sạn, taxi"],
            ["Có tệp đính kèm", "5 phiếu", "Cột Tệp hiện icon ghim"],
            ["Có hạn thanh toán", "8/8 phiếu", "Cột Ngày hiện dòng “hạn …” bên dưới"],
            ["Tổng cộng", "**8 phiếu**", "Chi ra 819.040.000 → Tính khách 862.290.000 → Lãi 43.250.000"],
        ],
        widths=[4.0, 5.4, 6.8],
        small=True,
    )

    h("12.5 Giờ và hợp đồng", 2)
    table(
        ["Case", "Số lượng", "Ý nghĩa khi kiểm thử"],
        [
            ["Tổng dòng giờ", "585 dòng · 3.453,5 giờ", "Đủ dữ liệu vẽ biểu đồ nhiều tháng"],
            ["Đã duyệt", "583 dòng", "Dòng khoá, không sửa được"],
            ["Chờ duyệt", "2 dòng", "Test luồng duyệt"],
            [
                "**Giờ tính tiền < giờ đã làm**",
                "4 dòng",
                "Test dòng “Giờ không ra tiền” trong ô Chi phí",
            ],
            ["Không tính tiền", "19 dòng", "Hạng mục non-billable"],
            ["Có giờ bắt đầu", "585 dòng", "Chế độ Lịch hiện đủ khối"],
            ["Có ghi chú", "21 dòng", "Hiện dưới tên hạng mục"],
            ["Hợp đồng đang chạy", "6 hợp đồng", "Trạng thái Open"],
            ["Hợp đồng đã bàn giao", "1 hợp đồng", "Bảo trì phần mềm STM 2025"],
            ["Hợp đồng rỗng", "1 hợp đồng", "STM mini giai đoạn 2 — 0 hạng mục, test màn trống"],
            ["Công việc có ước tính", "43/43", "Đủ để vẽ đường dự báo"],
        ],
        widths=[5.4, 3.8, 7.0],
        small=True,
    )

    h("12.6 Loại dịch vụ và bảng giá", 2)
    table(
        ["Case", "Ví dụ", "Ý nghĩa"],
        [
            ["Loại đang dùng", "7 loại", "Thiết kế, Phát triển, Kiểm thử…"],
            ["Loại đã lưu trữ", "Hỗ trợ vận hành (ngưng dùng)", "Test nút “Xem mục lưu trữ”"],
            ["Loại có gán nhân sự", "Phát triển (2), Kiểm thử (1), QLDA (1)", "Cột phải hiện “N người”"],
            ["Loại không gán ai", "4 loại", "Cột phải hiện “mọi người”"],
            ["Bảng giá chuẩn công ty", "Giá chuẩn công ty", "Áp dụng khi khách chưa có bảng riêng"],
            ["Bảng giá riêng khách", "Sacombank, OCB, VIB", "3 bảng"],
            ["Bảng giá đã lưu trữ", "Bảng giá 2025 (hết hiệu lực)", "Test filter trạng thái"],
        ],
        widths=[4.4, 5.6, 6.2],
        small=True,
    )
    note(
        "Kết luận đối chiếu: dữ liệu mẫu phủ ĐỦ mọi nhánh nghiệp vụ đã cài đặt. "
        "Không còn case nào thiếu.",
        "good",
    )
    pagebreak()

    # ══════════════════ 14. VIỆC CÒN TỒN ══════════════════
    h("13. Việc còn tồn và giới hạn", 1)
    p("Phần này ghi minh bạch những gì CHƯA có, để team không kỳ vọng nhầm.")

    h("13.1 Đã chốt KHÔNG làm", 2)
    table(
        ["Tính năng", "Lý do bỏ"],
        [
            [
                "Hoá đơn (Invoices)",
                "Chưa dựng module hoá đơn. Ô thứ ba ở tổng quan thay bằng Chi phí — số thật",
            ],
            [
                "Hợp đồng định kỳ (Recurring)",
                "Công ty bán theo dự án, không có hợp đồng lặp theo tháng",
            ],
            ["Nhật ký hoạt động (Feed)", "Chưa cần"],
            ["Lưu view, xuất file", "Chưa cần"],
            ["Phân quyền chi tiết", "Chưa cần ở giai đoạn này"],
        ],
        widths=[5.4, 10.8],
    )

    h("13.2 Giới hạn kỹ thuật hiện tại", 2)
    table(
        ["Giới hạn", "Ảnh hưởng", "Khi nào cần xử lý"],
        [
            [
                "**Lịch nghỉ lễ cố định**",
                "Ngày lễ Việt Nam đang gắn cứng trong mã nguồn",
                "Khi thuê người nước ngoài hoặc đổi lịch nghỉ — sẽ sai công suất và giá vốn mỗi giờ",
            ],
            [
                "Phần đã xuất hoá đơn = 0",
                "Toàn bộ doanh thu ghi nhận nằm ở cột chờ xuất",
                "Khi dựng module hoá đơn",
            ],
            [
                "Chưa có tích hợp lịch ngoài",
                "Panel gợi ý thiếu nhóm “Đã xếp lịch” và “Sự kiện lịch”",
                "Khi cần nối Google Calendar / Outlook",
            ],
        ],
        widths=[4.4, 5.4, 6.4],
        small=True,
    )

    h("13.3 Chạy bản demo trên máy cá nhân", 2)
    note(
        "npx vite dev --config vite.config.local.ts --port 5199\n\n"
        "Dùng file cấu hình riêng vì bản gốc nạp plugin của Lovable, plugin đó so "
        "đường dẫn kiểu POSIX với đường dẫn Windows nên báo lỗi ngay khi khởi động. "
        "File vite.config.ts gốc không đụng tới, deploy vẫn bình thường.",
        "info",
    )

    doc.add_paragraph()
    fin = doc.add_paragraph()
    fin.alignment = 1
    r = fin.add_run("— Hết —")
    r.italic = True
    r.font.color.rgb = g.MUTED
