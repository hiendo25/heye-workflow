import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  Copy,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Tag,
  Users2,
  Trash2,
  Star,
  X,
  Eye,
  Share2,
  FileText,
  CalendarDays,
  PanelLeftClose,
  Clock,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BudgetOverview } from "@/components/heye/BudgetOverview";
import { EmptyState, ListToolbar, StatusPills } from "@/components/heye/BudgetChrome";
import { BudgetSidebar } from "@/components/heye/BudgetSidebar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BILLING_LABEL,
  BILLING_NOTE,
  budgetTotal,
  money,
  rateCardsForClient,
  serviceTotal,
  UNIT_LABEL,
  type Budget,
  type BillingType,
  type BudgetService,
  type FinanceData,
  costRateFor,
  effectivePrice,
  type ForecastTicket,
} from "@/lib/finance-data";
import type { User } from "@/lib/heye-data";

/** Cột hiện được, bật/tắt qua nút "Cột" giống Fields của Productive. */
const COLUMNS = [
  { key: "desc", label: "Cách tính", en: "Billing type" },
  { key: "unit", label: "Đơn vị", en: "Unit" },
  { key: "track", label: "Theo dõi", en: "Tracking" },
  { key: "estimate", label: "Ước tính", en: "Estimate" },
  { key: "quantity", label: "Số lượng", en: "Qty" },
  { key: "price", label: "Đơn giá", en: "Price" },
  { key: "total", label: "Thành tiền", en: "Budget total" },
] as const;
type ColKey = (typeof COLUMNS)[number]["key"];

const BILL_STYLE: Record<BillingType, string> = {
  tm: "bg-good-soft text-good",
  fixed: "bg-warn-soft text-warn",
  percentage: "bg-brand-soft text-brand",
  non_billable: "bg-line text-ink-3",
};

/** Icon đầu hàng cho biết hạng mục thuộc loại nào — đọc được ngay không cần đọc chữ. */
function RowIcon({ s }: { s: BudgetService }) {
  if (s.billing_type === "non_billable")
    return <Ban size={13} className="text-ink-3" aria-label="Không tính tiền" />;
  if (s.unit === "piece")
    return <Tag size={13} className="text-warn" aria-label="Bán theo gói" />;
  if (s.billing_type === "fixed")
    return <Lock size={13} className="text-warn" aria-label="Trọn gói" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-good" aria-label="Theo giờ" />;
}

/**
 * Bảy tab nằm TRONG hợp đồng, không phải ngoài menu chính.
 * Trước đây tôi đẩy Chi phí và Giờ ra sidebar toàn cục — sai: ở Productive
 * mọi thứ về một hợp đồng đều nằm trong chính hợp đồng đó.
 */
const TABS = [
  { key: "overview", label: "Tổng quan", en: "Overview" },
  { key: "services", label: "Hạng mục", en: "Services" },
  { key: "time", label: "Giờ", en: "Time" },
  { key: "expenses", label: "Chi phí", en: "Expenses" },
  // Productive còn ba tab Invoices / Recurring / Feed, nhưng bên mình bán theo
  // dự án chứ không có hợp đồng lặp theo tháng, và module hóa đơn chưa dựng.
  // Dựng vỏ rỗng chỉ để giống hình thì người dùng bấm vào lại thấy màn trống,
  // tệ hơn là không có tab. Thêm lại khi nào thật sự cần xuất hóa đơn.
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function BudgetDetail({
  budget,
  data,
  onBack,
  onAddService,
  onEditService,
  onDeleteService,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onEditBudget,
  users,
  forecastTickets,
  onSaveBudgetCostRate,
  onRemoveBudgetCostRate,
  renderTab,
}: {
  budget: Budget;
  data: FinanceData;
  users: User[];
  forecastTickets: ForecastTicket[];
  onBack: () => void;
  onAddService: (v: Record<string, unknown>) => void;
  onEditService: (id: string, v: Record<string, unknown>) => void;
  onDeleteService: (id: string) => void;
  onAddSection: (name: string) => void;
  onEditSection: (id: string, name: string) => void;
  onDeleteSection: (id: string) => void;
  onEditBudget: (v: Record<string, unknown>) => void;
  onSaveBudgetCostRate: (userId: string, rate: number) => void;
  onRemoveBudgetCostRate: (id: string) => void;
  /** Nội dung cho tab Giờ / Chi phí, do trang cha lọc sẵn theo hợp đồng. */
  renderTab?: ((key: "time" | "expenses") => React.ReactNode) | undefined;
}) {
  const [adding, setAdding] = useState<string | null | "root">(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newSection, setNewSection] = useState(false);
  const [view, setView] = useState<TabKey>("overview");
  const [sideOpen, setSideOpen] = useState(true);
  // Tạo hạng mục trống — khác đường rút từ bảng giá
  const [blankIn, setBlankIn] = useState<string | null>(null);
  const [cols, setCols] = useState<Set<ColKey>>(
    // Đơn vị luôn hiện ở Productive — thiếu nó thì nhìn bảng không biết dòng
    // bán theo giờ, ngày hay trọn gói.
    new Set(["desc", "unit", "track", "estimate", "quantity", "price", "total"]),
  );

  const client = data.clients.find((c) => c.id === budget.client_id);
  const services = data.services.filter((s) => s.budget_id === budget.id);
  const sections = data.sections.filter((s) => s.budget_id === budget.id);
  const loose = services.filter((s) => !s.section_id);
  const total = budgetTotal(services);
  // Nền để tính hạng mục phần trăm: tổng những hạng mục đứng độc lập.
  const pctBase = services
    .filter((x) => x.billing_type !== "percentage" && x.billing_type !== "non_billable")
    .reduce((a, x) => a + Number(x.quantity) * Number(x.price), 0);
  const totalQty = services.reduce((a, s) => a + Number(s.quantity), 0);

  /** Nhân bản hạng mục: chép mọi thiết lập, thêm tiền tố vào tên. */
  const dupService = (s: BudgetService) =>
    onAddService({
      budget_id: s.budget_id,
      section_id: s.section_id,
      name: `Bản sao của ${s.name}`,
      service_type_id: s.service_type_id,
      billing_type: s.billing_type,
      unit: s.unit,
      quantity: s.quantity,
      price: s.price,
      estimate: s.estimate,
      allow_time: s.allow_time,
      allow_expense: s.allow_expense,
    });

  const on = (k: ColKey) => cols.has(k);
  const toggle = (k: ColKey) =>
    setCols((c) => {
      const n = new Set(c);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const commitRename = (id: string) => {
    const v = draft.trim();
    if (v) onEditSection(id, v);
    setRenaming(null);
  };

  return (
    <div className="flex min-h-0 items-stretch gap-0">
      <div className="min-w-0 flex-1">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-ink-2 hover:text-brand"
      >
        <ArrowLeft size={14} /> Tất cả hợp đồng
      </button>

      {/* ---- Đầu trang: dựng theo ảnh Productive ----
           Hàng 1: mã khách nhỏ + tên hợp đồng lớn + sao, bên phải là khoảng
           ngày và bộ icon xem/chia sẻ/tài liệu/đóng.
           Hàng 2: cặp pill trạng thái bên trái, 7 tab bên phải, nút tím cuối. */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold text-brand">{client?.name}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="text-[26px] font-bold tracking-tight">{budget.name}</h1>
            <button type="button" className="text-ink-3 hover:text-warn" title="Đánh dấu">
              <Star size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {budget.start_date && (
            <span className="num inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-ink hover:bg-line/50">
              <CalendarDays size={15} className="text-ink-2" />
              {fmtDate(budget.start_date)} – {fmtDate(budget.end_date)}
            </span>
          )}
          <span className="mx-1 h-5 w-px bg-line" />
          <button type="button" title="Xem như khách" className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50">
            <Eye size={17} />
          </button>
          <button type="button" title="Chia sẻ" className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50">
            <Share2 size={17} />
          </button>
          <button type="button" title="Hồ sơ" className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50">
            <FileText size={17} />
          </button>
          <button type="button" onClick={onBack} title="Đóng" className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50">
            <X size={19} />
          </button>
        </div>
      </div>

      {/* ---- Hàng trạng thái + tab ---- */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-line pb-3">
        <StatusPills
          status={budget.status}
          onChange={(st) => onEditBudget({ status: st })}
        />

        <nav className="ml-auto flex flex-wrap items-center gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className={`rounded-lg px-3 py-2 text-[14px] transition ${
                view === t.key
                  ? "bg-brand-soft font-semibold text-brand"
                  : "text-ink-2 hover:bg-line/50 hover:text-ink"
              }`}
            >
              {t.label}
              <span className="ml-1 text-[11px] font-normal text-ink-3">{t.en}</span>
            </button>
          ))}
        </nav>

        <Button
          onClick={() => setAdding("root")}
          className="gap-1.5 rounded-lg bg-brand px-4 text-white hover:bg-brand/90"
        >
          <Plus size={16} /> Hạng mục
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-lg p-1.5 text-ink-2 hover:bg-line/50 hover:text-ink">
            <MoreHorizontal size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[210px]">
            <DropdownMenuItem onSelect={() => setEditBudget(true)}>
              <Pencil size={14} /> Sửa hợp đồng
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setCostOpen(true)}>
              <Users2 size={14} /> Giá vốn riêng hợp đồng
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Copy size={14} /> Nhân bản
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {view === "overview" && (
        <div className="mt-4">
          <BudgetOverview data={data} budgetId={budget.id} tickets={forecastTickets} />
        </div>
      )}

      {view === "services" && (
      <>
      {/* ---- Thanh công cụ ---- */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink-2 hover:border-brand hover:text-brand">
            <Settings2 size={13} /> Cột <span className="num text-ink-3">{cols.size}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[170px]">
            {COLUMNS.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={on(c.key)}
                onCheckedChange={() => toggle(c.key)}
                onSelect={(e) => e.preventDefault()}
              >
                {c.label}
                <span className="ml-auto pl-3 text-[11px] text-ink-3">{c.en}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="outline" onClick={() => setNewSection(true)}>
          <Plus size={13} /> Nhóm hạng mục
        </Button>

        <div className="flex-1" />
        <Button size="sm" onClick={() => setAdding(sections[0]?.id ?? "root")}>
          <Plus size={13} /> Thêm hạng mục
        </Button>
      </div>

      {newSection && (
        <div className="mt-2 flex gap-2">
          <Input
            autoFocus
            value={draft}
            placeholder="Tên nhóm: Định danh eKYC, Giao dịch tiền mặt…"
            className="h-8 w-72"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                onAddSection(draft.trim());
                setDraft("");
                setNewSection(false);
              }
              if (e.key === "Escape") setNewSection(false);
            }}
          />
          <Button
            size="sm"
            disabled={!draft.trim()}
            onClick={() => {
              onAddSection(draft.trim());
              setDraft("");
              setNewSection(false);
            }}
          >
            Thêm
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setNewSection(false)}>
            Huỷ
          </Button>
        </div>
      )}

      {/* ---- Bảng gộp: tổng nằm trên header, section là hàng trong bảng ---- */}
      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="align-bottom">
                <Th className="w-[30%] text-left">
                  Nhóm / Hạng mục
                  <div className="mt-0.5 text-[10.5px] font-normal normal-case text-ink-3">
                    {services.length} hạng mục
                  </div>
                </Th>
                {on("desc") && <Th className="text-left">Cách tính</Th>}
                {on("unit") && <Th className="text-left">Đơn vị</Th>}
                {on("track") && <Th className="text-center">Theo dõi</Th>}
                {on("estimate") && <Th className="text-right">Ước tính</Th>}
                {on("quantity") && (
                  <Th className="text-right">
                    Số lượng
                    <div className="num mt-0.5 text-[12px] font-bold normal-case text-ink">
                      {totalQty}
                    </div>
                  </Th>
                )}
                {on("price") && <Th className="text-right">Đơn giá</Th>}
                {on("total") && (
                  <Th className="text-right">
                    Thành tiền
                    <div className="num mt-0.5 text-[13px] font-bold normal-case text-ink">
                      {money(total)}
                    </div>
                  </Th>
                )}
                <Th className="w-10" />
              </tr>
            </thead>

            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[12.5px] text-ink-3">
                    Hợp đồng chưa có hạng mục nào. Bấm “Thêm hạng mục” để rút giá từ bảng giá
                    của khách.
                  </td>
                </tr>
              )}

              {sections.map((sec) => {
                const rows = services.filter((s) => s.section_id === sec.id);
                return (
                  <SectionRows
                    onPatch={onEditService}
                    onDuplicate={dupService}
                    pctBase={pctBase}
                    key={sec.id}
                    name={sec.name}
                    rows={rows}
                    data={data}
                    cols={cols}
                    renaming={renaming === sec.id}
                    draft={draft}
                    setDraft={setDraft}
                    onStartRename={() => {
                      setDraft(sec.name);
                      setRenaming(sec.id);
                    }}
                    onCommitRename={() => commitRename(sec.id)}
                    onCancelRename={() => setRenaming(null)}
                    onRemoveSection={() => onDeleteSection(sec.id)}
                    onAdd={() => setAdding(sec.id)}
                    onAddBlank={() => setBlankIn(sec.id)}
                    onEdit={setEditingId}
                    onDelete={onDeleteService}
                  />
                );
              })}

              {loose.length > 0 && (
                <SectionRows
                  onPatch={onEditService}
                  onDuplicate={dupService}
                  pctBase={pctBase}
                  name={sections.length ? "Chưa phân nhóm" : "Hạng mục bán"}
                  rows={loose}
                  data={data}
                  cols={cols}
                  onAdd={() => setAdding("root")}
                  onAddBlank={() => setBlankIn("root")}
                  onEdit={setEditingId}
                  onDelete={onDeleteService}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      </>
      )}

      {/* ---- Giờ và Chi phí: cùng dữ liệu toàn cục nhưng lọc theo hợp đồng ---- */}
      {(view === "time" || view === "expenses") && (
        <div className="mt-4">
          {renderTab?.(view) ?? (
            <div className="rounded-xl border border-line bg-surface">
              <EmptyState hint="Chưa nối được dữ liệu cho tab này." />
            </div>
          )}
        </div>
      )}

      </div>

      {sideOpen ? (
        <BudgetSidebar
          budget={budget}
          client={client ?? null}
          contractTotal={total}
          onClose={() => setSideOpen(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setSideOpen(true)}
          title="Mở bảng thông tin"
          className="ml-1 h-fit rounded-lg border border-line bg-surface p-2 text-ink-2 hover:border-brand hover:text-brand"
        >
          <PanelLeftClose size={17} />
        </button>
      )}
    </div>
  );
}

/* -------- Một nhóm: hàng tiêu đề + các hàng hạng mục, cùng một bảng -------- */

function SectionRows({
  name,
  rows,
  data,
  cols,
  renaming,
  draft,
  setDraft,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRemoveSection,
  onAdd,
  onAddBlank,
  onEdit,
  onDelete,
  onPatch,
  onDuplicate,
  pctBase,
}: {
  name: string;
  rows: BudgetService[];
  data: FinanceData;
  cols: Set<ColKey>;
  renaming?: boolean;
  draft?: string;
  setDraft?: (v: string) => void;
  onStartRename?: () => void;
  onCommitRename?: () => void;
  onCancelRename?: () => void;
  onRemoveSection?: () => void;
  onAdd: () => void;
  /** Tạo hạng mục trống, không rút từ bảng giá. */
  onAddBlank: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** Sửa nhanh một trường ngay trên bảng, dùng cho hai icon Theo dõi. */
  onPatch: (id: string, v: Record<string, unknown>) => void;
  onDuplicate: (s: BudgetService) => void;
  /** Tổng các hạng mục KHÔNG phải phần trăm, để tính phí theo tỷ lệ. */
  pctBase: number;
}) {
  const on = (k: ColKey) => cols.has(k);
  const sum = budgetTotal(rows);
  const qty = rows.reduce((a, s) => a + Number(s.quantity), 0);
  const span = 2 + [...cols].length;

  return (
    <>
      <tr className="bg-surface-2">
        <td className="px-4 py-2">
          {renaming ? (
            <Input
              autoFocus
              value={draft ?? ""}
              className="h-7 w-64"
              onChange={(e) => setDraft?.(e.target.value)}
              onBlur={onCommitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommitRename?.();
                if (e.key === "Escape") onCancelRename?.();
              }}
            />
          ) : (
            <span className="text-[13px] font-bold">{name}</span>
          )}
        </td>
        {on("desc") && <td />}
        {on("unit") && <td />}
        {on("track") && <td />}
        {on("estimate") && <td />}
        {on("quantity") && <td className="num px-3 py-2 text-right font-semibold">{qty}</td>}
        {on("price") && <td />}
        {on("total") && (
          <td className="num px-3 py-2 text-right font-semibold">{money(sum)}</td>
        )}
        <td className="px-2 py-2 text-right">
          {onStartRename && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                aria-label="Tuỳ chọn nhóm"
              >
                <MoreHorizontal size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onSelect={onAdd}>
                  <Plus size={14} /> Thêm hạng mục
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onStartRename}>
                  <Pencil size={14} /> Đổi tên nhóm
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onRemoveSection?.()}
                  className="text-bad focus:text-bad"
                >
                  <Trash2 size={14} /> Xoá nhóm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </td>
      </tr>

      {rows.map((s) => {
        const st = data.serviceTypes.find((t) => t.id === s.service_type_id);
        return (
          <tr
            key={s.id}
            onDoubleClick={() => onEdit(s.id)}
            className="border-b border-line last:border-0 hover:bg-brand-soft/25"
          >
            <td className="px-4 py-2">
              <div className="flex items-start gap-2">
                <span className="mt-1 shrink-0">
                  <RowIcon s={s} />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-ink">{s.name}</div>
                  <div className="text-[11.5px] text-ink-3">{st?.name}</div>
                </div>
              </div>
            </td>
            {on("desc") && (
              <td className="px-3 py-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${BILL_STYLE[s.billing_type]}`}
                >
                  {BILLING_LABEL[s.billing_type]}
                </span>
              </td>
            )}
            {on("unit") && (
              <td className="px-3 py-2 text-[12px] text-ink-2">
                {s.billing_type === "percentage" ? "phần trăm" : (UNIT_LABEL[s.unit] ?? s.unit)}
              </td>
            )}
            {on("track") && (
              <td className="px-3 py-2">
                {/* Hai icon bấm được, tô tím khi bật — không phải chuỗi chữ.
                    Đồng hồ = cho ghi giờ, hoá đơn = cho ghi chi phí. */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    title={s.allow_time ? "Đang cho ghi giờ" : "Không cho ghi giờ"}
                    onClick={() => onPatch(s.id, { allow_time: !s.allow_time })}
                    className={`rounded p-1 transition ${
                      s.allow_time
                        ? "bg-brand-soft text-brand"
                        : "text-ink-3 hover:bg-line/60 hover:text-ink-2"
                    }`}
                  >
                    <Clock size={13} />
                  </button>
                  <button
                    type="button"
                    title={s.allow_expense ? "Đang cho ghi chi phí" : "Không cho ghi chi phí"}
                    onClick={() => onPatch(s.id, { allow_expense: !s.allow_expense })}
                    className={`rounded p-1 transition ${
                      s.allow_expense
                        ? "bg-brand-soft text-brand"
                        : "text-ink-3 hover:bg-line/60 hover:text-ink-2"
                    }`}
                  >
                    <Receipt size={13} />
                  </button>
                </div>
              </td>
            )}
            {on("estimate") && (
              <td className="num px-3 py-2 text-right text-ink-2">
                {s.estimate ? `${s.estimate}` : "—"}
              </td>
            )}
            {on("quantity") && (
              <td className="num px-3 py-2 text-right">
                {/* Hạng mục phần trăm: số lượng CHÍNH LÀ tỷ lệ phần trăm */}
                {s.billing_type === "percentage"
                  ? `${s.quantity} %`
                  : on("unit")
                    ? s.quantity
                    : `${s.quantity} ${UNIT_LABEL[s.unit] ?? s.unit}`}
              </td>
            )}
            {on("price") && (
              <td className="num px-3 py-2 text-right">
                {/* Phần trăm không có đơn giá riêng, nó ăn theo tổng bên dưới */}
                {s.billing_type === "percentage" ? (
                  <span className="text-ink-3">—</span>
                ) : (
                  money(s.price)
                )}
              </td>
            )}
            {on("total") && (
              <td className="num px-3 py-2 text-right font-semibold">
                {s.billing_type === "non_billable" ? (
                  <span className="text-ink-3">0</span>
                ) : (
                  money(Math.round(serviceTotal(s, pctBase)))
                )}
              </td>
            )}
            <td className="px-2 py-2">
              <div className="flex justify-end gap-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(s.id)}
                  className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                  aria-label="Sửa hạng mục"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(s)}
                  className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                  aria-label="Nhân bản hạng mục"
                  title="Nhân bản"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(s.id)}
                  className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                  aria-label="Xoá hạng mục"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </td>
          </tr>
        );
      })}

      {/* Cặp nút dưới TỪNG nhóm, đúng như Productive: nút mặc định tạo hạng
          mục trống, nút phụ mới là rút từ bảng giá. Trước đây chỉ có một nút
          chung trên toolbar và luôn bắt rút bảng giá — không tạo được hạng
          mục ad-hoc, mà việc đó thì hay gặp. */}
      <tr>
        <td colSpan={span} className="px-4 py-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddBlank}
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand hover:underline"
            >
              <Plus size={13} /> Hạng mục mới
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2 hover:text-brand"
            >
              <Plus size={13} /> Rút từ bảng giá
            </button>
            {rows.length === 0 && (
              <span className="text-[12px] text-ink-3">Nhóm này chưa có hạng mục.</span>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-3 ${className}`}
    >
      {children}
    </th>
  );
}

/* -------- Dialog thêm hạng mục: rút giá từ bảng giá -------- */

function ServiceDialog({
  open,
  data,
  budget,
  sectionId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  data: FinanceData;
  budget: Budget;
  sectionId: string | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const cards = rateCardsForClient(data.rateCards, budget.client_id);
  const own = cards.find((c) => c.client_id === budget.client_id);
  const [cardId, setCardId] = useState(own?.id ?? cards[0]?.id ?? "");
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [estimate, setEstimate] = useState("");
  const [billing, setBilling] = useState<BillingType>("tm");
  const [allowTime, setAllowTime] = useState(true);
  const [allowExpense, setAllowExpense] = useState(false);

  const items = data.rateCardItems.filter((i) => i.rate_card_id === cardId);
  const item = items.find((i) => i.id === itemId);
  const st = item ? data.serviceTypes.find((s) => s.id === item.service_type_id) : null;
  const unitPrice = item ? effectivePrice(item) : 0;
  const total = item && qty ? Number(qty) * unitPrice : 0;

  // Rút sẵn mọi cấu hình đã khai trên bảng giá — đỡ phải khai lại từng hợp đồng.
  const pick = (id: string) => {
    setItemId(id);
    const it = data.rateCardItems.find((i) => i.id === id);
    if (!it) return;
    const t = data.serviceTypes.find((s) => s.id === it.service_type_id);
    // Tên dòng giá là thứ người dùng đặt, ưu tiên nó trước mô tả và tên loại
    if (!name) setName(it.name?.trim() || it.description?.trim() || t?.name || "");
    setBilling(it.billing_type ?? (it.unit === "piece" ? "fixed" : "tm"));
    setAllowTime(it.allow_time ?? true);
    setAllowExpense(it.allow_expense ?? it.unit === "piece");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Thêm hạng mục bán</DialogTitle>
          <DialogDescription>
            Rút đơn giá từ bảng giá của khách, rồi điền số lượng để ra thành tiền.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <L label="Bảng giá">
              <Select
                value={cardId}
                onValueChange={(v) => {
                  setCardId(v);
                  setItemId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.client_id ? c.name : `${c.name} (chuẩn)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
            <L label="Loại dịch vụ" required>
              <Select value={itemId} onValueChange={pick}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn từ bảng giá" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => {
                    const t = data.serviceTypes.find((s) => s.id === i.service_type_id);
                    // Hiện TÊN DÒNG, không phải tên loại: hai dòng cùng loại
                    // mà hiện tên loại thì trông y hệt nhau, không chọn đúng được.
                    return (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name ?? t?.name} — {money(Math.round(effectivePrice(i)))}/
                        {UNIT_LABEL[i.unit] ?? i.unit}
                        {i.name && t && (
                          <span className="ml-1.5 text-[11px] text-ink-3">{t.name}</span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </L>
          </div>

          <L label="Tên hạng mục" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={st ? `${st.name} module Mở tài khoản` : "Tên hiện trên hợp đồng"}
            />
          </L>

          <L label="Cách tính tiền">
            <Select value={billing} onValueChange={(v) => setBilling(v as BillingType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BILLING_LABEL) as BillingType[]).map((b) => (
                  <SelectItem key={b} value={b}>
                    {BILLING_LABEL[b]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11.5px] text-ink-3">{BILLING_NOTE[billing]}</p>
          </L>

          <div className="grid grid-cols-2 gap-3">
            <L
              label={
                billing === "percentage"
                  ? "Tỷ lệ (%)"
                  : `Số lượng bán (${item ? (UNIT_LABEL[item.unit] ?? item.unit) : "đơn vị"})`
              }
              required
            >
              <Input
                className="num"
                inputMode="decimal"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="500"
              />
            </L>
            <L label="Ước tính làm hết">
              <Input
                className="num"
                inputMode="decimal"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={billing === "fixed" ? "480" : "= số lượng bán"}
                disabled={billing === "tm"}
              />
            </L>
          </div>
          {billing === "fixed" && (
            <p className="-mt-1 text-[11.5px] text-ink-3">
              Với trọn gói, ước tính có thể thấp hơn số lượng bán — phần chênh là lãi dự kiến.
            </p>
          )}

          <div className="flex gap-4 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <Check checked={allowTime} onChange={setAllowTime} label="Cho log giờ" />
            <Check checked={allowExpense} onChange={setAllowExpense} label="Cho ghi chi phí" />
          </div>
          {!allowTime && billing === "fixed" && (
            <p className="-mt-1 text-[11.5px] text-warn">
              Bán trọn gói mà tắt log giờ thì không biết tốn bao nhiêu công — không tính được lãi lỗ.
            </p>
          )}

          {item && qty && (
            <div className="flex items-baseline justify-between rounded-lg bg-brand-soft px-3 py-2">
              <span className="text-[12.5px] text-ink-2">
                {qty} {UNIT_LABEL[item.unit]} × {money(Math.round(unitPrice))}
              </span>
              <span className="num text-[15px] font-bold text-brand">
                {billing === "non_billable" ? "0" : money(total)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!item || !name.trim() || !qty}
            onClick={() =>
              onSubmit({
                budget_id: budget.id,
                section_id: sectionId,
                service_type_id: item!.service_type_id,
                name: name.trim(),
                billing_type: billing,
                unit: item!.unit,
                quantity: Number(qty),
                price: Math.round(unitPrice),
                estimate: billing === "tm" ? Number(qty) : estimate ? Number(estimate) : null,
                allow_time: allowTime,
                allow_expense: allowExpense,
              })
            }
          >
            Thêm vào hợp đồng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function L({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </span>
      {children}
    </label>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12.5px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--brand)]"
      />
      {label}
    </label>
  );
}

/* -------- Sửa hạng mục: số lượng, giá, cách tính, nhóm -------- */

/**
 * Tạo hạng mục TRỐNG, không rút từ bảng giá.
 *
 * Productive đặt đây làm nút mặc định ("New item"), rút bảng giá chỉ là nút
 * phụ. Trước đây tôi chỉ có đường rút bảng giá, nên mọi hạng mục ad-hoc —
 * một khoản thoả thuận riêng, một phần việc phát sinh — đều phải tạo dòng giá
 * giả trong bảng giá trước, rất ngược.
 */
function BlankServiceDialog({
  open,
  data,
  budget,
  sectionId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  data: FinanceData;
  budget: Budget;
  sectionId: string | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [billing, setBilling] = useState<BillingType>("tm");
  const [unit, setUnit] = useState<"hour" | "day" | "piece">("hour");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [estimate, setEstimate] = useState("");
  const [allowTime, setAllowTime] = useState(true);
  const [allowExpense, setAllowExpense] = useState(false);

  const types = data.serviceTypes.filter((t) => !t.is_archived);
  const isPct = billing === "percentage";
  const ok = name.trim() && typeId && qty && (isPct || price);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Hạng mục mới</DialogTitle>
          <DialogDescription>
            Tạo thẳng một hạng mục cho hợp đồng này, không lấy từ bảng giá. Dùng khi có khoản
            thoả thuận riêng không nằm trong biểu giá chuẩn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <L label="Tên hạng mục" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </L>

          <div className="grid grid-cols-2 gap-3">
            <L label="Loại dịch vụ" required>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
            <L label="Cách tính tiền">
              <Select value={billing} onValueChange={(v) => setBilling(v as BillingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(BILLING_LABEL) as BillingType[]).map((b) => (
                    <SelectItem key={b} value={b}>
                      {BILLING_LABEL[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
          </div>

          <p className="-mt-1 text-[11.5px] text-ink-3">{BILLING_NOTE[billing]}</p>

          <div className="grid grid-cols-3 gap-3">
            <L label={isPct ? "Tỷ lệ (%)" : "Số lượng"} required>
              <Input className="num" value={qty} onChange={(e) => setQty(e.target.value)} />
            </L>
            {!isPct && (
              <>
                <L label="Đơn vị">
                  <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">giờ</SelectItem>
                      <SelectItem value="day">ngày</SelectItem>
                      <SelectItem value="piece">gói</SelectItem>
                    </SelectContent>
                  </Select>
                </L>
                <L label="Đơn giá" required>
                  <Input className="num" value={price} onChange={(e) => setPrice(e.target.value)} />
                </L>
              </>
            )}
          </div>

          <L label="Giờ dự kiến (để trống thì lấy bằng số lượng)">
            <Input
              className="num"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
            />
          </L>

          <div className="flex flex-wrap gap-4 rounded-lg border border-line px-3 py-2.5">
            <label className="flex items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                checked={allowTime}
                onChange={(e) => setAllowTime(e.target.checked)}
              />
              Cho ghi giờ
            </label>
            <label className="flex items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                checked={allowExpense}
                onChange={(e) => setAllowExpense(e.target.checked)}
              />
              Cho ghi chi phí
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!ok}
            onClick={() => {
              onSubmit({
                budget_id: budget.id,
                section_id: sectionId,
                name: name.trim(),
                service_type_id: typeId,
                billing_type: billing,
                unit: isPct ? "hour" : unit,
                quantity: Number(qty),
                price: isPct ? 0 : Number(price),
                estimate: estimate ? Number(estimate) : Number(qty),
                allow_time: allowTime,
                allow_expense: allowExpense,
              });
              onClose();
            }}
          >
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditServiceDialog({
  open,
  service,
  sections,
  onClose,
  onSubmit,
}: {
  open: boolean;
  service: FinanceData["services"][number] | null;
  sections: FinanceData["sections"];
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [qty, setQty] = useState(service ? String(service.quantity) : "");
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [estimate, setEstimate] = useState(service?.estimate ? String(service.estimate) : "");
  const [billing, setBilling] = useState<BillingType>(service?.billing_type ?? "tm");
  const [sectionId, setSectionId] = useState(service?.section_id ?? "none");
  const [allowTime, setAllowTime] = useState(service?.allow_time ?? true);
  const [allowExpense, setAllowExpense] = useState(service?.allow_expense ?? false);

  if (!service) return null;
  const total = billing === "non_billable" ? 0 : Number(qty || 0) * Number(price || 0);
  const changed = Number(price) !== service.price;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Sửa hạng mục</DialogTitle>
          <DialogDescription>
            Số lượng và đơn giá thường thay đổi khi đàm phán — sửa tại đây, tổng hợp đồng tự tính lại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <L label="Tên hạng mục" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </L>

          <div className="grid grid-cols-2 gap-3">
            <L label="Cách tính tiền">
              <Select value={billing} onValueChange={(v) => setBilling(v as BillingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(BILLING_LABEL) as BillingType[]).map((b) => (
                    <SelectItem key={b} value={b}>
                      {BILLING_LABEL[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
            <L label="Thuộc nhóm">
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa phân nhóm</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
          </div>
          <p className="-mt-1 text-[11.5px] text-ink-3">{BILLING_NOTE[billing]}</p>

          <div className="grid grid-cols-3 gap-3">
            <L
              label={
                billing === "percentage"
                  ? "Tỷ lệ (%)"
                  : `Số lượng (${UNIT_LABEL[service.unit] ?? service.unit})`
              }
              required
            >
              <Input
                className="num"
                inputMode="decimal"
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </L>
            <L label="Đơn giá" required>
              <Input
                className="num"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
              />
            </L>
            <L label="Ước tính">
              <Input
                className="num"
                inputMode="decimal"
                value={estimate}
                disabled={billing === "tm"}
                placeholder={billing === "tm" ? "= số lượng" : ""}
                onChange={(e) => setEstimate(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </L>
          </div>

          {changed && (
            <p className="-mt-1 text-[11.5px] text-warn">
              Đơn giá khác bảng giá gốc — chỉ áp dụng cho hợp đồng này, bảng giá không đổi.
            </p>
          )}

          <div className="flex gap-4 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <Check checked={allowTime} onChange={setAllowTime} label="Cho log giờ" />
            <Check checked={allowExpense} onChange={setAllowExpense} label="Cho ghi chi phí" />
          </div>

          <div className="flex items-baseline justify-between rounded-lg bg-brand-soft px-3 py-2">
            <span className="text-[12.5px] text-ink-2">
              {qty || 0} {UNIT_LABEL[service.unit]} × {money(Number(price || 0))}
            </span>
            <span className="num text-[15px] font-bold text-brand">{money(total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!name.trim() || !qty || !price}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                billing_type: billing,
                section_id: sectionId === "none" ? null : sectionId,
                quantity: Number(qty),
                price: Number(price),
                estimate: billing === "tm" ? Number(qty) : estimate ? Number(estimate) : null,
                allow_time: allowTime,
                allow_expense: allowExpense,
              })
            }
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------- Sửa thông tin hợp đồng -------- */

function EditBudgetDialog({
  open,
  budget,
  onClose,
  onSubmit,
}: {
  open: boolean;
  budget: Budget;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(budget.name);
  const [code, setCode] = useState(budget.code ?? "");
  const [start, setStart] = useState(budget.start_date ?? "");
  const [end, setEnd] = useState(budget.end_date ?? "");
  const [note, setNote] = useState(budget.note ?? "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Sửa hợp đồng</DialogTitle>
          <DialogDescription>
            Khách hàng không đổi được sau khi tạo — đơn giá các hạng mục đã rút từ bảng giá của khách này.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <L label="Tên hợp đồng" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </L>
          <L label="Số hợp đồng">
            <Input className="num" value={code} onChange={(e) => setCode(e.target.value)} />
          </L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Từ ngày">
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </L>
            <L label="Đến ngày">
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </L>
          </div>
          <L label="Ghi chú">
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </L>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                code: code.trim() || null,
                start_date: start || null,
                end_date: end || null,
                note: note.trim() || null,
              })
            }
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function fmtDate(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

/* -------- Giá vốn riêng cho hợp đồng này -------- */

function BudgetCostRatesDialog({
  open,
  budget,
  data,
  users,
  onClose,
  onSave,
  onRemove,
}: {
  open: boolean;
  budget: Budget;
  data: FinanceData;
  users: User[];
  onClose: () => void;
  onSave: (userId: string, rate: number) => void;
  onRemove: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [userId, setUserId] = useState("");
  const [rate, setRate] = useState("");

  const rows = data.budgetCostRates.filter((r) => r.budget_id === budget.id);
  const used = new Set(rows.map((r) => r.user_id));
  const options = users.filter((u) => !used.has(u.id));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Giá vốn riêng cho hợp đồng này</DialogTitle>
          <DialogDescription>
            Đè lên giá vốn mặc định của từng người, chỉ trong hợp đồng này. Dùng khi cùng một
            cộng tác viên tính giá khác nhau giữa các dự án.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {rows.length === 0 && !adding && (
            <p className="rounded-lg border border-line bg-surface-2 px-3 py-4 text-center text-[12.5px] text-ink-3">
              Chưa đặt giá riêng. Mọi người đang dùng giá vốn mặc định của mình.
            </p>
          )}

          {rows.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-line">
              {rows.map((r) => {
                const u = users.find((x) => x.id === r.user_id);
                const def = costRateFor(data, r.user_id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: u?.avatar_color }}
                    >
                      {u?.initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium">{u?.full_name ?? "—"}</div>
                      <div className="text-[11px] text-ink-3">
                        mặc định {money(Math.round(def.total))} đ/giờ
                      </div>
                    </div>
                    <span className="num text-[13.5px] font-semibold">{money(r.rate)}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(r.id)}
                      className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                      aria-label="Bỏ giá riêng"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {adding ? (
            <div className="flex items-end gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
              <L label="Người">
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Chọn người" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </L>
              <L label="Giá vốn mỗi giờ">
                <Input
                  className="num w-32"
                  inputMode="numeric"
                  value={rate}
                  placeholder="200000"
                  onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ""))}
                />
              </L>
              <Button
                size="sm"
                disabled={!userId || !rate}
                onClick={() => {
                  onSave(userId, Number(rate));
                  setUserId("");
                  setRate("");
                  setAdding(false);
                }}
              >
                Thêm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Huỷ
              </Button>
            </div>
          ) : (
            options.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
                <Plus size={13} /> Thêm người
              </Button>
            )
          )}

          <p className="text-[11.5px] text-ink-3">
            Bỏ giá riêng thì chi phí của những giờ đã log trong hợp đồng này sẽ được tính lại
            theo giá vốn mặc định.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

