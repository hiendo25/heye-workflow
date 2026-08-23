import { useState } from "react";
import { Ban, Clock, Coins, FileSignature, Folder, Play, Plus, Square, Tag as TagIcon, Trash2, X } from "lucide-react";
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
  BILLING_LABEL,
  costRateFor,
  fmtDuration,
  isoDate,
  money,
  parseDuration,
  whyCannotTrack,
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
  onLogTime,
  onDeleteTime,
  onStartTimer,
  onStopTimer,
  allUsers,
  nsId,
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
  onLogTime: (v: Record<string, unknown>) => void;
  onDeleteTime: (id: string) => void;
  onStartTimer: (entryId: string) => void;
  onStopTimer: (entryId: string) => void;
  allUsers: User[];
  nsId: string;
}) {
  const [saving, setSaving] = useState(false);
  const [logging, setLogging] = useState(false);

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

            <section className="rounded-xl border border-line bg-surface">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <Clock size={14} className="text-ink-3" />
                <h3 className="text-[12.5px] font-bold">Thời gian</h3>
                <span className="num text-[12.5px] font-semibold text-ink-2">
                  {fmtDuration(logged)}
                </span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!current}
                  onClick={() => setLogging(true)}
                  title={current ? "" : "Gán hạng mục trước khi ghi giờ"}
                >
                  <Plus size={13} /> Ghi nhận giờ
                </Button>
              </div>

              {entries.length === 0 ? (
                <p className="px-4 py-4 text-[12px] text-ink-3">
                  Chưa ai ghi giờ trên công việc này.
                  {!current && " Cần gán hạng mục trước."}
                </p>
              ) : (
                <div>
                  {entries.map((e) => {
                    const who = allUsers.find((u) => u.id === e.user_id);
                    const locked = !!e.approved_at;
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-2.5 border-b border-line px-4 py-2 last:border-0"
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: who?.avatar_color ?? "#8B87A0" }}
                        >
                          {who?.initial ?? "?"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-medium">{who?.full_name ?? "—"}</div>
                          <div className="truncate text-[11px] text-ink-3">
                            {fmtDay(e.date)}
                            {e.note ? ` · ${e.note}` : ""}
                          </div>
                        </div>
                        {locked && (
                          <span className="rounded bg-good-soft px-1.5 py-0.5 text-[10px] font-semibold text-good">
                            đã duyệt
                          </span>
                        )}
                        {/* Đồng hồ chỉ bấm cho hôm nay, giống Productive. */}
                        {!locked && e.date === isoDate(new Date()) && (
                          <button
                            type="button"
                            onClick={() =>
                              e.timer_started_at ? onStopTimer(e.id) : onStartTimer(e.id)
                            }
                            aria-label={e.timer_started_at ? "Dừng đồng hồ" : "Bấm giờ"}
                            className={`rounded p-1 ${
                              e.timer_started_at
                                ? "bg-good-soft text-good"
                                : "text-ink-3 hover:bg-brand-soft hover:text-brand"
                            }`}
                          >
                            {e.timer_started_at ? <Square size={12} /> : <Play size={12} />}
                          </button>
                        )}
                        <span className="num shrink-0 text-[12.5px] font-semibold">
                          {fmtDuration(e.minutes)}
                        </span>
                        {!locked && (
                          <button
                            type="button"
                            onClick={() => onDeleteTime(e.id)}
                            className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                            aria-label="Xoá dòng giờ"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

      {logging && current && (
        <LogTimeDialog
          service={current}
          ticketId={ticket.id}
          users={allUsers}
          data={data}
          nsId={nsId}
          onClose={() => setLogging(false)}
          onSubmit={(v) => {
            onLogTime(v);
            setLogging(false);
          }}
        />
      )}
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

/**
 * Ghi giờ ngay trên công việc — đúng chỗ Productive đặt (tab Time của task).
 * Cho chọn NGƯỜI vì quản lý ghi hộ nhân viên là chuyện thường gặp.
 */
function LogTimeDialog({
  service,
  ticketId,
  users,
  data,
  nsId,
  onClose,
  onSubmit,
}: {
  service: BudgetService;
  ticketId: string;
  users: User[];
  data: FinanceData;
  nsId: string;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [dur, setDur] = useState("");
  const [date, setDate] = useState(isoDate(new Date()));
  const [note, setNote] = useState("");

  const minutes = parseDuration(dur);
  const free = service.billing_type === "non_billable";
  const isInternal = data.budgets.find((b) => b.id === service.budget_id)?.is_internal ?? false;
  const blocked = userId ? whyCannotTrack(data, service.id, userId, date) : null;
  const rate = userId
    ? costRateFor(data, userId, { onDate: date, budgetId: service.budget_id, isInternal })
    : { total: 0, source: "none" as const };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận giờ</DialogTitle>
          <DialogDescription>
            Giờ tính vào hạng mục <b>{service.name}</b>. Chọn người khác nếu bạn ghi hộ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FF label="Người làm" required>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FF>

          <div className="grid grid-cols-2 gap-3">
            <FF label="Thời lượng" required>
              <Input
                className="num"
                autoFocus
                value={dur}
                placeholder="8h · 9-17 · 1h30"
                onChange={(e) => setDur(e.target.value)}
              />
            </FF>
            <FF label="Ngày">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FF>
          </div>

          <FF label="Ghi chú">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Đã làm gì" />
          </FF>

          {blocked && (
            <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3 py-2 text-[12.5px]">
              {blocked}
            </div>
          )}

          {minutes > 0 && !blocked && (
            <div className="rounded-lg bg-brand-soft px-3 py-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-ink-2">
                  {fmtDuration(minutes)} × {money(Math.round(rate.total))} đ/giờ
                </span>
                <span className="num font-bold text-brand">
                  {money(Math.round((minutes / 60) * rate.total))} đ
                </span>
              </div>
              {free && (
                <p className="mt-1 text-[11.5px] text-ink-3">
                  Hạng mục không tính tiền: vẫn tốn chi phí nhưng không sinh doanh thu.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!userId || minutes <= 0 || !!blocked}
            onClick={() =>
              onSubmit({
                namespace_id: nsId,
                user_id: userId,
                service_id: service.id,
                ticket_id: ticketId,
                date,
                minutes,
                billable_minutes: free ? 0 : minutes,
                note: note.trim() || null,
                cost_rate_snapshot: Math.round(rate.total),
              })
            }
          >
            Ghi nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FF({
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

const fmtDay = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};
