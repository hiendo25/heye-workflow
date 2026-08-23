import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutList,
  Pin,
  Play,
  Plus,
  Table2,
  Trash2,
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
  costRateFor,
  fmtDuration,
  isoDate,
  money,
  parseDuration,
  weekDays,
  weekStartOf,
  weekSubmission,
  whyCannotTrack,
  isEntryLocked,
  WEEKDAY_LABEL,
  type BudgetService,
  type FinanceData,
  type TimeEntry,
} from "@/lib/finance-data";
import type { Ticket, User } from "@/lib/heye-data";

type View = "day" | "week" | "calendar";

export function MyTime({
  data,
  users,
  tickets,
  nsId,
  currentUser,
  onSubmitWeek,
  onSave,
  onUpdate,
  onDelete,
}: {
  data: FinanceData;
  users: User[];
  tickets: Ticket[];
  nsId: string;
  currentUser: User | null;
  onSubmitWeek: (weekStart: string) => void;
  onSave: (v: Record<string, unknown>) => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [view, setView] = useState<View>("day");
  const [cursor, setCursor] = useState(new Date());
  const [adding, setAdding] = useState<{ date: string; serviceId?: string | undefined } | null>(null);

  const days = weekDays(cursor);
  const today = isoDate(cursor);

  const mine = useMemo(
    () => (currentUser ? data.timeEntries.filter((e) => e.user_id === currentUser.id) : []),
    [data.timeEntries, currentUser],
  );

  const byDate = (d: string) => mine.filter((e) => e.date === d);
  const sum = (list: TimeEntry[]) => list.reduce((a, e) => a + e.minutes, 0);
  const weekTotal = sum(mine.filter((e) => days.some((d) => isoDate(d) === e.date)));

  const move = (delta: number) => {
    const n = new Date(cursor);
    n.setDate(cursor.getDate() + delta);
    setCursor(n);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-[20px] font-bold tracking-tight">Giờ của tôi</h1>

        <div className="flex items-center gap-0.5">
          <IconBtn onClick={() => move(view === "day" ? -1 : -7)} label="Trước">
            <ChevronLeft size={15} />
          </IconBtn>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="rounded-md px-2 py-1 text-[12px] text-ink-2 hover:bg-brand-soft hover:text-brand"
          >
            Hôm nay
          </button>
          <IconBtn onClick={() => move(view === "day" ? 1 : 7)} label="Sau">
            <ChevronRight size={15} />
          </IconBtn>
        </div>

        <span className="text-[13px] text-ink-2">
          {view === "day"
            ? fmtLong(cursor)
            : `${fmtShort(days[0]!)} – ${fmtShort(days[6]!)}`}
        </span>

        <div className="flex-1" />

        <div className="flex overflow-hidden rounded-lg border border-line">
          <Seg on={view === "day"} onClick={() => setView("day")} icon={<LayoutList size={13} />}>
            Ngày
          </Seg>
          <Seg on={view === "week"} onClick={() => setView("week")} icon={<Table2 size={13} />}>
            Lưới tuần
          </Seg>
          <Seg
            on={view === "calendar"}
            onClick={() => setView("calendar")}
            icon={<CalendarDays size={13} />}
          >
            Lịch
          </Seg>
        </div>
      </div>

      {/* Dải tổng theo ngày */}
      <div className="mt-3 flex overflow-hidden rounded-xl border border-line bg-surface">
        {days.map((d) => {
          const iso = isoDate(d);
          const total = sum(byDate(iso));
          const isToday = iso === isoDate(new Date());
          const active = view === "day" && iso === today;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => {
                setCursor(d);
                if (view !== "day") setView("day");
              }}
              className={`flex-1 border-r border-line px-2 py-2 text-center last:border-r-0 ${
                active ? "bg-brand-soft" : "hover:bg-brand-soft/40"
              }`}
            >
              <div
                className={`num text-[14px] font-semibold ${
                  total === 0 ? "text-ink-3" : active ? "text-brand" : "text-ink"
                }`}
              >
                {fmtDuration(total)}
              </div>
              <div className={`text-[11px] ${isToday ? "font-bold text-brand" : "text-ink-3"}`}>
                {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
              </div>
            </button>
          );
        })}
        <div className="w-[132px] bg-surface-2 px-2 py-2 text-center">
          <div className="num text-[14px] font-bold">{fmtDuration(weekTotal)}</div>
          <div className="text-[11px] text-ink-3">Tổng tuần</div>
        </div>
      </div>

      {currentUser && <SubmitBar
        data={data}
        userId={currentUser.id}
        weekStart={weekStartOf(days[0]!)}
        onSubmit={onSubmitWeek}
      />}

      {!currentUser ? (
        <Empty>Chọn một người để xem giờ đã ghi nhận.</Empty>
      ) : view === "week" ? (
        <WeekGrid
          data={data}
          entries={mine}
          days={days}
          onAdd={(iso, serviceId) => setAdding({ date: iso, serviceId })}
        />
      ) : view === "calendar" ? (
        <CalendarView data={data} entries={mine} days={days} />
      ) : (
        <DayView
          data={data}
          tickets={tickets}
          entries={byDate(today)}
          date={today}
          onAdd={(serviceId) => setAdding({ date: today, serviceId: serviceId ?? undefined })}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      )}

      {adding && currentUser && (
        <EntryDialog
          key={`${adding.date}-${adding.serviceId ?? "new"}`}
          open
          data={data}
          tickets={tickets}
          date={adding.date}
          presetService={adding.serviceId ?? null}
          user={currentUser}
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

/* ================= Xem theo ngày ================= */

function DayView({
  data,
  tickets,
  entries,
  date,
  onAdd,
  onDelete,
  onUpdate,
}: {
  data: FinanceData;
  tickets: Ticket[];
  entries: TimeEntry[];
  date: string;
  onAdd: (serviceId?: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
}) {
  // Gợi ý: hạng mục vừa dùng gần đây, để bấm một phát là ra dòng mới.
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: BudgetService[] = [];
    for (const e of [...data.timeEntries].reverse()) {
      if (seen.has(e.service_id)) continue;
      const s = data.services.find((x) => x.id === e.service_id);
      if (s) {
        out.push(s);
        seen.add(e.service_id);
      }
      if (out.length >= 5) break;
    }
    return out;
  }, [data.timeEntries, data.services]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Panel gợi ý bên trái, giống Productive */}
      <aside className="space-y-3">
        <Button className="w-full" onClick={() => onAdd()}>
          <Plus size={14} /> Ghi nhận giờ
        </Button>

        {recent.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <header className="flex items-center gap-1.5 border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">
              <Pin size={11} /> Vừa dùng gần đây
            </header>
            {recent.map((s) => {
              const t = data.serviceTypes.find((x) => x.id === s.service_type_id);
              const b = data.budgets.find((x) => x.id === s.budget_id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onAdd(s.id)}
                  className="flex w-full items-start gap-2 border-b border-line px-3 py-2 text-left last:border-0 hover:bg-brand-soft/40"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: t?.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium">{s.name}</span>
                    <span className="block truncate text-[11px] text-ink-3">{b?.name}</span>
                  </span>
                  <Play size={12} className="mt-1 shrink-0 text-ink-3" />
                </button>
              );
            })}
          </section>
        )}
      </aside>

      {/* Danh sách dòng giờ trong ngày */}
      <div>
        {entries.length === 0 ? (
          <Empty>
            Chưa ghi nhận giờ nào cho ngày {fmtDay(date)}. Chọn hạng mục bên trái hoặc bấm “Ghi
            nhận giờ”.
          </Empty>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <EntryRow
                key={e.id}
                entry={e}
                data={data}
                tickets={tickets}
                onDelete={() => onDelete(e.id)}
                onUpdate={(v) => onUpdate(e.id, v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  data,
  tickets,
  onDelete,
  onUpdate,
}: {
  entry: TimeEntry;
  data: FinanceData;
  tickets: Ticket[];
  onDelete: () => void;
  onUpdate: (v: Record<string, unknown>) => void;
}) {
  const [dur, setDur] = useState(fmtDuration(entry.minutes));
  const s = data.services.find((x) => x.id === entry.service_id);
  const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
  const tk = entry.ticket_id ? tickets.find((x) => x.id === entry.ticket_id) : null;
  const free = s?.billing_type === "non_billable";
  const cost = (entry.minutes / 60) * Number(entry.cost_rate_snapshot);
  const locked = isEntryLocked(entry);

  const commit = () => {
    const m = parseDuration(dur);
    if (m && m !== entry.minutes) {
      onUpdate({ minutes: m, billable_minutes: free ? 0 : m });
    }
    setDur(fmtDuration(m || entry.minutes));
  };

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: t?.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold">{s?.name ?? "—"}</div>
          <div className="mt-0.5 truncate text-[11.5px] text-ink-3">
            {b?.name}
            {tk && ` · ${tk.key} ${tk.title}`}
          </div>
          {entry.note && <p className="mt-1 text-[12.5px] text-ink-2">{entry.note}</p>}
        </div>

        <Input
          value={dur}
          disabled={locked}
          onChange={(e) => setDur(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="num h-8 w-[76px] text-center text-[13.5px] font-semibold"
        />

        {!locked && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-1 rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
            aria-label="Xoá dòng giờ"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2 text-[11.5px] text-ink-3">
        <span>
          Chi phí <b className="num text-ink-2">{money(Math.round(cost))} đ</b>
        </span>
        {free ? (
          <span className="rounded bg-line px-1.5 py-0.5 text-[10.5px]">không tính tiền khách</span>
        ) : (
          <span>
            Tính tiền <b className="num text-ink-2">{fmtDuration(entry.billable_minutes)}</b>
          </span>
        )}
        {locked && (
          <span className="rounded bg-good-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-good">
            đã duyệt
          </span>
        )}
      </div>
    </div>
  );
}

/* ================= Lưới tuần ================= */

function WeekGrid({
  data,
  entries,
  days,
  onAdd,
}: {
  data: FinanceData;
  entries: TimeEntry[];
  days: Date[];
  onAdd: (iso: string, serviceId: string) => void;
}) {
  // Mỗi hàng là một hạng mục đã từng log trong tuần này.
  const isoDays = days.map(isoDate);
  const inWeek = entries.filter((e) => isoDays.includes(e.date));
  const serviceIds = [...new Set(inWeek.map((e) => e.service_id))];

  if (serviceIds.length === 0) {
    return <Empty>Tuần này chưa ghi nhận giờ nào. Chuyển sang xem Ngày để bắt đầu.</Empty>;
  }

  const cell = (sid: string, iso: string) =>
    inWeek.filter((e) => e.service_id === sid && e.date === iso).reduce((a, e) => a + e.minutes, 0);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-3">
              <th className="border-b border-line px-4 py-2 text-left font-bold">Hạng mục</th>
              {days.map((d) => (
                <th key={isoDate(d)} className="border-b border-line px-2 py-2 text-center font-bold">
                  {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
                </th>
              ))}
              <th className="border-b border-line px-3 py-2 text-right font-bold">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {serviceIds.map((sid) => {
              const s = data.services.find((x) => x.id === sid);
              const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
              const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
              const rowTotal = isoDays.reduce((a, iso) => a + cell(sid, iso), 0);
              return (
                <tr key={sid} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: t?.color }}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s?.name}</div>
                        <div className="truncate text-[11px] text-ink-3">{b?.name}</div>
                      </div>
                    </div>
                  </td>
                  {isoDays.map((iso) => {
                    const m = cell(sid, iso);
                    return (
                      <td key={iso} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => onAdd(iso, sid)}
                          className={`num w-full rounded-md py-1.5 text-[12.5px] ${
                            m
                              ? "bg-brand-soft font-semibold text-brand"
                              : "text-ink-3 hover:bg-surface-2"
                          }`}
                        >
                          {m ? fmtDuration(m) : "+"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="num px-3 py-2 text-right font-semibold">
                    {fmtDuration(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= Lịch ================= */

function CalendarView({
  data,
  entries,
  days,
}: {
  data: FinanceData;
  entries: TimeEntry[];
  days: Date[];
}) {
  return (
    <div className="mt-4 grid gap-2 md:grid-cols-7">
      {days.map((d) => {
        const iso = isoDate(d);
        const list = entries.filter((e) => e.date === iso);
        const total = list.reduce((a, e) => a + e.minutes, 0);
        return (
          <div key={iso} className="min-h-[150px] rounded-xl border border-line bg-surface p-2">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11.5px] font-semibold text-ink-2">
                {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
              </span>
              {total > 0 && (
                <span className="num text-[11px] text-ink-3">{fmtDuration(total)}</span>
              )}
            </div>
            <div className="space-y-1">
              {list.map((e) => {
                const s = data.services.find((x) => x.id === e.service_id);
                const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
                return (
                  <div
                    key={e.id}
                    className="rounded-md px-1.5 py-1 text-[11px] leading-tight"
                    style={{ background: `${t?.color ?? "#8B87A0"}1a` }}
                    title={s?.name}
                  >
                    <div className="num font-semibold" style={{ color: t?.color }}>
                      {fmtDuration(e.minutes)}
                    </div>
                    <div className="truncate text-ink-2">{s?.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= Dialog ghi nhận giờ ================= */

function EntryDialog({
  open,
  data,
  tickets,
  date,
  presetService,
  user,
  nsId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  data: FinanceData;
  tickets: Ticket[];
  date: string;
  presetService: string | null;
  user: User;
  nsId: string;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [ticketId, setTicketId] = useState("none");
  const [serviceId, setServiceId] = useState(presetService ?? "");
  const [dur, setDur] = useState("");
  const [note, setNote] = useState("");
  const [d, setD] = useState(date);

  // Chỉ hạng mục cho phép log giờ.
  const options = data.services.filter((s) => s.allow_time);
  const service = data.services.find((s) => s.id === serviceId);
  const free = service?.billing_type === "non_billable";
  const minutes = parseDuration(dur);

  // Giá vốn tại NGÀY log — chụp lại để số liệu quá khứ không đổi khi tăng lương.
  const rate = costRateFor(data, user.id, {
    onDate: d,
    ...(service ? { budgetId: service.budget_id } : {}),
    isInternal: service
      ? (data.budgets.find((b) => b.id === service.budget_id)?.is_internal ?? false)
      : false,
  });
  const cost = (minutes / 60) * rate.total;

  // Vì sao không log được — theo đúng danh sách điều kiện của Productive.
  const blocked = serviceId ? whyCannotTrack(data, serviceId, user.id, d) : null;

  // Chọn công việc thì tự điền hạng mục đã gán — đúng cách Productive làm.
  const pickTicket = (v: string) => {
    setTicketId(v);
    if (v === "none") return;
    const tk = tickets.find((x) => x.id === v);
    if (tk?.budget_service_id) setServiceId(tk.budget_service_id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận giờ</DialogTitle>
          <DialogDescription>
            Chọn công việc thì hạng mục tự điền sẵn. Việc không có công việc cụ thể (họp, đào
            tạo, hỗ trợ) thì chọn thẳng hạng mục.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <L label="Công việc">
            <Select value={ticketId} onValueChange={pickTicket}>
              <SelectTrigger>
                <SelectValue placeholder="Không gắn công việc cụ thể" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
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
              <SelectContent className="max-h-[320px]">
                {data.budgets.map((b) => {
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
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </L>

          <div className="grid grid-cols-2 gap-3">
            <L label="Thời lượng" required>
              <Input
                className="num"
                autoFocus
                value={dur}
                placeholder="8h · 1h30 · 45m · 0.5"
                onChange={(e) => setDur(e.target.value)}
              />
            </L>
            <L label="Ngày">
              <Input type="date" value={d} onChange={(e) => setD(e.target.value)} />
            </L>
          </div>

          <L label="Ghi chú">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Đã làm gì trong khoảng thời gian này"
            />
          </L>

          {blocked && (
            <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3 py-2 text-[12.5px]">
              {blocked}
            </div>
          )}

          {minutes > 0 && !blocked && (
            <div className="rounded-lg bg-brand-soft px-3 py-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-ink-2">Thời lượng ghi nhận</span>
                <span className="num font-bold text-brand">{fmtDuration(minutes)}</span>
              </div>
              <div className="mt-0.5 flex justify-between text-ink-2">
                <span>Chi phí ({money(Math.round(rate.total))} đ/giờ)</span>
                <span className="num">{money(Math.round(cost))} đ</span>
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
            disabled={!serviceId || minutes <= 0 || !!blocked}
            onClick={() =>
              onSubmit({
                namespace_id: nsId,
                user_id: user.id,
                service_id: serviceId,
                ticket_id: ticketId === "none" ? null : ticketId,
                date: d,
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

/* ================= phụ trợ ================= */

function Seg({
  children,
  icon,
  on,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] ${
        on ? "bg-brand-soft font-semibold text-brand" : "bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-line bg-surface px-5 py-12 text-center">
      <Clock size={24} className="mx-auto text-ink-3" />
      <p className="mx-auto mt-3 max-w-[46ch] text-[13px] text-ink-3">{children}</p>
    </div>
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

const fmtLong = (d: Date) =>
  `${WEEKDAY_LABEL[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
const fmtShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
const fmtDay = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/**
 * Thanh nộp bảng chấm công.
 *
 * Productive yêu cầu có dòng giờ cho ĐỦ 7 ngày mới tính là nộp đầy đủ —
 * kể cả cuối tuần. Mục đích: phân biệt "hôm đó nghỉ" với "quên chưa log".
 */
function SubmitBar({
  data,
  userId,
  weekStart,
  onSubmit,
}: {
  data: FinanceData;
  userId: string;
  weekStart: string;
  onSubmit: (weekStart: string) => void;
}) {
  if (!data.timeSettings?.require_submission) return null;

  const { status, daysLogged } = weekSubmission(
    data.submissions,
    data.timeEntries,
    userId,
    weekStart,
  );

  const style =
    status === "submitted"
      ? "border-good bg-good-soft"
      : status === "changes_requested"
        ? "border-bad bg-bad-soft"
        : status === "partial"
          ? "border-warn bg-warn-soft"
          : "border-line bg-surface";

  const label =
    status === "submitted"
      ? "Đã nộp bảng chấm công tuần này"
      : status === "changes_requested"
        ? "Quản lý yêu cầu sửa lại"
        : status === "partial"
          ? `Đã nộp nhưng còn thiếu — mới có ${daysLogged}/7 ngày`
          : `Chưa nộp — đã ghi nhận ${daysLogged}/7 ngày`;

  return (
    <div
      className={`mt-2 flex flex-wrap items-center gap-3 rounded-lg border-l-[3px] px-3.5 py-2 text-[12.5px] ${style}`}
    >
      <span>{label}</span>
      <div className="flex-1" />
      {status !== "submitted" && (
        <Button size="sm" variant="outline" onClick={() => onSubmit(weekStart)}>
          Nộp bảng chấm công
        </Button>
      )}
    </div>
  );
}
