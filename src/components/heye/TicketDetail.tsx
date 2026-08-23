import { useState } from "react";
import { Ban, Clock, Coins, FileSignature, Folder, Tag as TagIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  BILLING_LABEL,
  money,
  UNIT_LABEL,
  type Budget,
  type BudgetService,
  type FinanceData,
} from "@/lib/finance-data";
import { PRIORITY_LABEL, type Status, type Tag, type Ticket, type User } from "@/lib/heye-data";

/**
 * Chi tiết công việc — trọng tâm là ô "Hạng mục bán".
 *
 * Theo cách Productive làm: gán hạng mục ở sidebar công việc, sau đó log
 * giờ trên công việc này thì hạng mục tự điền sẵn. Dropdown chỉ hiện hạng
 * mục thuộc các hợp đồng đã nối với dự án chứa công việc.
 */
export function TicketDetail({
  ticket,
  status,
  users,
  tags,
  groupName,
  projectId,
  data,
  onClose,
  onSetService,
}: {
  ticket: Ticket;
  status: Status | undefined;
  users: User[];
  tags: Tag[];
  groupName: string;
  projectId: string | null;
  data: FinanceData;
  onClose: () => void;
  onSetService: (serviceId: string | null) => void;
}) {
  const [saving, setSaving] = useState(false);

  // Chỉ hạng mục của hợp đồng đã nối với dự án này.
  const budgets = data.budgets.filter((b) => b.project_id === projectId);
  const options = data.services.filter((s) => budgets.some((b) => b.id === s.budget_id));
  const current = data.services.find((s) => s.id === ticket.budget_service_id) ?? null;
  const currentBudget = current ? budgets.find((b) => b.id === current.budget_id) : null;

  const entries = data.timeEntries.filter((e) => e.ticket_id === ticket.id);
  const logged = entries.reduce((a, e) => a + e.minutes, 0);

  const change = (v: string) => {
    setSaving(true);
    onSetService(v === "none" ? null : v);
    setTimeout(() => setSaving(false), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose}>
      <div
        className="scroll-y h-full w-full max-w-[760px] bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11.5px] text-ink-3">
              <span className="num">{ticket.key}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Folder size={11} /> {groupName}
              </span>
            </div>
            <h2 className="mt-1 text-[17px] font-bold leading-snug tracking-tight">
              {ticket.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-3 hover:bg-brand-soft hover:text-brand"
            aria-label="Đóng"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid gap-5 px-5 py-4 md:grid-cols-[minmax(0,1fr)_260px]">
          {/* --- Cột trái --- */}
          <div className="space-y-4">
            <section className="rounded-xl border border-line bg-surface p-4">
              <h3 className="text-[12.5px] font-bold">Hạng mục bán</h3>
              <p className="mt-0.5 text-[11.5px] text-ink-3">
                Nơi giờ log trên công việc này chảy về để tính tiền. Chọn một lần, sau đó nhập
                giờ sẽ tự điền sẵn.
              </p>

              <div className="mt-3">
                <Select value={ticket.budget_service_id ?? "none"} onValueChange={change}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chưa gán hạng mục" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[340px]">
                    <SelectItem value="none">Chưa gán hạng mục</SelectItem>
                    {budgets.map((b) => {
                      const items = options.filter((s) => s.budget_id === b.id);
                      if (!items.length) return null;
                      return (
                        <SelectGroup key={b.id}>
                          <SelectLabel className="text-[11px] text-ink-3">{b.name}</SelectLabel>
                          {items.map((s) => {
                            const t = data.serviceTypes.find((x) => x.id === s.service_type_id);
                            return (
                              <SelectItem key={s.id} value={s.id}>
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ background: t?.color }}
                                  />
                                  {s.name}
                                  <span className="text-[11px] text-ink-3">{t?.name}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      );
                    })}
                  </SelectContent>
                </Select>
                {saving && <p className="mt-1 text-[11.5px] text-good">Đã lưu</p>}
              </div>

              {budgets.length === 0 && (
                <p className="mt-2 rounded-lg border-l-[3px] border-warn bg-warn-soft px-3 py-2 text-[11.5px]">
                  Dự án này chưa nối với hợp đồng nào nên chưa có hạng mục để chọn. Vào Tài
                  chính → Hợp đồng để nối.
                </p>
              )}

              {current ? (
                <ServiceCard service={current} budget={currentBudget ?? null} data={data} />
              ) : (
                budgets.length > 0 && (
                  <p className="mt-3 rounded-lg border-l-[3px] border-warn bg-warn-soft px-3 py-2 text-[11.5px]">
                    Chưa gán hạng mục. Giờ log trên công việc này sẽ không ra doanh thu, cũng
                    không vào được báo cáo lời lỗ của hợp đồng.
                  </p>
                )
              )}
            </section>

            <section className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-ink-3" />
                <h3 className="text-[12.5px] font-bold">Thời gian</h3>
                <div className="flex-1" />
                <span className="num text-[12.5px] font-semibold">
                  {Math.floor(logged / 60)}:{String(logged % 60).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2 text-[12px] text-ink-3">
                {entries.length === 0
                  ? "Chưa ai log giờ trên công việc này."
                  : `${entries.length} dòng giờ đã ghi nhận.`}
              </p>
            </section>
          </div>

          {/* --- Cột phải --- */}
          <aside className="space-y-3.5">
            <Field label="Trạng thái">
              {status ? (
                <span
                  className="inline-block rounded-md px-2 py-[3px] text-[11.5px] font-semibold"
                  style={{ backgroundColor: status.color_bg, color: status.color_fg }}
                >
                  {status.label}
                </span>
              ) : (
                <span className="text-ink-3">—</span>
              )}
            </Field>

            <Field label="Người phụ trách">
              {users.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {users.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pl-0.5 pr-2 text-[12px]"
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[9.5px] font-bold text-white"
                        style={{ backgroundColor: u.avatar_color }}
                      >
                        {u.initial}
                      </span>
                      {u.full_name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-ink-3">—</span>
              )}
            </Field>

            <Field label="Độ ưu tiên">
              {ticket.priority ? PRIORITY_LABEL[ticket.priority] : <span className="text-ink-3">—</span>}
            </Field>

            <Field label="Tag">
              {tags.length ? (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-md px-1.5 py-[1px] text-[10.5px] font-medium"
                      style={{ backgroundColor: t.color_bg, color: t.color_fg }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-ink-3">—</span>
              )}
            </Field>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Thẻ tóm tắt hạng mục đang gán — cho biết giờ log sẽ ra tiền thế nào. */
function ServiceCard({
  service,
  budget,
  data,
}: {
  service: BudgetService;
  budget: Budget | null;
  data: FinanceData;
}) {
  const type = data.serviceTypes.find((t) => t.id === service.service_type_id);
  const free = service.billing_type === "non_billable";
  const logged = data.timeEntries
    .filter((e) => e.service_id === service.id)
    .reduce((a, e) => a + e.minutes, 0);
  const usedH = logged / 60;
  const pct = service.quantity ? Math.min(100, Math.round((usedH / service.quantity) * 100)) : 0;

  return (
    <div className="mt-3 rounded-lg border border-line bg-surface-2 p-3">
      <div className="flex items-start gap-2">
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ background: type?.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">{service.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-3">
            <span className="inline-flex items-center gap-1">
              <TagIcon size={11} /> {type?.name}
            </span>
            {budget && (
              <span className="inline-flex items-center gap-1">
                <FileSignature size={11} /> {budget.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[12px]">
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-ink-3">Cách tính</div>
          <div className="mt-0.5 inline-flex items-center gap-1 font-medium">
            {free && <Ban size={11} className="text-ink-3" />}
            {BILLING_LABEL[service.billing_type]}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider text-ink-3">Đơn giá bán</div>
          <div className="num mt-0.5 font-medium">
            {free ? (
              <span className="text-ink-3">không tính tiền</span>
            ) : (
              `${money(service.price)} / ${UNIT_LABEL[service.unit]}`
            )}
          </div>
        </div>
      </div>

      {service.quantity > 0 && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[11.5px]">
            <span className="text-ink-3">Đã log trên hạng mục</span>
            <span className="num">
              {usedH.toFixed(1)} / {service.quantity} {UNIT_LABEL[service.unit]}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${
                pct >= 90 ? "bg-bad" : pct >= 70 ? "bg-warn" : "bg-good"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {free && (
        <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-ink-3">
          <Coins size={12} className="mt-0.5 shrink-0" />
          Giờ log vào đây vẫn tính chi phí lương, nhưng không sinh doanh thu.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="text-[13px]">{children}</div>
    </div>
  );
}
