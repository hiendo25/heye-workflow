# -*- coding: utf-8 -*-
"""
Chương 13 — Phụ lục: các hộp thoại thêm/sửa.

Viết theo đúng format trang help của Productive (đã đối chiếu trực tiếp): KHÔNG
dùng bảng, mà gạch đầu dòng với tên trường in đậm rồi gạch ngang và mô tả. Kèm
ảnh thật và hộp Ghi chú. Bảng ba cột kín chữ bắt mắt nhảy ngang liên tục, dạng
này đọc một mạch từ trên xuống.
"""


def build(g):
    h, p, img, note, pagebreak, field = g.h, g.p, g.img, g.note, g.pagebreak, g.field

    pagebreak()
    h("13. Phụ lục — Các hộp thoại thêm và sửa", 1)
    p(
        "Tra cứu khi đang thao tác. Mỗi trường ghi rõ nó dùng để làm gì và ảnh "
        "hưởng tới đâu. Dấu ✱ là trường bắt buộc."
    )

    # ═════════════ 13.1 ═════════════
    h("13.1 Thêm loại dịch vụ", 2)
    img("m01-them-loai-dich-vu.png", "Hình 18 — Hộp thoại thêm loại dịch vụ")
    p(
        "Loại dịch vụ là danh mục gốc, khai một lần dùng cho mọi hợp đồng. Nó "
        "trả lời câu hỏi cấp công ty: mảng Kiểm thử năm nay lãi bao nhiêu, cộng "
        "từ tất cả dự án."
    )
    field(
        "Tên",
        "khoá gộp báo cáo. Mọi hạng mục gắn cùng một loại sẽ cộng chung một dòng "
        "doanh thu và chi phí. Đặt theo loại lao động, không theo việc cụ thể — "
        "“Kiểm thử” đúng, “Test màn đăng nhập” sai vì đó là tên hạng mục.",
        required=True,
    )
    field(
        "Mã viết tắt",
        "nhãn ngắn hiện cạnh tên, giúp phân biệt nhanh khi danh sách dài. Ba đến "
        "sáu ký tự in hoa: DEV, QC, DESIGN.",
    )
    field(
        "Màu nhận diện",
        "chấm màu đầu mỗi dòng, quét bảng bằng mắt nhanh hơn đọc chữ. Chọn màu "
        "khác biệt cho các loại hay đứng cạnh nhau.",
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
    field(
        "Thêm người",
        "chọn trong ô “+ Thêm người”, người đó vào danh sách ngay không cần bấm "
        "lưu. Từ lúc này chỉ những người trong danh sách mới chọn được loại này "
        "khi ghi giờ.",
    )
    field(
        "Bỏ gán",
        "bấm dấu × cạnh tên. Giờ đã ghi trước đó vẫn giữ nguyên, không bị xoá.",
    )
    field(
        "Không gán ai",
        "mọi người đều ghi giờ được vào loại này. Đây là mặc định, hợp với đội "
        "nhỏ ai cũng làm nhiều việc.",
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
    field(
        "Loại chưa dùng ở đâu",
        "hộp thoại chỉ hỏi xác nhận rồi xoá thẳng, vì không có dữ liệu nào để mất.",
    )
    field(
        "Loại đang có dữ liệu",
        "hộp thoại bắt chọn một loại thay thế. Toàn bộ dòng giá, giờ và chi phí "
        "chuyển sang loại đó, sau đó loại cũ mới bị xoá. Số liệu quá khứ giữ "
        "nguyên, chỉ đổi nhãn phân loại nên báo cáo cũ không thủng.",
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
    field(
        "Tên bảng giá",
        "phân biệt các bảng khi chọn lúc lập hợp đồng. Gắn tên khách hoặc phạm "
        "vi áp dụng: Bảng giá OCB, Giá chuẩn công ty.",
        required=True,
    )
    field(
        "Khách hàng",
        "quyết định bảng này áp cho ai, là trường quan trọng nhất. Để trống thì "
        "đây là bảng chuẩn công ty, áp cho mọi khách chưa có bảng riêng. Chọn "
        "khách thì thành bảng riêng, chỉ khách đó dùng và được ưu tiên hơn bảng "
        "chuẩn.",
    )
    note("Một khách chỉ nên có một bảng riêng, nhiều bảng thì không rõ bảng nào được áp.")

    # ═════════════ 13.5 ═════════════
    h("13.5 Thêm dòng giá", 2)
    img("m05-them-dong-gia.png", "Hình 22 — Hộp thoại thêm dòng giá")
    p(
        "Mỗi dòng là một mức giá bán. Bảng giá chỉ chứa đơn giá, không chứa số "
        "lượng — số lượng thuộc về từng hợp đồng cụ thể."
    )
    field(
        "Tên dòng giá",
        "phân biệt các mức giá khác nhau trong cùng một loại lao động. Không có "
        "nó thì mỗi loại chỉ bán được một giá. Ví dụ “Thiết kế cấp cao” và "
        "“Thiết kế cấp thường” cùng thuộc loại Thiết kế nhưng khác đơn giá.",
        required=True,
    )
    field(
        "Loại dịch vụ",
        "khoá gộp báo cáo. Nhiều dòng giá dùng chung một loại là bình thường.",
        required=True,
    )
    field(
        "Cách tính tiền",
        "quyết định doanh thu sinh ra thế nào và ai chịu rủi ro khi làm quá. "
        "Theo giờ: làm bao nhiêu tính bấy nhiêu. Trọn gói: giá cố định, vượt thì "
        "công ty chịu. Phần trăm: ăn theo tổng các hạng mục khác. Không tính "
        "tiền: chỉ ghi chi phí.",
    )
    field("Đơn vị", "đơn vị của đơn giá: giờ, ngày, hoặc gói.")
    field(
        "Đơn giá",
        "tiền bán một đơn vị, nhân với số lượng ra doanh thu.",
        required=True,
    )
    field(
        "Giá vốn dự kiến",
        "cho phép ước lãi ngay lúc báo giá, chưa cần ai log giờ thật. Để trống "
        "thì chỉ biết lãi sau khi có giờ thật.",
    )
    field(
        "Giảm giá hoặc phụ giá",
        "điều chỉnh so với giá gốc mà vẫn giữ được giá gốc để đối chiếu. Số âm "
        "là giảm, dương là cộng thêm — ví dụ −10 là giảm 10%.",
    )
    field(
        "Cho ghi giờ và chi phí",
        "quyết định dòng này có nhận log giờ hay phiếu chi không. Dòng bán theo "
        "giờ thì bật ghi giờ, dòng bản quyền hay thiết bị thì bật ghi chi phí.",
    )

    # ═════════════ 13.6 ═════════════
    pagebreak()
    h("13.6 Thêm mức giá vốn", 2)
    img("m06-them-muc-gia-von.png", "Hình 23 — Hộp thoại thêm mức giá vốn")
    p(
        "Giá vốn trả lời: một giờ của người này tốn công ty bao nhiêu. Đây là vế "
        "thứ hai để tính lãi — giá bán gắn vào hạng mục, giá vốn gắn vào con người."
    )
    field(
        "Kỳ lương",
        "cho biết số tiền nhập vào là lương của bao lâu, để hệ thống quy ra giờ. "
        "Chọn theo giờ, tuần, hai tuần, tháng hoặc năm cho khớp hợp đồng lao động.",
    )
    field(
        "Số tiền",
        "lương trọn một kỳ, chưa chia giờ. Hệ thống tự chia theo lịch làm việc "
        "bên dưới.",
        required=True,
    )
    field("Tiền tệ", "phân biệt khi thuê người nước ngoài: VND, USD, EUR.")
    field(
        "Lịch làm việc",
        "mẫu số của phép chia. Cùng mức lương, ai làm ít giờ hơn thì giá vốn mỗi "
        "giờ cao hơn. Điền số giờ từng ngày trong tuần, tổng phải khác 0. Người "
        "làm bán thời gian thì điền ít giờ hơn.",
        required=True,
    )
    field(
        "Áp dụng từ",
        "mốc bắt đầu hiệu lực. Giờ log trước ngày này vẫn tính theo mức cũ. Điền "
        "ngày mức lương có hiệu lực thật, không phải ngày nhập liệu.",
        required=True,
    )
    field(
        "Kết thúc",
        "cho phép hẹn trước ngày đổi lương mà không cần nhớ vào sửa. Để trống "
        "nghĩa là còn hiệu lực đến nay.",
    )
    field(
        "Cộng chi phí gián tiếp",
        "phân bổ tiền văn phòng, phần mềm và bộ phận hỗ trợ vào giá vốn mỗi giờ. "
        "Bật cho nhân viên chính thức, tắt cho cộng tác viên vì họ không dùng "
        "văn phòng và không có bộ phận hỗ trợ.",
    )
    field(
        "Ghi chú",
        "giải thích lý do đổi mức, hữu ích khi soát lại sau vài tháng: “Tăng "
        "lương giữa năm”, “Lập trình viên cấp cao”.",
    )
    note(
        "Thêm mức mới không xoá mức cũ. Hệ thống giữ cả lịch sử, giờ log ở quá "
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
    field(
        "Tên hợp đồng",
        "nhận diện trong danh sách và trong mọi báo cáo. Kèm giai đoạn nếu dự án "
        "chia chặng: “Core Banking — Giai đoạn 1”.",
        required=True,
    )
    field(
        "Khách hàng",
        "quyết định bảng giá nào được áp khi rút hạng mục. Khách chưa có bảng "
        "riêng thì rơi về giá chuẩn công ty.",
        required=True,
    )
    field("Số hợp đồng", "đối chiếu với hồ sơ giấy và kế toán, ví dụ HD-2026-001.")
    field(
        "Từ ngày và Đến ngày",
        "cơ sở cảnh báo cạn ngân sách. Hệ thống so ngày dự báo cạn với ngày kết "
        "thúc để báo sớm. Để trống thì mất cảnh báo này.",
    )

    # ═════════════ 13.8 ═════════════
    h("13.8 Hai đường thêm hạng mục", 2)
    p("Cả hai nút nằm dưới từng nhóm trong tab Hạng mục, khác nhau ở chỗ giá lấy từ đâu.")

    img("m08-them-hang-muc-trong.png", "Hình 25 — Hạng mục mới, nhập tay từ đầu")
    p("Dùng khi có khoản thoả thuận riêng không nằm trong biểu giá chuẩn.")
    field(
        "Tên hạng mục",
        "tên việc cụ thể bán cho khách này, hiện trên hoá đơn và báo cáo. Mô tả "
        "công việc thật: “Đọc chip CCCD qua NFC”.",
        required=True,
    )
    field(
        "Loại dịch vụ",
        "để gộp báo cáo theo mảng, độc lập với việc nó nằm nhóm nào.",
        required=True,
    )
    field("Cách tính tiền", "quyết định ai chịu rủi ro khi làm quá dự kiến, xem mục 6.3.")
    field(
        "Số lượng hoặc Tỷ lệ",
        "nhân với đơn giá ra thành tiền, đồng thời là trần giờ được ghi nhận. "
        "Kiểu Phần trăm thì ô này là tỷ lệ phần trăm, không phải số lượng.",
        required=True,
    )
    field(
        "Đơn vị và Đơn giá",
        "cặp quyết định thành tiền. Ẩn khi chọn kiểu Phần trăm vì loại đó ăn "
        "theo tổng các hạng mục khác.",
        required=True,
    )
    field(
        "Giờ dự kiến",
        "cơ sở dự báo tiến độ, tách khỏi số lượng đã bán. Để trống thì lấy bằng "
        "số lượng. Điền khác khi ước lượng nội bộ khác con số bán cho khách.",
    )
    field(
        "Cho ghi giờ và chi phí",
        "chặn ghi nhầm vào hạng mục không phù hợp. Bật tắt lại được sau bằng hai "
        "icon trên bảng.",
    )

    img("m09-rut-tu-bang-gia.png", "Hình 26 — Rút từ bảng giá")
    p(
        "Chọn một dòng giá có sẵn, hệ thống điền trước đơn giá, đơn vị và cách "
        "tính tiền. Chỉ cần nhập số lượng."
    )
    note(
        "Đây là đường nên dùng khi giá đã đàm phán và ghi trong bảng giá. Nhập "
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
    field(
        "Hạng mục",
        "nói cho hệ thống biết giờ này thuộc hợp đồng nào, tính vào doanh thu và "
        "chi phí của ai. Chỉ hiện hạng mục đang bật “cho ghi giờ” — không thấy "
        "hạng mục cần tìm thì kiểm tra icon đồng hồ trên bảng hạng mục.",
        required=True,
    )
    field(
        "Ngày",
        "quyết định giờ này rơi vào kỳ báo cáo nào, và tính theo mức giá vốn "
        "đang hiệu lực ngày đó. Mặc định hôm nay, ghi bù ngày cũ thì sửa lại.",
        required=True,
    )
    field(
        "Thời lượng",
        "số phút thật đã làm, nhân với giá vốn ra chi phí. Ba cách nhập: 2h30 · "
        "9-5 · 150, xem mục 7.2.",
        required=True,
    )
    field(
        "Ghi chú",
        "giải thích việc đã làm, hiện trong báo cáo và khi quản lý duyệt. Ngắn "
        "gọn nhưng đủ để người khác hiểu: “Sửa lỗi đọc chip lô 3”.",
    )

    # ═════════════ 13.10 ═════════════
    h("13.10 Sửa dòng giờ đã ghi", 2)
    img("m11-sua-dong-gio.png", "Hình 28 — Hộp thoại sửa dòng giờ")
    p(
        "Mở từ menu ba chấm ở màn Giờ của tôi, hoặc nút bút chì ở màn Giờ toàn "
        "công ty và trong chi tiết công việc. Có nó thì ghi nhầm không phải xoá "
        "đi làm lại, giữ được lịch sử."
    )
    field(
        "Hạng mục",
        "đổi hạng mục thì chi phí được tính lại theo giá vốn của hợp đồng mới, "
        "vì cùng một người có thể có mức giá vốn riêng cho từng hợp đồng.",
    )
    field(
        "Ngày",
        "chuyển dòng giờ sang kỳ báo cáo khác. Kiểm tra lại nếu ngày mới rơi vào "
        "mức giá vốn khác.",
    )
    field(
        "Thời lượng",
        "cập nhật cả giờ tính tiền nếu hạng mục có tính tiền. Có nút chuyển sang "
        "nhập khoảng giờ, khi đó lưu luôn giờ bắt đầu để block đứng đúng chỗ "
        "trên lịch.",
    )
    field("Ghi chú", "sửa tự do, không ảnh hưởng số liệu.")
    note(
        "Dòng đã duyệt bị khoá, không sửa được. Phải bỏ duyệt trước — để số liệu "
        "đã chốt không bị đổi sau lưng người duyệt.",
        "warn",
    )

    # ═════════════ 13.11 ═════════════
    pagebreak()
    h("13.11 Thêm chi phí", 2)
    img("m12-them-chi-phi.png", "Hình 29 — Hộp thoại thêm chi phí")
    p(
        "Chi phí là tiền chi ra ngoài lương: thầu phụ, bản quyền, thiết bị, đi "
        "lại. Không ghi vào đây thì báo cáo lãi bị thổi phồng."
    )
    field(
        "Người nộp",
        "truy ai chịu trách nhiệm khoản chi, và ai được hoàn tiền nếu ứng trước.",
        required=True,
    )
    field(
        "Ngày chi",
        "quyết định chi phí rơi vào kỳ báo cáo nào. Điền ngày phát sinh thật, "
        "không phải ngày nhập liệu.",
        required=True,
    )
    field(
        "Nhà cung cấp",
        "đối chiếu công nợ và tra lại khi cần: Oracle Việt Nam, FPT Telecom.",
    )
    field(
        "Hoàn ứng",
        "phân biệt ai phải trả tiền — công ty trả thẳng nhà cung cấp, hay hoàn "
        "lại cho nhân viên đã ứng. Chọn Có thì cột thanh toán đổi nhãn thành "
        "“Chưa hoàn / Đã hoàn”: cùng một cột, cách gọi khác vì người nhận tiền khác.",
    )
    field("Hạn thanh toán", "theo dõi công nợ sắp đến hạn theo hợp đồng với nhà cung cấp.")
    field("Tiền tệ", "phân biệt khi thuê thầu nước ngoài: VND, USD, EUR.")
    field("Tệp đính kèm", "chứng từ để kế toán đối chiếu, điền tên file hoá đơn.")
    field(
        "Hạng mục",
        "nói cho hệ thống biết chi phí này thuộc hợp đồng nào. Chỉ hiện hạng mục "
        "đang bật “cho ghi chi phí”.",
        required=True,
    )
    field(
        "Nội dung",
        "mô tả hiện ở cột đầu bảng để nhận ra phiếu khi soát. Nói rõ mua gì: "
        "“Bản quyền nền tảng lõi — đợt 1”.",
        required=True,
    )
    field(
        "Các dòng chi",
        "tách một phiếu thành nhiều khoản để khai đúng thuế từng khoản. Chuyến "
        "công tác gồm vé, khách sạn, taxi là ba dòng, mỗi dòng đơn giá và thuế riêng.",
        required=True,
    )
    field(
        "Đơn giá đã gồm thuế",
        "cho phép nhập theo con số ghi trên hoá đơn, khỏi tự trừ ngược. Tích khi "
        "hoá đơn ghi giá đã bao gồm VAT.",
    )
    field(
        "Phụ giá",
        "phần cộng thêm khi tính lại cho khách, đây là lãi từ chi phí. Cộng phần "
        "trăm hoặc cộng số tiền cố định. Tính trên tiền trước thuế, không tính "
        "trên tiền đã gồm thuế.",
    )
    note(
        "Trạng thái duyệt quyết định số liệu: phiếu chờ duyệt đã tính vào chi "
        "phí nhưng chưa sinh doanh thu. Nguyên tắc thận trọng — ghi chi phí sớm "
        "nhất, ghi doanh thu muộn nhất. Xem mục 9.2.",
    )
