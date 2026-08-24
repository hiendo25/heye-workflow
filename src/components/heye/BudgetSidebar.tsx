/**
 * Panel phải của hợp đồng, dựng theo ảnh Productive.
 *
 * Ảnh cho thấy một dải icon ở đỉnh (nhà · người · mảnh ghép · PDF · bánh răng)
 * và nút thu gọn ở góc phải. Dưới đó là các khối gập được: Dự án, Deal gốc,
 * mỗi khối có link hành động màu tím.
 *
 * Ở HeyE chưa có CRM nên khối "Deal gốc" hiện dấu "/" đúng như ảnh — Productive
 * cũng hiển thị "/" khi hợp đồng không sinh ra từ deal nào.
 */
import { useState } from "react";
import {
  Building2,
  ChevronDown,
  CalendarRange,
  FileText,
  Home,
  PanelRightClose,
  Puzzle,
  Settings,
  User,
} from "lucide-react";
import { money, type Budget, type ClientCompany } from "@/lib/finance-data";

type PaneKey = "home" | "client" | "apps" | "pdf" | "settings";

const PANES: { key: PaneKey; icon: React.ReactNode; title: string }[] = [
  { key: "home", icon: <Home size={17} />, title: "Tổng quan" },
  { key: "client", icon: <User size={17} />, title: "Khách hàng" },
  { key: "apps", icon: <Puzzle size={17} />, title: "Tiện ích" },
  { key: "pdf", icon: <FileText size={17} />, title: "Hồ sơ PDF" },
  { key: "settings", icon: <Settings size={17} />, title: "Thiết lập" },
];

/** Khối gập được, tiêu đề đậm + mũi tên xoay. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="border-b border-line px-4 py-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[16px] font-bold tracking-tight">{title}</span>
        <ChevronDown
          size={17}
          className={`text-ink-2 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

/** Một trường: nhãn xám nhỏ trên, giá trị dưới. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12.5px] text-ink-2">{label}</div>
      <div className="mt-0.5 text-[14px] text-ink">{value}</div>
    </div>
  );
}

/** Link hành động màu tím, kiểu "Assign to another project". */
function ActionLink({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="text-[14px] font-medium text-brand hover:underline">
      {children}
    </button>
  );
}

export function BudgetSidebar({
  budget,
  client,
  contractTotal,
  onClose,
}: {
  budget: Budget;
  client: ClientCompany | null;
  contractTotal: number;
  onClose?: () => void;
}) {
  const [pane, setPane] = useState<PaneKey>("home");

  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-l border-line bg-surface">
      {/* Dải icon chọn khu vực */}
      <div className="flex items-center gap-1 border-b border-line px-3 py-2">
        {PANES.map((p) => (
          <button
            key={p.key}
            type="button"
            title={p.title}
            onClick={() => setPane(p.key)}
            className={`rounded-lg p-2 transition ${
              pane === p.key
                ? "border-b-2 border-brand text-brand"
                : "text-ink-2 hover:bg-line/50 hover:text-ink"
            }`}
          >
            {p.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          title="Thu gọn"
          className="ml-auto rounded-lg p-2 text-ink-2 hover:bg-line/50 hover:text-ink"
        >
          <PanelRightClose size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {pane === "home" && (
          <>
            <Block title="Dự án">
              <Field label="Dự án" value={client?.name ?? "—"} />
              <ActionLink>Gán sang dự án khác</ActionLink>
            </Block>

            <Block title="Cơ hội gốc">
              {/* Chưa có CRM nên để "/" đúng như Productive khi không có deal */}
              <Field label="Tên cơ hội" value={<span className="text-ink-2">/</span>} />
              <Field label="Giá trị" value={<span className="text-ink-2">/</span>} />
              <ActionLink>Gán vào cơ hội</ActionLink>
            </Block>

            <div className="px-4 py-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-ink hover:text-brand"
              >
                <CalendarRange size={16} /> Xem trong lịch xếp việc
              </button>
            </div>
          </>
        )}

        {pane === "client" && (
          <Block title="Khách hàng">
            <Field
              label="Công ty"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={15} className="text-ink-2" />
                  {client?.name ?? "—"}
                </span>
              }
            />
            <Field label="Mã hợp đồng" value={budget.code || "—"} />
            <Field label="Giá trị hợp đồng" value={money(Math.round(contractTotal))} />
          </Block>
        )}

        {pane === "pdf" && (
          <Block title="Hồ sơ PDF">
            <Field label="Báo giá" value={<ActionLink>Xuất bản báo giá</ActionLink>} />
            <Field label="Tình hình hợp đồng" value={<ActionLink>Xuất bản tình hình</ActionLink>} />
          </Block>
        )}

        {(pane === "apps" || pane === "settings") && (
          <div className="px-4 py-10 text-center text-[13px] text-ink-2">
            {pane === "apps" ? "Chưa nối tiện ích nào." : "Thiết lập riêng cho hợp đồng này."}
          </div>
        )}
      </div>
    </aside>
  );
}
