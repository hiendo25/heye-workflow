# -*- coding: utf-8 -*-
"""
Chương 13 — Phụ lục: các hộp thoại thêm/sửa.

Tách riêng vì đây là phần team tra khi ĐANG thao tác, không phải đọc tuần tự.
Mỗi hộp thoại một ảnh thật kèm bảng giải thích từng trường: bắt buộc hay
không, nhập gì, và điều gì xảy ra sau khi bấm nút chính.
"""


def build(g):
    h, p, table, img, note, pagebreak = g.h, g.p, g.table, g.img, g.note, g.pagebreak

    pagebreak()
    h("13. Phụ lục — Các hộp thoại thêm và sửa", 1)
    p(
        "Tra cứu khi đang thao tác. Dấu ✱ là trường bắt buộc, thiếu thì nút lưu "
        "không bấm được."
    )

    # ─────────────── 13.1 Loại dịch vụ ───────────────
    h("13.1 Thêm loại dịch vụ", 2)
    img("m01-them-loai-dich-vu.png", "Hình 18 — Hộp thoại thêm loại dịch vụ")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Tên", "✱", "Tên loại lao động: Phát triển, Kiểm thử, Thiết kế"],
            ["Mã viết tắt", "", "Nhãn ngắn hiện cạnh tên trong bảng: DEV, QC, DESIGN"],
            ["Màu nhận diện", "", "Chấm màu đầu dòng, giúp quét bảng nhanh"],
        ],
        widths=[4.0, 2.2, 10.2],
    )
    note(
        "Đặt tên theo LOẠI VIỆC chứ không theo việc cụ thể. “Kiểm thử” đúng, "
        "“Test màn đăng nhập” sai — cái sau là tên hạng mục trong hợp đồng.",
        "warn",
    )

    h("13.2 Gán nhân sự vào loại dịch vụ", 2)
    img("m02-gan-nhan-su.png", "Hình 19 — Hộp thoại gán nhân sự")
    p(
        "Mở từ menu ba chấm của mỗi dòng. Chỉ người được gán mới chấm giờ vào "
        "loại này được."
    )
    table(
        ["Thao tác", "Kết quả"],
        [
            ["Chọn người trong ô “+ Thêm người”", "Người đó vào danh sách ngay, không cần bấm lưu"],
            ["Bấm dấu × cạnh tên", "Bỏ gán người đó"],
            ["Không gán ai", "Mọi người đều chấm giờ được — đây là mặc định"],
        ],
        widths=[6.5, 9.9],
    )
    note(
        "Cột phụ ngoài danh sách hiện “N người” hoặc “mọi người” — nhìn là biết "
        "loại nào đang giới hạn.",
    )

    h("13.3 Xoá loại dịch vụ", 2)
    img("m03-xoa-gop-loai-dich-vu.png", "Hình 20 — Hộp thoại xoá và gộp")
    p(
        "Loại đang được dùng thì không xoá trắng được. Hệ thống bắt chọn loại "
        "thay thế và chuyển toàn bộ dữ liệu sang đó."
    )
    table(
        ["Tình huống", "Hộp thoại hiện gì"],
        [
            [
                "Loại CHƯA dùng ở đâu",
                "Chỉ hỏi xác nhận, xoá thẳng",
            ],
            [
                "Loại ĐANG có dòng giá, giờ hoặc chi phí",
                "Bắt chọn loại thay thế. Mọi dữ liệu chuyển sang loại đó rồi mới xoá",
            ],
        ],
        widths=[6.0, 10.4],
    )
    note("Không hoàn tác được. Cân nhắc dùng Lưu trữ nếu chỉ muốn ẩn đi.", "warn")

    # ─────────────── 13.4 Bảng giá ───────────────
    pagebreak()
    h("13.4 Thêm bảng giá", 2)
    img("m04-them-bang-gia.png", "Hình 21 — Hộp thoại thêm bảng giá")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Tên bảng giá", "✱", "Ví dụ: Bảng giá OCB, Giá chuẩn công ty"],
            [
                "Khách hàng",
                "",
                "Để trống = bảng chuẩn công ty, áp cho mọi khách chưa có bảng riêng. "
                "Chọn khách = bảng riêng, chỉ khách đó dùng",
            ],
        ],
        widths=[4.0, 2.2, 10.2],
    )

    h("13.5 Thêm dòng giá", 2)
    img("m05-them-dong-gia.png", "Hình 22 — Hộp thoại thêm dòng giá")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            [
                "Tên dòng giá",
                "✱",
                "Tên tự đặt để phân biệt: “Thiết kế cấp cao”, “Thiết kế cấp thường”",
            ],
            ["Loại dịch vụ", "✱", "Nhãn phân loại. Nhiều dòng dùng chung một loại được"],
            ["Cách tính tiền", "", "Theo giờ / Trọn gói / Phần trăm / Không tính tiền"],
            ["Đơn vị", "", "giờ, ngày, hoặc gói"],
            ["Đơn giá", "✱", "Giá bán một đơn vị"],
            ["Giá vốn dự kiến", "", "Để ước lãi ngay lúc báo giá, chưa cần log giờ thật"],
            ["Giảm giá / phụ giá (%)", "", "Âm là giảm, dương là cộng thêm"],
            ["Cho ghi giờ / chi phí", "", "Quyết định dòng này có nhận log giờ hay phiếu chi không"],
        ],
        widths=[4.6, 2.2, 9.6],
    )
    note(
        "Tên dòng giá TÁCH khỏi loại dịch vụ chính là để bán được nhiều mức giá "
        "cho cùng một loại lao động.",
    )

    # ─────────────── 13.6 Giá vốn ───────────────
    pagebreak()
    h("13.6 Thêm mức giá vốn", 2)
    img("m06-them-muc-gia-von.png", "Hình 23 — Hộp thoại thêm mức giá vốn")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Kỳ lương", "", "Theo giờ / tuần / hai tuần / tháng / năm"],
            ["Số tiền", "✱", "Lương của trọn một kỳ, chưa chia giờ"],
            ["Tiền tệ", "", "VND, USD, EUR"],
            [
                "Lịch làm việc",
                "✱",
                "Số giờ từng ngày trong tuần. Tổng phải khác 0, hệ thống lấy đây "
                "để quy ra giá vốn mỗi giờ",
            ],
            ["Áp dụng từ", "✱", "Ngày mức lương này bắt đầu có hiệu lực"],
            [
                "Kết thúc",
                "",
                "Để trống nghĩa là còn hiệu lực đến nay. Điền khi biết trước ngày đổi lương",
            ],
            [
                "Cộng chi phí gián tiếp",
                "",
                "Bật cho nhân viên chính thức. Tắt cho cộng tác viên vì họ không "
                "dùng văn phòng, không có bộ phận hỗ trợ",
            ],
            ["Ghi chú", "", "Lý do đổi mức: “Tăng lương giữa năm”, “Lập trình viên cấp cao”"],
        ],
        widths=[4.6, 2.2, 9.6],
    )
    note(
        "Thêm mức mới KHÔNG xoá mức cũ. Hệ thống giữ cả lịch sử, và giờ log ở "
        "quá khứ vẫn tính theo mức đang hiệu lực lúc đó.",
    )

    # ─────────────── 13.7 Hợp đồng ───────────────
    pagebreak()
    h("13.7 Thêm hợp đồng", 2)
    img("m07-them-hop-dong.png", "Hình 24 — Hộp thoại thêm hợp đồng")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Tên hợp đồng", "✱", "Ví dụ: Core Banking — Giai đoạn 1"],
            ["Khách hàng", "✱", "Quyết định bảng giá nào được áp"],
            ["Số hợp đồng", "", "Mã nội bộ: HD-2026-001"],
            ["Từ ngày / Đến ngày", "", "Khoảng thời gian hợp đồng, dùng để cảnh báo cạn ngân sách"],
        ],
        widths=[4.6, 2.2, 9.6],
    )

    h("13.8 Hai đường thêm hạng mục", 2)
    p("Cả hai nút đều nằm dưới từng nhóm trong tab Hạng mục.")

    img("m08-them-hang-muc-trong.png", "Hình 25 — Hạng mục mới, nhập tay từ đầu")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Tên hạng mục", "✱", "Việc cụ thể bán cho khách"],
            ["Loại dịch vụ", "✱", "Để gộp báo cáo theo mảng"],
            ["Cách tính tiền", "", "Bốn kiểu, xem mục 6.3"],
            ["Số lượng / Tỷ lệ", "✱", "Kiểu Phần trăm thì ô này là tỷ lệ %"],
            ["Đơn vị, Đơn giá", "✱", "Ẩn khi chọn kiểu Phần trăm"],
            ["Giờ dự kiến", "", "Để trống thì lấy bằng số lượng"],
            ["Cho ghi giờ / chi phí", "", "Bật tắt được lại sau bằng hai icon trên bảng"],
        ],
        widths=[4.6, 2.2, 9.6],
    )
    note(
        "Dùng khi có khoản thoả thuận riêng không nằm trong biểu giá chuẩn.",
    )

    img("m09-rut-tu-bang-gia.png", "Hình 26 — Rút từ bảng giá")
    p(
        "Chọn một dòng giá có sẵn, hệ thống điền trước đơn giá và cách tính. "
        "Chỉ cần nhập số lượng."
    )
    note(
        "Đây là đường nên dùng khi giá đã đàm phán và ghi trong bảng giá — tránh "
        "gõ lại sai số.",
    )

    # ─────────────── 13.9 Ghi giờ ───────────────
    pagebreak()
    h("13.9 Ghi nhận giờ", 2)
    img("m10-ghi-nhan-gio.png", "Hình 27 — Hộp thoại ghi giờ")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Hạng mục", "✱", "Chỉ hiện hạng mục đang bật “cho ghi giờ”"],
            ["Ngày", "✱", "Mặc định hôm nay"],
            [
                "Thời lượng",
                "✱",
                "Ba cách nhập: 2h30 · 9-5 · 150 — xem mục 7.2",
            ],
            ["Ghi chú", "", "Mô tả ngắn việc đã làm, hiện trong báo cáo"],
        ],
        widths=[4.6, 2.2, 9.6],
    )

    h("13.10 Sửa dòng giờ đã ghi", 2)
    img("m11-sua-dong-gio.png", "Hình 28 — Hộp thoại sửa dòng giờ")
    p(
        "Mở từ menu ba chấm ở màn Giờ của tôi, hoặc nút bút chì ở màn Giờ toàn "
        "công ty và trong chi tiết công việc."
    )
    table(
        ["Sửa được", "Lưu ý"],
        [
            ["Hạng mục", "Đổi hạng mục thì chi phí được TÍNH LẠI theo giá vốn của hợp đồng mới"],
            ["Ngày", "Chuyển dòng giờ sang ngày khác"],
            ["Thời lượng", "Nhập thời lượng hoặc chuyển sang nhập khoảng giờ"],
            ["Ghi chú", "Sửa tự do"],
        ],
        widths=[4.0, 12.4],
    )
    note(
        "Dòng ĐÃ DUYỆT bị khoá, không sửa được. Phải bỏ duyệt trước.",
        "warn",
    )

    # ─────────────── 13.11 Chi phí ───────────────
    pagebreak()
    h("13.11 Thêm chi phí", 2)
    img("m12-them-chi-phi.png", "Hình 29 — Hộp thoại thêm chi phí")
    table(
        ["Trường", "Bắt buộc", "Nhập gì"],
        [
            ["Người nộp", "✱", "Ai bỏ tiền ra hoặc ai đứng tên phiếu"],
            ["Ngày chi", "✱", "Ngày phát sinh khoản chi"],
            ["Nhà cung cấp", "", "Bên nhận tiền: Oracle Việt Nam, FPT Telecom"],
            [
                "Hoàn ứng",
                "",
                "Có = nhân viên ứng trước, công ty trả lại. Chọn Có thì cột thanh "
                "toán đổi nhãn thành Chưa hoàn / Đã hoàn",
            ],
            ["Hạn thanh toán", "", "Ngày phải trả nhà cung cấp"],
            ["Tiền tệ", "", "VND, USD, EUR"],
            ["Tệp đính kèm", "", "Tên file hoá đơn"],
            ["Hạng mục", "✱", "Chỉ hiện hạng mục đang bật “cho ghi chi phí”"],
            ["Nội dung", "✱", "Mô tả khoản chi, hiện ở cột đầu bảng"],
            [
                "Các dòng chi",
                "✱",
                "Một phiếu nhiều dòng: chuyến công tác gồm vé, khách sạn, taxi. "
                "Mỗi dòng có đơn giá, số lượng, thuế %",
            ],
            [
                "Đơn giá đã gồm thuế",
                "",
                "Tích khi đơn giá nhập vào đã bao gồm VAT",
            ],
            [
                "Phụ giá",
                "",
                "Phần cộng thêm khi tính lại cho khách. Cộng phần trăm hoặc cộng "
                "số tiền cố định",
            ],
        ],
        widths=[4.6, 2.2, 9.6],
    )
    note(
        "Phụ giá tính trên TIỀN TRƯỚC THUẾ, không tính trên tiền đã gồm thuế — "
        "xem mục 9.3.",
    )
