import { useState } from "react";
import { ArrowLeft, Clock, FileText, Plus, Trash2 } from "lucide-react";
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
  type FinanceData,
} from "@/lib/finance-data";

const BILL_STYLE: Record<BillingType, string> = {
  tm: "bg-good-soft text-good",
  fixed: "bg-warn-soft text-warn",
  non_billable: "bg-line text-ink-3",
};

export function BudgetDetail({
  budget,
  data,
  onBack,
  onAddService,
  onDeleteService,
  onAddSection,
}: {
  budget: Budget;
  data: FinanceData;
  onBack: () => void;
  onAddService: (v: Record<string, unknown>) => void;
  onDeleteService: (id: string) => void;
  onAddSection: (name: string) => void;
}) {
  const [adding, setAdding] = useState<string | null | "root">(null);
  const [newSection, setNewSection] = useState(false);
  const [sectionName, setSectionName] = useState("");

  const client = data.clients.find((c) => c.id === budget.client_id);
  const services = data.services.filter((s) => s.budget_id === budget.id);
  const sections = data.sections.filter((s) => s.budget_id === budget.id);
  const total = budgetTotal(services);
  const loose = services.filter((s) => !s.section_id);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-ink-2 hover:text-brand"
      >
        <ArrowLeft size={14} /> Tất cả hợp đồng
      </button>

      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] text-ink-3">{client?.name}</div>
          <h1 className="mt-0.5 text-[20px] font-bold tracking-tight">{budget.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                budget.status === "open" ? "bg-ink text-background" : "bg-line text-ink-3"
              }`}
            >
              {budget.status === "open" ? "ĐANG CHẠY" : "ĐÃ BÀN GIAO"}
            </span>
            {budget.code && <span className="num">{budget.code}</span>}
            {budget.start_date && (
              <span className="num">
                {fmtDate(budget.start_date)} – {fmtDate(budget.end_date)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-ink-3">Tổng hợp đồng</div>
          <div className="num text-[22px] font-bold tracking-tight">{money(total)}</div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {sections.map((sec) => (
          <SectionBlock
            key={sec.id}
            title={sec.name}
            rows={services.filter((s) => s.section_id === sec.id)}
            data={data}
            onAdd={() => setAdding(sec.id)}
            onDelete={onDeleteService}
          />
        ))}

        {(loose.length > 0 || sections.length === 0) && (
          <SectionBlock
            title={sections.length === 0 ? "Hạng mục bán" : "Chưa phân nhóm"}
            rows={loose}
            data={data}
            onAdd={() => setAdding("root")}
            onDelete={onDeleteService}
          />
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {newSection ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={sectionName}
              placeholder="Tên nhóm: Giai đoạn 1, Mở tài khoản…"
              className="h-8 w-64"
              onChange={(e) => setSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && sectionName.trim()) {
                  onAddSection(sectionName.trim());
                  setSectionName("");
                  setNewSection(false);
                }
                if (e.key === "Escape") setNewSection(false);
              }}
            />
            <Button
              size="sm"
              disabled={!sectionName.trim()}
              onClick={() => {
                onAddSection(sectionName.trim());
                setSectionName("");
                setNewSection(false);
              }}
            >
              Thêm
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNewSection(false)}>
              Huỷ
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setNewSection(true)}>
            <Plus size={13} /> Thêm nhóm hạng mục
          </Button>
        )}
      </div>

      <ServiceDialog
        key={adding ?? "closed"}
        open={adding !== null}
        data={data}
        budget={budget}
        sectionId={adding === "root" ? null : adding}
        onClose={() => setAdding(null)}
        onSubmit={onAddService}
      />
    </>
  );
}

function SectionBlock({
  title,
  rows,
  data,
  onAdd,
  onDelete,
}: {
  title: string;
  rows: FinanceData["services"];
  data: FinanceData;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const sum = budgetTotal(rows);
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
        <span className="text-[13.5px] font-bold">{title}</span>
        <div className="flex-1" />
        <span className="num text-[13px] font-semibold">{money(sum)}</span>
      </header>

      {rows.length === 0 ? (
        <div className="px-4 py-4 text-[12.5px] text-ink-3">Nhóm này chưa có hạng mục nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-3">
                <th className="border-b border-line px-3 py-2 text-left font-bold">Hạng mục</th>
                <th className="border-b border-line px-3 py-2 text-left font-bold">Cách tính</th>
                <th className="border-b border-line px-3 py-2 text-center font-bold">Theo dõi</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Ước tính</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Số lượng</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Đơn giá</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Thành tiền</th>
                <th className="border-b border-line px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const st = data.serviceTypes.find((t) => t.id === s.service_type_id);
                return (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-brand-soft/25">
                    <td className="px-3 py-2">
                      <span
                        className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                        style={{ background: st?.color }}
                      />
                      <span className="font-medium text-ink">{s.name}</span>
                      <div className="ml-4 text-[11.5px] text-ink-3">{st?.name}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${BILL_STYLE[s.billing_type]}`}
                      >
                        {BILLING_LABEL[s.billing_type]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-ink-3">
                      <span className="inline-flex gap-1.5">
                        {s.allow_time && <Clock size={13} className="text-good" />}
                        {s.allow_expense && <FileText size={13} className="text-warn" />}
                      </span>
                    </td>
                    <td className="num px-3 py-2 text-right text-ink-2">
                      {s.estimate ? `${s.estimate} ${UNIT_LABEL[s.unit]}` : "—"}
                    </td>
                    <td className="num px-3 py-2 text-right">
                      {s.quantity} {UNIT_LABEL[s.unit]}
                    </td>
                    <td className="num px-3 py-2 text-right">{money(s.price)}</td>
                    <td className="num px-3 py-2 text-right font-semibold">
                      {s.billing_type === "non_billable" ? (
                        <span className="text-ink-3">0</span>
                      ) : (
                        money(serviceTotal(s))
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => onDelete(s.id)}
                        className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                        aria-label="Xoá hạng mục"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-4 py-2.5">
        <button
          type="button"
          onClick={onAdd}
          className="text-[12.5px] font-medium text-brand hover:underline"
        >
          + Thêm hạng mục từ bảng giá
        </button>
      </div>
    </section>
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
  const total = item && qty ? Number(qty) * item.price : 0;

  const pick = (id: string) => {
    setItemId(id);
    const it = data.rateCardItems.find((i) => i.id === id);
    const t = it ? data.serviceTypes.find((s) => s.id === it.service_type_id) : null;
    if (t && !name) setName(t.name);
    // Đơn vị 'gói' thường là license/hạ tầng: mặc định trọn gói, bật ghi chi phí.
    if (it?.unit === "piece") {
      setBilling("fixed");
      setAllowExpense(true);
    }
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
                    return (
                      <SelectItem key={i.id} value={i.id}>
                        {t?.name} — {money(i.price)}/{UNIT_LABEL[i.unit]}
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
            <L label={`Số lượng bán (${item ? UNIT_LABEL[item.unit] : "đơn vị"})`} required>
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
                {qty} {UNIT_LABEL[item.unit]} × {money(item.price)}
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
                price: item!.price,
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

function fmtDate(d: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
