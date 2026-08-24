import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutList,
  Pin,
  Copy as CopyIcon,
  History,
  Play,
  Plus,
  Square,
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
  liveMinutes,
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
  onStartTimer,
  onStopTimer,
  onCopyYesterday,
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
  onStartTimer: (entryId: string) => void;
  onStopTimer: (entryId: string) => void;
  onCopyYesterday: (rows: TimeEntry[]) => void;
}) {
  const [view, setView] = useState<View>("day");
  const [cursor, setCursor] = useState(new Date());
  const [adding, setAdding] = useState<{ date: string; serviceId?: string | undefined } | null>(null);
  // Hạng mục đã ghim — giữ ở máy người dùng, không cần bảng riêng.
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("heye.pinnedServices") ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const togglePin = (id: string) =>
    setPinned((p) => {
      const next = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
      try {
        localStorage.setItem("heye.pinnedServices", JSON.stringify(next));
      } catch {
        /* trình duyệt chặn lưu thì bỏ qua */
      }
      return next;
    });

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
            Bảng chấm công
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
        <CalendarView
          data={data}
          entries={mine}
          days={days}
          onMove={(id, date, startMin) => onUpdate(id, { date, start_min: startMin })}
          onResize={(id, minutes) => {
            // Kéo dài block thì giờ tính tiền đi theo, trừ khi hạng mục
            // không tính tiền — lúc đó giữ nguyên 0.
            const e = mine.find((x) => x.id === id);
            const sv = e ? data.services.find((x) => x.id === e.service_id) : null;
            onUpdate(id, {
              minutes,
              billable_minutes: sv?.billing_type === "non_billable" ? 0 : minutes,
            });
          }}
        />
      ) : (
        <DayView
          data={data}
          tickets={tickets}
          entries={byDate(today)}
          date={today}
          onAdd={(serviceId) => setAdding({ date: today, serviceId: serviceId ?? undefined })}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onStartTimer={onStartTimer}
          onStopTimer={onStopTimer}
          allEntries={mine}
          onCopyYesterday={onCopyYesterday}
          pinned={pinned}
          onTogglePin={togglePin}
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
  onStartTimer,
  onStopTimer,
  allEntries,
  onCopyYesterday,
  pinned,
  onTogglePin,
}: {
  data: FinanceData;
  tickets: Ticket[];
  entries: TimeEntry[];
  date: string;
  onAdd: (serviceId?: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onStartTimer: (entryId: string) => void;
  onStopTimer: (entryId: string) => void;
  allEntries: TimeEntry[];
  onCopyYesterday: (rows: TimeEntry[]) => void;
  pinned: string[];
  onTogglePin: (serviceId: string) => void;
}) {
  // Giờ của hôm qua — để chép sang hôm nay cho việc lặp lại hằng ngày.
  const yesterday = useMemo(() => {
    const y = new Date(date);
    y.setDate(y.getDate() - 1);
    const iso = isoDate(y);
    return allEntries.filter((e) => e.date === iso);
  }, [allEntries, date]);

  const pinnedServices = useMemo(
    () => pinned.map((id) => data.services.find((s) => s.id === id)).filter(Boolean) as BudgetService[],
    [pinned, data.services],
  );

  // Gợi ý: hạng mục vừa dùng gần đây, để bấm một phát là ra dòng mới.
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: BudgetService[] = [];
    for (const e of [...data.timeEntries].reverse()) {
      if (seen.has(e.service_id) || pinned.includes(e.service_id)) continue;
      const s = data.services.find((x) => x.id === e.service_id);
      if (s) {
        out.push(s);
        seen.add(e.service_id);
      }
      if (out.length >= 5) break;
    }
    return out;
  }, [data.timeEntries, data.services, pinned]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Panel gợi ý bên trái, giống Productive */}
      <aside className="space-y-3">
        <Button className="w-full" onClick={() => onAdd()}>
          <Plus size={14} /> Ghi nhận giờ
        </Button>

        {/* Chép lại giờ hôm qua — chỉ hiện khi hôm qua có log và hôm nay chưa. */}
        {yesterday.length > 0 && entries.length === 0 && (
          <Button variant="outline" className="w-full" onClick={() => onCopyYesterday(yesterday)}>
            <CopyIcon size={13} /> Chép {yesterday.length} dòng của hôm qua
          </Button>
        )}

        {pinnedServices.length > 0 && (
          <SuggestBox
            title="Đã ghim"
            icon={<Pin size={11} />}
            items={pinnedServices}
            data={data}
            pinned={pinned}
            onPick={onAdd}
            onTogglePin={onTogglePin}
          />
        )}

        {recent.length > 0 && (
          <SuggestBox
            title="Vừa dùng gần đây"
            icon={<History size={11} />}
            items={recent}
            data={data}
            pinned={pinned}
            onPick={onAdd}
            onTogglePin={onTogglePin}
          />
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
                onStartTimer={() => onStartTimer(e.id)}
                onStopTimer={() => onStopTimer(e.id)}
                isToday={date === isoDate(new Date())}
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
  onStartTimer,
  onStopTimer,
  isToday,
}: {
  entry: TimeEntry;
  data: FinanceData;
  tickets: Ticket[];
  onDelete: () => void;
  onUpdate: (v: Record<string, unknown>) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  isToday: boolean;
}) {
  const [dur, setDur] = useState(fmtDuration(entry.minutes));
  const s = data.services.find((x) => x.id === entry.service_id);
  const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
  const tk = entry.ticket_id ? tickets.find((x) => x.id === entry.ticket_id) : null;
  const free = s?.billing_type === "non_billable";
  const cost = (entry.minutes / 60) * Number(entry.cost_rate_snapshot);
  const locked = isEntryLocked(entry);
  const running = !!entry.timer_started_at;

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

        {/* Đồng hồ chỉ bấm được cho hôm nay — ràng buộc của Productive. */}
        {!locked && isToday && (
          <button
            type="button"
            onClick={running ? onStopTimer : onStartTimer}
            aria-label={running ? "Dừng đồng hồ" : "Bấm giờ"}
            className={`mt-0.5 rounded-md p-1.5 ${
              running
                ? "bg-good-soft text-good"
                : "text-ink-3 hover:bg-brand-soft hover:text-brand"
            }`}
          >
            {running ? <Square size={13} /> : <Play size={13} />}
          </button>
        )}

        <Input
          value={running ? fmtDuration(liveMinutes(entry)) : dur}
          disabled={locked || running}
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
  // Hàng = hạng mục đã log trong tuần, CỘNG những hạng mục người dùng tự thêm.
  // Thiếu vế thứ hai thì tuần trống là màn cụt: không có hàng nào để bấm vào.
  const isoDays = days.map(isoDate);
  const inWeek = entries.filter((e) => isoDays.includes(e.date));
  const [extra, setExtra] = useState<string[]>([]);
  const serviceIds = [...new Set([...inWeek.map((e) => e.service_id), ...extra])];

  const canAdd = data.services.filter((s) => s.allow_time && !serviceIds.includes(s.id));

  const cell = (sid: string, iso: string) =>
    inWeek.filter((e) => e.service_id === sid && e.date === iso).reduce((a, e) => a + e.minutes, 0);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-3">
              <th className="border-b border-line px-4 py-2 text-left font-bold">Hạng mục</th>
              {/* Cột Tổng đứng NGAY SAU tên hạng mục, trước các ngày — đúng
                  thứ tự Productive. Đặt ở cuối thì phải kéo ngang mới thấy. */}
              <th className="border-b border-r border-line px-3 py-2 text-right font-bold">
                Tổng
              </th>
              {days.map((d) => (
                <th key={isoDate(d)} className="border-b border-line px-2 py-2 text-center font-bold">
                  {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
                </th>
              ))}
            </tr>
            {/* Hàng tổng theo từng ngày, Productive gọi là Weekly summary */}
            <tr className="bg-bg/40 text-[12px]">
              <td className="border-b border-line px-4 py-1.5 font-semibold text-ink-2">
                Tổng theo ngày
              </td>
              <td className="num border-b border-r border-line px-3 py-1.5 text-right font-bold">
                {fmtDuration(
                  serviceIds.reduce(
                    (a, sid) => a + isoDays.reduce((b, iso) => b + cell(sid, iso), 0),
                    0,
                  ),
                )}
              </td>
              {isoDays.map((iso) => (
                <td
                  key={iso}
                  className="num border-b border-line px-2 py-1.5 text-center font-semibold text-ink-2"
                >
                  {fmtDuration(serviceIds.reduce((a, sid) => a + cell(sid, iso), 0))}
                </td>
              ))}
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
                  <td className="num border-r border-line px-3 py-2 text-right font-semibold">
                    {fmtDuration(rowTotal)}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Thêm hạng mục vào bảng, đúng vị trí góc dưới trái như Productive */}
      {canAdd.length > 0 && (
        <div className="border-t border-line px-3 py-2">
          <Select value="" onValueChange={(v) => setExtra((x) => [...x, v])}>
            <SelectTrigger className="h-8 w-[260px] border-dashed text-[12.5px]">
              <SelectValue placeholder="+ Thêm hạng mục" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              {data.budgets.map((b) => {
                const items = canAdd.filter((s) => s.budget_id === b.id);
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
        </div>
      )}
    </div>
  );
}

/* ================= Lịch: lưới giờ kéo thả =================
   Productive dựng chế độ Lịch thành LƯỚI GIỜ, không phải 7 thẻ danh sách:
   trục dọc là các mốc giờ trong ngày, 7 cột ngày, mỗi dòng giờ là một block
   đặt đúng vị trí bắt đầu và cao theo thời lượng. Kéo thân block để đổi
   giờ hoặc ngày, kéo cạnh dưới để đổi thời lượng.

   Những dòng chưa gắn giờ cụ thể xếp vào khu riêng phía trên lưới, đúng như
   bản gốc: chúng vẫn tính vào tổng nhưng không có chỗ đứng trên trục giờ. */

const DAY_START = 7 * 60;
const DAY_END = 20 * 60;
const PX_PER_MIN = 0.9;
const SNAP = 15;

function CalendarView({
  data,
  entries,
  days,
  onMove,
  onResize,
}: {
  data: FinanceData;
  entries: TimeEntry[];
  days: Date[];
  onMove: (id: string, date: string, startMin: number) => void;
  onResize: (id: string, minutes: number) => void;
}) {
  const [drag, setDrag] = useState<{
    id: string;
    mode: "move" | "resize";
    startY: number;
    startX: number;
    origMin: number;
    origStart: number;
    origDate: string;
  } | null>(null);
  const [ghost, setGhost] = useState<{ date: string; start: number; minutes: number } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const isoDays = days.map(isoDate);
  const hours: number[] = [];
  for (let h = DAY_START; h <= DAY_END; h += 60) hours.push(h);

  const snap = (v: number) => Math.round(v / SNAP) * SNAP;

  const compute = (ev: PointerEvent) => {
    if (!drag) return null;
    const dyMin = (ev.clientY - drag.startY) / PX_PER_MIN;
    if (drag.mode === "resize") {
      return {
        date: drag.origDate,
        start: drag.origStart,
        minutes: Math.max(SNAP, snap(drag.origMin + dyMin)),
      };
    }
    const colW = (gridRef.current?.clientWidth ?? 700) / days.length;
    const shift = Math.round((ev.clientX - drag.startX) / colW);
    const idx = isoDays.indexOf(drag.origDate);
    const nextIdx = Math.max(0, Math.min(days.length - 1, idx + shift));
    const rawStart = snap(drag.origStart + dyMin);
    return {
      date: isoDays[nextIdx] ?? drag.origDate,
      start: Math.max(DAY_START, Math.min(DAY_END - drag.origMin, rawStart)),
      minutes: drag.origMin,
    };
  };

  useEffect(() => {
    if (!drag) return;
    const onMoveEv = (ev: PointerEvent) => setGhost(compute(ev));
    const onUp = (ev: PointerEvent) => {
      const next = compute(ev);
      if (next) {
        if (drag.mode === "resize") {
          if (next.minutes !== drag.origMin) onResize(drag.id, next.minutes);
        } else if (next.date !== drag.origDate || next.start !== drag.origStart) {
          onMove(drag.id, next.date, next.start);
        }
      }
      setDrag(null);
      setGhost(null);
    };
    window.addEventListener("pointermove", onMoveEv);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMoveEv);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag]);

  const untimed = entries.filter((e) => e.start_min == null);
  const gridH = (DAY_END - DAY_START) * PX_PER_MIN;
  const cols = "56px repeat(" + days.length + ", 1fr)";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
      {untimed.length > 0 && (
        <div className="border-b border-line bg-bg/40 px-3 py-2">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Chưa gắn giờ
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: cols }}>
            <div />
            {isoDays.map((iso) => (
              <div key={iso} className="space-y-1">
                {untimed
                  .filter((e) => e.date === iso)
                  .map((e) => (
                    <UntimedChip key={e.id} entry={e} data={data} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid border-b border-line" style={{ gridTemplateColumns: cols }}>
        <div />
        {days.map((d) => {
          const iso = isoDate(d);
          const total = entries.filter((e) => e.date === iso).reduce((a, e) => a + e.minutes, 0);
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={iso} className={"px-2 py-2 text-center " + (weekend ? "bg-bg/60" : "")}>
              <div className="text-[11.5px] font-bold text-ink-2">
                {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
              </div>
              {total > 0 && <div className="num text-[11px] text-ink-3">{fmtDuration(total)}</div>}
            </div>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className="relative grid overflow-x-auto"
        style={{ gridTemplateColumns: cols, height: gridH }}
      >
        <div className="relative border-r border-line">
          {hours.map((h) => (
            <div
              key={h}
              className="num absolute right-1.5 -translate-y-1/2 text-[10.5px] text-ink-3"
              style={{ top: (h - DAY_START) * PX_PER_MIN }}
            >
              {String(Math.floor(h / 60)).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {days.map((d) => {
          const iso = isoDate(d);
          const weekend = d.getDay() === 0 || d.getDay() === 6;
          const list = entries.filter((e) => e.date === iso && e.start_min != null);
          return (
            <div
              key={iso}
              className={
                "relative border-r border-line last:border-r-0 " + (weekend ? "bg-bg/40" : "")
              }
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-line/60"
                  style={{ top: (h - DAY_START) * PX_PER_MIN }}
                />
              ))}

              {list.map((e) => {
                const isDragging = drag?.id === e.id;
                if (isDragging && ghost && ghost.date !== iso) return null;
                const g = isDragging && ghost ? ghost : null;
                const st = g?.start ?? e.start_min ?? DAY_START;
                const mins = g?.minutes ?? e.minutes;
                const sv = data.services.find((x) => x.id === e.service_id);
                const t = sv ? data.serviceTypes.find((x) => x.id === sv.service_type_id) : null;
                const color = t?.color ?? "#8B87A0";
                const locked = !!e.approved_at;
                return (
                  <div
                    key={e.id}
                    onPointerDown={(ev) => {
                      if (locked) return;
                      ev.preventDefault();
                      setDrag({
                        id: e.id,
                        mode: "move",
                        startY: ev.clientY,
                        startX: ev.clientX,
                        origMin: e.minutes,
                        origStart: e.start_min ?? DAY_START,
                        origDate: e.date,
                      });
                    }}
                    className={
                      "absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-[11px] leading-tight " +
                      (locked ? "cursor-not-allowed " : "cursor-grab active:cursor-grabbing ") +
                      (isDragging ? "opacity-80 shadow-lg" : "")
                    }
                    style={{
                      top: (st - DAY_START) * PX_PER_MIN,
                      height: Math.max(18, mins * PX_PER_MIN - 2),
                      background: color + "22",
                      borderLeft: "3px solid " + color,
                    }}
                    title={
                      (sv?.name ?? "") +
                      " · " +
                      fmtDuration(mins) +
                      (locked ? " · đã duyệt, không sửa được" : "")
                    }
                  >
                    <div className="num font-semibold" style={{ color }}>
                      {fmtDuration(mins)}
                    </div>
                    <div className="truncate text-ink-2">{sv?.name}</div>

                    {!locked && (
                      <div
                        onPointerDown={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          setDrag({
                            id: e.id,
                            mode: "resize",
                            startY: ev.clientY,
                            startX: ev.clientX,
                            origMin: e.minutes,
                            origStart: e.start_min ?? DAY_START,
                            origDate: e.date,
                          });
                        }}
                        className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize hover:bg-ink/10"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="border-t border-line px-3 py-2 text-[11px] text-ink-3">
        Kéo block để đổi giờ hoặc ngày · kéo cạnh dưới để đổi thời lượng · bám mốc 15 phút
      </p>
    </div>
  );
}

/** Chip cho dòng chưa gắn giờ cụ thể trong ngày. */
function UntimedChip({ entry, data }: { entry: TimeEntry; data: FinanceData }) {
  const sv = data.services.find((x) => x.id === entry.service_id);
  const t = sv ? data.serviceTypes.find((x) => x.id === sv.service_type_id) : null;
  const color = t?.color ?? "#8B87A0";
  return (
    <div
      className="truncate rounded-md px-1.5 py-1 text-[11px]"
      style={{ background: color + "22", borderLeft: "3px solid " + color }}
      title={sv?.name}
    >
      <span className="num font-semibold" style={{ color }}>
        {fmtDuration(entry.minutes)}
      </span>{" "}
      <span className="text-ink-2">{sv?.name}</span>
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

/** Một nhóm gợi ý trong panel trái: Đã ghim / Vừa dùng gần đây. */
function SuggestBox({
  title,
  icon,
  items,
  data,
  pinned,
  onPick,
  onTogglePin,
}: {
  title: string;
  icon: React.ReactNode;
  items: BudgetService[];
  data: FinanceData;
  pinned: string[];
  onPick: (serviceId: string) => void;
  onTogglePin: (serviceId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <header className="flex items-center gap-1.5 border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">
        {icon} {title}
      </header>
      {items.map((s) => {
        const t = data.serviceTypes.find((x) => x.id === s.service_type_id);
        const b = data.budgets.find((x) => x.id === s.budget_id);
        const isPinned = pinned.includes(s.id);
        return (
          <div
            key={s.id}
            className="group flex items-start gap-2 border-b border-line px-3 py-2 last:border-0 hover:bg-brand-soft/40"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: t?.color }}
            />
            <button
              type="button"
              onClick={() => onPick(s.id)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate text-[12.5px] font-medium">{s.name}</span>
              <span className="block truncate text-[11px] text-ink-3">{b?.name}</span>
            </button>
            <button
              type="button"
              onClick={() => onTogglePin(s.id)}
              aria-label={isPinned ? "Bỏ ghim" : "Ghim hạng mục"}
              className={`mt-0.5 shrink-0 rounded p-1 ${
                isPinned
                  ? "text-brand"
                  : "text-ink-3 opacity-0 group-hover:opacity-100 hover:text-brand"
              }`}
            >
              <Pin size={12} fill={isPinned ? "currentColor" : "none"} />
            </button>
          </div>
        );
      })}
    </section>
  );
}
