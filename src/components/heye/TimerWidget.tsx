import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Square, Timer as TimerIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  financeQuery,
  fmtClock,
  fmtDuration,
  insertRow,
  runningTimer,
  timerElapsed,
  timerOverrun,
  timerShouldAutoStop,
  updateRow,
  TIMER_AUTO_STOP_HOURS,
} from "@/lib/finance-data";
import { workspaceQuery } from "@/lib/heye-data";

/**
 * Đồng hồ bấm giờ ở thanh trên — đúng chỗ Productive đặt.
 *
 * Chỉ hiện khi có đồng hồ đang chạy. Ràng buộc theo tài liệu:
 * mỗi người một đồng hồ, chỉ bấm cho hôm nay, quá 24 giờ thì tự dừng.
 */
export function TimerWidget() {
  const { data } = useQuery(financeQuery);
  const { data: ws } = useQuery(workspaceQuery);
  const qc = useQueryClient();
  const [, tick] = useState(0);

  // Người đang dùng máy. Bản demo lấy người đầu danh sách.
  const me = ws?.users?.[0] ?? null;
  const entry = data && me ? runningTimer(data.timeEntries, me.id) : null;

  // Nhịp 1 giây để đồng hồ chạy.
  useEffect(() => {
    if (!entry) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [entry]);

  const stop = useMutation({
    mutationFn: async (auto: boolean) => {
      if (!entry?.timer_started_at) return;
      const mins = timerElapsed(entry.timer_started_at);
      await insertRow("timer_logs", {
        time_entry_id: entry.id,
        started_at: entry.timer_started_at,
        stopped_at: new Date().toISOString(),
        minutes: mins,
        auto_stopped: auto,
      });
      const total = entry.minutes + mins;
      await updateRow("time_entries", entry.id, {
        minutes: total,
        // Hạng mục không tính tiền thì phần tính tiền vẫn giữ 0.
        billable_minutes: entry.billable_minutes > 0 || entry.minutes === 0 ? total : 0,
        timer_started_at: null,
      });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["finance"] }),
  });

  // Quá 24 giờ thì tự dừng, không để đồng hồ chạy qua đêm mãi.
  useEffect(() => {
    if (!entry?.timer_started_at) return;
    if (timerShouldAutoStop(entry.timer_started_at)) {
      stop.mutate(true);
      toast.warning(`Đồng hồ chạy quá ${TIMER_AUTO_STOP_HOURS} giờ nên đã tự dừng.`);
    }
  }, [entry, stop]);

  if (!entry || !data || !entry.timer_started_at) return null;

  const service = data.services.find((s) => s.id === entry.service_id);
  const budget = service ? data.budgets.find((b) => b.id === service.budget_id) : null;
  const over = timerOverrun(entry.timer_started_at);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`num inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-semibold ${
            over ? "bg-warn-soft text-warn" : "bg-good-soft text-good"
          }`}
          title={over ? "Đồng hồ đã chạy hơn 8 giờ — kiểm tra xem có quên tắt không" : "Đang bấm giờ"}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          {fmtClock(entry.timer_started_at, entry.minutes)}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[300px] p-3">
        <div className="flex items-start gap-2">
          <TimerIcon size={15} className="mt-0.5 shrink-0 text-ink-3" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{service?.name ?? "—"}</div>
            <div className="truncate text-[11.5px] text-ink-3">{budget?.name}</div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-[12px]">
          <Row label="Bắt đầu lúc" value={fmtTime(entry.timer_started_at)} />
          <Row label="Đã ghi trước đó" value={fmtDuration(entry.minutes)} />
          <Row
            label="Đang đếm"
            value={fmtDuration(timerElapsed(entry.timer_started_at))}
            bold
          />
        </div>

        {over && (
          <p className="mt-2 rounded bg-warn-soft px-2 py-1.5 text-[11.5px] text-warn">
            Đồng hồ đã chạy hơn 8 giờ. Nếu quên tắt thì dừng lại và sửa số giờ cho đúng.
          </p>
        )}

        <Button
          size="sm"
          className="mt-3 w-full"
          variant="outline"
          onClick={() => {
            stop.mutate(false);
            toast.success("Đã dừng đồng hồ và cộng vào dòng giờ.");
          }}
        >
          <Square size={12} /> Dừng và lưu
        </Button>

        <p className="mt-2 text-[11px] text-ink-3">
          Dừng lúc lẻ từ 30 giây trở lên sẽ làm tròn lên phút.
        </p>
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-ink-3">{label}</span>
      <span className={`num ${bold ? "font-bold text-brand" : "text-ink-2"}`}>{value}</span>
    </div>
  );
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
