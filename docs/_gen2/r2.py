# -*- coding: utf-8 -*-
"""Phần 2: tiến độ công việc, KPI, phân tầng, màu sắc, bẫy đội nhỏ, đối chiếu HeyE."""


def build(g):
    h, p, table, img, note, pagebreak, field = (
        g.h, g.p, g.table, g.img, g.note, g.pagebreak, g.field
    )

    # ═══════════ 2. TIẾN ĐỘ ═══════════
    pagebreak()
    h("2. Tiến độ công việc", 1)

    h("2.1 Tạo mới vs Hoàn thành — dễ hiểu nhất", 2)
    img("jira-created-vs-resolved.png", "Hình 9 — Created vs Resolved của Jira")
    p(
        "Hai đường theo thời gian, tô vùng giữa chúng. Đây là biểu đồ dễ hiểu nhất "
        "trong toàn khảo sát — người không biết agile vẫn đọc được."
    )
    field("Vùng đỏ", "tạo nhiều hơn hoàn thành. Đội đang đuối, tồn đọng phình ra.")
    field("Vùng xanh", "hoàn thành nhiều hơn tạo. Đội đang bắt kịp.")
    field(
        "Bảng dữ liệu ngay dưới",
        "ba cột Kỳ · Tạo mới · Hoàn thành. Jira luôn đặt bảng dưới biểu đồ để "
        "người xem kiểm chứng được con số.",
    )
    note(
        "Chỉ cần ngày tạo và ngày hoàn thành của công việc — HeyE chắc chắn đã có. "
        "Đây là biểu đồ rẻ nhất mà giá trị cao nhất cho người xem không chuyên.",
    )

    h("2.2 Velocity — xu hướng nhiều kỳ", 2)
    img("jira-velocity.png", "Hình 10 — Velocity của Jira")
    p("Cột đôi cạnh nhau, mỗi cặp một kỳ, cộng một đường trung bình ngang.")
    field("Cột xám", "khối lượng cam kết lúc bắt đầu kỳ.")
    field("Cột xanh lá", "khối lượng thực tế hoàn thành.")
    field(
        "Đường ngang",
        "trung bình cộng các cột hoàn thành. Tài liệu ví dụ: (17.5+13.5+38.5+18+33+28)/6 = 24.75.",
    )
    p("Khoảng cách giữa cột xám và cột xanh chính là độ chính xác khi ước lượng.")

    img("cu-velocity-img2.png", "Hình 11 — Velocity của ClickUp, có trung bình động")
    p("ClickUp làm tương tự nhưng thêm hai đường trung bình động. Tooltip đọc được:")
    table(
        ["Chỉ số", "Giá trị"],
        [
            ["Forecast", "52 điểm"],
            ["Completed", "**10 điểm**"],
            ["Trung bình động forecast", "16.8 điểm"],
            ["Trung bình động velocity", "**4.3 điểm**"],
        ],
        widths=[7.0, 9.0],
    )
    note(
        "Ví dụ này cho thấy đội cam kết 52 điểm nhưng chỉ xong 10. Trung bình động "
        "phơi bày việc cam kết quá tay một cách mãn tính — điều mà biểu đồ một kỳ "
        "không nói được. Đây chính là giá trị của biểu đồ nhiều kỳ.",
    )
    note(
        "ClickUp mặc định hiện 7 kỳ, cho chỉnh 3–10. Tối thiểu 3 kỳ mới có nghĩa. "
        "Với đội Việt không chạy sprint, đổi trục X thành THÁNG.",
    )

    h("2.3 Burndown — và vì sao HeyE nên cân nhắc", 2)
    img("jira-burndown.png", "Hình 12 — Burndown của Jira")
    field("Đường xám thẳng", "nhịp lý tưởng, đi từ tổng khối lượng về 0.")
    field("Đường đỏ bậc thang", "khối lượng còn lại thực tế.")
    field(
        "Đường đỏ ĐI LÊN",
        "có việc thêm vào giữa kỳ. Nhìn phát biết ngay khách hoặc sếp nhồi thêm việc.",
    )
    field("Nền xám dọc", "ngày nghỉ, không tính vào nhịp.")
    note(
        "Burndown chỉ có nghĩa nếu chạy sprint nghiêm túc và ước lượng đầy đủ. Đội "
        "Việt dùng app quản lý việc thường không làm vậy, và với khoảng 10 công "
        "việc mỗi kỳ thì đường sẽ giật bậc thang lớn, ít giá trị.",
        "warn",
    )

    img("cu-burnup-img2.png", "Hình 13 — Burnup của ClickUp")
    p(
        "Burnup vẽ ngược lên. Điểm hơn burndown: tách được trạng thái “đang làm” "
        "khỏi “đã xong” — burndown chỉ có “còn lại”."
    )

    h("2.4 Cumulative Flow — tắc ở khâu nào", 2)
    img("jira-cumulative-flow.png", "Hình 14 — Cumulative Flow của Jira")
    p(
        "Vùng chồng, mỗi màu một trạng thái. Cách đọc: dải màu nào PHÌNH RỘNG theo "
        "chiều dọc là khâu đó tắc."
    )
    img("cu-cumflow-img1.png", "Hình 15 — Cumulative Flow của ClickUp")
    p(
        "Ví dụ này rõ hơn: dải xám (chưa làm) phình từ 25 lên 67 công việc trong "
        "khi dải xanh lá (xong) gần như đứng yên ở mức 5–8. Tồn đọng tăng liên tục."
    )
    note(
        "Cần lịch sử đổi trạng thái của từng công việc — HeyE có thể chưa lưu. Và "
        "cần hàng trăm công việc qua nhiều tháng mới thành hình mượt. Với đội nhỏ "
        "sẽ ra bậc thang răng cưa.",
        "warn",
    )

    h("2.5 Control Chart — Linear làm khác hẳn", 2)
    img("jira-control-chart.png", "Hình 16 — Control Chart của Jira")
    field("Mỗi chấm", "một công việc, trục dọc là số ngày trôi qua.")
    field(
        "Đường xanh",
        "trung bình động: lấy công việc đó cộng 4 cái trước và 4 cái sau, tính "
        "trung bình. Tính theo SỐ LƯỢNG công việc, không theo khoảng thời gian.",
    )
    field(
        "Vùng xanh nhạt",
        "độ lệch chuẩn. Dải hẹp nghĩa là quy trình dự đoán được; dải rộng là bất ổn.",
    )
    note(
        "Linear xử lý cùng bài toán này theo cách khác và tốt hơn cho đội nhỏ: "
        "họ KHÔNG dùng trung bình mà dùng PHÂN VỊ — trung vị và p95. Trung bình bị "
        "một công việc treo ba tháng kéo lệch hoàn toàn.",
    )

    img("jira-release-burndown.png", "Hình 17 — Release Burndown, có dự báo")
    p(
        "Cột chồng theo từng kỳ, bốn lớp: còn lại · đã xong (số âm phía trên) · "
        "việc thêm vào (số dương phía dưới đáy) · dự báo (cột xám mờ)."
    )
    note(
        "Công thức dự báo của Jira: lấy velocity ba kỳ gần nhất chia phần việc còn "
        "lại. Linear làm tinh tế hơn — cho một DẢI ±40% thay vì một ngày cụ thể. "
        "Cách trung thực hơn khi nói về tương lai.",
    )

    # ═══════════ 3. KPI ═══════════
    pagebreak()
    h("3. Hàng số to và thanh tiến độ", 1)

    h("3.1 Hàng KPI kể một câu chuyện", 2)
    img("cu-sprintintro-img5.png", "Hình 18 — Action Report của ClickUp")
    p("Năm ô số to, và điểm hay là chúng kể trọn một câu chuyện liền mạch:")
    table(
        ["Ô", "Giá trị", "Ý nghĩa"],
        [
            ["Committed", "26 điểm", "Cam kết ban đầu"],
            ["Added", "5 điểm", "Thêm vào giữa kỳ"],
            ["Removed", "0 điểm", "Bỏ ra"],
            ["Completed", "0 điểm", "Đã xong"],
            ["Remaining", "**31 điểm**", "Còn lại — có icon cảnh báo riêng"],
        ],
        widths=[3.4, 3.0, 9.6],
    )
    note(
        "Bài học: hàng KPI mạnh nhất khi bốn năm ô kể một câu chuyện, không phải "
        "năm con số rời rạc. Ô cảnh báo cần icon riêng.",
    )

    img("mo-numbers-i06.png", "Hình 19 — Widget Numbers của Monday")
    p(
        "Một con số cực lớn giữa widget, có ký hiệu tiền tệ đặt trái hoặc phải. "
        "Với HeyE quản lý chi phí, đây gần như là bản thiết kế sẵn cho ô tổng chi "
        "phí tháng."
    )
    note(
        "Quy luật rút ra từ cả ba sản phẩm: số to LUÔN là một phép cộng hoặc đếm "
        "mà ai cũng hiểu ngay — tổng tiền, tổng giờ, số việc còn lại. Chỉ số tinh "
        "vi như cycle time hay velocity không bao giờ đứng một mình làm số to.",
    )

    h("3.2 Thanh tiến độ phải có trọng số", 2)
    img("mo-battery-i05.png", "Hình 20 — Battery của Monday")
    p(
        "Thanh ngang chia đoạn theo màu trạng thái, kèm số phần trăm lớn bên cạnh. "
        "Điểm hay nhất nằm ở chỗ ít ai để ý:"
    )
    note(
        "Monday cho chọn một cột số làm TRỌNG SỐ. Trong ảnh họ chọn cột giờ ước "
        "tính, nên 85.4% là theo GIỜ chứ không phải theo đầu việc. Đây là khác biệt "
        "lớn: 9 trên 10 việc xong nhưng việc còn lại chiếm nửa khối lượng thì phần "
        "trăm theo đầu việc là con số dối trá.",
    )

    # ═══════════ 4. PHÂN TẦNG ═══════════
    pagebreak()
    h("4. Cách phân tầng sếp và PM", 1)

    h("4.1 Jira phân theo NƠI ĐẶT", 2)
    table(
        ["Nơi", "Ai xem", "Nội dung"],
        [
            [
                "**Dashboard** trang chủ",
                "Sếp",
                "Biểu đồ tròn, Tạo mới vs Hoàn thành, số tổng — nhìn phát hiểu",
            ],
            [
                "**Reports** trong bảng công việc",
                "PM",
                "Burndown, Velocity, Cumulative Flow, Control Chart — cần hiểu quy trình",
            ],
        ],
        widths=[4.4, 2.2, 9.4],
    )
    note(
        "Mỗi báo cáo của Jira có link “Cách đọc biểu đồ này” ngay tại chỗ. Control "
        "Chart thậm chí có ba ảnh nhỏ minh hoạ ba cách đọc.",
    )

    h("4.2 Asana phân theo PHẠM VI DỮ LIỆU", 2)
    img("asana-dashboard-home.png", "Hình 21 — Màn Reporting của Asana")
    p(
        "Đây không phải một dashboard mà là THƯ VIỆN dashboard, chia mục Yêu thích "
        "và Gần đây. Mỗi cái có tên riêng, một dòng mô tả mục đích, và chủ sở hữu."
    )
    p("Tên các dashboard thật trong ảnh: Marketing Launches · Cross-region Campaigns · Project Budget Tracking · Fiscal Year KPIs.")
    note(
        "Bài học lớn nhất cho HeyE: đừng làm một màn “Thống kê” cứng cho tất cả. "
        "Làm một danh sách dashboard, mỗi cái trả lời một câu hỏi cho một nhóm người.",
    )

    img("asana-add-chart-gallery.png", "Hình 22 — Thư viện biểu đồ của Asana")
    p("Sidebar chia bốn nhóm theo CÂU HỎI NGHIỆP VỤ, không theo loại hình đồ thị:")
    field("Recommended", "gợi ý sẵn.")
    field("Resourcing", "nhân sự và phân bổ nguồn lực.")
    field("Work health", "sức khỏe công việc.")
    field("Progress", "tiến độ.")
    note(
        "Người dùng nghĩ theo câu hỏi, không nghĩ theo hình dạng. HeyE nên chia "
        "tương tự: **Tiến độ · Nhân sự · Chi phí** — trong đó Chi phí là nhóm cả "
        "Jira lẫn Asana đều không có.",
    )

    img("asana-dashboard.png", "Hình 23 — Dashboard thật của Asana")
    p(
        "Bốn loại biểu đồ đang chạy. Chú ý biểu đồ dưới cùng bên phải — Upcoming "
        "tasks by assignee dùng AVATAR thay tên ở trục ngang và sắp xếp giảm dần. "
        "Nhìn một giây biết ai nhiều việc nhất."
    )

    # ═══════════ 5. MÀU ═══════════
    pagebreak()
    h("5. Quy ước màu và ngưỡng cảnh báo", 1)
    table(
        ["Màu", "Dùng cho", "Xác minh từ"],
        [
            ["**Đỏ** — vùng tô", "Tạo nhiều hơn xong, tồn đọng phình", "Created vs Resolved"],
            ["**Đỏ** — đường nét đứt", "Ngưỡng sức chứa", "Asana Workload"],
            ["**Đỏ** — vùng trên ngưỡng", "Người này quá tải", "Asana Workload"],
            ["**Đỏ** — bong bóng", "Quá tải, kèm tooltip “4 trên 3”", "Monday Workload"],
            ["Xanh lá", "Hoàn thành, hoặc xong nhiều hơn tạo", "Velocity, Created vs Resolved"],
            ["Xám", "Đường cơ sở: nhịp lý tưởng, cam kết ban đầu", "Burndown, Velocity"],
            ["Xám nhạt nền dọc", "Ngày nghỉ, không tính", "Jira Burndown"],
            ["Xám cột mờ", "Dự báo tương lai", "Release Burndown"],
            ["Xanh nhạt vùng nền", "Độ lệch chuẩn — hẹp là tốt", "Control Chart"],
            ["Gạch chéo", "Ngày lễ và cuối tuần", "Monday Workload"],
        ],
        widths=[4.6, 6.4, 5.0],
        small=True,
    )
    note(
        "Quy tắc: đỏ CHỈ dùng cho “đã vượt ngưỡng hoặc đang xấu đi”, xám cho đường "
        "cơ sở và dự báo, xanh lá cho đã hoàn thành. Không dùng đỏ chỉ vì cần thêm màu.",
    )

    # ═══════════ 6. ĐỘI NHỎ ═══════════
    pagebreak()
    h("6. Bẫy khi làm cho đội nhỏ", 1)
    p("HeyE phục vụ đội 5–10 người. Không phải biểu đồ nào cũng còn nghĩa ở quy mô đó.")

    h("6.1 Vẫn có nghĩa", 2)
    field("Lưới tải nhân sự", "càng ít người càng dễ đọc. Tám người vừa một màn hình, không cần cuộn. Đây là biểu đồ HƯỞNG LỢI từ đội nhỏ.")
    field("Thanh tiến độ có trọng số", "không phụ thuộc cỡ mẫu.")
    field("Hàng số to", "luôn đúng.")
    field("Bảng giờ công theo người", "mười dòng là đẹp.")
    field("Velocity nhiều kỳ", "vẫn dùng được, nhưng cần tối thiểu ba kỳ.")

    h("6.2 Trở nên vô dụng hoặc gây hiểu lầm", 2)
    field(
        "Cumulative Flow",
        "cần vài trăm công việc qua nhiều tháng mới thành hình mượt. Đội nhỏ sẽ ra "
        "bậc thang răng cưa, đọc không nổi.",
    )
    field(
        "Phân vị p95",
        "p95 trên mười hai công việc là con số vô nghĩa. Linear đặt sẵn bốn mốc "
        "phân vị vì họ nhắm đội lớn. HeyE nên chỉ hiện trung vị.",
    )
    field(
        "Trung bình thời gian",
        "với ít mẫu, một công việc treo lâu bóp méo hoàn toàn. Nếu làm thì BẮT BUỘC "
        "dùng trung vị chứ không dùng trung bình.",
    )
    field(
        "Burndown một kỳ",
        "không sai, nhưng với khoảng mười công việc mỗi kỳ thì đường giật bậc thang "
        "lớn, giá trị thấp hơn nhiều so với chi phí xây.",
    )
    note(
        "Nguyên tắc chung: biểu đồ dựa trên PHÂN PHỐI THỐNG KÊ cần nhiều mẫu, đội "
        "nhỏ nên tránh. Biểu đồ dựa trên TRẠNG THÁI HIỆN TẠI và TỔNG ĐƠN GIẢN không "
        "phụ thuộc cỡ mẫu, an toàn.",
    )

    # ═══════════ 7. ĐỐI CHIẾU HEYE ═══════════
    pagebreak()
    h("7. Đối chiếu với dữ liệu HeyE", 1)
    p(
        "Kiểm tra thật trên cơ sở dữ liệu HeyE ngày 24/08/2026 xem tính được chỉ số "
        "nào ngay."
    )

    h("7.1 Dữ liệu đang có", 2)
    table(
        ["Bảng", "Cột dùng được", "Cho phép tính"],
        [
            [
                "**time_entries**",
                "user_id · date · minutes · billable_minutes · cost_rate_snapshot · approved_at",
                "Utilization, giờ theo người theo tháng, chi phí lao động",
            ],
            [
                "**cost_rates**",
                "hours_mon … hours_sun · start_date · end_date",
                "Capacity chuẩn, xử lý bán thời gian và người vào giữa tháng",
            ],
            [
                "**tickets**",
                "created_at · deadline · start_date · estimate_hours · status_id",
                "Tạo mới vs Hoàn thành, tải việc theo thời gian",
            ],
            ["**ticket_assignees**", "ticket_id · user_id", "Tải việc theo người"],
            ["**expenses**", "date · amount · status", "Chi phí theo tháng"],
        ],
        widths=[3.4, 6.4, 6.2],
        small=True,
    )
    note(
        "Cấu trúc cost_rates của HeyE trùng khớp với Productive: lưới giờ từng ngày "
        "trong tuần cộng khoảng ngày hiệu lực. Ba cơ chế capacity đều làm được ngay.",
    )

    h("7.2 Thử tính utilization thật", 2)
    p("Áp công thức Productive lên dữ liệu HeyE, tháng 7/2026:")
    table(
        ["Người", "Capacity", "Đã làm", "Tính tiền", "Total %", "Bill %", "Đánh giá"],
        [
            ["Sơn", "184h", "182h", "182h", "99%", "99%", "Tốt"],
            ["Linh", "184h", "182h", "182h", "99%", "99%", "Tốt"],
            ["Vy", "184h", "136h", "136h", "74%", "74%", "**Cảnh báo**"],
            ["Trang", "184h", "67h", "67h", "36%", "36%", "**Thấp**"],
        ],
        widths=[2.4, 2.2, 2.0, 2.2, 2.2, 2.2, 3.2],
        small=True,
    )
    p("Công thức chạy đúng. Nhưng dữ liệu mẫu lộ ra ba thiếu sót:")
    field(
        "Total bằng Bill ở mọi người",
        "mọi giờ đều tính tiền, nên không so sánh được hai chỉ số. Thiếu case giờ "
        "nội bộ: họp, đào tạo, bảo hành.",
    )
    field(
        "Không ai quá tải",
        "cao nhất 99%, không ai vượt 100%. Biểu đồ cảnh báo đỏ không có dữ liệu để hiện.",
    )
    field(
        "Không có nghỉ phép",
        "Available luôn bằng Capacity, nên không thấy được khoảng hở giữa hai cột.",
    )
    note(
        "Trang chỉ 36% — với vai trò quản lý dự án thì đó là bình thường theo chuẩn "
        "Productive. Nhưng nếu không có mục tiêu riêng theo vai trò thì sẽ bị đánh "
        "giá oan. Đây là lý do nên làm mục tiêu riêng từng người.",
        "warn",
    )

    h("7.3 Việc cần làm trước khi dựng", 2)
    table(
        ["Việc", "Vì sao", "Mức"],
        [
            [
                "**Tách ngày lễ ra cấu hình**",
                "Hiện gắn cứng lễ Việt Nam trong mã nguồn. Mọi công thức capacity "
                "phụ thuộc nó.",
                "Cao",
            ],
            [
                "**Thêm case giờ nội bộ vào dữ liệu mẫu**",
                "Để Total tách khỏi Bill, mới demo được chẩn đoán “bận việc nội bộ” "
                "và “thật sự rảnh”.",
                "Cao",
            ],
            [
                "**Thêm một kỳ quá tải**",
                "Để thấy cảnh báo đỏ hoạt động.",
                "Vừa",
            ],
            [
                "**Thêm nghỉ phép**",
                "Để Available khác Capacity.",
                "Vừa",
            ],
            [
                "Lưu lịch sử đổi trạng thái",
                "Chỉ cần nếu làm Cumulative Flow — biểu đồ này đứng cuối danh sách "
                "ưu tiên.",
                "Thấp",
            ],
        ],
        widths=[4.6, 8.8, 2.6],
        small=True,
    )

    h("7.4 Ba nguyên tắc nên áp cho mọi biểu đồ", 2)
    field(
        "Bấm vào biểu đồ phải ra danh sách công việc",
        "cả ClickUp lẫn Monday đều làm điều này ở mọi widget, và sửa được ngay tại "
        "chỗ. Biểu đồ không bấm được chỉ là tranh trang trí, và người xem sẽ không "
        "tin con số.",
    )
    field(
        "Mỗi biểu đồ có một dòng cách đọc bằng tiếng Việt",
        "Jira có link giải thích trên mọi báo cáo. Đừng giả định người dùng biết "
        "burndown là gì.",
    )
    field(
        "Chốt sẵn quy tắc, đừng bắt người dùng cấu hình",
        "Monday có tám tổ hợp cấu hình workload và tài liệu của chính họ phải cảnh "
        "báo về bẫy quy đổi. Với đội 5–10 người, chốt cứng một tổ hợp rồi chỉ mở "
        "tùy chỉnh khi có người yêu cầu.",
    )
