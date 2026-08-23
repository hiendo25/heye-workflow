/**
 * Vỏ màn hợp đồng, dựng theo đúng ảnh chụp Productive.
 *
 * Ba thứ tách ra đây vì cả 7 tab đều dùng chung:
 *   - Cặp pill trạng thái  Open — Delivered  (nối nhau bằng gạch ngang)
 *   - Thanh công cụ        Cột · Bộ lọc · Nhóm · Tải về
 *   - Màn trống            hình minh hoạ + nút Đặt lại bộ lọc
 *
 * Trước đây tôi để trạng thái là MỘT badge và bỏ hẳn thanh công cụ. Ảnh thật
 * cho thấy hai pill luôn hiện cùng lúc: cái đang chọn tô tím đặc, cái còn lại
 * là viền rỗng và bấm được để chuyển tiếp.
 */
import { ChevronDown, Download, Inbox, SlidersHorizontal, Table2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Cặp pill Open — Delivered, không phải một badge đơn. */
export function StatusPills({
  status,
  onChange,
}: {
  status: string;
  onChange?: (s: "open" | "delivered") => void;
}) {
  const open = status === "open";
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={() => onChange?.("open")}
        className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
          open ? "bg-brand text-white" : "border border-line bg-surface text-ink-2 hover:text-ink"
        }`}
      >
        Đang chạy
      </button>
      <span className="mx-1 h-px w-3 bg-line" />
      <button
        type="button"
        onClick={() => onChange?.("delivered")}
        className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
          !open ? "bg-brand text-white" : "border border-line bg-surface text-ink-2 hover:text-ink"
        }`}
      >
        Đã bàn giao
      </button>
    </div>
  );
}

/** Nút thanh công cụ có badge đếm, dùng chung cho Cột / Bộ lọc / Nhóm. */
function ToolButton({
  icon,
  label,
  count,
  caret,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  count?: number | undefined;
  caret?: boolean;
  children?: React.ReactNode;
}) {
  const body = (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink hover:bg-line/50">
      {icon}
      {label}
      {count !== undefined && (
        <span className="num rounded-full bg-line px-1.5 py-px text-[11px] text-ink-2">{count}</span>
      )}
      {caret && <ChevronDown size={13} className="text-ink-3" />}
    </span>
  );
  if (!children) return body;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">{body}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Thanh công cụ trắng bo tròn nằm trên mỗi bảng.
 * Ảnh thật: Fields 7 | Filters 1 | Group ▾ | ↓  — căn trái, nền trắng, viền mảnh.
 */
export function ListToolbar({
  fieldCount,
  filterCount,
  fields,
  filters,
  groups,
  onExport,
  right,
}: {
  fieldCount?: number | undefined;
  filterCount?: number | undefined;
  fields?: React.ReactNode;
  filters?: React.ReactNode;
  groups?: React.ReactNode;
  onExport?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2.5">
      <ToolButton icon={<Table2 size={14} />} label="Cột" count={fieldCount}>
        {fields}
      </ToolButton>
      <ToolButton icon={<SlidersHorizontal size={14} />} label="Bộ lọc" count={filterCount}>
        {filters}
      </ToolButton>
      <ToolButton label="Nhóm" caret>
        {groups}
      </ToolButton>
      <button
        type="button"
        onClick={onExport}
        title="Tải về"
        className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50 hover:text-ink"
      >
        <Download size={15} />
      </button>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

/**
 * Màn trống. Productive luôn kèm nút Reset filters, vì màn trống hay là do
 * lọc quá tay chứ không phải thật sự chưa có dữ liệu.
 */
export function EmptyState({
  title = "Chưa có dữ liệu",
  hint = "Thử chỉnh lại bộ lọc để xem kết quả.",
  onReset,
}: {
  title?: string;
  hint?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <div className="rounded-2xl bg-brand-soft p-5 text-brand">
        <Inbox size={44} strokeWidth={1.25} />
      </div>
      <div className="text-[22px] font-bold tracking-tight">{title}</div>
      <p className="max-w-sm text-[13.5px] text-ink-2">{hint}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 rounded-lg border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink hover:border-brand hover:text-brand"
        >
          Đặt lại bộ lọc
        </button>
      )}
    </div>
  );
}
