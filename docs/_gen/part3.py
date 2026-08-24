# -*- coding: utf-8 -*-
"""Phần 3: Hợp đồng, Giờ của tôi, Giờ toàn công ty, Chi phí, Biểu đồ."""


def build(g):
    doc, h, p, bullet, table, img, note, pagebreak = (
        g.doc, g.h, g.p, g.bullet, g.table, g.img, g.note, g.pagebreak
    )

    # ══════════════════ 7. HỢP ĐỒNG ══════════════════
    h("7. Màn 4 — Hợp đồng", 1)
    p(
        "Hợp đồng là nơi ra lãi lỗ. Mỗi hợp đồng tính lãi riêng. Một dự án dài có "
        "thể chia thành nhiều hợp đồng theo giai đoạn để theo dõi từng chặng."
    )
    img("06-hop-dong-danh-sach.png", "Hình 6 — Danh sách hợp đồng")
    p(
        "Mỗi dòng hiện: tên hợp đồng, khách hàng, số hạng mục và tổng giá trị. "
        "Hợp đồng “Hệ thống STM Admin — tặng kèm” có 20 hạng mục nhưng tổng bằng 0 "
        "— đúng, vì đây là gói tặng kèm, mọi hạng mục đều để Không tính tiền."
    )

    h("7.1 Vỏ màn hợp đồng", 2)
    img("07-hd-tong-quan.png", "Hình 7 — Tab Tổng quan của hợp đồng")
    table(
        ["#", "Thành phần", "Giải thích"],
        [
            [
                "1",
                "Bốn tab bên trong hợp đồng",
                "Tổng quan (Overview) · Hạng mục (Services) · Giờ (Time) · Chi phí (Expenses). Mọi thứ thuộc về hợp đồng đều nằm trong đây",
            ],
            [
                "2",
                "Biểu đồ diễn biến",
                "Xem chi tiết ở mục 11",
            ],
        ],
        widths=[1.0, 4.4, 10.8],
    )
    p("Ngoài ra trên đầu màn còn có:")
    bullet("Cặp trạng thái Đang chạy — Đã bàn giao: bấm để chuyển")
    bullet("Khoảng ngày hiệu lực của hợp đồng")
    bullet("Panel phải: dự án liên quan, cơ hội gốc, xem trong lịch xếp việc")
    note(
        "Panel phải chỉ mở sẵn ở tab Tổng quan. Ba tab còn lại là bảng nhiều cột, "
        "panel chiếm chỗ khiến cột cuối bị che — nên hệ thống tự thu gọn. Mở lại "
        "bằng nút ở góc phải trên.",
        "info",
    )

    h("7.2 Tab Hạng mục — nơi khai những gì đang bán", 2)
    img("08-hd-hang-muc.png", "Hình 8 — Tab Hạng mục")
    table(
        ["#", "Cột", "Giải thích"],
        [
            [
                "1",
                "Toàn bộ header bảng",
                "Nhóm/Hạng mục · Cách tính · Đơn vị · Theo dõi · Ước tính · Số lượng · Đơn giá · Thành tiền",
            ],
        ],
        widths=[1.0, 4.4, 10.8],
    )

    h("7.3 Bốn cách tính tiền", 2)
    table(
        ["Cách tính", "Ai chịu rủi ro khi làm quá", "Dùng khi nào", "Ví dụ thật"],
        [
            [
                "**Theo giờ**\nTime & materials",
                "Khách trả thêm",
                "Phạm vi chưa rõ, làm tới đâu tính tới đó",
                "Đọc chip CCCD — 420 giờ × 750.000 đ",
            ],
            [
                "**Trọn gói**\nFixed",
                "Công ty tự chịu",
                "Phạm vi rõ, chốt giá một lần",
                "Bản quyền phần mềm STM cho 40 máy",
            ],
            [
                "**Phần trăm**\nPercentage",
                "Theo tổng các hạng mục khác",
                "Phí quản lý, phí vận hành",
                "Phí quản lý dự án — 8% → 361.408.000 đ",
            ],
            [
                "**Không tính tiền**\nNon-billable",
                "Công ty chịu toàn bộ",
                "Vẫn tốn chi phí nhưng không thu khách",
                "Đào tạo, bảo hành, gói tặng kèm",
            ],
        ],
        widths=[3.6, 3.2, 4.4, 5.0],
        small=True,
    )
    note(
        "Hạng mục PHẦN TRĂM tính hai vòng: vòng một cộng các hạng mục đứng độc lập, "
        "vòng hai mới nhân tỷ lệ. Gộp một vòng thì phí sẽ tính lên chính nó. "
        "Trong báo cáo, nền là doanh thu ĐÃ GHI NHẬN — làm được bao nhiêu mới thu "
        "phí quản lý bấy nhiêu.",
        "info",
    )

    h("7.4 Cột Theo dõi — hai icon bấm được", 2)
    table(
        ["Icon", "Bật nghĩa là", "Tắt nghĩa là"],
        [
            ["Đồng hồ", "Cho ghi GIỜ vào hạng mục này", "Không ai log giờ vào được"],
            ["Hoá đơn", "Cho ghi CHI PHÍ vào hạng mục này", "Không nộp phiếu chi vào được"],
        ],
        widths=[3.0, 6.6, 6.6],
    )
    note(
        "Dòng thuần thương mại như bán license thì TẮT CẢ HAI — không ai làm giờ, "
        "không có chi phí đi kèm. Trong dữ liệu mẫu, dòng “Bản quyền STM mini cho "
        "25 máy” đang ở trạng thái này.",
        "info",
    )

    h("7.5 Ước tính và Số lượng khác nhau thế nào", 2)
    table(
        ["", "Số lượng (Qty)", "Ước tính (Estimate)"],
        [
            ["Là gì", "Số ĐÃ BÁN cho khách", "Số DỰ KIẾN làm nội bộ"],
            ["Dùng để", "Tính tiền, làm trần ngân sách", "So sánh kế hoạch với thực tế"],
            [
                "Khi nào lệch nhau",
                "Bán 100 giờ nhưng nội bộ ước 120 giờ vì biết khó",
                "→ Biết trước là sẽ lỗ 20 giờ",
            ],
        ],
        widths=[3.4, 6.4, 6.4],
    )

    h("7.6 Hai đường thêm hạng mục", 2)
    table(
        ["Nút", "Khi nào dùng"],
        [
            [
                "**Hạng mục mới**",
                "Khoản thoả thuận riêng, không có trong biểu giá chuẩn. Nhập tay tên, loại, đơn giá",
            ],
            [
                "**Rút từ bảng giá**",
                "Dùng đơn giá đã đàm phán sẵn. Chọn dòng giá, chỉ cần nhập số lượng",
            ],
        ],
        widths=[4.2, 12.0],
    )
    pagebreak()

    # ══════════════════ 8. GIỜ CỦA TÔI ══════════════════
    h("8. Màn 5 — Giờ của tôi", 1)
    p("Nhân viên tự ghi giờ. Có ba chế độ xem cho ba thói quen khác nhau.")

    h("8.1 Chế độ Ngày", 2)
    img("12-gio-ngay.png", "Hình 9 — Chế độ Ngày")
    p("Phù hợp khi ghi giờ cuối mỗi ngày. Panel trái gợi ý hạng mục hay dùng:")
    bullet("Đã ghim — hạng mục tự ghim để luôn thấy ở đầu")
    bullet("Vừa dùng gần đây — hệ thống tự nhớ")
    p(
        "Dải trên cùng hiện tổng giờ từng ngày trong tuần và tổng tuần. "
        "Bấm “Ghi nhận giờ” hoặc bấm thẳng vào hạng mục ở panel trái để thêm dòng."
    )

    h("8.2 Ba cách nhập thời lượng", 2)
    table(
        ["Gõ", "Hiểu thành", "Ghi chú"],
        [
            ["8h  ·  8  ·  8:00", "8 giờ 00", "Nhập thẳng thời lượng"],
            ["1h30  ·  1.5  ·  90m", "1 giờ 30", "Nhiều cách viết đều được"],
            ["9-5  ·  9 to 5  ·  9 am-5 pm", "8 giờ 00", "Nhập khoảng giờ, tự tính hiệu"],
            ["9-", "Đang chạy", "Bỏ trống vế sau = bấm giờ từ lúc đó"],
        ],
        widths=[5.2, 3.6, 7.4],
    )

    h("8.3 Menu ba chấm trên mỗi dòng giờ", 2)
    table(
        ["Thao tác", "Giải thích"],
        [
            [
                "**Sửa**",
                "Đổi hạng mục, ngày, thời lượng, ghi chú. Đổi hạng mục thì chi phí tính lại theo giá vốn của hợp đồng mới",
            ],
            ["**Nhân bản**", "Chép dòng giống hệt, tiện khi làm cùng việc nhiều ngày"],
            ["**Ghim hạng mục**", "Đưa hạng mục lên đầu panel gợi ý"],
            ["**Xoá**", "Xoá hẳn dòng giờ"],
        ],
        widths=[3.4, 12.8],
    )
    note(
        "Dòng ĐÃ DUYỆT bị khoá, không sửa và không xoá được. Muốn sửa thì quản lý "
        "phải bỏ duyệt trước.",
        "warn",
    )

    h("8.4 Chế độ Bảng chấm công", 2)
    img("13-gio-bang-cham-cong.png", "Hình 10 — Chế độ Bảng chấm công")
    p(
        "Phù hợp khi ghi bù cả tuần. Hàng là hạng mục, cột là ngày. Cột Tổng đứng "
        "ngay sau tên hạng mục để đọc nhanh, hàng “Tổng theo ngày” ở trên cùng. "
        "Bấm ô trống để thêm giờ. Nút “Thêm hạng mục” ở góc dưới trái dùng khi tuần "
        "chưa có dòng nào."
    )

    h("8.5 Chế độ Lịch", 2)
    img("14-gio-lich.png", "Hình 11 — Chế độ Lịch")
    p(
        "Lưới giờ theo ngày. Mỗi dòng giờ là một khối đặt đúng vị trí bắt đầu, "
        "cao theo thời lượng."
    )
    bullet("Kéo thân khối để đổi giờ hoặc đổi sang ngày khác")
    bullet("Kéo cạnh dưới để đổi thời lượng, bám mốc 15 phút")
    bullet("Vạch đỏ ngang đánh dấu thời điểm hiện tại")
    bullet("Cuối tuần tô nền xám, dòng đã duyệt khoá lại không kéo được")
    pagebreak()

    # ══════════════════ 9. GIỜ TOÀN CÔNG TY ══════════════════
    h("9. Màn 6 — Giờ toàn công ty", 1)
    p("Dành cho quản lý: theo dõi cả team, ghi hộ người quên, duyệt hàng loạt.")

    h("9.1 Chế độ Bảng chấm công — ai thiếu giờ", 2)
    img("15-gio-cty-cham-cong.png", "Hình 12 — Lưới tuần toàn công ty")
    table(
        ["Màu ô", "Nghĩa là"],
        [
            ["**Số đỏ**", "Ngày thiếu giờ so với giờ công kỳ vọng (8 giờ/ngày làm việc)"],
            ["**Nền vàng**", "Có giờ nhưng còn dòng chờ duyệt"],
            ["**Nền xanh**", "Đã duyệt hết"],
            ["Ô trống", "Chưa ghi giờ — bấm vào để ghi hộ"],
        ],
        widths=[3.4, 12.8],
    )
    p(
        "Bấm tên người để xem chi tiết cả tuần, bấm một ô để xem chi tiết một ngày. "
        "Nút “Duyệt cả tuần” duyệt hàng loạt mọi dòng đang chờ."
    )

    h("9.2 Chế độ Bảng — lọc và gộp nhóm", 2)
    img("16-gio-cty-bang.png", "Hình 13 — Chế độ Bảng")
    table(
        ["#", "Thành phần", "Giải thích"],
        [
            [
                "1",
                "Thanh công cụ",
                "Cột (chọn cột hiện) · Bộ lọc (chỉ dòng chờ duyệt, lọc theo người) · Nhóm (theo nhân sự / hợp đồng / hạng mục) · Tìm kiếm",
            ],
        ],
        widths=[1.0, 3.4, 11.8],
    )
    p(
        "Mỗi nhóm có dòng tiêu đề hiện số dòng, tổng giờ và nút “Duyệt N dòng”. "
        "Cuối bảng có hàng TỔNG. Cột “Cách ghi” phân biệt bấm giờ với nhập tay."
    )
    note(
        "Hai chế độ trả lời hai câu hỏi khác nhau. Bảng chấm công: “tuần này ai "
        "thiếu giờ”. Bảng: “những dòng giờ nào thoả điều kiện này”. Câu hỏi thứ hai "
        "cần lọc và gộp nhóm nên mới có thanh công cụ.",
        "info",
    )
    pagebreak()

    # ══════════════════ 10. CHI PHÍ ══════════════════
    h("10. Màn 7 — Chi phí", 1)
    p(
        "Tiền chi ra ngoài lương: thầu phụ, bản quyền, thiết bị, đi lại. Ghi vào "
        "hạng mục đã bật icon ghi chi phí."
    )
    img("10-chi-phi-toan-cty.png", "Hình 14 — Màn Chi phí toàn công ty")
    table(
        ["#", "Cột", "Giải thích"],
        [
            [
                "1",
                "Header bảng",
                "Hạng mục · Nội dung · Ngày · Thanh toán · Tệp · Chi ra · Tính khách · Duyệt",
            ],
        ],
        widths=[1.0, 3.4, 11.8],
    )

    h("10.1 Hai trục trạng thái độc lập", 2)
    p(
        "Điểm quan trọng nhất của màn này: DUYỆT và THANH TOÁN là hai trục riêng. "
        "Một phiếu có thể đã duyệt mà chưa chi tiền, hoặc đã chi mà chưa duyệt."
    )
    table(
        ["Trục", "Các trạng thái", "Ảnh hưởng tới báo cáo"],
        [
            [
                "**Duyệt**",
                "Chờ duyệt · Đã duyệt · Cần sửa lại · Đã huỷ",
                "Quyết định phiếu có sinh doanh thu hay không",
            ],
            [
                "**Thanh toán**",
                "Chưa trả · Đã trả (kèm ngày)",
                "Không ảnh hưởng lãi lỗ, chỉ theo dõi dòng tiền",
            ],
            [
                "**Hoàn ứng**",
                "Chưa hoàn · Đã hoàn",
                "Khi bật, nhãn cột đổi thành Chưa hoàn / Đã hoàn vì người nhận tiền là nhân viên",
            ],
        ],
        widths=[3.0, 5.6, 7.6],
    )

    h("10.2 Trạng thái duyệt ảnh hưởng số liệu ra sao", 2)
    table(
        ["Trạng thái", "Tính vào CHI PHÍ", "Tính vào DOANH THU", "Vì sao"],
        [
            [
                "Chờ duyệt",
                "✓ Có",
                "✗ Không",
                "Nguyên tắc thận trọng: ghi chi phí sớm nhất, ghi doanh thu muộn nhất",
            ],
            ["Đã duyệt", "✓ Có", "✓ Có", "Đã xác nhận, tính đủ hai chiều"],
            ["Cần sửa lại", "✗ Không", "✗ Không", "Chưa hợp lệ, chờ người nộp sửa"],
            ["Đã huỷ", "✗ Không", "✗ Không", "Không phát sinh thật"],
        ],
        widths=[3.0, 3.2, 3.4, 6.6],
    )
    note(
        "Trong ảnh, dòng “Bản quyền nền tảng lõi — đợt 2” đang chờ duyệt nên số "
        "“Tính khách” hiện MỜ — báo hiệu chưa được tính vào doanh thu.",
        "info",
    )

    h("10.3 Hộp thoại nhập chi phí", 2)
    img("11-dialog-chi-phi.png", "Hình 15 — Hộp thoại Thêm chi phí")
    table(
        ["Nhóm trường", "Gồm những gì", "Lưu ý"],
        [
            [
                "Thông tin chi phí",
                "Người nộp · Ngày chi · Nhà cung cấp · Hoàn ứng · Hạn thanh toán · Tiền tệ · Tệp đính kèm",
                "Hoàn ứng = Có nghĩa nhân viên ứng tiền trước",
            ],
            [
                "Ghi vào đâu",
                "Hạng mục · Nội dung",
                "Chỉ hiện hạng mục đã bật icon ghi chi phí",
            ],
            [
                "Các dòng chi",
                "Nội dung · Đơn giá · Số lượng · Thuế % · Trước thuế",
                "Một phiếu nhiều dòng: chuyến công tác gồm vé, khách sạn, taxi",
            ],
            [
                "Tính cho khách",
                "Kiểu phụ giá (phần trăm hoặc số tiền) · Giá trị",
                "Phụ giá tính trên số TRƯỚC THUẾ",
            ],
        ],
        widths=[3.4, 6.6, 6.2],
        small=True,
    )
    note(
        "Ví dụ thật — phiếu “Thuê thầu phụ tích hợp NFC”:\n"
        "   Trước thuế 85.000.000 đ, thuế 10% = 8.500.000 đ\n"
        "   Trả nhà cung cấp = 93.500.000 đ\n"
        "   Phụ giá 25% trên số TRƯỚC THUẾ = 21.250.000 đ\n"
        "   → Tính cho khách = 85.000.000 + 21.250.000 = 106.250.000 đ",
        "good",
    )
    p(
        "Trường hợp đặc biệt — phiếu “Hạ tầng máy chủ do khách tự mua”: chi ra 0 đ "
        "nhưng tính khách 40.000.000 đ. Khách tự mua máy chủ, công ty vẫn tính công "
        "lắp đặt bằng phụ giá dạng SỐ TIỀN."
    )

    h("10.4 Tab Chi phí trong hợp đồng", 2)
    img("09-hd-chi-phi.png", "Hình 16 — Tab Chi phí lọc theo hợp đồng")
    p(
        "Cùng dữ liệu nhưng chỉ hiện phiếu thuộc hợp đồng đang mở, kèm ba ô tổng "
        "riêng của hợp đồng đó."
    )
    pagebreak()
