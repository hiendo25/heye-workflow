import { useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
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
  bookingHours,
  costRateFor,
  isoDate,
  money,
  scheduledHoursOn,
  weekDays,
  workdaysBetween,
  WEEKDAY_LABEL,
  type Booking,
  type FinanceData,
} from "@/lib/finance-data";
import type { User } from "@/lib/heye-data";

/**
 * Xếp lịch nhân sự — nguồn dữ liệu TƯƠNG LAI duy nhất.
 *
 * Không xếp lịch thì biểu đồ chỉ vẽ được quá khứ, đường đứt không có gì
 * để nối. Dự báo đọc từ đây chứ không phải ngoại suy từ số liệu cũ.
 */
export function ResourcePlanner({
  data,
  users,
  nsId,
  onCreate,
  onUpdate,
  onDelete,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  onCreate: (v: Record<string, unknown>) => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [cursor, setCursor] = useState(new Date());
  const [adding, setAdding] = useState<{ userId: string; date: string } | null>(null);
  const [open, setOpen] = useState<Booking | null>(null);

  const days = weekDays(cursor);
  const isoDays = days.map(isoDate);
  const today = isoDate(new Date());

  const move = (d: number) => {
    const n = new Date(cursor);
    n.setDate(cursor.getDate() + d);
    setCursor(n);
  };

  // Giờ làm chuẩn mỗi ngày để so với sức chứa
  const capacity = 8;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight">Xếp lịch</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-2">
            Phân bổ người vào hạng mục trong tương lai. Đây là dữ liệu để vẽ đường dự báo.
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
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-3">
                <th className="border-b border-line px-4 py-2 text-left font-bold">Nhân sự</th>
                {days.map((d) => (
                  <th key={isoDate(d)} className="border-b border-line px-2 py-2 text-center font-bold">
                    {WEEKDAY_LABEL[d.getDay()]} {d.getDate()}
                  </th>
                ))}
                <th className="border-b border-line px-3 py-2 text-right font-bold">Tuần</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const weekTotal = isoDays.reduce(
                  (a, iso) => a + scheduledHoursOn(data.bookings, u.id, iso),
                  0,
                );
                return (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: u.avatar_color }}
                        >
                          {u.initial}
                        </span>
                        <span className="font-medium">{u.full_name}</span>
                      </span>
                    </td>
                    {isoDays.map((iso) => {
                      const confirmed = scheduledHoursOn(data.bookings, u.id, iso);
                      const withTent = scheduledHoursOn(data.bookings, u.id, iso, true);
                      const tentative = withTent - confirmed;
                      const weekend = [0, 6].includes(new Date(iso).getDay());
                      const over = confirmed > capacity;
                      return (
                        <td key={iso} className="px-1 py-1 text-center">
                          <button
                            type="button"
                            onClick={() => setAdding({ userId: u.id, date: iso })}
                            disabled={weekend}
                            className={`num w-full rounded-md py-1.5 text-[12.5px] disabled:opacity-30 ${
                              over
                                ? "bg-bad-soft font-semibold text-bad"
                                : confirmed
                                  ? "bg-good-soft font-semibold text-good"
                                  : tentative
                                    ? "bg-line text-ink-3"
                                    : "text-ink-3 hover:bg-surface-2"
                            }`}
                            title={
                              over
                                ? `Quá tải: ${confirmed}h trên sức chứa ${capacity}h`
                                : tentative
                                  ? `${confirmed}h chắc chắn + ${tentative}h tạm tính`
                                  : "Xếp lịch"
                            }
                          >
                            {confirmed || tentative ? (
                              <>
                                {confirmed || "—"}
                                {tentative > 0 && (
                                  <span className="ml-0.5 text-[10px] opacity-60">
                                    +{tentative}
                                  </span>
                                )}
                              </>
                            ) : (
                              "+"
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="num px-3 py-2 text-right font-semibold">
                      {weekTotal ? `${weekTotal}h` : <span className="text-ink-3">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-2 text-[11.5px] text-ink-3">
        Ô xanh đã xếp · ô đỏ quá sức chứa {capacity}h · số nhỏ mờ là giờ tạm tính (không cộng
        vào tổng, vì việc chưa chắc).
      </p>

      {/* Danh sách lịch đã xếp trong tuần */}
      <h3 className="mt-6 text-[13.5px] font-bold">Lịch đã xếp</h3>
      <div className="mt-2 space-y-2">
        {data.bookings
          .filter((b) => b.end_date >= isoDays[0]! && b.start_date <= isoDays[6]!)
          .map((b) => {
            const s = data.services.find((x) => x.id === b.service_id);
            const bd = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
            const u = users.find((x) => x.id === b.user_id);
            const t = s ? data.serviceTypes.find((x) => x.id === s.service_type_id) : null;
            const hours = bookingHours(b);
            const rate = costRateFor(data, b.user_id, { onDate: b.start_date });
            return (
              <div
                key={b.id}
                onClick={() => setOpen(b)}
                className={`cursor-pointer rounded-xl border bg-surface px-4 py-3 hover:bg-brand-soft/25 ${
                  b.is_tentative ? "border-dashed border-line-2" : "border-line"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: u?.avatar_color }}
                  >
                    {u?.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold">{s?.name}</span>
                      {b.is_tentative && (
                        <span className="rounded bg-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-3">
                          tạm tính
                        </span>
                      )}
                      {b.auto_track && (
                        <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                          tự ghi giờ
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[11.5px] text-ink-3">
                      {u?.full_name} · {bd?.name}
                    </div>
                    <div className="num mt-0.5 text-[11.5px] text-ink-3">
                      {fmtVn(b.start_date)} – {fmtVn(b.end_date)} · {b.hours_per_day}h mỗi ngày
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="num text-[14px] font-bold">{hours}h</div>
                    <div className="num text-[11px] text-ink-3">
                      {money(Math.round(hours * rate.total))} đ
                    </div>
                  </div>
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: t?.color }}
                  />
                </div>
              </div>
            );
          })}
        {data.bookings.filter((b) => b.end_date >= isoDays[0]! && b.start_date <= isoDays[6]!)
          .length === 0 && (
          <div className="rounded-xl border border-line bg-surface px-5 py-10 text-center">
            <CalendarRange size={24} className="mx-auto text-ink-3" />
            <p className="mx-auto mt-3 max-w-[52ch] text-[13px] text-ink-3">
              Tuần này chưa xếp lịch cho ai. Bấm vào ô trống ở bảng trên để xếp — không có lịch
              thì biểu đồ dự báo không vẽ được đường tương lai.
            </p>
          </div>
        )}
      </div>

      {adding && (
        <BookingDialog
          key={`${adding.userId}-${adding.date}`}
          data={data}
          users={users}
          nsId={nsId}
          preset={adding}
          onClose={() => setAdding(null)}
          onSubmit={(v) => {
            onCreate(v);
            setAdding(null);
          }}
        />
      )}

      {open && (
        <BookingSheet
          booking={open}
          data={data}
          users={users}
          onClose={() => setOpen(null)}
          onUpdate={onUpdate}
          onDelete={(id) => {
            onDelete(id);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}

/* ============ Chi tiết một lịch ============ */

function BookingSheet({
  booking,
  data,
  users,
  onClose,
  onUpdate,
  onDelete,
}: {
  booking: Booking;
  data: FinanceData;
  users: User[];
  onClose: () => void;
  onUpdate: (id: string, v: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const s = data.services.find((x) => x.id === booking.service_id);
  const b = s ? data.budgets.find((x) => x.id === s.budget_id) : null;
  const u = users.find((x) => x.id === booking.user_id);
  const hours = bookingHours(booking);
  const days = workdaysBetween(booking.start_date, booking.end_date).length;
  const rate = costRateFor(data, booking.user_id, { onDate: booking.start_date });
  const revenue = s?.billing_type === "tm" ? hours * Number(s.price) : 0;
  const cost = hours * rate.total;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{s?.name}</DialogTitle>
          <DialogDescription>
            {u?.full_name} · {b?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-[12.5px]">
            <Row label="Khoảng thời gian" value={`${fmtVn(booking.start_date)} – ${fmtVn(booking.end_date)}`} />
            <Row label="Ngày làm việc" value={`${days} ngày`} />
            <Row label="Giờ mỗi ngày" value={`${booking.hours_per_day}h`} />
            <Row label="Tổng giờ" value={`${hours}h`} bold />
          </div>

          <div className="rounded-lg bg-brand-soft px-3 py-2.5 text-[12.5px]">
            <Row label="Chi phí dự kiến" value={`${money(Math.round(cost))} đ`} />
            <Row
              label="Doanh thu dự kiến"
              value={revenue ? `${money(Math.round(revenue))} đ` : "—"}
            />
            {revenue > 0 && (
              <Row
                label="Lãi dự kiến"
                value={`${money(Math.round(revenue - cost))} đ`}
                bold
                tone={revenue - cost >= 0 ? "good" : "bad"}
              />
            )}
            {s?.billing_type === "fixed" && (
              <p className="mt-1 text-[11px] text-ink-3">
                Hạng mục trọn gói: doanh thu đã cố định ở hợp đồng, không tăng theo giờ.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle
              on={booking.is_tentative}
              onClick={() => onUpdate(booking.id, { is_tentative: !booking.is_tentative })}
            >
              {booking.is_tentative ? "Đang tạm tính" : "Đã chắc chắn"}
            </Toggle>
            <Toggle
              on={booking.auto_track}
              onClick={() => onUpdate(booking.id, { auto_track: !booking.auto_track })}
            >
              {booking.auto_track ? "Tự ghi giờ" : "Không tự ghi giờ"}
            </Toggle>
          </div>

          {booking.is_tentative && (
            <p className="text-[11.5px] text-ink-3">
              Lịch tạm tính không cộng vào tổng giờ đã xếp của người đó, để không làm phồng
              khối lượng công việc khi việc còn chưa chắc.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-bad hover:bg-bad-soft hover:text-bad"
            onClick={() => onDelete(booking.id)}
          >
            <Trash2 size={13} /> Xoá lịch
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Xếp lịch mới ============ */

function BookingDialog({
  data,
  users,
  nsId,
  preset,
  onClose,
  onSubmit,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  preset: { userId: string; date: string };
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [userId, setUserId] = useState(preset.userId);
  const [serviceId, setServiceId] = useState("");
  const [start, setStart] = useState(preset.date);
  const [end, setEnd] = useState(preset.date);
  const [perDay, setPerDay] = useState("8");
  const [tentative, setTentative] = useState(false);
  const [autoTrack, setAutoTrack] = useState(false);

  const options = data.services.filter((s) => s.allow_time);
  const s = data.services.find((x) => x.id === serviceId);
  const days = start && end && end >= start ? workdaysBetween(start, end).length : 0;
  const hours = days * Number(perDay || 0);
  const rate = userId ? costRateFor(data, userId, { onDate: start }) : { total: 0 };
  const revenue = s?.billing_type === "tm" ? hours * Number(s.price) : 0;

  // Còn bao nhiêu chưa xếp trên hạng mục này
  const alreadyBooked = data.bookings
    .filter((b) => b.service_id === serviceId)
    .reduce((a, b) => a + bookingHours(b), 0);
  const loggedH =
    data.timeEntries.filter((e) => e.service_id === serviceId).reduce((a, e) => a + e.minutes, 0) /
    60;
  const left = s ? Number(s.quantity) - alreadyBooked - loggedH : 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xếp lịch</DialogTitle>
          <DialogDescription>
            Phân bổ người vào hạng mục trong tương lai. Lịch này là dữ liệu để vẽ đường dự báo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <L label="Người" required>
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
            <L label="Giờ mỗi ngày" required>
              <Input
                className="num"
                inputMode="decimal"
                value={perDay}
                onChange={(e) => setPerDay(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </L>
          </div>

          <L label="Hạng mục" required>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hạng mục" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {data.budgets.map((b) => {
                  const items = options.filter((x) => x.budget_id === b.id);
                  if (!items.length) return null;
                  return (
                    <SelectGroup key={b.id}>
                      <SelectLabel className="text-[11px] text-ink-3">{b.name}</SelectLabel>
                      {items.map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            {s && (
              <p className="mt-1 text-[11.5px] text-ink-3">
                Còn chưa xếp:{" "}
                <b className={left < 0 ? "text-bad" : "text-ink-2"}>{left.toFixed(1)}h</b> trên{" "}
                {s.quantity}h đã bán
              </p>
            )}
          </L>

          <div className="grid grid-cols-2 gap-3">
            <L label="Từ ngày" required>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </L>
            <L label="Đến ngày" required>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </L>
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle on={tentative} onClick={() => setTentative((v) => !v)}>
              Tạm tính
            </Toggle>
            <Toggle on={autoTrack} onClick={() => setAutoTrack((v) => !v)}>
              Tự ghi giờ
            </Toggle>
          </div>
          {tentative && (
            <p className="-mt-1 text-[11.5px] text-ink-3">
              Giữ chỗ cho việc chưa chắc — không cộng vào tổng giờ đã xếp của người đó.
            </p>
          )}

          {hours > 0 && (
            <div className="rounded-lg bg-brand-soft px-3 py-2.5 text-[12.5px]">
              <Row label={`${days} ngày làm việc`} value={`${hours}h`} bold />
              <Row label="Chi phí dự kiến" value={`${money(Math.round(hours * rate.total))} đ`} />
              {revenue > 0 && (
                <Row label="Doanh thu dự kiến" value={`${money(Math.round(revenue))} đ`} />
              )}
              {left < 0 && (
                <p className="mt-1 text-[11.5px] text-warn">
                  Xếp vượt số giờ đã bán trên hạng mục này.
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
            disabled={!userId || !serviceId || days <= 0 || Number(perDay) <= 0}
            onClick={() =>
              onSubmit({
                namespace_id: nsId,
                user_id: userId,
                service_id: serviceId,
                start_date: start,
                end_date: end,
                hours_per_day: Number(perDay),
                is_tentative: tentative,
                auto_track: autoTrack,
              })
            }
          >
            Xếp lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ phụ trợ ============ */

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "good" | "bad" | undefined;
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-ink-2">{label}</span>
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
      className={`rounded-lg border px-2.5 py-1 text-[12px] ${
        on ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line bg-surface text-ink-2"
      }`}
    >
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
