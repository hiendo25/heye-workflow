import { useMemo, useState } from "react";
import { BarChart3, EyeOff } from "lucide-react";
import {
  budgetSummary,
  fmtDuration,
  isoDate,
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
  const s = useMemo(() => budgetSummary(data, budgetId), [data, budgetId]);
  const series = useMemo(() => buildSeries(data, budgetId, grain), [data, budgetId, grain]);

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

      {showChart && <Chart tab={view} series={series} contractTotal={s.contractTotal} />}

      {/* Ba ô số liệu — bố cục theo Productive */}
      <div className="grid gap-0 overflow-hidden rounded-xl border border-line bg-surface md:grid-cols-3">
        {view === "budgeting" ? (
          <>
            <Box title="Thời gian">
              <Row label="Giờ đã bán" value={`${s.soldQty}`} />
              <Row label="Giờ tính tiền" value={fmtDuration(s.recognizedMin)} />
              <Row
                label={`Còn lại (${Math.round(100 - timePct)}%)`}
                value={`${Math.max(0, s.soldQty - s.recognizedMin / 60).toFixed(1)}`}
                big
              />
              <Bar pct={100 - timePct} />
            </Box>

            <Box title="Ngân sách">
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
            <Box title="Thời gian">
              <Row label="Giờ ước tính" value={`${s.estimateQty}`} />
              <Row label="Giờ đã làm" value={fmtDuration(s.workedMin)} />
              <Row
                label={`Còn lại (${Math.round(100 - workedPct)}%)`}
                value={`${Math.max(0, s.estimateQty - s.workedMin / 60).toFixed(1)}`}
                big
              />
              <Bar pct={100 - workedPct} />
            </Box>

            <Box title="Lợi nhuận">
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
  worked: number;
  billable: number;
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

  const buckets = new Map<string, { worked: number; billable: number; rev: number; cost: number }>();
  const touch = (k: string) =>
    buckets.get(k) ?? buckets.set(k, { worked: 0, billable: 0, rev: 0, cost: 0 }).get(k)!;

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

  const keys = [...buckets.keys()].sort();
  let w = 0, bi = 0, rv = 0, ct = 0;
  return keys.map((k) => {
    const b = buckets.get(k)!;
    w += b.worked;
    bi += b.billable;
    rv += b.rev;
    ct += b.cost;
    return {
      label: grain === "month" ? fmtMonth(k) : fmtWeek(k),
      worked: w,
      billable: bi,
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
        Chưa có dữ liệu để vẽ biểu đồ. Ghi nhận giờ hoặc chi phí để thấy diễn biến theo thời gian.
      </div>
    );
  }

  const W = 1000;
  const H = 300;
  const pad = { t: 16, r: 62, b: 34, l: 66 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  const maxMoney = Math.max(
    contractTotal,
    ...series.map((p) => Math.max(p.revenue, p.cost, p.profit)),
  ) * 1.05 || 1;
  const maxHours = Math.max(...series.map((p) => p.worked / 60)) * 1.15 || 1;

  const x = (i: number) => pad.l + (series.length === 1 ? iw / 2 : (i * iw) / (series.length - 1));
  const yM = (v: number) => pad.t + ih - (v / maxMoney) * ih;
  const yH = (v: number) => pad.t + ih - (v / maxHours) * ih;

  const path = (get: (p: Point) => number, future: boolean) => {
    const pts = series
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => (future ? p.isFuture : !p.isFuture));
    if (!pts.length) return "";
    // Nối liền mạch: đoạn dự báo bắt đầu từ điểm thực cuối cùng.
    if (future) {
      const lastReal = series.map((p, i) => ({ p, i })).filter(({ p }) => !p.isFuture).at(-1);
      if (lastReal) pts.unshift(lastReal);
    }
    return pts.map(({ p, i }, n) => `${n ? "L" : "M"}${x(i)} ${yM(get(p))}`).join(" ");
  };

  const barW = Math.min(38, (iw / series.length) * 0.5);
  const firstFuture = series.findIndex((p) => p.isFuture);

  return (
    <div className="rounded-xl border border-line bg-surface px-4 pb-2 pt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Biểu đồ diễn biến">
        {/* lưới + hai trục: trái tiền, phải giờ */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = pad.t + ih - r * ih;
          return (
            <g key={r}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--line)" strokeWidth="1" />
              <text
                x={pad.l - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--ink-3)"
                fontFamily="var(--font-mono)"
              >
                {shortMoney(maxMoney * r)}
              </text>
              <text
                x={W - pad.r + 8}
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

        {/* cột giờ đã làm */}
        {series.map((p, i) => {
          const y = yH(p.worked / 60);
          return (
            <rect
              key={i}
              x={x(i) - barW / 2}
              y={y}
              width={barW}
              height={Math.max(0, pad.t + ih - y)}
              rx="3"
              fill="var(--warn)"
              opacity={p.isFuture ? 0.28 : 0.55}
            />
          );
        })}

        {/* vạch ranh giới thật / dự báo */}
        {firstFuture > 0 && (
          <>
            <line
              x1={x(firstFuture - 1)}
              y1={pad.t}
              x2={x(firstFuture - 1)}
              y2={pad.t + ih}
              stroke="var(--brand)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text x={x(firstFuture - 1) + 5} y={pad.t + 11} fontSize="10" fill="var(--brand)">
              hôm nay
            </text>
          </>
        )}

        {tab === "budgeting" ? (
          <>
            {/* trần hợp đồng */}
            <line
              x1={pad.l}
              y1={yM(contractTotal)}
              x2={W - pad.r}
              y2={yM(contractTotal)}
              stroke="var(--bad)"
              strokeWidth="2.5"
            />
            <path d={path((p) => p.revenue, false)} fill="none" stroke="var(--good)" strokeWidth="2.5" />
            <path
              d={path((p) => p.revenue, true)}
              fill="none"
              stroke="var(--good)"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.65"
            />
          </>
        ) : (
          <>
            <path d={path((p) => p.revenue, false)} fill="none" stroke="#2563EB" strokeWidth="2.5" />
            <path
              d={path((p) => p.revenue, true)}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.65"
            />
            <path d={path((p) => p.profit, false)} fill="none" stroke="var(--good)" strokeWidth="2.5" />
            <path
              d={path((p) => p.profit, true)}
              fill="none"
              stroke="var(--good)"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.65"
            />
          </>
        )}

        {series.map((p, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 12}
            textAnchor="middle"
            fontSize="10.5"
            fill="var(--ink-3)"
          >
            {p.label}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 border-t border-line pt-2.5 text-[11.5px] text-ink-2">
        <Legend color="var(--warn)" box>
          Giờ đã làm
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
        Trục trái: tiền · trục phải: giờ · đường đứt là phần dự báo
      </p>
    </div>
  );
}

/* ============ phụ trợ ============ */

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-3">
        {title}
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
}: {
  children: React.ReactNode;
  color: string;
  dash?: boolean;
  box?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {box ? (
        <span className="h-2.5 w-3.5 rounded-sm" style={{ background: color, opacity: 0.55 }} />
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

function shortMoney(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}tỷ`;
  if (v >= 1e6) return `${Math.round(v / 1e6)}tr`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}k`;
  return `${Math.round(v)}`;
}

const fmtMonth = (k: string) => {
  const [y, m] = k.split("-");
  return `T${Number(m)}/${String(y).slice(2)}`;
};
const fmtWeek = (k: string) => {
  const [, m, d] = k.split("-");
  return `${d}/${m}`;
};
