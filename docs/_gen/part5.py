# -*- coding: utf-8 -*-
"""
Chương 13 — Phụ lục: các hộp thoại thêm/sửa.

Cách viết theo trang help của Productive: mỗi trường trả lời hai câu — trường
này SINH RA ĐỂ LÀM GÌ, và điền sai thì HỎNG Ở ĐÂU. Chỉ nói "nhập tên vào ô
Tên" thì người đọc vẫn không biết đặt tên thế nào cho đúng.
"""


def build(g):
    h, p, table, img, note, pagebreak = g.h, g.p, g.table, g.img, g.note, g.pagebreak

    # Bảng ba cột dùng chung: Trường · Mục đích · Cách điền
    W = [3.6, 6.4, 6.4]

    pagebreak()
    h("13. Phụ lục — Các hộp thoại thêm và sửa", 1)
    p(
        "Tra cứu khi đang thao tác. Mỗi trường ghi rõ nó sinh ra để làm gì và "
        "điền sai thì ảnh hưởng tới đâu. Dấu ✱ là trường bắt buộc."
    )

    # ═════════════ 13.1 ═════════════
    h("13.1 Thêm loại dịch vụ", 2)
    img("m01-them-loai-dich-vu.png", "Hình 18 — Hộp thoại thêm loại dịch vụ")
    p(
        "Loại dịch vụ là danh mục gốc, khai một lần dùng cho mọi hợp đồng. Nó "
        "tồn tại để trả lời câu hỏi cấp công ty: mảng Kiểm thử năm nay lãi bao "
        "nhiêu, cộng từ tất cả dự án."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Tên ✱",
                "Là khoá gộp báo cáo. Mọi hạng mục gắn cùng một loại sẽ cộng chung "
                "một dòng doanh thu và chi phí",
                "Đặt theo LOẠI LAO ĐỘNG, không theo việc cụ thể. Đúng: Kiểm thử. "
                "Sai: Test màn đăng nhập — cái sau là tên hạng mục",
            ],
            [
                "Mã viết tắt",
                "Nhãn ngắn hiện cạnh tên, giúp phân biệt nhanh khi danh sách dài",
                "Ba đến sáu ký tự in hoa: DEV, QC, DESIGN, DEVOPS",
            ],
            [
                "Màu nhận diện",
                "Chấm màu đầu mỗi dòng. Quét bảng bằng mắt nhanh hơn đọc chữ",
                "Chọn màu khác biệt cho các loại hay đứng cạnh nhau",
            ],
        ],
        widths=W,
    )
    note(
        "Đặt tên sai ở đây kéo theo sai toàn bộ báo cáo về sau. Loại quá chi "
        "tiết thì báo cáo vụn, loại quá gộp thì không biết mảng nào lỗ.",
        "warn",
    )

    # ═════════════ 13.2 ═════════════
    h("13.2 Gán nhân sự vào loại dịch vụ", 2)
    img("m02-gan-nhan-su.png", "Hình 19 — Hộp thoại gán nhân sự")
    p(
        "Mở từ menu ba chấm. Dùng để chặn ghi giờ nhầm loại: bạn Kiểm thử vô ý "
        "chọn Phát triển thì báo cáo mảng sai ngay, mà rất khó phát hiện."
    )
    table(
        ["Thao tác", "Điều gì xảy ra", "Khi nào dùng"],
        [
            [
                "Thêm người",
                "Người đó vào danh sách ngay, không cần bấm lưu. Từ giờ CHỈ những "
                "người trong danh sách mới chọn được loại này khi ghi giờ",
                "Đội có phân vai rõ, muốn chặn nhầm lẫn từ gốc",
            ],
            [
                "Bấm dấu × cạnh tên",
                "Bỏ gán. Giờ đã ghi trước đó vẫn giữ nguyên, không bị xoá",
                "Người chuyển bộ phận",
            ],
            [
                "Không gán ai",
                "Mọi người đều ghi giờ được vào loại này — đây là mặc định",
                "Đội nhỏ, ai cũng làm nhiều việc",
            ],
        ],
        widths=W,
    )
    note(
        "Cột phụ ngoài danh sách hiện “N người” hoặc “mọi người”, nhìn là biết "
        "loại nào đang giới hạn."
    )

    # ═════════════ 13.3 ═════════════
    h("13.3 Xoá loại dịch vụ", 2)
    img("m03-xoa-gop-loai-dich-vu.png", "Hình 20 — Hộp thoại xoá và gộp")
    p(
        "Loại dịch vụ bị nhiều thứ trỏ vào: dòng giá, hạng mục, dòng giờ, phiếu "
        "chi. Xoá trắng là mất hết dữ liệu lịch sử, nên hệ thống bắt chuyển "
        "trước rồi mới xoá."
    )
    table(
        ["Tình huống", "Hệ thống làm gì", "Lý do"],
        [
            [
                "Loại chưa được dùng ở đâu",
                "Chỉ hỏi xác nhận rồi xoá thẳng",
                "Không có dữ liệu nào để mất",
            ],
            [
                "Loại đang có dòng giá, giờ, hoặc chi phí",
                "Bắt chọn một loại thay thế. Toàn bộ dữ liệu chuyển sang loại đó, "
                "sau đó loại cũ mới bị xoá",
                "Giữ nguyên số liệu quá khứ, chỉ đổi nhãn phân loại. Báo cáo cũ "
                "không bị thủng",
            ],
        ],
        widths=[4.4, 6.0, 6.0],
    )
    note(
        "Không hoàn tác được. Nếu chỉ muốn ẩn khỏi danh sách chọn mà vẫn giữ "
        "báo cáo cũ, dùng Lưu trữ thay vì xoá.",
        "warn",
    )

    # ═════════════ 13.4 ═════════════
    pagebreak()
    h("13.4 Thêm bảng giá", 2)
    img("m04-them-bang-gia.png", "Hình 21 — Hộp thoại thêm bảng giá")
    p(
        "Bảng giá lưu mức giá đã đàm phán với một khách. Có nó thì lập hợp đồng "
        "mới chỉ cần chọn, không phải nhớ và gõ lại — đây là chỗ hay sai số "
        "nhất khi làm tay."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Tên bảng giá ✱",
                "Phân biệt các bảng khi chọn lúc lập hợp đồng",
                "Gắn tên khách hoặc phạm vi áp dụng: Bảng giá OCB, Giá chuẩn công ty",
            ],
            [
                "Khách hàng",
                "Quyết định bảng này áp cho ai. Đây là trường quan trọng nhất",
                "Để TRỐNG = bảng chuẩn công ty, áp cho mọi khách chưa có bảng riêng. "
                "CHỌN khách = bảng riêng, chỉ khách đó dùng và được ưu tiên hơn bảng chuẩn",
            ],
        ],
        widths=W,
    )
    note(
        "Một khách chỉ nên có một bảng riêng. Nhiều bảng cho cùng khách thì "
        "không rõ bảng nào được áp."
    )

    # ═════════════ 13.5 ═════════════
    h("13.5 Thêm dòng giá", 2)
    img("m05-them-dong-gia.png", "Hình 22 — Hộp thoại thêm dòng giá")
    p(
        "Mỗi dòng là một mức giá bán. Bảng giá chỉ chứa ĐƠN GIÁ, không chứa số "
        "lượng — số lượng thuộc về từng hợp đồng cụ thể."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Tên dòng giá ✱",
                "Phân biệt các mức giá khác nhau trong cùng một loại lao động. "
                "Không có nó thì mỗi loại chỉ bán được một giá",
                "Thiết kế cấp cao, Thiết kế cấp thường — hai dòng cùng loại "
                "Thiết kế nhưng khác đơn giá",
            ],
            [
                "Loại dịch vụ ✱",
                "Khoá gộp báo cáo. Nhiều dòng giá dùng chung một loại là bình thường",
                "Chọn loại đã khai ở màn Loại dịch vụ",
            ],
            [
                "Cách tính tiền",
                "Quyết định doanh thu sinh ra thế nào và ai chịu rủi ro khi làm quá",
                "Theo giờ: làm bao nhiêu tính bấy nhiêu. Trọn gói: giá cố định. "
                "Phần trăm: ăn theo tổng các hạng mục khác. Không tính tiền: chỉ ghi chi phí",
            ],
            [
                "Đơn vị",
                "Đơn vị của đơn giá, ảnh hưởng cách quy đổi khi log giờ",
                "giờ, ngày, hoặc gói",
            ],
            [
                "Đơn giá ✱",
                "Tiền bán một đơn vị. Nhân với số lượng ra doanh thu",
                "Số tiền đã đàm phán với khách",
            ],
            [
                "Giá vốn dự kiến",
                "Cho phép ước lãi NGAY LÚC BÁO GIÁ, chưa cần ai log giờ thật",
                "Ước chừng chi phí một đơn vị. Để trống thì chỉ biết lãi sau khi có giờ thật",
            ],
            [
                "Giảm giá / phụ giá",
                "Điều chỉnh so với giá gốc mà vẫn giữ được giá gốc để đối chiếu",
                "Số âm là giảm giá, dương là cộng thêm. Ví dụ −10 là giảm 10%",
            ],
            [
                "Cho ghi giờ / chi phí",
                "Quyết định dòng này có nhận log giờ hay phiếu chi không",
                "Dòng bán theo giờ thì bật ghi giờ. Dòng bản quyền, thiết bị thì "
                "bật ghi chi phí",
            ],
        ],
        widths=W,
    )

    # ═════════════ 13.6 ═════════════
    pagebreak()
    h("13.6 Thêm mức giá vốn", 2)
    img("m06-them-muc-gia-von.png", "Hình 23 — Hộp thoại thêm mức giá vốn")
    p(
        "Giá vốn trả lời: một giờ của người này tốn công ty bao nhiêu. Đây là "
        "vế thứ hai để tính lãi — giá bán gắn vào hạng mục, giá vốn gắn vào con "
        "người."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Kỳ lương",
                "Cho biết số tiền nhập vào là lương của bao lâu, để hệ thống quy ra giờ",
                "Theo giờ / tuần / hai tuần / tháng / năm. Chọn đúng kiểu hợp đồng lao động",
            ],
            [
                "Số tiền ✱",
                "Lương trọn một kỳ, chưa chia giờ",
                "Nhập nguyên lương kỳ. Hệ thống tự chia theo lịch làm việc bên dưới",
            ],
            [
                "Tiền tệ",
                "Phân biệt khi thuê người nước ngoài",
                "VND, USD, EUR",
            ],
            [
                "Lịch làm việc ✱",
                "Mẫu số của phép chia. Cùng mức lương, ai làm ít giờ hơn thì giá "
                "vốn mỗi giờ cao hơn",
                "Số giờ từng ngày trong tuần. Tổng phải khác 0. Người làm bán "
                "thời gian thì điền ít giờ hơn",
            ],
            [
                "Áp dụng từ ✱",
                "Mốc bắt đầu hiệu lực. Giờ log trước ngày này vẫn tính theo mức cũ",
                "Ngày mức lương này có hiệu lực thật, không phải ngày nhập liệu",
            ],
            [
                "Kết thúc",
                "Cho phép hẹn trước ngày đổi lương mà không cần nhớ vào sửa",
                "Để trống nghĩa là còn hiệu lực đến nay. Điền khi đã biết trước ngày đổi",
            ],
            [
                "Cộng chi phí gián tiếp",
                "Phân bổ tiền văn phòng, phần mềm, bộ phận hỗ trợ vào giá vốn mỗi giờ",
                "BẬT cho nhân viên chính thức. TẮT cho cộng tác viên vì họ không "
                "dùng văn phòng, không có bộ phận hỗ trợ",
            ],
            [
                "Ghi chú",
                "Giải thích lý do đổi mức, hữu ích khi soát lại sau vài tháng",
                "Tăng lương giữa năm, Lập trình viên cấp cao",
            ],
        ],
        widths=W,
    )
    note(
        "Thêm mức mới KHÔNG xoá mức cũ. Hệ thống giữ cả lịch sử, giờ log ở quá "
        "khứ vẫn tính theo mức đang hiệu lực lúc đó — nên báo cáo cũ không bị "
        "thay đổi khi tăng lương."
    )

    # ═════════════ 13.7 ═════════════
    pagebreak()
    h("13.7 Thêm hợp đồng", 2)
    img("m07-them-hop-dong.png", "Hình 24 — Hộp thoại thêm hợp đồng")
    p(
        "Hợp đồng là nơi ra lãi lỗ. Mỗi hợp đồng tính riêng, nên dự án dài nên "
        "chia thành nhiều hợp đồng theo giai đoạn để biết chặng nào lỗ."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Tên hợp đồng ✱",
                "Nhận diện trong danh sách và trong mọi báo cáo",
                "Kèm giai đoạn nếu dự án chia chặng: Core Banking — Giai đoạn 1",
            ],
            [
                "Khách hàng ✱",
                "Quyết định BẢNG GIÁ nào được áp khi rút hạng mục",
                "Chọn khách đã khai. Khách chưa có bảng riêng thì rơi về giá chuẩn công ty",
            ],
            [
                "Số hợp đồng",
                "Đối chiếu với hồ sơ giấy và kế toán",
                "Mã nội bộ: HD-2026-001",
            ],
            [
                "Từ ngày / Đến ngày",
                "Cơ sở cảnh báo cạn ngân sách. Hệ thống so ngày dự báo cạn với "
                "ngày kết thúc để báo sớm",
                "Khoảng thời gian theo hợp đồng ký. Để trống thì mất cảnh báo này",
            ],
        ],
        widths=W,
    )

    # ═════════════ 13.8 ═════════════
    h("13.8 Hai đường thêm hạng mục", 2)
    p(
        "Cả hai nút nằm dưới từng nhóm trong tab Hạng mục. Khác nhau ở chỗ giá "
        "lấy từ đâu."
    )

    img("m08-them-hang-muc-trong.png", "Hình 25 — Hạng mục mới, nhập tay từ đầu")
    p("Dùng khi có khoản thoả thuận riêng không nằm trong biểu giá chuẩn.")
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Tên hạng mục ✱",
                "Tên việc cụ thể bán cho khách này, hiện trên hoá đơn và báo cáo",
                "Mô tả công việc thật: Đọc chip CCCD qua NFC",
            ],
            [
                "Loại dịch vụ ✱",
                "Để gộp báo cáo theo mảng, độc lập với việc nó nằm nhóm nào",
                "Chọn loại lao động tương ứng",
            ],
            [
                "Cách tính tiền",
                "Quyết định ai chịu rủi ro khi làm quá dự kiến",
                "Xem mục 6.3 để chọn đúng",
            ],
            [
                "Số lượng / Tỷ lệ ✱",
                "Nhân với đơn giá ra thành tiền. Đồng thời là TRẦN giờ được ghi nhận",
                "Kiểu Phần trăm thì ô này là tỷ lệ %, không phải số lượng",
            ],
            [
                "Đơn vị, Đơn giá ✱",
                "Cặp quyết định thành tiền",
                "Ẩn khi chọn kiểu Phần trăm vì loại đó ăn theo tổng",
            ],
            [
                "Giờ dự kiến",
                "Cơ sở dự báo tiến độ, tách khỏi số lượng đã bán",
                "Để trống thì lấy bằng số lượng. Điền khác khi ước lượng nội bộ "
                "khác con số bán cho khách",
            ],
            [
                "Cho ghi giờ / chi phí",
                "Chặn ghi nhầm vào hạng mục không phù hợp",
                "Bật tắt lại được sau bằng hai icon trên bảng",
            ],
        ],
        widths=W,
    )

    img("m09-rut-tu-bang-gia.png", "Hình 26 — Rút từ bảng giá")
    p(
        "Chọn một dòng giá có sẵn, hệ thống điền trước đơn giá, đơn vị và cách "
        "tính tiền. Chỉ cần nhập số lượng."
    )
    note(
        "Đây là đường NÊN DÙNG khi giá đã đàm phán và ghi trong bảng giá. Nhập "
        "tay lại dễ sai số, mà sai đơn giá thì sai luôn báo cáo lãi lỗ."
    )

    # ═════════════ 13.9 ═════════════
    pagebreak()
    h("13.9 Ghi nhận giờ", 2)
    img("m10-ghi-nhan-gio.png", "Hình 27 — Hộp thoại ghi giờ")
    p(
        "Giờ là nguyên liệu của mọi con số. Không ai ghi giờ thì hệ thống không "
        "biết chi phí thật, và báo cáo lãi lỗ chỉ là dự toán."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Hạng mục ✱",
                "Nói cho hệ thống biết giờ này thuộc hợp đồng nào, tính vào doanh "
                "thu và chi phí của ai",
                "Chỉ hiện hạng mục đang bật “cho ghi giờ”. Không thấy hạng mục "
                "cần tìm thì kiểm tra icon đồng hồ trên bảng hạng mục",
            ],
            [
                "Ngày ✱",
                "Quyết định giờ này rơi vào kỳ báo cáo nào, và tính theo mức giá "
                "vốn đang hiệu lực ngày đó",
                "Mặc định hôm nay. Ghi bù ngày cũ thì sửa lại cho đúng",
            ],
            [
                "Thời lượng ✱",
                "Số phút thật đã làm. Nhân với giá vốn ra chi phí",
                "Ba cách nhập: 2h30 · 9-5 · 150. Xem mục 7.2",
            ],
            [
                "Ghi chú",
                "Giải thích việc đã làm, hiện trong báo cáo và khi quản lý duyệt",
                "Ngắn gọn nhưng đủ để người khác hiểu: “Sửa lỗi đọc chip lô 3”",
            ],
        ],
        widths=W,
    )

    # ═════════════ 13.10 ═════════════
    h("13.10 Sửa dòng giờ đã ghi", 2)
    img("m11-sua-dong-gio.png", "Hình 28 — Hộp thoại sửa dòng giờ")
    p(
        "Mở từ menu ba chấm ở màn Giờ của tôi, hoặc nút bút chì ở màn Giờ toàn "
        "công ty và trong chi tiết công việc. Có nó thì ghi nhầm không phải xoá "
        "đi làm lại, giữ được lịch sử."
    )
    table(
        ["Sửa được", "Hệ thống làm gì kèm theo", "Lưu ý"],
        [
            [
                "Hạng mục",
                "TÍNH LẠI chi phí theo giá vốn của hợp đồng mới",
                "Vì cùng một người có thể có mức giá vốn riêng cho từng hợp đồng",
            ],
            [
                "Ngày",
                "Chuyển dòng giờ sang kỳ báo cáo khác",
                "Kiểm tra lại nếu ngày mới rơi vào mức giá vốn khác",
            ],
            [
                "Thời lượng",
                "Cập nhật cả giờ tính tiền nếu hạng mục có tính tiền",
                "Có nút chuyển sang nhập khoảng giờ, khi đó lưu luôn giờ bắt đầu "
                "để block đứng đúng chỗ trên lịch",
            ],
            ["Ghi chú", "Không ảnh hưởng số liệu", "Sửa tự do"],
        ],
        widths=[3.2, 6.6, 6.6],
    )
    note(
        "Dòng ĐÃ DUYỆT bị khoá, không sửa được. Phải bỏ duyệt trước — để số "
        "liệu đã chốt không bị đổi sau lưng người duyệt.",
        "warn",
    )

    # ═════════════ 13.11 ═════════════
    pagebreak()
    h("13.11 Thêm chi phí", 2)
    img("m12-them-chi-phi.png", "Hình 29 — Hộp thoại thêm chi phí")
    p(
        "Chi phí là tiền chi ra NGOÀI lương: thầu phụ, bản quyền, thiết bị, đi "
        "lại. Không ghi vào đây thì báo cáo lãi bị thổi phồng."
    )
    table(
        ["Trường", "Sinh ra để làm gì", "Cách điền"],
        [
            [
                "Người nộp ✱",
                "Truy ai chịu trách nhiệm khoản chi, và ai được hoàn tiền nếu ứng trước",
                "Người bỏ tiền ra hoặc người đứng tên phiếu",
            ],
            [
                "Ngày chi ✱",
                "Quyết định chi phí rơi vào kỳ báo cáo nào",
                "Ngày phát sinh thật, không phải ngày nhập liệu",
            ],
            [
                "Nhà cung cấp",
                "Đối chiếu công nợ và tra lại khi cần",
                "Tên bên nhận tiền: Oracle Việt Nam, FPT Telecom",
            ],
            [
                "Hoàn ứng",
                "Phân biệt ai là người phải trả tiền: công ty trả thẳng nhà cung "
                "cấp, hay hoàn lại cho nhân viên đã ứng",
                "Chọn CÓ thì cột thanh toán đổi nhãn thành Chưa hoàn / Đã hoàn — "
                "cùng một cột, cách gọi khác vì người nhận tiền khác",
            ],
            [
                "Hạn thanh toán",
                "Theo dõi công nợ sắp đến hạn",
                "Ngày phải trả theo hợp đồng với nhà cung cấp",
            ],
            [
                "Tiền tệ",
                "Phân biệt khi thuê thầu nước ngoài",
                "VND, USD, EUR",
            ],
            [
                "Tệp đính kèm",
                "Chứng từ để kế toán đối chiếu",
                "Tên file hoá đơn",
            ],
            [
                "Hạng mục ✱",
                "Nói cho hệ thống biết chi phí này thuộc hợp đồng nào",
                "Chỉ hiện hạng mục đang bật “cho ghi chi phí”",
            ],
            [
                "Nội dung ✱",
                "Mô tả hiện ở cột đầu bảng, để nhận ra phiếu khi soát",
                "Nói rõ mua gì: “Bản quyền nền tảng lõi — đợt 1”",
            ],
            [
                "Các dòng chi ✱",
                "Tách một phiếu thành nhiều khoản để khai đúng thuế từng khoản",
                "Chuyến công tác gồm vé, khách sạn, taxi — ba dòng, mỗi dòng đơn "
                "giá và thuế riêng",
            ],
            [
                "Đơn giá đã gồm thuế",
                "Cho phép nhập theo con số ghi trên hoá đơn, khỏi tự trừ ngược",
                "Tích khi hoá đơn ghi giá đã bao gồm VAT",
            ],
            [
                "Phụ giá",
                "Phần cộng thêm khi tính lại cho khách — đây là lãi từ chi phí",
                "Cộng phần trăm hoặc cộng số tiền cố định. Tính trên TIỀN TRƯỚC "
                "THUẾ, không tính trên tiền đã gồm thuế",
            ],
        ],
        widths=W,
    )
    note(
        "Trạng thái DUYỆT quyết định số liệu: phiếu chờ duyệt đã tính vào chi "
        "phí nhưng CHƯA sinh doanh thu. Nguyên tắc thận trọng — ghi chi phí sớm "
        "nhất, ghi doanh thu muộn nhất. Xem mục 9.2.",
    )
