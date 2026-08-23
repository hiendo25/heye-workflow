import { useState } from "react";
import { History, Pencil, Trash2 } from "lucide-react";
import { PanelFooter, PanelRow, SettingsPanel } from "@/components/heye/SettingsPanel";
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
  costRateFor,
  latestRate,
  money,
  overheadPerHour,
  rateHistory,
  type CostRate,
  type FinanceData,
  type OverheadSettings,
} from "@/lib/finance-data";
import type { User } from "@/lib/heye-data";

export function CostRatePanel({
  data,
  users,
  nsId,
  onSaveRate,
  onDeleteRate,
  onSaveOverhead,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  onSaveRate: (v: Record<string, unknown>) => void;
  onDeleteRate: (id: string) => void;
  onSaveOverhead: (v: Record<string, unknown>) => void;
}) {
  const [edit, setEdit] = useState<User | null>(null);
  const [history, setHistory] = useState<User | null>(null);
  const [ohOpen, setOhOpen] = useState(false);

  const oh = overheadPerHour(data.overhead);
  const missing = users.filter((u) => !latestRate(data.costRates, u.id)).length;

  return (
    <>
      <SettingsPanel
        title="Giá vốn nhân sự"
        description={
          <>
            Con số thứ hai để tính được lãi. Giá bán gắn vào <b>hạng mục</b>, giá vốn gắn vào{" "}
            <b>con người</b> — một người đi dự án nào cũng tốn như nhau.
            <br />
            <br />
            Đây là dữ liệu nhạy cảm vì lộ mức lương, nên thực tế chỉ kế toán và ban giám đốc
            được xem.
          </>
        }
      >
        {missing > 0 && (
          <div className="border-b border-line bg-warn-soft px-4 py-2.5 text-[12.5px] text-ink">
            Còn <b>{missing}</b> người chưa có giá vốn. Giờ họ log sẽ tính chi phí bằng 0 — lợi
            nhuận nhìn cao hơn thực tế.
          </div>
        )}

        {users.map((u) => {
          const r = costRateFor(data, u.id);
          const def = latestRate(data.costRates, u.id);
          const versions = rateHistory(data.costRates, u.id).length;
          return (
            <PanelRow
              key={u.id}
              meta={
                r.source === "none" ? (
                  <span className="text-warn">chưa đặt</span>
                ) : (
                  <span className="flex items-center gap-3">
                    {r.overhead > 0 && (
                      <span className="text-[11.5px] text-ink-3">
                        {money(Math.round(r.base))} + {money(Math.round(r.overhead))}
                      </span>
                    )}
                    <span className="num w-28 text-right font-semibold text-ink">
                      {money(Math.round(r.total))}
                    </span>
                  </span>
                )
              }
              actions={[
                {
                  label: def ? "Sửa giá vốn" : "Đặt giá vốn",
                  icon: <Pencil size={14} />,
                  onSelect: () => setEdit(u),
                },
                ...(versions > 1
                  ? [
                      {
                        label: `Lịch sử (${versions} mức)`,
                        icon: <History size={14} />,
                        onSelect: () => setHistory(u),
                      },
                    ]
                  : []),
              ]}
            >
              <span
                className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: u.avatar_color }}
              >
                {u.initial}
              </span>
              <span className="font-medium text-ink">{u.full_name}</span>
              {def && !def.add_overhead && (
                <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-[10.5px] text-ink-3">
                  không cộng chi phí gián tiếp
                </span>
              )}
            </PanelRow>
          );
        })}

        <PanelFooter>
          <span className="text-[12.5px] text-ink-2">
            Chi phí gián tiếp:{" "}
            {data.overhead?.is_enabled ? (
              <b className="num">{money(Math.round(oh))} đ/giờ</b>
            ) : (
              <span className="text-warn">chưa bật</span>
            )}
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={() => setOhOpen(true)}>
            Cấu hình chi phí gián tiếp
          </Button>
        </PanelFooter>
      </SettingsPanel>

      <RateDialog
        key={edit?.id ?? "closed"}
        open={edit !== null}
        user={edit}
        current={edit ? latestRate(data.costRates, edit.id) : null}
        overhead={oh}
        onClose={() => setEdit(null)}
        onSubmit={(v) => {
          onSaveRate({ ...v, namespace_id: nsId, user_id: edit!.id });
          setEdit(null);
        }}
      />

      <HistoryDialog
        key={history?.id ?? "closed-h"}
        open={history !== null}
        user={history}
        rows={history ? rateHistory(data.costRates, history.id) : []}
        onClose={() => setHistory(null)}
        onDelete={onDeleteRate}
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

/* -------- Đặt / sửa giá vốn -------- */

function RateDialog({
  open,
  user,
  current,
  overhead,
  onClose,
  onSubmit,
}: {
  open: boolean;
  user: User | null;
  current: CostRate | null;
  overhead: number;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [rate, setRate] = useState(current ? String(current.rate) : "");
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [addOh, setAddOh] = useState(current?.add_overhead ?? true);
  const [note, setNote] = useState("");

  if (!user) return null;
  const base = Number(rate || 0);
  const total = base + (addOh ? overhead : 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Giá vốn — {user.full_name}</DialogTitle>
          <DialogDescription>
            Công ty tốn bao nhiêu cho một giờ làm việc của người này. Thường tính bằng
            lương tháng chia số giờ làm chuẩn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá vốn mỗi giờ" required>
              <Input
                className="num"
                inputMode="numeric"
                autoFocus
                value={rate}
                placeholder="280000"
                onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ""))}
              />
            </Field>
            <Field label="Áp dụng từ ngày">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
          </div>

          {current && (
            <p className="-mt-1 text-[11.5px] text-ink-3">
              Mức hiện tại <b className="num">{money(current.rate)}</b> áp dụng từ{" "}
              {fmt(current.valid_from)}. Lưu mức mới sẽ giữ nguyên chi phí của những giờ đã
              log trước ngày áp dụng.
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <input
              type="checkbox"
              checked={addOh}
              onChange={(e) => setAddOh(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[var(--brand)]"
            />
            <span className="text-[12.5px]">
              Cộng chi phí gián tiếp
              <span className="block text-[11.5px] text-ink-3">
                Mặt bằng, điện nước, quản lý — phân bổ lên mỗi giờ làm việc.
              </span>
            </span>
          </label>

          <Field label="Ghi chú">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tăng lương định kỳ, lên cấp bậc…"
            />
          </Field>

          {base > 0 && (
            <div className="rounded-lg bg-brand-soft px-3 py-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-ink-2">Lương quy giờ</span>
                <span className="num">{money(base)}</span>
              </div>
              {addOh && overhead > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-2">Chi phí gián tiếp</span>
                  <span className="num">+ {money(Math.round(overhead))}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-brand/20 pt-1 font-bold">
                <span>Giá vốn thực</span>
                <span className="num text-brand">{money(Math.round(total))} đ/giờ</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!rate}
            onClick={() =>
              onSubmit({
                rate: Number(rate),
                valid_from: from,
                add_overhead: addOh,
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

/* -------- Lịch sử giá vốn -------- */

function HistoryDialog({
  open,
  user,
  rows,
  onClose,
  onDelete,
}: {
  open: boolean;
  user: User | null;
  rows: CostRate[];
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!user) return null;
  const today = new Date().toISOString().slice(0, 10);
  const activeId = rows.find((r) => r.valid_from <= today)?.id;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Lịch sử giá vốn — {user.full_name}</DialogTitle>
          <DialogDescription>
            Mỗi mức có ngày hiệu lực riêng. Giờ đã log tính theo mức đang có hiệu lực tại
            ngày log, nên tăng lương không làm lệch số liệu tháng trước.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-line rounded-lg border border-line">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="num font-semibold">{money(r.rate)}</span>
                  {r.id === activeId && (
                    <span className="rounded bg-good-soft px-1.5 py-0.5 text-[10px] font-bold text-good">
                      ĐANG ÁP DỤNG
                    </span>
                  )}
                  {r.valid_from > today && (
                    <span className="rounded bg-warn-soft px-1.5 py-0.5 text-[10px] font-bold text-warn">
                      HIỆU LỰC SAU
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-ink-3">
                  từ {fmt(r.valid_from)}
                  {r.note && ` · ${r.note}`}
                </div>
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                  aria-label="Xoá mức giá"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
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

/* -------- Chi phí gián tiếp -------- */

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
  const [cost, setCost] = useState(value ? String(value.monthly_cost) : "");
  const [hours, setHours] = useState(value ? String(value.monthly_hours) : "");
  const [on, setOn] = useState(value?.is_enabled ?? false);

  const per = Number(hours) ? Number(cost) / Number(hours) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Chi phí gián tiếp</DialogTitle>
          <DialogDescription>
            Mặt bằng, điện nước, máy móc, HR, kế toán, quản lý — không gắn vào dự án nào
            nhưng vẫn phải trả. Phân bổ lên mỗi giờ làm việc để biên lợi nhuận phản ánh
            đúng thực tế.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Field label="Chi phí gián tiếp mỗi tháng" required>
            <Input
              className="num"
              inputMode="numeric"
              value={cost}
              placeholder="450000000"
              onChange={(e) => setCost(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
          <Field label="Tổng giờ làm việc của công ty mỗi tháng" required>
            <Input
              className="num"
              inputMode="numeric"
              value={hours}
              placeholder="4800"
              onChange={(e) => setHours(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px]">
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => setOn(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--brand)]"
            />
            Cộng chi phí gián tiếp vào giá vốn
          </label>

          {per > 0 && (
            <div className="rounded-lg bg-brand-soft px-3 py-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[12.5px] text-ink-2">Phân bổ mỗi giờ</span>
                <span className="num text-[15px] font-bold text-brand">
                  {money(Math.round(per))} đ
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-3">
                Người có lương quy giờ 280.000 đ sẽ tốn thực tế{" "}
                <b className="num">{money(Math.round(280000 + per))} đ</b>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!cost || !hours}
            onClick={() =>
              onSubmit({
                monthly_cost: Number(cost),
                monthly_hours: Number(hours),
                is_enabled: on,
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

function Field({
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
