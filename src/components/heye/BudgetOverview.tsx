import { useMemo, useState } from "react";
import { BarChart3, EyeOff } from "lucide-react";
import {
  budgetRunsOutOn,
  budgetSummary,
  fmtDuration,
  forecastByDate,
  isoDate,
  workdaysBetween,
  money,
  type FinanceData,
} from "@/lib/finance-data";

type Tab = "budgeting" | "profitability";
type Grain = "month" | "week";

/**
 * Tổng quan hợp đồng — hai góc nhìn của cùng một dữ liệu.
 *
 *   Ngân sách  : "Còn bao nhiêu tiền tiêu với khách?"  (đối ngoại)
 *   Lợi nhuận  : "Ta có thực sự lãi không?"            (đối nội)
 *
 * Cả hai đều đúng, chỉ khác câu hỏi. Chênh lệch giữa giờ đã làm và giờ
 * tính tiền chính là chỗ lợi nhuận rò rỉ — chỉ tab Lợi nhuận mới thấy.
 */
export function BudgetOverview({ data, budgetId }: { data: FinanceData; budgetId: string }) {
  const [tab, setTab] = useState<Tab>("budgeting");
  const [grain, setGrain] = useState<Grain>("month");
  const [showChart, setShowChart] = useState(true);

  const view = tab;
  const todayVn = fmtVn(isoDate(new Date()));
  const s = useMemo(() => budgetSummary(data, budgetId), [data, budgetId]);
  const series = useMemo(() => buildSeries(data, budgetId, grain), [data, budgetId, grain]);

  // Ngày ngân sách cạn theo lịch đã xếp — giá trị lớn nhất của dự báo.
  const runOut = useMemo(() => budgetRunsOutOn(data, budgetId), [data, budgetId]);

  const timePct = s.soldQty ? Math.min(100, (s.recognizedMin / 60 / s.soldQty) * 100) : 0;
  const workedPct = s.estimateQty ? Math.min(100, (s.workedMin / 60 / s.estimateQty) * 100) : 0;
  const budgetPct = s.contractTotal ? (s.usedBudget / s.contractTotal) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-line">
          <Seg on={tab === "budgeting"} onClick={() => setTab("budgeting")}>
            Ngân sách
          </Seg>
          <Seg on={tab === "profitability"} onClick={() => setTab("profitability")}>
            Lợi nhuận
          </Seg>
        </div>

        <div className="flex overflow-hidden rounded-lg border border-line">
          <Seg on={grain === "month"} onClick={() => setGrain("month")}>
            Tháng
          </Seg>
          <Seg on={grain === "week"} onClick={() => setGrain("week")}>
            Tuần
          </Seg>
        </div>

        <span className="num rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink-2">
          {series.at(-1)?.label ?? "—"}
        </span>

        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink-2 hover:border-brand hover:text-brand"
        >
          {showChart ? <EyeOff size={13} /> : <BarChart3 size={13} />}
          {showChart ? "Ẩn biểu đồ" : "Hiện biểu đồ"}
        </button>
      </div>

      {runOut && (
        <div className="rounded-lg border-l-[3px] border-bad bg-bad-soft px-3.5 py-2.5 text-[12.5px]">
          Theo lịch đã xếp, ngân sách sẽ cạn vào <b>{fmtVn(runOut.date)}</b> và vượt{" "}
          <b className="num">{money(Math.round(runOut.overBy))} đ</b>
          {s.budget?.end_date && runOut.date < s.budget.end_date && (
            <> — trong khi hợp đồng còn tới {fmtVn(s.budget.end_date)}.</>
          )}{" "}
          Còn thời gian để đàm phán tăng ngân sách, cắt phạm vi, hoặc đổi nhân sự.
        </div>
      )}

      {showChart && <Chart tab={view} series={series} contractTotal={s.contractTotal} />}

      {/* Ba ô số liệu — bố cục theo Productive */}
      <div className="grid gap-0 overflow-hidden rounded-xl border border-line bg-surface md:grid-cols-3">
        {view === "budgeting" ? (
          <>
            <Box title="Thời gian" date={todayVn}>
              <Row label="Giờ đã bán" value={`${s.soldQty}`} />
              <Row label="Giờ tính tiền" value={fmtDuration(s.recognizedMin)} />
              <Row
                label={`Còn lại (${Math.round(100 - timePct)}%)`}
                value={`${Math.max(0, s.soldQty - s.recognizedMin / 60).toFixed(1)}`}
                big
              />
              <Bar pct={100 - timePct} />
            </Box>

            <Box title="Ngân sách" date={todayVn}>
              <Row label="Tổng hợp đồng" value={money(Math.round(s.contractTotal))} />
              <Row label="Đã dùng" value={money(Math.round(s.usedBudget))} />
              <Row
                label={`Còn lại (${Math.round(100 - budgetPct)}%)`}
                value={money(Math.round(s.remainingBudget))}
                big
                tone={s.remainingBudget < 0 ? "bad" : undefined}
              />
              <Bar pct={100 - budgetPct} />
            </Box>

            <Box title="Chi phí phát sinh">
              <Row label="Số phiếu" value={`${s.expenses.length}`} />
              <Row label="Đã chi" value={money(Math.round(s.expenseCost))} />
              <Row
                label="Chi phí lương"
                value={money(Math.round(s.laborCost))}
                big
              />
            </Box>
          </>
        ) : (
          <>
            <Box title="Thời gian" date={todayVn}>
              <Row label="Giờ ước tính" value={`${s.estimateQty}`} />
              <Row label="Giờ đã làm" value={fmtDuration(s.workedMin)} />
              <Row
                label={`Còn lại (${Math.round(100 - workedPct)}%)`}
                value={`${Math.max(0, s.estimateQty - s.workedMin / 60).toFixed(1)}`}
                big
              />
              <Bar pct={100 - workedPct} />
            </Box>

            <Box title="Lợi nhuận" date={todayVn}>
              <Row label="Doanh thu" value={money(Math.round(s.revenue))} />
              <Row label="Chi phí" value={money(Math.round(s.cost))} />
              <Row
                label={`Lợi nhuận (${Math.round(s.margin)}%)`}
                value={money(Math.round(s.profit))}
                big
                tone={s.profit >= 0 ? "good" : "bad"}
              />
              <Bar pct={Math.max(0, Math.min(100, s.margin))} tone={s.profit >= 0 ? "good" : "bad"} />
            </Box>

            <Box title="Cấu thành chi phí">
              <Row label="Lương nhân sự" value={money(Math.round(s.laborCost))} />
              <Row label="Chi phí phát sinh" value={money(Math.round(s.expenseCost))} />
              <Row
                label="Giờ không ra tiền"
                value={fmtDuration(s.unbillableMin)}
                big
                tone={s.unbillableMin > 0 ? "warn" : undefined}
              />
            </Box>
          </>
        )}
      </div>

      {view === "budgeting" ? (
        <Note>
          Góc nhìn <b>đối ngoại</b>: còn bao nhiêu tiền để tiêu với khách. Tính trên{" "}
          <b>giờ tính tiền</b> nhân đơn giá bán. Bấm sang <b>Lợi nhuận</b> để thấy con số nội bộ.
        </Note>
      ) : (
        <Note tone="warn">
          Góc nhìn <b>đối nội</b>. Chú ý điểm bất đối xứng cố ý: doanh thu tính trên{" "}
          <b>giờ tính tiền</b>, còn chi phí tính trên <b>giờ đã làm</b>. Hợp đồng này có{" "}
          <b>{fmtDuration(s.unbillableMin)}</b> làm mà không ra tiền — chỉ màn này mới thấy.
        </Note>
      )}
    </div>
  );
}

/* ============ Biểu đồ ============ */

type Point = {
  label: string;
  /** Giờ đã làm (từ dòng giờ thật) */
  worked: number;
  /** Giờ tính được tiền */
  billable: number;
  /** Giờ đã xếp lịch — cột nhạt, gồm cả quá khứ lẫn tương lai */
  scheduled: number;
  revenue: number;
  cost: number;
  profit: number;
  isFuture: boolean;
};

/** Cộng dồn theo kỳ — giống chế độ Cumulative của Productive. */
function buildSeries(data: FinanceData, budgetId: string, grain: Grain): Point[] {
  const s = budgetSummary(data, budgetId);
  const svc = new Map(s.services.map((x) => [x.id, x]));
  const today = isoDate(new Date());

  const keyOf = (d: string) => {
    if (grain === "month") return d.slice(0, 7);
    const dt = new Date(d);
    const back = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
    dt.setDate(dt.getDate() - back);
    return isoDate(dt);
  };

  const buckets = new Map<
    string,
    { worked: number; billable: number; scheduled: number; rev: number; cost: number }
  >();
  const touch = (k: string) =>
    buckets.get(k) ??
    buckets.set(k, { worked: 0, billable: 0, scheduled: 0, rev: 0, cost: 0 }).get(k)!;

  for (const e of s.entries) {
    const b = touch(keyOf(e.date));
    b.worked += e.minutes;
    b.billable += e.billable_minutes;
    b.cost += (e.minutes / 60) * Number(e.cost_rate_snapshot);
    const sv = svc.get(e.service_id);
    if (sv && sv.billing_type === "tm") b.rev += (e.billable_minutes / 60) * Number(sv.price);
  }
  for (const x of s.expenses) {
    const b = touch(keyOf(x.date));
    const sv = svc.get(x.service_id);
    const im = expenseImpactSafe(data, x, sv);
    b.cost += im.cost;
    b.rev += im.revenue;
  }

  // Cột nhạt: giờ đã xếp lịch, tính cho mọi kỳ có booking.
  for (const b of data.bookings) {
    const sv = svc.get(b.service_id);
    if (!sv || (budgetId && sv.budget_id !== budgetId)) continue;
    for (const day of workdaysBetween(b.start_date, b.end_date)) {
      touch(keyOf(day)).scheduled += Number(b.hours_per_day) * 60;
    }
  }

  // Phần TƯƠNG LAI: đọc từ lịch đã xếp trong Resource Planner.
  // Không có lịch thì không có đường đứt — dự báo không phải phép ngoại suy.
  for (const [day, f] of forecastByDate(data, budgetId)) {
    const b = touch(keyOf(day));
    b.rev += f.revenue;
    b.cost += f.cost;
    b.worked += f.hours * 60;
  }

  const keys = [...buckets.keys()].sort();
  let w = 0, bi = 0, sc = 0, rv = 0, ct = 0;
  return keys.map((k) => {
    const b = buckets.get(k)!;
    w += b.worked;
    bi += b.billable;
    sc += b.scheduled;
    rv += b.rev;
    ct += b.cost;
    return {
      label: grain === "month" ? fmtMonth(k) : fmtWeek(k),
      worked: w,
      billable: bi,
      scheduled: sc,
      revenue: rv,
      cost: ct,
      profit: rv - ct,
      isFuture: k > (grain === "month" ? today.slice(0, 7) : today),
    };
  });
}

function expenseImpactSafe(
  data: FinanceData,
  e: FinanceData["expenses"][number],
  sv: FinanceData["services"][number] | undefined,
) {
  if (e.status === "cancelled" || e.status === "changes_requested") return { cost: 0, revenue: 0 };
  const rows = data.expenseItems.filter((i) => i.expense_id === e.id);
  const net = rows.reduce((a, i) => {
    const raw = Number(i.unit_price) * Number(i.quantity);
    const rate = Number(i.tax_rate) / 100;
    return a + (i.tax_included && rate ? raw / (1 + rate) : raw);
  }, 0);
  const billable =
    e.markup_type === "fixed" ? Number(e.markup_value) : net * (1 + Number(e.markup_value) / 100);
  const free = !sv || sv.billing_type === "non_billable";
  return { cost: net, revenue: e.status === "approved" && !free ? billable : 0 };
}

/**
 * Biểu đồ dựng theo đúng bố cục Productive:
 *  - HAI cột cạnh nhau mỗi kỳ: giờ đã xếp lịch (nhạt) và giờ tính tiền (đậm)
 *  - Cột nằm giữa hai nhãn kỳ, đường tiền chồng lên trên
 *  - Đường cong mượt, phần tương lai chuyển sang nét đứt
 *  - Vạch dọc kèm nhãn xoay đánh dấu kỳ hiện tại
 *  - Trục trái là tiền, trục phải là giờ
 */
function Chart({
  tab,
  series,
  contractTotal,
}: {
  tab: Tab;
  series: Point[];
  contractTotal: number;
}) {
  if (series.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-12 text-center text-[13px] text-ink-3">
        Chưa có dữ liệu để vẽ biểu đồ. Ghi nhận giờ hoặc xếp lịch để thấy diễn biến theo thời gian.
      </div>
    );
  }

  const W = 1000;
  const H = 320;
  const pad = { t: 18, r: 64, b: 40, l: 70 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  const maxMoney =
    Math.max(contractTotal, ...series.map((p) => Math.max(p.revenue, p.cost, p.profit))) * 1.08 ||
    1;
  const maxHours =
    Math.max(...series.map((p) => Math.max(p.worked, p.scheduled) / 60)) * 1.15 || 1;

  // Mỗi kỳ chiếm một ô; cột và điểm đường nằm giữa ô.
  const slot = iw / series.length;
  const x = (i: number) => pad.l + slot * (i + 0.5);
  const yM = (v: number) => pad.t + ih - (v / maxMoney) * ih;
  const yH = (v: number) => pad.t + ih - (v / maxHours) * ih;

  const firstFuture = series.findIndex((p) => p.isFuture);
  const cutX = firstFuture > 0 ? x(firstFuture - 1) : -1;

  /** Đường cong mượt qua các điểm, kiểu Catmull-Rom. */
  const smooth = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M${pts[0]!.x} ${pts[0]!.y}`;
    let d = `M${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const line = (get: (p: Point) => number, future: boolean) => {
    const idx = series
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (future ? p.isFuture : !p.isFuture));
    if (!idx.length) return "";
    // Đoạn dự báo bắt đầu từ điểm thực cuối cùng để nối liền mạch.
    if (future && firstFuture > 0) idx.unshift({ p: series[firstFuture - 1]!, i: firstFuture - 1 });
    return smooth(idx.map(({ p, i }) => ({ x: x(i), y: yM(get(p)) })));
  };

  // Cột nhạt rộng, cột đậm hẹp hơn chồng lên giữa
  const wideW = Math.min(96, slot * 0.66);
  const narrowW = wideW * 0.45;

  return (
    <div className="rounded-xl border border-line bg-surface px-4 pb-2 pt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Biểu đồ diễn biến">
        {/* Lưới ngang + hai trục */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = pad.t + ih - r * ih;
          return (
            <g key={r}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--line)" strokeWidth="1" />
              <text
                x={pad.l - 9}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--ink-3)"
                fontFamily="var(--font-mono)"
              >
                {axisMoney(maxMoney * r)}
              </text>
              <text
                x={W - pad.r + 9}
                y={y + 4}
                fontSize="10"
                fill="var(--ink-3)"
                fontFamily="var(--font-mono)"
              >
                {Math.round(maxHours * r)}h
              </text>
            </g>
          );
        })}

        {/* Cột nhạt (giờ đã xếp) rộng, cột đậm (giờ tính tiền) hẹp hơn
            chồng lên cùng tâm — đúng cách Productive vẽ. */}
        {series.map((p, i) => {
          const cx = x(i);
          const base = pad.t + ih;
          const ySch = yH(p.scheduled / 60);
          const yWork = yH((tab === "budgeting" ? p.billable : p.worked) / 60);
          return (
            <g key={i}>
              <rect
                x={cx - wideW / 2}
                y={ySch}
                width={wideW}
                height={Math.max(0, base - ySch)}
                fill="#F5C86B"
                opacity="0.55"
              />
              <rect
                x={cx - narrowW / 2}
                y={yWork}
                width={narrowW}
                height={Math.max(0, base - yWork)}
                fill="#E9A319"
              />
            </g>
          );
        })}

        {/* Trần hợp đồng: liền ở quá khứ, đứt ở tương lai */}
        {tab === "budgeting" && (
          <>
            <line
              x1={pad.l}
              y1={yM(contractTotal)}
              x2={cutX > 0 ? cutX : W - pad.r}
              y2={yM(contractTotal)}
              stroke="var(--bad)"
              strokeWidth="2.5"
            />
            {cutX > 0 && (
              <line
                x1={cutX}
                y1={yM(contractTotal)}
                x2={W - pad.r}
                y2={yM(contractTotal)}
                stroke="var(--bad)"
                strokeWidth="2.5"
                strokeDasharray="7 5"
              />
            )}
          </>
        )}

        {tab === "budgeting" ? (
          <>
            <path d={line((p) => p.revenue, false)} fill="none" stroke="var(--good)" strokeWidth="2.5" />
            <path
              d={line((p) => p.revenue, true)}
              fill="none"
              stroke="var(--good)"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.6"
            />
          </>
        ) : (
          <>
            <path d={line((p) => p.revenue, false)} fill="none" stroke="#2563EB" strokeWidth="2.5" />
            <path
              d={line((p) => p.revenue, true)}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.6"
            />
            <path d={line((p) => p.profit, false)} fill="none" stroke="var(--good)" strokeWidth="2.5" />
            <path
              d={line((p) => p.profit, true)}
              fill="none"
              stroke="var(--good)"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.6"
            />
          </>
        )}

        {/* Vạch kỳ hiện tại, nhãn xoay dọc như Productive */}
        {cutX > 0 && (
          <g>
            <line
              x1={cutX}
              y1={pad.t}
              x2={cutX}
              y2={pad.t + ih}
              stroke="var(--brand)"
              strokeWidth="1.5"
            />
            <rect
              x={cutX - 9}
              y={pad.t + 4}
              width="18"
              height="84"
              rx="3"
              fill="var(--surface)"
              stroke="var(--brand)"
              strokeWidth="1"
            />
            <text
              x={cutX}
              y={pad.t + 46}
              fontSize="9"
              fill="var(--brand)"
              textAnchor="middle"
              transform={`rotate(-90 ${cutX} ${pad.t + 46})`}
            >
              Kỳ đang xem
            </text>
          </g>
        )}

        {/* Nhãn kỳ */}
        {series.map((p, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 14}
            textAnchor="middle"
            fontSize="10.5"
            fill="var(--ink-3)"
          >
            {p.label}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 border-t border-line pt-2.5 text-[11.5px] text-ink-2">
        <Legend color="#F5C86B" box faded>
          Giờ đã xếp lịch
        </Legend>
        <Legend color="#E9A319" box>
          {tab === "budgeting" ? "Giờ tính tiền" : "Giờ đã làm"}
        </Legend>
        {tab === "budgeting" ? (
          <>
            <Legend color="var(--bad)">Trần hợp đồng</Legend>
            <Legend color="var(--good)">Đã dùng</Legend>
            <Legend color="var(--good)" dash>
              Đã dùng (dự báo)
            </Legend>
          </>
        ) : (
          <>
            <Legend color="#2563EB">Doanh thu</Legend>
            <Legend color="#2563EB" dash>
              Doanh thu (dự báo)
            </Legend>
            <Legend color="var(--good)">Lợi nhuận</Legend>
            <Legend color="var(--good)" dash>
              Lợi nhuận (dự báo)
            </Legend>
          </>
        )}
      </div>

      <p className="pb-1 text-center text-[11px] text-ink-3">
        Trục trái tiền · trục phải giờ · nét đứt là phần dự báo theo lịch đã xếp
      </p>
    </div>
  );
}

/* ============ phụ trợ ============ */

function Box({
  title,
  date,
  children,
}: {
  title: string;
  date?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-3">
          {title}
        </span>
        {date && (
          <span className="num rounded bg-brand-soft px-1.5 py-0.5 text-[10.5px] text-brand">
            {date}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  big,
  tone,
}: {
  label: string;
  value: string;
  big?: boolean;
  tone?: "good" | "bad" | "warn" | undefined;
}) {
  const c =
    tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "";
  return (
    <div className="flex items-baseline justify-between py-[3px]">
      <span className="text-[12.5px] text-ink-2">{label}</span>
      <span className={`num ${big ? "text-[15px] font-bold" : "text-[13px]"} ${c}`}>{value}</span>
    </div>
  );
}

function Bar({ pct, tone }: { pct: number; tone?: "good" | "bad" }) {
  const v = Math.max(0, Math.min(100, pct));
  const c =
    tone === "bad" || v < 15 ? "bg-bad" : tone === "good" ? "bg-good" : v < 35 ? "bg-warn" : "bg-good";
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${v}%` }} />
    </div>
  );
}

function Seg({
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
      className={`px-3 py-1.5 text-[12.5px] ${
        on ? "bg-good-soft font-semibold text-good" : "bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Legend({
  children,
  color,
  dash,
  box,
  faded,
}: {
  children: React.ReactNode;
  color: string;
  dash?: boolean;
  box?: boolean;
  faded?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {box ? (
        <span
          className="h-2.5 w-3.5 rounded-sm"
          style={{ background: color, opacity: faded ? 0.55 : 1 }}
        />
      ) : dash ? (
        <span
          className="h-0 w-4 border-t-2 border-dashed"
          style={{ borderColor: color, opacity: 0.7 }}
        />
      ) : (
        <span className="h-0.5 w-4 rounded" style={{ background: color }} />
      )}
      {children}
    </span>
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone?: "warn" }) {
  return (
    <div
      className={`rounded-lg border-l-[3px] px-3.5 py-2.5 text-[12.5px] ${
        tone === "warn" ? "border-warn bg-warn-soft" : "border-brand bg-brand-soft"
      }`}
    >
      {children}
    </div>
  );
}

/** Nhãn trục tiền: giữ số lẻ như Productive (€71.68K), không làm tròn. */
function axisMoney(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}tr`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return `${Math.round(v)}`;
}

function shortMoney(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}tỷ`;
  if (v >= 1e6) return `${Math.round(v / 1e6)}tr`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}k`;
  return `${Math.round(v)}`;
}

const fmtVn = (v: string) => {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};

const fmtMonth = (k: string) => {
  const [y, m] = k.split("-");
  return `T${Number(m)}/${String(y).slice(2)}`;
};
const fmtWeek = (k: string) => {
  const [, m, d] = k.split("-");
  return `${d}/${m}`;
};
