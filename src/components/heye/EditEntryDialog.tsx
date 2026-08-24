import { useEffect, useState } from "react";
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
  parseDuration,
  type FinanceData,
  type TimeEntry,
} from "@/lib/finance-data";

/**
 * Sửa một dòng giờ đã ghi.
 *
 * Trước đây dòng giờ chỉ sửa được thời lượng ngay tại chỗ, còn hạng mục, ngày
 * và ghi chú thì chịu — ghi nhầm hạng mục là phải xoá rồi ghi lại từ đầu, mất
 * luôn lịch sử. Productive có mục Edit trong menu ba chấm của mỗi dòng.
 *
 * Đổi hạng mục thì tính lại giá vốn theo hạng mục mới, vì giá vốn phụ thuộc
 * hợp đồng: cùng một người có thể có giá vốn riêng cho từng hợp đồng.
 */
export function EditEntryDialog({
  entry,
  data,
  onClose,
  onSave,
}: {
  entry: TimeEntry | null;
  data: FinanceData;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  const [serviceId, setServiceId] = useState(entry?.service_id ?? "");
  const [date, setDate] = useState(entry?.date ?? "");
  const [dur, setDur] = useState(entry ? fmtDuration(entry.minutes) : "");
  const [note, setNote] = useState(entry?.note ?? "");
  const [range, setRange] = useState(false);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");

  useEffect(() => {
    if (!entry) return;
    setServiceId(entry.service_id);
    setDate(entry.date);
    setDur(fmtDuration(entry.minutes));
    setNote(entry.note ?? "");
  }, [entry]);

  const options = data.services.filter((s) => s.allow_time);
  // Nhập khoảng giờ thì quy ra phút; qua nửa đêm coi như hôm sau.
  const rangeMin = (() => {
    if (!range) return null;
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    if ([fh, fm, th, tm].some((n) => Number.isNaN(n))) return null;
    let d = th! * 60 + tm! - (fh! * 60 + fm!);
    if (d < 0) d += 24 * 60;
    return d || null;
  })();
  const minutes = range ? rangeMin : parseDuration(dur);
  const svc = data.services.find((s) => s.id === serviceId);
  const free = svc?.billing_type === "non_billable";

  return (
    <Dialog open={entry !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Sửa dòng giờ</DialogTitle>
          <DialogDescription>
            Đổi hạng mục thì chi phí được tính lại theo giá vốn của hợp đồng mới.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[12.5px] font-medium text-ink-2">Hạng mục</div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-[12.5px] font-medium text-ink-2">Ngày</div>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-ink-2">
                  {range ? "Khoảng giờ" : "Thời lượng"}
                </span>
                {/* Productive có nút "Set range" chuyển giữa hai cách nhập.
                    Gõ chuỗi 9-5 vào ô thời lượng vẫn được, nhưng người mới
                    không đoán ra là gõ được. */}
                <button
                  type="button"
                  onClick={() => setRange((v) => !v)}
                  className="text-[11.5px] font-medium text-brand hover:underline"
                >
                  {range ? "Nhập thời lượng" : "Nhập khoảng giờ"}
                </button>
              </div>
              {range ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="time"
                    className="num h-9 px-2"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <span className="text-ink-3">–</span>
                  <Input
                    type="time"
                    className="num h-9 px-2"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              ) : (
                <Input
                  className="num"
                  value={dur}
                  placeholder="2h30 hoặc 9-5"
                  onChange={(e) => setDur(e.target.value)}
                />
              )}
            </div>
          </div>

          <div>
            <div className="mb-1 text-[12.5px] font-medium text-ink-2">Ghi chú</div>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {free && (
            <p className="rounded-lg bg-line/60 px-3 py-2 text-[12px] text-ink-2">
              Hạng mục này không tính tiền khách — giờ vẫn tính vào chi phí nhưng không sinh
              doanh thu.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!serviceId || !date || !minutes}
            onClick={() => {
              if (!entry || !minutes || !svc) return;
              // Nhập khoảng giờ thì lưu luôn giờ bắt đầu, để block đứng đúng
              // chỗ trên lưới lịch thay vì rơi về mặc định 7:00.
              const [fh, fm] = from.split(":").map(Number);
              onSave({
                service_id: serviceId,
                date,
                minutes,
                ...(range && !Number.isNaN(fh) ? { start_min: fh! * 60 + fm! } : {}),
                billable_minutes: free ? 0 : minutes,
                note: note.trim() || null,
                cost_rate_snapshot: Math.round(
                  costRateFor(data, entry.user_id, {
                    onDate: date,
                    budgetId: svc.budget_id,
                  }).total,
                ),
              });
              onClose();
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

