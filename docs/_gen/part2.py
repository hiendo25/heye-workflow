# -*- coding: utf-8 -*-
"""Phần 2: hai trục tính tiền + màn Loại dịch vụ, Bảng giá, Giá vốn."""


def build(g):
    doc, h, p, bullet, table, img, note, pagebreak = (
        g.doc, g.h, g.p, g.bullet, g.table, g.img, g.note, g.pagebreak
    )

    # ══════════════════ 3. HAI TRỤC TÍNH TIỀN ══════════════════
    h("2. Hai trục tính tiền: Giá bán và Giá vốn", 1)
    p("Lãi lỗ là hiệu của hai trục này. Chúng gắn vào hai thứ khác nhau.")
    table(
        ["", "GIÁ BÁN — Rate", "GIÁ VỐN — Cost rate"],
        [
            ["Gắn vào", "**Hạng mục** trong hợp đồng", "**Con người**"],
            ["Nguồn", "Bảng giá đã đàm phán với khách", "Lương thật của nhân viên"],
            ["Ai xem được", "Sale, PM, Kế toán", "Chỉ quản trị viên"],
            [
                "Ví dụ thật",
                "Đọc chip CCCD: 750.000 đ/giờ",
                "Sơn: 365.018 đ/giờ",
            ],
            [
                "Khi Sơn làm 1 giờ việc đó",
                "Doanh thu **+750.000 đ**",
                "Chi phí **−365.018 đ**",
            ],
            ["", "**→ Lãi 384.982 đ cho giờ đó**", ""],
        ],
        widths=[4.2, 6.1, 6.1],
    )

    h("2.1 Giá vốn được tính thế nào", 2)
    p("Công thức: lương một kỳ chia cho số giờ làm việc của trọn kỳ đó.")
    note(
        "Sơn — lương 39.000.000 đ/tháng, làm 8 giờ × 5 ngày mỗi tuần\n"
        "Tháng 8/2026 có 21 ngày làm việc (đã trừ cuối tuần và ngày lễ) → 168 giờ\n"
        "   Lương quy giờ      = 39.000.000 ÷ 168 = 232.143 đ/giờ\n"
        "   Chi phí gián tiếp  = 180.000.000 ÷ 1.176 = 153.061 đ/giờ\n"
        "   GIÁ VỐN MỖI GIỜ    = 232.143 + 153.061 = 385.204 đ/giờ",
        "info",
    )
    p(
        "Điểm cần nhớ: mẫu số là số giờ của TRỌN KỲ, không phải số giờ người đó "
        "thật sự làm. Tháng nghỉ lễ nhiều thì mẫu số nhỏ đi, giá vốn mỗi giờ tăng "
        "lên — đúng bản chất, vì vẫn phải trả đủ lương tháng đó."
    )

    h("2.2 Chi phí gián tiếp (Overhead)", 2)
    p(
        "Tiền thuê văn phòng, điện nước, phần mềm dùng chung — không gắn được vào "
        "dự án nào cụ thể nhưng vẫn phải trả. Hệ thống chia đều cho tổng số giờ làm "
        "việc của cả công ty rồi cộng vào giá vốn mỗi giờ."
    )
    table(
        ["Thiết lập hiện tại", "Giá trị", "Ý nghĩa"],
        [
            ["Chi phí mặt bằng", "180.000.000 đ", "Thuê văn phòng, điện nước mỗi kỳ"],
            ["Tổng giờ toàn công ty", "1.176 giờ", "Mẫu số để chia đều"],
            ["→ Phân bổ", "**153.061 đ/giờ**", "Cộng thêm vào giá vốn mỗi người"],
        ],
        widths=[5.5, 4.5, 6.4],
    )
    note(
        "Cộng tác viên KHÔNG cộng chi phí gián tiếp. Trong dữ liệu mẫu, bạn An là "
        "cộng tác viên ăn theo giờ (220.000 đ/giờ) nên giá vốn giữ nguyên 220.000 đ — "
        "họ không dùng văn phòng của công ty. Tắt bằng ô 'Cộng chi phí gián tiếp' "
        "khi khai mức giá vốn.",
        "warn",
    )
    pagebreak()

    # ══════════════════ 4. LOẠI DỊCH VỤ ══════════════════
    h("3. Màn 1 — Loại dịch vụ", 1)
    p(
        "Khai một lần, dùng cho mọi hợp đồng. Nhờ nó mới gộp được báo cáo "
        "“mảng Kiểm thử lãi bao nhiêu” từ tất cả dự án."
    )
    img("01-loai-dich-vu.png", "Hình 1 — Màn Loại dịch vụ")

    table(
        ["#", "Thành phần", "Công dụng", "Lưu ý khi dùng"],
        [
            [
                "1",
                "Tiêu đề và mô tả",
                "Nhắc nguyên tắc đặt tên",
                "Đặt theo LOẠI VIỆC (Kiểm thử), không theo việc cụ thể (Test màn đăng nhập)",
            ],
            [
                "2",
                "Danh sách loại dịch vụ",
                "Mỗi dòng: chấm màu, tên, mã viết tắt, số người được gán",
                "Cột phải hiện “2 người” nghĩa là chỉ 2 người đó chấm giờ được vào loại này. Hiện “mọi người” là không hạn chế",
            ],
            [
                "3",
                "Nút Thêm loại dịch vụ",
                "Tạo loại mới",
                "Cần: tên, mã viết tắt, màu nhận diện",
            ],
            [
                "4",
                "Xem mục lưu trữ",
                "Hiện cả loại đã ngưng dùng",
                "Loại đã dùng trong hợp đồng cũ thì LƯU TRỮ, đừng xoá — xoá là mất số liệu lịch sử",
            ],
        ],
        widths=[1.0, 3.4, 5.0, 6.8],
        small=True,
    )

    h("3.1 Menu ba chấm — 4 thao tác", 2)
    table(
        ["Thao tác", "Khi nào dùng", "Hệ quả"],
        [
            ["**Sửa**", "Đổi tên, mã, màu", "Áp dụng ngay cho mọi nơi đang dùng loại này"],
            [
                "**Gán nhân sự**",
                "Hạn chế ai được chấm giờ vào loại này",
                "Không gán ai = mọi người đều ghi được. Gán rồi thì chỉ người trong danh sách",
            ],
            [
                "**Lưu trữ**",
                "Loại ngưng dùng nhưng còn trong hợp đồng cũ",
                "Ẩn khỏi danh sách chọn, số liệu cũ giữ nguyên",
            ],
            [
                "**Xoá**",
                "Loại khai nhầm, chưa dùng ở đâu",
                "Nếu đang được dùng, hệ thống BẮT GỘP sang loại khác trước khi xoá — không cho mất dữ liệu",
            ],
        ],
        widths=[3.2, 5.4, 7.6],
    )
    note(
        "Xoá loại dịch vụ đang được dùng sẽ mở hộp thoại “Xoá và gộp”: chọn loại "
        "thay thế, hệ thống chuyển toàn bộ dòng giá, giờ và chi phí sang loại đó "
        "rồi mới xoá. Số liệu lịch sử giữ nguyên, chỉ đổi nhãn.",
        "good",
    )
    pagebreak()

    # ══════════════════ 5. BẢNG GIÁ ══════════════════
    h("4. Màn 2 — Bảng giá", 1)
    p(
        "Chỉ chứa ĐƠN GIÁ, không chứa số lượng — số lượng thuộc về hợp đồng. "
        "Nhờ vậy một bảng dùng lại được cho nhiều hợp đồng của cùng một khách."
    )
    img("02-bang-gia-danh-sach.png", "Hình 2 — Danh sách bảng giá")

    table(
        ["#", "Thành phần", "Giải thích"],
        [
            [
                "1",
                "Cột của bảng danh sách",
                "Tên bảng giá · Áp dụng cho khách nào · Số dòng giá · Trạng thái · Ngày tạo",
            ],
            [
                "2",
                "Một dòng bảng giá",
                "Bấm vào để mở chi tiết. Menu ba chấm bên phải: Đổi tên · Nhân bản · Lưu trữ · Xoá",
            ],
            ["3", "Nút Thêm bảng giá", "Tạo bảng mới, chọn áp dụng cho khách nào hoặc để trống = chuẩn công ty"],
        ],
        widths=[1.0, 4.4, 10.8],
    )

    h("4.1 Bảng chuẩn công ty và bảng riêng khách", 2)
    table(
        ["Loại bảng", "Khi nào áp dụng", "Ví dụ thật"],
        [
            [
                "**Chuẩn công ty**",
                "Khách CHƯA có bảng riêng thì rơi về đây",
                "Giá chuẩn công ty — 6 dòng",
            ],
            [
                "**Riêng khách**",
                "Khách đã đàm phán giá riêng",
                "Bảng giá Sacombank 2026 (7 dòng), Bảng giá OCB (6 dòng), Bảng giá VIB (7 dòng)",
            ],
            [
                "**Đã lưu trữ**",
                "Bảng hết hiệu lực, giữ để đối chiếu hợp đồng cũ",
                "Bảng giá 2025 (hết hiệu lực)",
            ],
        ],
        widths=[3.4, 5.4, 7.4],
    )

    img("03-bang-gia-chi-tiet.png", "Hình 3 — Chi tiết một bảng giá")
    table(
        ["#", "Thành phần", "Giải thích"],
        [
            ["1", "Nút quay lại", "Về danh sách bảng giá"],
            ["2", "Thêm dòng giá", "Mỗi dòng gồm: tên dòng, loại dịch vụ, đơn vị, đơn giá"],
        ],
        widths=[1.0, 4.4, 10.8],
    )

    h("4.2 Vì sao dòng giá cần TÊN RIÊNG", 2)
    p(
        "Tên dòng giá tách khỏi loại dịch vụ. Nhờ vậy một loại có nhiều mức giá "
        "khác nhau — cách bán phổ biến nhất:"
    )
    note(
        "Thiết kế cấp cao  — loại: Thiết kế — 900.000 đ/giờ\n"
        "Thiết kế cấp thường — loại: Thiết kế — 480.000 đ/giờ\n\n"
        "Hai dòng cùng loại Thiết kế, khác đơn giá. Báo cáo vẫn gộp chung về mảng "
        "Thiết kế, nhưng khi lập hợp đồng thì chọn đúng mức cần bán.",
        "info",
    )
    p(
        "Cột chênh lệch phần trăm bên phải so đơn giá của bảng này với giá chuẩn "
        "công ty CÙNG ĐƠN VỊ. So giá theo ngày với giá theo giờ là vô nghĩa nên hệ "
        "thống không so."
    )
    pagebreak()

    # ══════════════════ 6. GIÁ VỐN NHÂN SỰ ══════════════════
    h("5. Màn 3 — Giá vốn nhân sự", 1)
    note(
        "Màn này chỉ quản trị viên xem được. Đây là dữ liệu lương, cần giữ kín.",
        "warn",
    )
    img("04-gia-von-danh-sach.png", "Hình 4 — Danh sách giá vốn nhân sự")

    table(
        ["#", "Thành phần", "Giải thích"],
        [
            [
                "1",
                "Cột bảng",
                "Nhân sự · Kỳ lương · Lương kỳ · Giờ mỗi tuần · Giá vốn mỗi giờ",
            ],
            [
                "2",
                "Ô chi phí gián tiếp",
                "Hiển thị mức phân bổ hiện tại (153.061 đ/giờ), bấm vào để cấu hình",
            ],
        ],
        widths=[1.0, 4.4, 10.8],
    )
    p(
        "Cột Giá vốn mỗi giờ hiện phép cộng ngay dưới số tổng: "
        "“211.957 + 153.061” nghĩa là lương quy giờ cộng chi phí gián tiếp. "
        "Ai không cộng gián tiếp thì chỉ có một số."
    )

    h("5.1 Năm kỳ lương được hỗ trợ", 2)
    table(
        ["Kỳ lương", "Nhập gì", "Ví dụ trong dữ liệu mẫu"],
        [
            ["Theo giờ", "Đơn giá mỗi giờ", "An — 220.000 đ/giờ (cộng tác viên)"],
            ["Theo tuần", "Lương một tuần", "Vy — 6.000.000 đ/tuần"],
            ["Hai tuần một lần", "Lương hai tuần", "An — 11.000.000 đ/kỳ"],
            ["Theo tháng", "Lương một tháng", "Sơn — 39.000.000 đ/tháng"],
            ["Theo năm", "Lương một năm", "Cường — 320.000.000 đ/năm"],
        ],
        widths=[3.4, 4.4, 8.4],
    )

    img("05-gia-von-chi-tiet.png", "Hình 5 — Chi tiết giá vốn một người")
    table(
        ["#", "Thành phần", "Giải thích"],
        [
            [
                "1",
                "Biểu đồ giá vốn theo thời gian",
                "Vẽ dạng BẬC THANG vì giá vốn đổi đột ngột tại ngày hiệu lực, không tăng dần. Trục dọc không bắt đầu từ 0 để thấy rõ chênh lệch",
            ],
            [
                "2",
                "Lịch sử mức giá",
                "Mỗi lần tăng lương là một dòng mới. Dòng cũ giữ nguyên, đảm bảo chi phí đã tính của giờ cũ không bị đổi",
            ],
        ],
        widths=[1.0, 4.4, 10.8],
        small=True,
    )

    h("5.2 Sáu ô tóm tắt", 2)
    table(
        ["Ô", "Ý nghĩa"],
        [
            ["Kỳ lương", "Đang tính theo giờ, tuần, hai tuần, tháng hay năm"],
            ["Áp dụng từ", "Ngày mức này có hiệu lực"],
            ["Chi phí mỗi kỳ", "Số tiền lương của kỳ đó"],
            ["Đang áp mức này", "Đã bao nhiêu ngày kể từ ngày hiệu lực"],
            [
                "Công suất tháng này",
                "Số giờ làm việc của THÁNG hiện tại, đã trừ cuối tuần và ngày lễ",
            ],
            [
                "Số giờ trọn kỳ",
                "Số giờ của KỲ LƯƠNG. Người ăn lương tháng thì hai số trùng nhau, ăn lương năm hoặc hai tuần thì lệch",
            ],
        ],
        widths=[4.4, 11.8],
    )
    note(
        "Tăng lương thì THÊM MỘT DÒNG MỚI với ngày hiệu lực, đừng sửa dòng cũ. "
        "Sửa dòng cũ sẽ tính lại chi phí của những giờ đã ghi trước đó — số liệu "
        "quá khứ thay đổi, báo cáo tháng trước không còn khớp.",
        "warn",
    )
    pagebreak()
