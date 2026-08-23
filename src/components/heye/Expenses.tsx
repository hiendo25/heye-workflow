import { useMemo, useState } from "react";
import {
  Check,
  Copy as CopyIcon,
  Paperclip,
  Plus,
  Receipt,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  expenseItemAmounts,
  expenseServices,
  expenseTotals,
  whyCannotExpense,
  EXPENSE_STATUS_LABEL,
  money,
  type Expense,
  type ExpenseItem,
  type ExpenseStatus,
  type FinanceData,
} from "@/lib/finance-data";
import type { User } from "@/lib/heye-data";

const STATUS_STYLE: Record<ExpenseStatus, string> = {
  approved: "bg-good-soft text-good",
  submitted: "bg-warn-soft text-warn",
  changes_requested: "bg-bad-soft text-bad",
  cancelled: "bg-line text-ink-3",
};

type Draft = {
  description: string;
  unit_price: string;
  quantity: string;
  tax_rate: string;
  tax_included: boolean;
};

/**
 * Chi phí — nguồn thứ hai sinh ra cost, bên cạnh giờ nhân sự.
 * Thầu phụ, bản quyền, thiết bị, đi lại.
 */
export function Expenses({
  data,
  users,
  nsId,
  onCreate,
  onUpdate,
  onDelete,
  onSetStatus,
  onDuplicate,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  onCreate: (expense: Record<string, unknown>, items: Record<string, unknown>[]) => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: ExpenseStatus, note?: string) => void;
  onDuplicate: (expense: Expense) => void;
}) {
  const [filter, setFilter] = useState<"all" | ExpenseStatus>("all");
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<Expense | null>(null);

  const list = data.expenses.filter((e) => filter === "all" || e.status === filter);
  const canLog = expenseServices(data.services);

  const totals = useMemo(() => {
    let cost = 0;
    let billable = 0;
    for (const e of data.expenses) {
      if (e.status === "cancelled" || e.status === "changes_requested") continue;
      const t = expenseTotals(e, data.expenseItems);
      cost += t.net;
      const s = data.services.find((x) => x.id === e.service_id);
      if (e.status === "approved" && s?.billing_type !== "non_billable") billable += t.billable;
    }
    return { cost, billable, profit: billable - cost };
  }, [data.expenses, data.expenseItems, data.services]);

  const pending = data.expenses.filter((e) => e.status === "submitted").length;

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-bold tracking-tight">Chi phí</h1>
          <p className="mt-1 max-w-[72ch] text-[13px] text-ink-2">
            Tiền chi ra ngoài lương: thầu phụ, bản quyền, thiết bị, đi lại. Ghi vào hạng mục
            đơn vị <b>gói</b> đã bật cho ghi chi phí.
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} disabled={canLog.length === 0}>
          <Plus size={13} /> Thêm chi phí
        </Button>
      </div>

      {canLog.length === 0 && (
        <div className="mt-3 rounded-lg border-l-[3px] border-warn bg-warn-soft px-3.5 py-2.5 text-[12.5px]">
          Chưa hạng mục nào ghi được chi phí. Hạng mục cần đơn vị <b>gói</b> và bật{" "}
          <b>cho ghi chi phí</b> trong hợp đồng.
        </div>
      )}

      {/* Ba con số tổng */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Chi ra" value={money(Math.round(totals.cost))} />
        <Stat label="Tính cho khách" value={money(Math.round(totals.billable))} />
        <Stat
          label="Lãi từ chi phí"
          value={money(Math.round(totals.profit))}
          tone={totals.profit >= 0 ? "good" : "bad"}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Chip on={filter === "all"} onClick={() => setFilter("all")}>
          Tất cả ({data.expenses.length})
        </Chip>
        {(Object.keys(EXPENSE_STATUS_LABEL) as ExpenseStatus[]).map((st) => {
          const n = data.expenses.filter((e) => e.status === st).length;
          if (!n) return null;
          return (
            <Chip key={st} on={filter === st} onClick={() => setFilter(st)}>
              {EXPENSE_STATUS_LABEL[st]} ({n})
            </Chip>
          );
        })}
        {pending > 0 && (
          <>
            <div className="flex-1" />
            <span className="text-[12px] text-ink-3">
              {pending} phiếu chờ duyệt — đã tính vào chi phí, chưa tính doanh thu
            </span>
          </>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
        {list.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Receipt size={24} className="mx-auto text-ink-3" />
            <p className="mt-3 text-[13px] text-ink-3">Chưa có phiếu chi phí nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-ink-3">
                  <Th className="text-left">Nội dung</Th>
                  <Th className="text-left">Hạng mục</Th>
                  <Th className="text-left">Người nộp</Th>
                  <Th className="text-right">Chi ra</Th>
                  <Th className="text-right">Tính khách</Th>
                  <Th className="text-center">Trạng thái</Th>
                  <Th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {list.map((e) => {
                  const t = expenseTotals(e, data.expenseItems);
                  const s = data.services.find((x) => x.id === e.service_id);
                  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
                  const who = users.find((u) => u.id === e.user_id);
                  const free = s?.billing_type === "non_billable";
                  const rows = data.expenseItems.filter((i) => i.expense_id === e.id);
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setOpen(e)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-brand-soft/25"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-ink">{e.reference}</div>
                        <div className="text-[11.5px] text-ink-3">
                          {fmtDay(e.date)}
                          {e.vendor && ` · ${e.vendor}`}
                          {rows.length > 1 && ` · ${rows.length} dòng`}
                          {e.attachment_name && " · có tệp"}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="truncate text-[12.5px]">{s?.name ?? "—"}</div>
                        <div className="truncate text-[11px] text-ink-3">{b?.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[9.5px] font-bold text-white"
                            style={{ backgroundColor: who?.avatar_color ?? "#8B87A0" }}
                          >
                            {who?.initial ?? "?"}
                          </span>
                          <span className="text-[12.5px]">{who?.full_name ?? "—"}</span>
                        </span>
                      </td>
                      <td className="num px-3 py-2 text-right font-semibold">
                        {money(Math.round(t.net))}
                      </td>
                      <td className="num px-3 py-2 text-right">
                        {free ? (
                          <span className="text-[11.5px] text-ink-3">không tính tiền</span>
                        ) : e.status === "approved" ? (
                          <span className="font-semibold text-good">
                            {money(Math.round(t.billable))}
                          </span>
                        ) : (
                          <span className="text-ink-3">{money(Math.round(t.billable))}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLE[e.status]}`}
                        >
                          {EXPENSE_STATUS_LABEL[e.status]}
                        </span>
                      </td>
                      <td className="px-2 py-2" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex justify-end gap-0.5">
                          {e.status === "submitted" && (
                            <button
                              type="button"
                              onClick={() => onSetStatus(e.id, "approved")}
                              className="rounded p-1 text-good hover:bg-good-soft"
                              aria-label="Duyệt"
                            >
                              <Check size={13} />
                            </button>
                          )}
                          {e.status === "approved" && (
                            <button
                              type="button"
                              onClick={() => onSetStatus(e.id, "submitted")}
                              className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                              aria-label="Bỏ duyệt"
                            >
                              <Undo2 size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDuplicate(e)}
                            className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                            aria-label="Nhân đôi"
                            title="Nhân đôi phiếu này"
                          >
                            <CopyIcon size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(e.id)}
                            className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                            aria-label="Xoá"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11.5px] text-ink-3">
        Phiếu <b>chờ duyệt</b> đã tính vào chi phí nhưng chưa sinh doanh thu — nguyên tắc thận
        trọng: ghi chi phí sớm nhất, ghi doanh thu muộn nhất.
      </p>

      {adding && (
        <ExpenseDialog
          data={data}
          users={users}
          nsId={nsId}
          onClose={() => setAdding(false)}
          onSubmit={(exp, items) => {
            onCreate(exp, items);
            setAdding(false);
          }}
        />
      )}

      {open && (
        <ExpenseSheet
          expense={open}
          data={data}
          users={users}
          onClose={() => setOpen(null)}
          onUpdate={onUpdate}
          onSetStatus={onSetStatus}
        />
      )}
    </>
  );
}

/* ============ Panel xem chi tiết ============ */

function ExpenseSheet({
  expense,
  data,
  users,
  onClose,
  onUpdate,
  onSetStatus,
}: {
  expense: Expense;
  data: FinanceData;
  users: User[];
  onClose: () => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onSetStatus: (id: string, status: ExpenseStatus, note?: string) => void;
}) {
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);

  const items = data.expenseItems.filter((i) => i.expense_id === expense.id);
  const t = expenseTotals(expense, data.expenseItems);
  const s = data.services.find((x) => x.id === expense.service_id);
  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
  const who = users.find((u) => u.id === expense.user_id);
  const free = s?.billing_type === "non_billable";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose}>
      <div
        className="scroll-y h-full w-full max-w-[680px] bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold">{expense.reference}</h2>
            <div className="text-[11.5px] text-ink-3">
              {fmtDay(expense.date)} · {who?.full_name}
              {expense.vendor && ` · ${expense.vendor}`}
            </div>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[expense.status]}`}
          >
            {EXPENSE_STATUS_LABEL[expense.status]}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-3 hover:bg-brand-soft hover:text-brand"
            aria-label="Đóng"
          >
            <X size={17} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          {expense.review_note && expense.status === "changes_requested" && (
            <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3.5 py-2.5 text-[12.5px]">
              Yêu cầu sửa: {expense.review_note}
            </div>
          )}

          <section className="rounded-xl border border-line bg-surface p-4">
            <h3 className="mb-2.5 text-[12.5px] font-bold">Ghi vào hạng mục</h3>
            <div className="text-[13px] font-medium">{s?.name}</div>
            <div className="text-[11.5px] text-ink-3">{b?.name}</div>
            {free && (
              <p className="mt-2 rounded bg-surface-2 px-2.5 py-1.5 text-[11.5px] text-ink-3">
                Hạng mục không tính tiền: chi phí này không sinh doanh thu.
              </p>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider text-ink-3">
                  <Th className="text-left">Nội dung</Th>
                  <Th className="text-right">Đơn giá</Th>
                  <Th className="text-right">SL</Th>
                  <Th className="text-right">Thuế</Th>
                  <Th className="text-right">Trước thuế</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const a = expenseItemAmounts(i);
                  return (
                    <tr key={i.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2">{i.description}</td>
                      <td className="num px-3 py-2 text-right">{money(i.unit_price)}</td>
                      <td className="num px-3 py-2 text-right">{i.quantity}</td>
                      <td className="num px-3 py-2 text-right text-ink-3">
                        {i.tax_rate}%{i.tax_included ? " (đã gồm)" : ""}
                      </td>
                      <td className="num px-3 py-2 text-right font-semibold">
                        {money(Math.round(a.net))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 text-[12.5px]">
            <Line label="Tổng trước thuế" value={money(Math.round(t.net))} />
            <Line label="Thuế đầu vào" value={money(Math.round(t.tax))} muted />
            <Line label="Trả nhà cung cấp" value={money(Math.round(t.gross))} bold />
            <div className="my-2 border-t border-line" />
            <Line
              label={`Phụ giá ${
                expense.markup_type === "percent" ? `${expense.markup_value}%` : "cố định"
              }`}
              value={free ? "—" : money(Math.round(t.billable))}
              muted
            />
            <Line
              label="Lãi"
              value={free ? "0" : money(Math.round(t.profit))}
              bold
              tone={free ? undefined : t.profit >= 0 ? "good" : "bad"}
            />
            <p className="mt-2 text-[11px] text-ink-3">
              Phụ giá tính trên giá trước thuế. Thuế đầu vào là tiền trả nhà cung cấp, khi xuất
              hoá đơn cho khách sẽ áp thuế riêng.
            </p>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <h3 className="mb-2.5 text-[12.5px] font-bold">Thanh toán</h3>
            <div className="flex flex-wrap gap-2">
              <Toggle
                on={expense.is_paid}
                onClick={() =>
                  onUpdate(expense.id, {
                    is_paid: !expense.is_paid,
                    paid_at: expense.is_paid ? null : new Date().toISOString().slice(0, 10),
                  })
                }
              >
                {expense.is_paid ? "Đã trả nhà cung cấp" : "Chưa trả nhà cung cấp"}
              </Toggle>
              <Toggle
                on={expense.is_reimbursed}
                onClick={() => onUpdate(expense.id, { is_reimbursed: !expense.is_reimbursed })}
              >
                {expense.is_reimbursed ? "Đã hoàn tiền người nộp" : "Chưa hoàn tiền người nộp"}
              </Toggle>
            </div>
          </section>

          {expense.status === "submitted" && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onSetStatus(expense.id, "approved")}>
                <Check size={14} /> Duyệt
              </Button>
              <Button variant="outline" onClick={() => setAsking(true)}>
                Yêu cầu sửa
              </Button>
            </div>
          )}

          {asking && (
            <div className="rounded-xl border border-line bg-surface p-3">
              <Input
                autoFocus
                value={note}
                placeholder="Cần sửa gì"
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  disabled={!note.trim()}
                  onClick={() => {
                    onSetStatus(expense.id, "changes_requested", note.trim());
                    setAsking(false);
                    onClose();
                  }}
                >
                  Gửi
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAsking(false)}>
                  Huỷ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ Form nộp chi phí ============ */

function ExpenseDialog({
  data,
  users,
  nsId,
  onClose,
  onSubmit,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  onClose: () => void;
  onSubmit: (expense: Record<string, unknown>, items: Record<string, unknown>[]) => void;
}) {
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [serviceId, setServiceId] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState("");
  const [markupType, setMarkupType] = useState<"percent" | "fixed">("percent");
  const [markup, setMarkup] = useState("0");
  const [attachment, setAttachment] = useState("");
  const [rows, setRows] = useState<Draft[]>([
    { description: "", unit_price: "", quantity: "1", tax_rate: "10", tax_included: false },
  ]);

  const options = expenseServices(data.services);
  const service = data.services.find((s) => s.id === serviceId);
  const free = service?.billing_type === "non_billable";
  const blocked = serviceId ? whyCannotExpense(data, serviceId) : null;

  const amounts = rows.map((r) =>
    expenseItemAmounts({
      id: "",
      expense_id: "",
      description: r.description,
      unit_price: Number(r.unit_price || 0),
      quantity: Number(r.quantity || 0),
      tax_rate: Number(r.tax_rate || 0),
      tax_included: r.tax_included,
      position: 0,
    }),
  );
  const net = amounts.reduce((a, x) => a + x.net, 0);
  const tax = amounts.reduce((a, x) => a + x.tax, 0);
  const billable =
    markupType === "fixed" ? Number(markup || 0) : net * (1 + Number(markup || 0) / 100);

  const setRow = (i: number, patch: Partial<Draft>) =>
    setRows((r) => r.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  const valid =
    reference.trim() && serviceId && userId && !blocked && rows.some((r) => r.description.trim());

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Thêm chi phí</DialogTitle>
          <DialogDescription>
            Tiền chi ra ngoài lương. Một phiếu có thể nhiều dòng — chuyến công tác gồm vé, khách
            sạn, taxi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h4 className="mb-2 text-[12px] font-bold">Thông tin chi phí</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <L label="Người nộp" required>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </L>
              <L label="Ngày chi">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </L>
              <L label="Nhà cung cấp">
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
              </L>
              <L label="Tệp đính kèm">
                <Input
                  value={attachment}
                  placeholder="hoa-don.pdf"
                  onChange={(e) => setAttachment(e.target.value)}
                />
              </L>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-[12px] font-bold">Ghi vào đâu</h4>
            <div className="grid grid-cols-2 gap-3">
              <L label="Hạng mục" required>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hạng mục" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {data.budgets.map((b) => {
                      const items = options.filter((s) => s.budget_id === b.id);
                      if (!items.length) return null;
                      return (
                        <SelectGroup key={b.id}>
                          <SelectLabel className="text-[11px] text-ink-3">{b.name}</SelectLabel>
                          {items.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
              </L>
              <L label="Nội dung" required>
                <Input
                  value={reference}
                  placeholder="Bản quyền cơ sở dữ liệu"
                  onChange={(e) => setReference(e.target.value)}
                />
              </L>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <h4 className="text-[12px] font-bold">Các dòng chi</h4>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() =>
                  setRows((r) => [
                    ...r,
                    { description: "", unit_price: "", quantity: "1", tax_rate: "10", tax_included: false },
                  ])
                }
                className="text-[12px] font-medium text-brand hover:underline"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-wider text-ink-3">
                    <Th className="text-left">Nội dung</Th>
                    <Th className="w-28 text-right">Đơn giá</Th>
                    <Th className="w-16 text-right">SL</Th>
                    <Th className="w-20 text-right">Thuế %</Th>
                    <Th className="w-28 text-right">Trước thuế</Th>
                    <Th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="px-2 py-1.5">
                        <Input
                          value={r.description}
                          placeholder="Mô tả"
                          className="h-7 border-0 px-1 shadow-none"
                          onChange={(e) => setRow(i, { description: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          className="num h-7 border-0 px-1 text-right shadow-none"
                          inputMode="numeric"
                          value={r.unit_price}
                          onChange={(e) =>
                            setRow(i, { unit_price: e.target.value.replace(/[^\d]/g, "") })
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          className="num h-7 border-0 px-1 text-right shadow-none"
                          inputMode="decimal"
                          value={r.quantity}
                          onChange={(e) =>
                            setRow(i, { quantity: e.target.value.replace(/[^\d.]/g, "") })
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          className="num h-7 border-0 px-1 text-right shadow-none"
                          inputMode="decimal"
                          value={r.tax_rate}
                          onChange={(e) =>
                            setRow(i, { tax_rate: e.target.value.replace(/[^\d.]/g, "") })
                          }
                        />
                      </td>
                      <td className="num px-2 py-1.5 text-right font-semibold">
                        {money(Math.round(amounts[i]?.net ?? 0))}
                      </td>
                      <td className="px-1 py-1.5">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRows((x) => x.filter((_, n) => n !== i))}
                            className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                            aria-label="Xoá dòng"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-ink-2">
              <input
                type="checkbox"
                checked={rows[0]?.tax_included ?? false}
                onChange={(e) => setRows((r) => r.map((x) => ({ ...x, tax_included: e.target.checked })))}
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
              Đơn giá đã gồm thuế
            </label>
          </section>

          {!free && (
            <section>
              <h4 className="mb-2 text-[12px] font-bold">Tính cho khách</h4>
              <div className="grid grid-cols-2 gap-3">
                <L label="Kiểu phụ giá">
                  <Select
                    value={markupType}
                    onValueChange={(v) => setMarkupType(v as "percent" | "fixed")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Cộng phần trăm</SelectItem>
                      <SelectItem value="fixed">Ấn định số tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </L>
                <L label={markupType === "percent" ? "Phụ giá (%)" : "Số tiền bán khách"}>
                  <Input
                    className="num"
                    inputMode="numeric"
                    value={markup}
                    onChange={(e) => setMarkup(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </L>
              </div>
              {markupType === "fixed" && (
                <p className="mt-1 text-[11.5px] text-ink-3">
                  Dùng khi nhà cung cấp xuất hoá đơn thẳng cho khách: giá vốn để 0, ấn định số
                  tiền mình tính.
                </p>
              )}
            </section>
          )}

          {blocked && (
            <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3.5 py-2.5 text-[12.5px]">
              {blocked}
            </div>
          )}

          {net > 0 && !blocked && (
            <div className="rounded-lg bg-brand-soft px-3.5 py-2.5 text-[12.5px]">
              <Line label="Tổng trước thuế" value={money(Math.round(net))} />
              <Line label="Thuế đầu vào" value={money(Math.round(tax))} muted />
              <Line label="Trả nhà cung cấp" value={money(Math.round(net + tax))} bold />
              {!free && (
                <>
                  <div className="my-1.5 border-t border-brand/20" />
                  <Line label="Tính cho khách" value={money(Math.round(billable))} />
                  <Line
                    label="Lãi"
                    value={money(Math.round(billable - net))}
                    bold
                    tone={billable - net >= 0 ? "good" : "bad"}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!valid}
            onClick={() =>
              onSubmit(
                {
                  namespace_id: nsId,
                  user_id: userId,
                  service_id: serviceId,
                  reference: reference.trim(),
                  date,
                  vendor: vendor.trim() || null,
                  attachment_name: attachment.trim() || null,
                  markup_type: markupType,
                  markup_value: Number(markup || 0),
                  status: "submitted",
                },
                rows
                  .filter((r) => r.description.trim())
                  .map((r, i) => ({
                    description: r.description.trim(),
                    unit_price: Number(r.unit_price || 0),
                    quantity: Number(r.quantity || 1),
                    tax_rate: Number(r.tax_rate || 0),
                    tax_included: r.tax_included,
                    position: i + 1,
                  })),
              )
            }
          >
            Nộp chi phí
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ phụ trợ ============ */

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | undefined;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-3">{label}</div>
      <div
        className={`num mt-1 text-[18px] font-bold ${
          tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  bold,
  muted,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  tone?: "good" | "bad" | undefined;
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className={muted ? "text-ink-3" : "text-ink-2"}>{label}</span>
      <span
        className={`num ${bold ? "font-bold" : ""} ${
          tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`border-b border-line px-3 py-2 font-bold ${className}`}>{children}</th>
  );
}

function Chip({
  children,
  on,
  onClick,
}: {
  children: React.ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-0.5 text-[12px] ${
        on
          ? "border-brand bg-brand font-semibold text-white"
          : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  children,
  on,
  onClick,
}: {
  children: React.ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] ${
        on ? "border-good bg-good-soft text-good" : "border-line bg-surface text-ink-2"
      }`}
    >
      {on && <Check size={12} />}
      {children}
    </button>
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
      <span className="mb-1.5 block text-[12px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </span>
      {children}
    </label>
  );
}

const fmtDay = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};
