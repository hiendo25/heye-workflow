import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Plus, Undo2, X } from "lucide-react";
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
  costRateFor,
  fmtDuration,
  isEntryLocked,
  isoDate,
  money,
  parseDuration,
  weekDays,
  weekStartOf,
  weekSubmission,
  whyCannotTrack,
  WEEKDAY_LABEL,
  type FinanceData,
  type TimeEntry,
} from "@/lib/finance-data";
import type { Ticket, User } from "@/lib/heye-data";

/**
 * Giờ toàn công ty — màn của quản lý.
 *
 * Đây là nơi Productive đặt hai việc mà "Giờ của tôi" không làm:
 *   1. Ghi giờ HỘ người khác (nhân viên quên, nghỉ việc, không dùng phần mềm)
 *   2. Duyệt giờ hàng loạt theo tuần
 *
 * Bấm ô để xem chi tiết một người trong một ngày, bấm tên để xem cả tuần.
 */
export function CompanyTime({
  data,
  users,
  tickets,
  nsId,
  onSave,
  onApprove,
  onUnapprove,
  onRequestChange,
  onDelete,
}: {
  data: FinanceData;
  users: User[];
  tickets: Ticket[];
  nsId: string;
  onSave: (v: Record<string, unknown>) => void;
  onApprove: (ids: string[]) => void;
  onUnapprove: (id: string) => void;
  onRequestChange: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const [cursor, setCursor] = useState(new Date());
  const [cell, setCell] = useState<{ userId: string; date?: string } | null>(null);
  const [adding, setAdding] = useState<{ userId: string; date: string } | null>(null);

  const days = weekDays(cursor);
  const isoDays = days.map(isoDate);
  const weekStart = weekStartOf(days[0]!);

  const inWeek = useMemo(
    () => data.timeEntries.filter((e) => isoDays.includes(e.date)),
    [data.timeEntries, isoDays],
  );

  const minutesOf = (userId: string, date?: string) =>
    inWeek
      .filter((e) => e.user_id === userId && (!date || e.date === date))
      .reduce((a, e) => a + e.minutes, 0);

  const pending = inWeek.filter((e) => !e.approved_at);
  const move = (d: number) => {
    const n = new Date(cursor);
    n.setDate(cursor.getDate() + d);
    setCursor(n);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight">Giờ toàn công ty</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-2">
            Xem giờ cả team, ghi hộ người quên log, và duyệt hàng loạt.
          </p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <IconBtn onClick={() => move(-7)} label="Tuần trước">
            <ChevronLeft size={15} />
          </IconBtn>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="rounded-md px-2 py-1 text-[12px] text-ink-2 hover:bg-brand-soft hover:text-brand"
          >
            Tuần này
          </button>
          <IconBtn onClick={() => move(7)} label="Tuần sau">
            <ChevronRight size={15} />
          </IconBtn>
        </div>
        <span className="num text-[12.5px] text-ink-2">
          {fmtShort(days[0]!)} – {fmtShort(days[6]!)}
        </span>

        {pending.length > 0 && (
          <Button size="sm" onClick={() => onApprove(pending.map((e) => e.id))}>
            <Check size={13} /> Duyệt cả tuần ({pending.length})
          </Button>
        )}
      </div>

      {/* Lưới tuần: hàng là người, cột là ngày */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-3">
                <th className="border-b border-line px-4 py-2 text-left font-bold">Nhân sự</th>
                {/* Tổng tuần đứng ngay sau tên người, trước các ngày — thứ tự
                    Productive. Ở cuối bảng thì phải kéo ngang mới đọc được. */}
                <th className="border-b border-r border-line px-3 py-2 text-right font-bold">
                  Tổng
                </th>
                {days.map((d) => {
                  const total = inWeek
                    .filter((e) => e.date === isoDate(d))
                    .reduce((a, e) => a + e.minutes, 0);
                  return (
                    <th
                      key={isoDate(d)}
                      className={`border-b border-line px-2 py-2 text-center ${
                        d.getDay() === 0 || d.getDay() === 6 ? "bg-bg/60" : ""
                      }`}
                    >
                      <div className="font-bold">
                        {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
                      </div>
                      {total > 0 && (
                        <div className="num mt-0.5 text-[11px] font-semibold normal-case text-ink-2">
                          {fmtDuration(total)}
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="border-b border-line px-3 py-2 text-center font-bold">Nộp</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const total = minutesOf(u.id);
                const sub = weekSubmission(data.submissions, data.timeEntries, u.id, weekStart);
                return (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setCell({ userId: u.id })}
                        className="flex items-center gap-2 text-left hover:text-brand"
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: u.avatar_color }}
                        >
                          {u.initial}
                        </span>
                        <span className="font-medium">{u.full_name}</span>
                      </button>
                    </td>
                    <td className="num border-r border-line px-3 py-2 text-right font-semibold">
                      {total ? fmtDuration(total) : <span className="text-ink-3">—</span>}
                    </td>
                    {isoDays.map((iso) => {
                      const m = minutesOf(u.id, iso);
                      const hasPending = inWeek.some(
                        (e) => e.user_id === u.id && e.date === iso && !e.approved_at,
                      );
                      // Productive tô ĐỎ ngày thiếu giờ so với giờ công kỳ vọng,
                      // đây mới là thứ quản lý cần thấy khi quét bảng. Màu theo
                      // trạng thái duyệt là trục khác, giữ lại cho ngày đủ giờ.
                      const dow = new Date(iso).getDay();
                      const expected = dow === 0 || dow === 6 ? 0 : 8 * 60;
                      const short = expected > 0 && m < expected;
                      return (
                        <td key={iso} className="px-1 py-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              m ? setCell({ userId: u.id, date: iso }) : setAdding({ userId: u.id, date: iso })
                            }
                            className={`num w-full rounded-md py-1.5 text-[12.5px] ${
                              short
                                ? "font-semibold text-bad"
                                : m
                                  ? hasPending
                                    ? "bg-warn-soft font-semibold text-warn"
                                    : "bg-good-soft font-semibold text-good"
                                  : "text-ink-3 hover:bg-surface-2"
                            }`}
                            title={
                              short
                                ? `Thiếu giờ — kỳ vọng ${fmtDuration(expected)}`
                                : m
                                  ? hasPending
                                    ? "Còn dòng chờ duyệt"
                                    : "Đã duyệt hết"
                                  : "Ghi hộ giờ"
                            }
                          >
                            {m ? fmtDuration(m) : "+"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      <SubBadge status={sub.status} days={sub.daysLogged} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-2 text-[11.5px] text-ink-3">
        Ô vàng còn dòng chờ duyệt · ô xanh đã duyệt hết · bấm ô trống để ghi hộ giờ.
      </p>

      {cell && (
        <EntriesSheet
          data={data}
          users={users}
          tickets={tickets}
          userId={cell.userId}
          date={cell.date ?? null}
          days={isoDays}
          onClose={() => setCell(null)}
          onApprove={onApprove}
          onUnapprove={onUnapprove}
          onRequestChange={onRequestChange}
          onDelete={onDelete}
          onAdd={(d) => {
            setCell(null);
            setAdding({ userId: cell.userId, date: d });
          }}
        />
      )}

      {adding && (
        <LogForDialog
          key={`${adding.userId}-${adding.date}`}
          data={data}
          tickets={tickets}
          user={users.find((u) => u.id === adding.userId)!}
          date={adding.date}
          nsId={nsId}
          onClose={() => setAdding(null)}
          onSubmit={(v) => {
            onSave(v);
            setAdding(null);
          }}
        />
      )}
    </>
  );
}

function SubBadge({ status, days }: { status: string; days: number }) {
  if (status === "submitted")
    return (
      <span className="rounded bg-good-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-good">
        đã nộp
      </span>
    );
  if (status === "changes_requested")
    return (
      <span className="rounded bg-bad-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-bad">
        cần sửa
      </span>
    );
  if (status === "partial")
    return (
      <span
        className="rounded bg-warn-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-warn"
        title={`Mới có ${days}/7 ngày`}
      >
        thiếu {7 - days} ngày
      </span>
    );
  return <span className="text-[10.5px] text-ink-3">chưa nộp</span>;
}

/* ============ Panel chi tiết: một người, một ngày hoặc cả tuần ============ */

function EntriesSheet({
  data,
  users,
  tickets,
  userId,
  date,
  days,
  onClose,
  onApprove,
  onUnapprove,
  onRequestChange,
  onDelete,
  onAdd,
}: {
  data: FinanceData;
  users: User[];
  tickets: Ticket[];
  userId: string;
  date: string | null;
  days: string[];
  onClose: () => void;
  onApprove: (ids: string[]) => void;
  onUnapprove: (id: string) => void;
  onRequestChange: (id: string, note: string) => void;
  onDelete: (id: string) => void;
  onAdd: (date: string) => void;
}) {
  const [asking, setAsking] = useState<TimeEntry | null>(null);
  const user = users.find((u) => u.id === userId);

  const list = data.timeEntries
    .filter((e) => e.user_id === userId && (date ? e.date === date : days.includes(e.date)))
    .sort((a, b) => a.date.localeCompare(b.date));

  const pending = list.filter((e) => !e.approved_at);
  const total = list.reduce((a, e) => a + e.minutes, 0);
  const cost = list.reduce((a, e) => a + (e.minutes / 60) * Number(e.cost_rate_snapshot), 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose}>
        <div
          className="scroll-y h-full w-full max-w-[720px] bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-5 py-3.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-white"
              style={{ backgroundColor: user?.avatar_color }}
            >
              {user?.initial}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold">{user?.full_name}</h2>
              <div className="text-[11.5px] text-ink-3">
                {date ? fmtVn(date) : "Cả tuần"} · {fmtDuration(total)} ·{" "}
                {money(Math.round(cost))} đ
              </div>
            </div>
            {pending.length > 0 && (
              <Button size="sm" onClick={() => onApprove(pending.map((e) => e.id))}>
                <Check size={13} /> Duyệt {pending.length} dòng
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-ink-3 hover:bg-brand-soft hover:text-brand"
              aria-label="Đóng"
            >
              <X size={17} />
            </button>
          </header>

          <div className="px-5 py-4">
            {date && (
              <Button size="sm" variant="outline" className="mb-3" onClick={() => onAdd(date)}>
                <Plus size={13} /> Ghi hộ giờ ngày này
              </Button>
            )}

            {list.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-[13px] text-ink-3">
                Chưa có dòng giờ nào.
              </p>
            ) : (
              <div className="space-y-2">
                {list.map((e) => {
                  const s = data.services.find((x) => x.id === e.service_id);
                  const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
                  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
                  const tk = e.ticket_id ? tickets.find((x) => x.id === e.ticket_id) : null;
                  const locked = isEntryLocked(e);
                  return (
                    <div key={e.id} className="rounded-xl border border-line bg-surface px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: t?.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold">{s?.name}</div>
                          <div className="truncate text-[11.5px] text-ink-3">
                            {!date && `${fmtVn(e.date)} · `}
                            {b?.name}
                            {tk && ` · ${tk.key}`}
                          </div>
                          {e.note && <p className="mt-1 text-[12px] text-ink-2">{e.note}</p>}
                          {e.change_requested_at && (
                            <p className="mt-1 rounded bg-bad-soft px-2 py-1 text-[11.5px] text-bad">
                              Yêu cầu sửa: {e.change_request_note ?? "—"}
                            </p>
                          )}
                        </div>
                        <span className="num shrink-0 text-[13.5px] font-semibold">
                          {fmtDuration(e.minutes)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-[11.5px]">
                        <span className="text-ink-3">
                          Chi phí{" "}
                          <b className="num text-ink-2">
                            {money(Math.round((e.minutes / 60) * Number(e.cost_rate_snapshot)))} đ
                          </b>
                        </span>
                        <div className="flex-1" />
                        {e.approved_at ? (
                          <>
                            <span className="rounded bg-good-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-good">
                              đã duyệt
                            </span>
                            <button
                              type="button"
                              onClick={() => onUnapprove(e.id)}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-ink-2 hover:bg-brand-soft hover:text-brand"
                            >
                              <Undo2 size={12} /> Bỏ duyệt
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setAsking(e)}
                              className="rounded px-1.5 py-0.5 text-ink-2 hover:bg-warn-soft hover:text-warn"
                            >
                              Yêu cầu sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => onApprove([e.id])}
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-good hover:bg-good-soft"
                            >
                              <Check size={12} /> Duyệt
                            </button>
                          </>
                        )}
                        {!locked && (
                          <button
                            type="button"
                            onClick={() => onDelete(e.id)}
                            className="rounded px-1.5 py-0.5 text-ink-3 hover:bg-bad-soft hover:text-bad"
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {asking && (
        <AskChangeDialog
          entry={asking}
          onClose={() => setAsking(null)}
          onSubmit={(note) => {
            onRequestChange(asking.id, note);
            setAsking(null);
          }}
        />
      )}
    </>
  );
}

function AskChangeDialog({
  entry,
  onClose,
  onSubmit,
}: {
  entry: TimeEntry;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu sửa lại</DialogTitle>
          <DialogDescription>
            Dòng {fmtDuration(entry.minutes)} ngày {fmtVn(entry.date)}. Người log sẽ thấy ghi
            chú này và sửa lại.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={note}
          placeholder="Ví dụ: ghi nhầm hạng mục, giờ chưa đúng…"
          onChange={(e) => setNote(e.target.value)}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button disabled={!note.trim()} onClick={() => onSubmit(note.trim())}>
            Gửi yêu cầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Ghi hộ giờ ============ */

function LogForDialog({
  data,
  tickets,
  user,
  date,
  nsId,
  onClose,
  onSubmit,
}: {
  data: FinanceData;
  tickets: Ticket[];
  user: User;
  date: string;
  nsId: string;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [serviceId, setServiceId] = useState("");
  const [ticketId, setTicketId] = useState("none");
  const [dur, setDur] = useState("");
  const [note, setNote] = useState("");

  const minutes = parseDuration(dur);
  const service = data.services.find((s) => s.id === serviceId);
  const free = service?.billing_type === "non_billable";
  const blocked = serviceId ? whyCannotTrack(data, serviceId, user.id, date) : null;
  const isInternal = service
    ? (data.budgets.find((b) => b.id === service.budget_id)?.is_internal ?? false)
    : false;
  const rate = costRateFor(data, user.id, {
    onDate: date,
    ...(service ? { budgetId: service.budget_id } : {}),
    isInternal,
  });

  const pickTicket = (v: string) => {
    setTicketId(v);
    const tk = tickets.find((x) => x.id === v);
    if (tk?.budget_service_id) setServiceId(tk.budget_service_id);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ghi hộ giờ — {user.full_name}</DialogTitle>
          <DialogDescription>
            Ngày {fmtVn(date)}. Dòng giờ ghi hộ có giá trị y như người đó tự log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <L label="Công việc">
            <Select value={ticketId} onValueChange={pickTicket}>
              <SelectTrigger>
                <SelectValue placeholder="Không gắn công việc cụ thể" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="none">Không gắn công việc cụ thể</SelectItem>
                {tickets.slice(0, 80).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="num mr-1.5 text-[11px] text-ink-3">{t.key}</span>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </L>

          <L label="Hạng mục bán" required>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hạng mục" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {data.budgets.map((b) => {
                  const items = data.services.filter((s) => s.budget_id === b.id && s.allow_time);
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

          <L label="Thời lượng" required>
            <Input
              className="num"
              autoFocus
              value={dur}
              placeholder="8h · 9-17 · 1h30 · 45m"
              onChange={(e) => setDur(e.target.value)}
            />
          </L>

          <L label="Ghi chú">
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </L>

          {blocked && (
            <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3 py-2 text-[12.5px]">
              {blocked}
            </div>
          )}

          {minutes > 0 && !blocked && (
            <div className="flex justify-between rounded-lg bg-brand-soft px-3 py-2 text-[12.5px]">
              <span className="text-ink-2">
                {fmtDuration(minutes)} × {money(Math.round(rate.total))} đ/giờ
              </span>
              <span className="num font-bold text-brand">
                {money(Math.round((minutes / 60) * rate.total))} đ
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!serviceId || minutes <= 0 || !!blocked}
            onClick={() =>
              onSubmit({
                namespace_id: nsId,
                user_id: user.id,
                service_id: serviceId,
                ticket_id: ticketId === "none" ? null : ticketId,
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

/* ============ phụ trợ ============ */

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md p-1.5 text-ink-2 hover:bg-brand-soft hover:text-brand"
    >
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
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </span>
      {children}
    </label>
  );
}

const fmtShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
const fmtVn = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};
