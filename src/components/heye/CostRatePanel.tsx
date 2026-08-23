import { useState } from "react";
import { Calendar, Coins, Pencil, Timer, Trash2, Wallet, X } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  costRateFor,
  hourlyCost,
  money,
  overheadBreakdown,
  periodCapacity,
  rateHistory,
  rateOnDate,
  RATE_AMOUNT_LABEL,
  RATE_TYPE_LABEL,
  weeklyHours,
  type CostRate,
  type FinanceData,
  type OverheadSettings,
  type RateType,
} from "@/lib/finance-data";
import type { User } from "@/lib/heye-data";

const DAYS = [
  { key: "hours_mon", label: "T2" },
  { key: "hours_tue", label: "T3" },
  { key: "hours_wed", label: "T4" },
  { key: "hours_thu", label: "T5" },
  { key: "hours_fri", label: "T6" },
  { key: "hours_sat", label: "T7" },
  { key: "hours_sun", label: "CN" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

export function CostRatePanel({
  data,
  users,
  nsId,
  onSaveRate,
  onUpdateRate,
  onDeleteRate,
  onSaveOverhead,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  onSaveRate: (v: Record<string, unknown>) => void;
  onUpdateRate: (id: string, v: Record<string, unknown>) => void;
  onDeleteRate: (id: string) => void;
  onSaveOverhead: (v: Record<string, unknown>) => void;
}) {
  const [openUser, setOpenUser] = useState<User | null>(null);
  const [ohOpen, setOhOpen] = useState(false);

  const ohb = overheadBreakdown(data.overhead);
  const oh = ohb.total;
  const missing = users.filter((u) => !rateOnDate(data.costRates, u.id)).length;

  return (
    <>
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-bold tracking-tight">Giá vốn nhân sự</h1>
            <p className="mt-1 max-w-[72ch] text-[13px] text-ink-2">
              Nhập lương theo kỳ, hệ thống tự quy ra giá vốn một giờ dựa trên lịch làm việc
              thật của từng người. Đây là con số thứ hai để tính được lãi — giá bán gắn vào
              hạng mục, giá vốn gắn vào con người.
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded bg-surface-2 px-2 py-1 text-[11.5px] text-ink-3">
              Chỉ quản trị viên xem được thông tin giá vốn. Phân quyền chưa làm.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setOhOpen(true)}>
            Chi phí gián tiếp:{" "}
            {data.overhead?.is_enabled ? (
              <b className="num ml-1" title="mặt bằng + nội bộ">
                {money(Math.round(oh))} đ/giờ
              </b>
            ) : (
              <span className="ml-1 text-warn">chưa bật</span>
            )}
          </Button>
        </div>

        {missing > 0 && (
          <div className="mt-3 rounded-lg border-l-[3px] border-warn bg-warn-soft px-3.5 py-2.5 text-[12.5px]">
            Còn <b>{missing}</b> người chưa có giá vốn. Giờ họ log sẽ tính chi phí bằng 0 —
            lợi nhuận nhìn cao hơn thực tế.
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-3">
                <th className="border-b border-line px-4 py-2 text-left font-bold">Nhân sự</th>
                <th className="border-b border-line px-3 py-2 text-left font-bold">Kỳ lương</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Lương kỳ</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">Giờ/tuần</th>
                <th className="border-b border-line px-3 py-2 text-right font-bold">
                  Giá vốn mỗi giờ
                </th>
                <th className="border-b border-line px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const cur = rateOnDate(data.costRates, u.id);
                const c = costRateFor(data, u.id);
                return (
                  <tr
                    key={u.id}
                    onClick={() => setOpenUser(u)}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-brand-soft/30"
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: u.avatar_color }}
                      >
                        {u.initial}
                      </span>
                      <span className="font-medium text-ink">{u.full_name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-ink-2">
                      {cur ? (
                        <span className="rounded bg-line px-1.5 py-0.5 text-[11px]">
                          {RATE_TYPE_LABEL[cur.rate_type]}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="num px-3 py-2.5 text-right text-ink-2">
                      {cur ? money(cur.amount) : "—"}
                    </td>
                    <td className="num px-3 py-2.5 text-right text-ink-2">
                      {cur ? weeklyHours(cur) : "—"}
                    </td>
                    <td className="num px-3 py-2.5 text-right">
                      {c.source === "none" ? (
                        <span className="text-warn">chưa đặt</span>
                      ) : (
                        <span className="font-semibold">{money(Math.round(c.total))}</span>
                      )}
                      {c.overhead > 0 && (
                        <div className="text-[11px] text-ink-3">
                          {money(Math.round(c.base))} + {money(Math.round(c.overhead))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] text-brand">Xem</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UserRatesSheet
        key={openUser?.id ?? "closed"}
        user={openUser}
        data={data}
        nsId={nsId}
        onClose={() => setOpenUser(null)}
        onSaveRate={onSaveRate}
        onUpdateRate={onUpdateRate}
        onDeleteRate={onDeleteRate}
      />

      <OverheadDialog
        key={ohOpen ? "oh" : "closed-oh"}
        open={ohOpen}
        value={data.overhead}
        onClose={() => setOhOpen(false)}
        onSubmit={(v) => {
          onSaveOverhead({ ...v, namespace_id: nsId });
          setOhOpen(false);
        }}
      />
    </>
  );
}

/* ============ Panel chi tiết một người ============ */

function UserRatesSheet({
  user,
  data,
  nsId,
  onClose,
  onSaveRate,
  onUpdateRate,
  onDeleteRate,
}: {
  user: User | null;
  data: FinanceData;
  nsId: string;
  onClose: () => void;
  onSaveRate: (v: Record<string, unknown>) => void;
  onUpdateRate: (id: string, v: Record<string, unknown>) => void;
  onDeleteRate: (id: string) => void;
}) {
  const [form, setForm] = useState<CostRate | "new" | null>(null);
  if (!user) return null;

  const rows = rateHistory(data.costRates, user.id);
  const cur = rateOnDate(data.costRates, user.id);
  const c = costRateFor(data, user.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={onClose}>
        <div
          className="scroll-y h-full w-full max-w-[720px] bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-line bg-surface px-5 py-4">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[15px] font-bold text-white"
              style={{ background: user.avatar_color }}
            >
              {user.initial}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold tracking-tight">{user.full_name}</h2>
              <div className="text-[12px] text-ink-3">{user.email ?? "Giá vốn nhân sự"}</div>
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

          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[13.5px] font-bold">Giá vốn hiện tại</h3>
              <div className="flex-1" />
              <Button size="sm" onClick={() => setForm("new")}>
                + Mức giá vốn
              </Button>
            </div>

            {!cur ? (
              <div className="mt-3 rounded-xl border border-line bg-surface px-5 py-10 text-center">
                <Wallet size={26} className="mx-auto text-ink-3" />
                <p className="mt-3 text-[14px] font-semibold">
                  {user.full_name} chưa có mức giá vốn nào
                </p>
                <p className="mt-1 text-[12.5px] text-ink-3">
                  Thêm mức lương để theo dõi chi phí nhân sự.
                </p>
                <Button size="sm" className="mt-4" onClick={() => setForm("new")}>
                  Thêm giá vốn
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2">
                <Stat
                  icon={<Coins size={15} />}
                  label="Kỳ lương"
                  value={RATE_TYPE_LABEL[cur.rate_type]}
                />
                <Stat
                  icon={<Calendar size={15} />}
                  label="Áp dụng từ"
                  value={fmt(cur.start_date)}
                  sub={cur.end_date ? `đến ${fmt(cur.end_date)}` : "đến nay"}
                />
                <Stat
                  icon={<Wallet size={15} />}
                  label={RATE_AMOUNT_LABEL[cur.rate_type]}
                  value={money(cur.amount)}
                />
                <Stat
                  icon={<Timer size={15} />}
                  label="Số giờ trọn kỳ"
                  value={
                    cur.rate_type === "hourly"
                      ? "—"
                      : `${Math.round(periodCapacity(cur, today))} giờ`
                  }
                  sub={`${weeklyHours(cur)} giờ mỗi tuần`}
                />
                <div className="rounded-lg bg-brand-soft px-3 py-2.5 sm:col-span-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-brand">
                      Giá vốn mỗi giờ
                    </span>
                    <span className="num text-[19px] font-bold text-brand">
                      {money(Math.round(c.total))} đ
                    </span>
                  </div>
                  {c.overhead > 0 && (
                    <div className="mt-1 text-[11.5px] text-ink-2">
                      lương quy giờ {money(Math.round(c.base))} + chi phí gián tiếp{" "}
                      {money(Math.round(c.overhead))}
                    </div>
                  )}
                  {!cur.add_overhead && (
                    <div className="mt-1 text-[11.5px] text-ink-3">
                      Không cộng chi phí gián tiếp (thường dùng cho cộng tác viên).
                    </div>
                  )}
                </div>
              </div>
            )}

            {rows.length > 0 && (
              <>
                <h3 className="mt-6 text-[13.5px] font-bold">Lịch sử mức giá</h3>
                <div className="mt-2 overflow-hidden rounded-xl border border-line bg-surface">
                  <table className="w-full border-collapse text-[12.5px]">
                    <thead>
                      <tr className="text-[10.5px] uppercase tracking-wider text-ink-3">
                        <th className="border-b border-line px-3 py-2 text-left font-bold">
                          Hiệu lực
                        </th>
                        <th className="border-b border-line px-3 py-2 text-left font-bold">Kỳ</th>
                        <th className="border-b border-line px-3 py-2 text-right font-bold">
                          Lương
                        </th>
                        <th className="border-b border-line px-3 py-2 text-right font-bold">
                          Mỗi giờ
                        </th>
                        <th className="border-b border-line px-3 py-2 text-center font-bold">
                          Gián tiếp
                        </th>
                        <th className="border-b border-line px-3 py-2 text-left font-bold">
                          Ghi chú
                        </th>
                        <th className="border-b border-line px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const active =
                          r.start_date <= today && (!r.end_date || r.end_date >= today);
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-line last:border-0 ${
                              active ? "bg-good-soft/40" : ""
                            }`}
                          >
                            <td className="px-3 py-2">
                              {fmt(r.start_date)} – {r.end_date ? fmt(r.end_date) : "nay"}
                              {active && (
                                <span className="ml-2 rounded bg-good-soft px-1.5 py-0.5 text-[10px] font-bold text-good">
                                  ĐANG ÁP DỤNG
                                </span>
                              )}
                              {r.start_date > today && (
                                <span className="ml-2 rounded bg-warn-soft px-1.5 py-0.5 text-[10px] font-bold text-warn">
                                  HIỆU LỰC SAU
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-ink-2">
                              {RATE_TYPE_LABEL[r.rate_type]}
                            </td>
                            <td className="num px-3 py-2 text-right">{money(r.amount)}</td>
                            <td className="num px-3 py-2 text-right font-semibold">
                              {money(Math.round(hourlyCost(r, today)))}
                            </td>
                            <td className="px-3 py-2 text-center text-ink-3">
                              {r.add_overhead ? "có" : "×"}
                            </td>
                            <td className="px-3 py-2 text-ink-3">{r.note ?? "—"}</td>
                            <td className="px-2 py-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  className="rounded p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
                                  aria-label="Tuỳ chọn"
                                >
                                  ⋯
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => setForm(r)}>
                                    <Pencil size={14} /> Sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => onDeleteRate(r.id)}
                                    className="text-bad focus:text-bad"
                                  >
                                    <Trash2 size={14} /> Xoá
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RateDialog
        key={form === "new" ? "new" : (form?.id ?? "closed")}
        open={form !== null}
        user={user}
        value={form === "new" ? null : form}
        overhead={overheadBreakdown(data.overhead).total}
        onClose={() => setForm(null)}
        onSubmit={(v) => {
          if (form === "new") onSaveRate({ ...v, namespace_id: nsId, user_id: user.id });
          else onUpdateRate((form as CostRate).id, v);
          setForm(null);
        }}
      />
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-3">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-ink-3">{label}</div>
        <div className="num text-[14px] font-semibold">{value}</div>
        {sub && <div className="text-[11px] text-ink-3">{sub}</div>}
      </div>
    </div>
  );
}

/* ============ Form thêm/sửa mức giá vốn ============ */

function RateDialog({
  open,
  user,
  value,
  overhead,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user: User;
  value: CostRate | null;
  overhead: number;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [type, setType] = useState<RateType>(value?.rate_type ?? "monthly");
  const [amount, setAmount] = useState(value ? String(value.amount) : "");
  const [start, setStart] = useState(value?.start_date ?? new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(value?.end_date ?? "");
  const [addOh, setAddOh] = useState(value?.add_overhead ?? true);
  const [note, setNote] = useState(value?.note ?? "");
  const [hours, setHours] = useState<Record<DayKey, number>>({
    hours_mon: value?.hours_mon ?? 8,
    hours_tue: value?.hours_tue ?? 8,
    hours_wed: value?.hours_wed ?? 8,
    hours_thu: value?.hours_thu ?? 8,
    hours_fri: value?.hours_fri ?? 8,
    hours_sat: value?.hours_sat ?? 0,
    hours_sun: value?.hours_sun ?? 0,
  });

  const week = Object.values(hours).reduce((a, b) => a + Number(b || 0), 0);
  const draft = {
    ...hours, rate_type: type, amount: Number(amount || 0),
    start_date: start, end_date: end || null,
  } as unknown as CostRate;
  const cap = type === "hourly" ? 0 : periodCapacity(draft, start);
  const perHour = amount ? hourlyCost(draft, start) : 0;
  const total = perHour + (addOh ? overhead : 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {value ? "Sửa mức giá vốn" : `Thêm mức giá vốn — ${user.full_name}`}
          </DialogTitle>
          <DialogDescription>
            Nhập lương theo kỳ thực tế của công ty. Hệ thống chia cho số giờ làm việc trọn
            kỳ (đã trừ ngày nghỉ lễ) để ra giá vốn một giờ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <L label="Kỳ lương">
              <Select value={type} onValueChange={(v) => setType(v as RateType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RATE_TYPE_LABEL) as RateType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {RATE_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </L>
            <L label={RATE_AMOUNT_LABEL[type]} required>
              <Input
                className="num"
                inputMode="numeric"
                autoFocus
                value={amount}
                placeholder={type === "monthly" ? "30000000" : ""}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              />
            </L>
          </div>

          <div>
            <div className="mb-1.5 text-[12.5px] font-medium text-ink-2">
              Lịch làm việc — số giờ mỗi ngày
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const on = Number(hours[d.key]) > 0;
                return (
                  <div key={d.key} className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setHours((h) => ({ ...h, [d.key]: on ? 0 : 8 }))
                      }
                      className={`w-full rounded-t-md py-1 text-[11px] font-semibold ${
                        on ? "bg-brand text-white" : "bg-line text-ink-3"
                      }`}
                    >
                      {d.label}
                    </button>
                    <input
                      inputMode="decimal"
                      value={hours[d.key] || ""}
                      disabled={!on}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [d.key]: Number(e.target.value.replace(/[^\d.]/g, "") || 0),
                        }))
                      }
                      className="num w-full rounded-b-md border border-t-0 border-line bg-surface py-1 text-center text-[12.5px] disabled:bg-surface-2 disabled:text-ink-3"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-2">
              Giờ làm mỗi tuần: <b className="num">{week}</b>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <L label="Bắt đầu từ" required>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </L>
            <L label="Kết thúc (nếu có)">
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </L>
          </div>

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <input
              type="checkbox"
              checked={addOh}
              onChange={(e) => setAddOh(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[var(--brand)]"
            />
            <span className="text-[12.5px]">
              Cộng chi phí gián tiếp vào mức này
              <span className="block text-[11.5px] text-ink-3">
                Bật cho nhân viên chính thức, tắt cho cộng tác viên.
              </span>
            </span>
          </label>

          <L label="Ghi chú">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tăng lương định kỳ, lên cấp bậc…"
            />
          </L>

          {Number(amount) > 0 && week > 0 && (
            <div className="rounded-lg bg-brand-soft px-3 py-2.5 text-[12.5px]">
              {type !== "hourly" && (
                <div className="flex justify-between text-ink-2">
                  <span>Số giờ làm việc trọn kỳ</span>
                  <span className="num">{Math.round(cap)} giờ</span>
                </div>
              )}
              <div className="flex justify-between text-ink-2">
                <span>Lương quy giờ</span>
                <span className="num">{money(Math.round(perHour))}</span>
              </div>
              {addOh && overhead > 0 && (
                <div className="flex justify-between text-ink-2">
                  <span>Chi phí gián tiếp</span>
                  <span className="num">+ {money(Math.round(overhead))}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-brand/20 pt-1 font-bold">
                <span>Giá vốn mỗi giờ</span>
                <span className="num text-brand">{money(Math.round(total))} đ</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!amount || week === 0}
            onClick={() =>
              onSubmit({
                rate_type: type,
                amount: Number(amount),
                ...hours,
                start_date: start,
                end_date: end || null,
                add_overhead: addOh,
                note: note.trim() || null,
              })
            }
          >
            {value ? "Lưu thay đổi" : "Tạo mức giá vốn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ Chi phí gián tiếp ============ */

function OverheadDialog({
  open,
  value,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: OverheadSettings | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [facility, setFacility] = useState(value ? String(value.facility_cost || "") : "");
  const [totalH, setTotalH] = useState(value ? String(value.total_hours || "") : "");
  const [internal, setInternal] = useState(value ? String(value.internal_cost || "") : "");
  const [clientH, setClientH] = useState(value ? String(value.client_hours || "") : "");
  const [on, setOn] = useState(value?.is_enabled ?? false);

  const perFacility = Number(totalH) ? Number(facility) / Number(totalH) : 0;
  const perInternal = Number(clientH) ? Number(internal) / Number(clientH) : 0;
  const perTotal = perFacility + perInternal;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Chi phí gián tiếp</DialogTitle>
          <DialogDescription>
            Những chi phí không gắn vào dự án nào nhưng vẫn phải trả. Phân bổ lên mỗi giờ làm
            việc để biên lợi nhuận phản ánh đúng thực tế.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* --- Phần 1: mặt bằng --- */}
          <section className="rounded-lg border border-line p-3">
            <h4 className="text-[12.5px] font-bold">Chi phí mặt bằng</h4>
            <p className="mb-2.5 mt-0.5 text-[11.5px] text-ink-3">
              Thuê văn phòng, điện nước, thiết bị, bản quyền phần mềm dùng chung. Chia cho{" "}
              <b>tổng giờ</b> vì ai làm gì cũng ngồi văn phòng.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <L label="Chi phí mỗi tháng" required>
                <Input
                  className="num"
                  inputMode="numeric"
                  value={facility}
                  placeholder="180000000"
                  onChange={(e) => setFacility(e.target.value.replace(/[^\d]/g, ""))}
                />
              </L>
              <L label="Tổng giờ làm việc" required>
                <Input
                  className="num"
                  inputMode="numeric"
                  value={totalH}
                  placeholder="1176"
                  onChange={(e) => setTotalH(e.target.value.replace(/[^\d]/g, ""))}
                />
              </L>
            </div>
            {perFacility > 0 && (
              <div className="mt-2 flex justify-between text-[12px]">
                <span className="text-ink-2">Mặt bằng mỗi giờ</span>
                <span className="num font-semibold">{money(Math.round(perFacility))} đ</span>
              </div>
            )}
          </section>

          {/* --- Phần 2: nội bộ --- */}
          <section className="rounded-lg border border-line p-3">
            <h4 className="text-[12.5px] font-bold">Chi phí nội bộ</h4>
            <p className="mb-2.5 mt-0.5 text-[11.5px] text-ink-3">
              Giờ làm việc nội bộ, đào tạo, nghỉ phép — phần không ra tiền. Chia cho{" "}
              <b>giờ làm cho khách</b>, vì chỉ phần đó mới sinh doanh thu để gánh.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <L label="Chi phí mỗi tháng">
                <Input
                  className="num"
                  inputMode="numeric"
                  value={internal}
                  placeholder="60000000"
                  onChange={(e) => setInternal(e.target.value.replace(/[^\d]/g, ""))}
                />
              </L>
              <L label="Giờ làm cho khách">
                <Input
                  className="num"
                  inputMode="numeric"
                  value={clientH}
                  placeholder="900"
                  onChange={(e) => setClientH(e.target.value.replace(/[^\d]/g, ""))}
                />
              </L>
            </div>
            {perInternal > 0 && (
              <div className="mt-2 flex justify-between text-[12px]">
                <span className="text-ink-2">Nội bộ mỗi giờ</span>
                <span className="num font-semibold">{money(Math.round(perInternal))} đ</span>
              </div>
            )}
            <p className="mt-2 rounded bg-surface-2 px-2 py-1.5 text-[11px] text-ink-3">
              Tạm nhập tay. Sau khi có phần ghi nhận giờ, số này tự tính từ giờ log vào hợp
              đồng nội bộ, chi phí nội bộ và ngày nghỉ phép.
            </p>
          </section>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px]">
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => setOn(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--brand)]"
            />
            Cộng chi phí gián tiếp vào giá vốn
          </label>

          {perTotal > 0 && (
            <div className="rounded-lg bg-brand-soft px-3 py-2.5 text-[12.5px]">
              <div className="flex justify-between text-ink-2">
                <span>Hợp đồng khách — cộng cả hai</span>
                <span className="num font-bold text-brand">
                  {money(Math.round(perTotal))} đ/giờ
                </span>
              </div>
              <div className="mt-0.5 flex justify-between text-ink-2">
                <span>Hợp đồng nội bộ — chỉ mặt bằng</span>
                <span className="num font-semibold">{money(Math.round(perFacility))} đ/giờ</span>
              </div>
              <p className="mt-1.5 border-t border-brand/20 pt-1.5 text-[11px] text-ink-3">
                Hợp đồng nội bộ không cộng phần nội bộ, vì làm vậy là tính trùng — bản thân
                giờ nội bộ chính là thứ tạo ra chi phí đó.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!facility || !totalH}
            onClick={() =>
              onSubmit({
                facility_cost: Number(facility),
                total_hours: Number(totalH),
                internal_cost: Number(internal || 0),
                client_hours: Number(clientH || totalH),
                is_enabled: on,
                monthly_cost: Number(facility),
                monthly_hours: Number(totalH),
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

function fmt(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
