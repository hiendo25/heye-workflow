import { supabase } from "@/integrations/supabase/client";

/**
 * Tầng dữ liệu tài chính.
 *
 * Ba khái niệm, đừng lẫn:
 *  - ServiceType : DANH MỤC loại lao động của công ty (Dev, QC, PM...). Khai 1 lần.
 *  - RateCard    : BẢNG GIÁ — chỉ có đơn giá, không có số lượng.
 *  - Budget      : HỢP ĐỒNG — có số lượng, có khách, có ngày (bài 7).
 */

export type ClientCompany = {
  id: string;
  namespace_id: string;
  name: string;
  short_name: string | null;
  tax_id: string | null;
  currency: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  note: string | null;
  is_active: boolean;
};

export type ServiceType = {
  id: string;
  namespace_id: string;
  name: string;
  code: string | null;
  color: string;
  position: number;
  is_active: boolean;
  is_archived: boolean;
};

export type RateCard = {
  id: string;
  namespace_id: string;
  /** null = bảng giá chuẩn công ty; có giá trị = bảng giá riêng của khách đó */
  client_id: string | null;
  name: string;
  currency: string;
  is_archived: boolean;
  note: string | null;
};

export type RateCardItem = {
  id: string;
  rate_card_id: string;
  service_type_id: string;
  unit: "hour" | "day" | "piece";
  price: number;
  position: number;
  description: string | null;
  billing_type: BillingType;
  /** Giảm giá / phụ giá theo %. Âm = giảm, dương = cộng thêm. */
  markup_pct: number;
  /** Giá vốn dự kiến một đơn vị — để ước lãi ngay lúc báo giá. */
  cost_estimate: number | null;
  allow_time: boolean;
  allow_expense: boolean;
};

export type BillingType = "tm" | "fixed" | "percentage" | "non_billable";

export type Budget = {
  id: string;
  namespace_id: string;
  client_id: string;
  project_id: string | null;
  name: string;
  code: string | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  owner_id: string | null;
  status: "open" | "delivered";
  is_internal: boolean;
  note: string | null;
};

export type BudgetSection = {
  id: string;
  budget_id: string;
  name: string;
  position: number;
};

export type BudgetService = {
  id: string;
  budget_id: string;
  section_id: string | null;
  service_type_id: string;
  name: string;
  billing_type: BillingType;
  unit: "hour" | "day" | "piece";
  quantity: number;
  price: number;
  estimate: number | null;
  allow_time: boolean;
  allow_expense: boolean;
  position: number;
};

export type RateType = "hourly" | "weekly" | "biweekly" | "monthly" | "annual";

export type CostRate = {
  id: string;
  namespace_id: string;
  user_id: string;
  rate_type: RateType;
  amount: number;
  currency: string;
  hours_mon: number;
  hours_tue: number;
  hours_wed: number;
  hours_thu: number;
  hours_fri: number;
  hours_sat: number;
  hours_sun: number;
  start_date: string;
  end_date: string | null;
  add_overhead: boolean;
  note: string | null;
};

export type BudgetCostRate = {
  id: string;
  budget_id: string;
  user_id: string;
  rate: number;
  note: string | null;
};

export type OverheadSettings = {
  id: string;
  namespace_id: string;
  /** Thuê văn phòng, điện nước, thiết bị, bản quyền dùng chung. */
  facility_cost: number;
  /** Tổng giờ làm việc của cả công ty trong tháng. */
  total_hours: number;
  /** Giờ làm cho khách — không tính giờ nội bộ và nghỉ phép. */
  client_hours: number;
  /** Chi phí nội bộ: giờ nội bộ + expense nội bộ + nghỉ phép. */
  internal_cost: number;
  internal_is_auto: boolean;
  is_enabled: boolean;
  note: string | null;
  /** @deprecated giữ để không vỡ dữ liệu cũ */
  monthly_cost: number;
  /** @deprecated */
  monthly_hours: number;
};

export type FinanceData = {
  clients: ClientCompany[];
  serviceTypes: ServiceType[];
  rateCards: RateCard[];
  rateCardItems: RateCardItem[];
  budgets: Budget[];
  sections: BudgetSection[];
  services: BudgetService[];
  costRates: CostRate[];
  budgetCostRates: BudgetCostRate[];
  overhead: OverheadSettings | null;
  timeEntries: TimeEntry[];
  submissions: TimesheetSubmission[];
  timerLogs: TimerLog[];
  expenses: Expense[];
  expenseItems: ExpenseItem[];
  timeSettings: TimeSettings | null;
};

type Query = {
  select: (s: string) => Promise<{ data: unknown; error: unknown }> & {
    order: (c: string, o: { ascending: boolean }) => Promise<{ data: unknown; error: unknown }>;
  };
};

async function all<T>(table: string, order?: string): Promise<T[]> {
  const client = supabase as unknown as { from: (t: string) => Query };
  const base = client.from(table).select("*");
  const { data, error } = await (order ? base.order(order, { ascending: true }) : base);
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function fetchFinance(): Promise<FinanceData> {
  const [
    clients, serviceTypes, rateCards, rateCardItems, budgets, sections, services,
    costRates, budgetCostRates, overhead, timeEntries, submissions, timeSettings, timerLogs, expenses, expenseItems,
  ] = await Promise.all([
      all<ClientCompany>("client_companies", "name"),
      all<ServiceType>("service_types", "position"),
      all<RateCard>("rate_cards", "name"),
      all<RateCardItem>("rate_card_items", "position"),
      all<Budget>("budgets", "created_at"),
      all<BudgetSection>("budget_sections", "position"),
      all<BudgetService>("budget_services", "position"),
      all<CostRate>("cost_rates", "start_date"),
      all<BudgetCostRate>("budget_cost_rates"),
      all<OverheadSettings>("overhead_settings"),
      all<TimeEntry>("time_entries", "date"),
      all<TimesheetSubmission>("timesheet_submissions", "week_start"),
      all<TimeSettings>("time_settings"),
      all<TimerLog>("timer_logs", "started_at"),
      all<Expense>("expenses", "date"),
      all<ExpenseItem>("expense_items", "position"),
    ]);
  return {
    clients, serviceTypes, rateCards, rateCardItems, budgets, sections, services,
    costRates, budgetCostRates, overhead: overhead[0] ?? null, timeEntries,
    submissions, timeSettings: timeSettings[0] ?? null, timerLogs,
    expenses, expenseItems,
  };
}

export const financeQuery = {
  queryKey: ["finance"],
  queryFn: fetchFinance,
  staleTime: 60_000,
};

export const UNIT_LABEL: Record<string, string> = {
  hour: "giờ",
  day: "ngày",
  piece: "gói",
};

export const BILLING_LABEL: Record<BillingType, string> = {
  tm: "Theo giờ",
  fixed: "Trọn gói",
  percentage: "Phần trăm",
  non_billable: "Không tính tiền",
};

/** Ai chịu rủi ro khi làm quá dự kiến — điểm quyết định của cách tính tiền. */
export const BILLING_NOTE: Record<BillingType, string> = {
  tm: "Làm bao nhiêu tính bấy nhiêu. Vượt dự kiến thì khách trả thêm.",
  fixed: "Giá cố định. Vượt dự kiến thì công ty tự chịu — nên vẫn phải theo dõi giờ.",
  percentage:
    "Tính theo phần trăm tổng các hạng mục khác: phí quản lý dự án, phí vận hành. Hợp đồng to thì phí to theo.",
  non_billable: "Không thu tiền khách nhưng vẫn tính chi phí: họp nội bộ, đào tạo, bảo hành.",
};

/**
 * Thành tiền một hạng mục. Không tính tiền thì doanh thu bằng 0.
 *
 * Hạng mục PHẦN TRĂM không tự đứng một mình: nó ăn theo tổng các hạng mục
 * khác, nên cần truyền base vào. Gọi mà không có base thì trả 0 — đúng hơn là
 * đoán bừa một con số.
 */
export function serviceTotal(
  s: Pick<BudgetService, "billing_type" | "quantity" | "price">,
  base = 0,
): number {
  if (s.billing_type === "non_billable") return 0;
  if (s.billing_type === "percentage") return (base * Number(s.quantity)) / 100;
  return s.quantity * s.price;
}

/**
 * Tổng giá trị hợp đồng, tính hai vòng.
 *
 * Vòng một cộng các hạng mục đứng độc lập. Vòng hai mới tính phần trăm, vì
 * phí quản lý 10% là 10% của những hạng mục kia — tính chung một vòng thì
 * hoặc bỏ sót, hoặc phí lại tính lên chính nó.
 */
export function budgetTotal(services: BudgetService[]): number {
  const base = services
    .filter((s) => s.billing_type !== "percentage")
    .reduce((sum, s) => sum + serviceTotal(s), 0);
  const pct = services
    .filter((s) => s.billing_type === "percentage")
    .reduce((sum, s) => sum + serviceTotal(s, base), 0);
  return base + pct;
}

/** 700000 -> "700.000" */
export function money(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

/**
 * Bảng giá áp dụng được cho một khách:
 * bảng riêng của khách đó + bảng chuẩn công ty.
 * Khách KHÔNG thấy bảng giá riêng của khách khác.
 */
export function rateCardsForClient(cards: RateCard[], clientId: string | null): RateCard[] {
  return cards.filter((c) => !c.is_archived && (c.client_id === null || c.client_id === clientId));
}

/** Đơn giá sau khi áp giảm giá / phụ giá. */
export function effectivePrice(i: Pick<RateCardItem, "price" | "markup_pct">): number {
  return Number(i.price) * (1 + Number(i.markup_pct ?? 0) / 100);
}

/** Biên lãi dự kiến của một dòng giá, nếu đã khai giá vốn dự kiến. */
export function estimatedMargin(i: RateCardItem): number | null {
  if (i.cost_estimate == null || !Number(i.cost_estimate)) return null;
  const p = effectivePrice(i);
  if (!p) return null;
  return Math.round(((p - Number(i.cost_estimate)) / p) * 100);
}

/** So sánh giá riêng của khách với giá chuẩn — trả về % chênh lệch. */
export function priceDelta(clientPrice: number, standardPrice: number): number | null {
  if (!standardPrice) return null;
  return Math.round(((clientPrice - standardPrice) / standardPrice) * 100);
}

/* ================= Ghi dữ liệu ================= */

type WriteClient = {
  from: (t: string) => {
    insert: (v: unknown) => Promise<{ error: unknown }>;
    update: (v: unknown) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
    delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
  };
};
const db = () => supabase as unknown as WriteClient;

async function run(p: Promise<{ error: unknown }>) {
  const { error } = await p;
  if (error) throw error;
}

export const insertRow = (table: string, values: Record<string, unknown>) =>
  run(db().from(table).insert(values));

export const updateRow = (table: string, id: string, values: Record<string, unknown>) =>
  run(db().from(table).update(values).eq("id", id));

export const deleteRow = (table: string, id: string) =>
  run(db().from(table).delete().eq("id", id));

/** Thêm bản ghi và lấy lại id — cần khi phải chèn tiếp bảng con. */
export async function insertReturning(
  table: string,
  values: Record<string, unknown>,
): Promise<{ id: string } | null> {
  const client = supabase as unknown as {
    from: (t: string) => {
      insert: (v: unknown) => {
        select: (s: string) => {
          single: () => Promise<{ data: unknown; error: unknown }>;
        };
      };
    };
  };
  const { data, error } = await client.from(table).insert(values).select("id").single();
  if (error) throw error;
  return (data as { id: string } | null) ?? null;
}

/* ================= Giá vốn nhân sự ================= */

export const RATE_TYPE_LABEL: Record<RateType, string> = {
  hourly: "Theo giờ",
  weekly: "Theo tuần",
  biweekly: "Hai tuần",
  monthly: "Theo tháng",
  annual: "Theo năm",
};

/** Nhãn ô nhập tiền, đổi theo kỳ đã chọn. */
export const RATE_AMOUNT_LABEL: Record<RateType, string> = {
  hourly: "Chi phí mỗi giờ",
  weekly: "Chi phí mỗi tuần",
  biweekly: "Chi phí mỗi hai tuần",
  monthly: "Chi phí mỗi tháng",
  annual: "Chi phí mỗi năm",
};

/** Tổng giờ làm việc một tuần theo lịch đã đặt. */
export function weeklyHours(r: Pick<CostRate,
  "hours_mon"|"hours_tue"|"hours_wed"|"hours_thu"|"hours_fri"|"hours_sat"|"hours_sun">): number {
  return (
    Number(r.hours_mon) + Number(r.hours_tue) + Number(r.hours_wed) + Number(r.hours_thu) +
    Number(r.hours_fri) + Number(r.hours_sat) + Number(r.hours_sun)
  );
}

/** Số giờ theo lịch cho một ngày cụ thể (0 = Chủ nhật). */
function hoursOfWeekday(r: CostRate, weekday: number): number {
  const map = [r.hours_sun, r.hours_mon, r.hours_tue, r.hours_wed, r.hours_thu, r.hours_fri, r.hours_sat];
  return Number(map[weekday] ?? 0);
}

/**
 * Số giờ làm việc THỰC TẾ trong một khoảng ngày, đếm theo lịch từng thứ
 * và TRỪ ngày nghỉ lễ.
 *
 * Đây là cách Productive tính: không dùng hệ số cố định kiểu "4 tuần/tháng",
 * mà đếm đúng số ngày làm việc có thật trong kỳ. Kiểm chứng với ví dụ trong
 * tài liệu: năm 2024 ra 2.064 giờ (2.096 giờ theo lịch trừ 4 ngày lễ).
 */
export function capacityBetween(
  r: CostRate,
  from: Date,
  to: Date,
  holidays?: Set<string>,
): number {
  let total = 0;
  const d = new Date(from);
  while (d <= to) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    if (!holidays?.has(iso)) total += hoursOfWeekday(r, d.getDay());
    d.setDate(d.getDate() + 1);
  }
  return total;
}

/** Ngày nghỉ lễ Việt Nam — trừ khỏi số giờ làm việc khi tính giá vốn giờ. */
export const VN_HOLIDAYS = new Set<string>([
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20",
  "2026-04-26", "2026-04-30", "2026-05-01", "2026-09-02",
  "2025-01-01", "2025-01-28", "2025-01-29", "2025-01-30", "2025-01-31", "2025-02-03",
  "2025-04-07", "2025-04-30", "2025-05-01", "2025-09-02",
]);

/** Kỳ lịch TRỌN VẸN chứa ngày `on` — theo loại kỳ lương. */
function fullPeriod(r: CostRate, on: Date): { from: Date; to: Date } {
  const y = on.getFullYear();
  const m = on.getMonth();
  if (r.rate_type === "annual") {
    return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
  }
  if (r.rate_type === "monthly") {
    return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
  }
  // weekly / biweekly: tuần bắt đầu từ thứ Hai
  const day = on.getDay();
  const back = day === 0 ? 6 : day - 1;
  const start = new Date(y, m, on.getDate() - back);
  const len = r.rate_type === "biweekly" ? 13 : 6;
  const end = new Date(start);
  end.setDate(end.getDate() + len);
  return { from: start, to: end };
}

/**
 * GIÁ VỐN MỘT GIỜ.
 *
 *   Giá vốn giờ = Lương của kỳ / Số giờ làm việc của TRỌN kỳ lịch
 *
 * Ví dụ trong tài liệu Productive: 60.000$/năm ÷ 2.064 giờ = 29,07$/giờ.
 * Dùng trọn kỳ lịch (không phải từ ngày bắt đầu hiệu lực) để mức lương
 * bắt đầu giữa kỳ không bị đội giá giờ lên.
 */
export function hourlyCost(r: CostRate, onDate?: string): number {
  if (r.rate_type === "hourly") return Number(r.amount);
  const on = onDate ? new Date(onDate) : new Date(r.start_date);
  const { from, to } = fullPeriod(r, on);
  const cap = capacityBetween(r, from, to, VN_HOLIDAYS);
  return cap ? Number(r.amount) / cap : 0;
}

/** Số giờ làm việc của trọn kỳ chứa ngày đang xét — hiện để đối chiếu. */
export function periodCapacity(r: CostRate, onDate?: string): number {
  if (r.rate_type === "hourly") return 0;
  const on = onDate ? new Date(onDate) : new Date(r.start_date);
  const { from, to } = fullPeriod(r, on);
  return capacityBetween(r, from, to, VN_HOLIDAYS);
}

/**
 * Chi phí gián tiếp mỗi giờ, tách làm hai phần theo cách Productive tính.
 *
 *   Mặt bằng mỗi giờ = Chi phí mặt bằng / TỔNG giờ làm việc
 *   Nội bộ mỗi giờ   = Chi phí nội bộ   / Giờ làm CHO KHÁCH
 *
 * Mẫu số khác nhau có chủ đích: ai làm gì cũng ngồi văn phòng nên mặt bằng
 * chia cho tổng giờ; còn chi phí nội bộ chỉ có giờ làm khách mới gánh được,
 * vì đó là phần duy nhất sinh ra doanh thu.
 */
export function overheadBreakdown(o: OverheadSettings | null): {
  facility: number;
  internal: number;
  total: number;
} {
  if (!o || !o.is_enabled) return { facility: 0, internal: 0, total: 0 };
  const facility = Number(o.total_hours) ? Number(o.facility_cost) / Number(o.total_hours) : 0;
  const internal = Number(o.client_hours) ? Number(o.internal_cost) / Number(o.client_hours) : 0;
  return { facility, internal, total: facility + internal };
}

/**
 * Chi phí gián tiếp áp cho một giờ.
 *
 * Hợp đồng KHÁCH   -> cộng đủ mặt bằng + nội bộ
 * Hợp đồng NỘI BỘ  -> chỉ cộng mặt bằng
 *
 * Nếu hợp đồng nội bộ cộng cả phần nội bộ thì thành tính trùng: bản thân
 * giờ nội bộ chính là thứ tạo ra chi phí nội bộ.
 */
export function overheadPerHour(o: OverheadSettings | null, isInternal = false): number {
  const b = overheadBreakdown(o);
  return isInternal ? b.facility : b.total;
}

/** Bản giá vốn có hiệu lực tại một ngày (nằm trong khoảng start..end). */
export function rateOnDate(rates: CostRate[], userId: string, onDate?: string): CostRate | null {
  const day = onDate ?? new Date().toISOString().slice(0, 10);
  return (
    rates
      .filter(
        (r) => r.user_id === userId && r.start_date <= day && (!r.end_date || r.end_date >= day),
      )
      .sort((a, b) => b.start_date.localeCompare(a.start_date))[0] ?? null
  );
}

/** Toàn bộ lịch sử giá vốn của một người, mới nhất trước. */
export function rateHistory(rates: CostRate[], userId: string): CostRate[] {
  return rates
    .filter((r) => r.user_id === userId)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}

/**
 * Giá vốn thực một giờ, theo thứ tự ưu tiên:
 *   1. Giá riêng của hợp đồng (nếu đang tính trong 1 hợp đồng cụ thể)
 *   2. Giá theo kỳ lương của người đó, quy về giờ
 * Overhead chỉ cộng khi người đó bật.
 */
export function costRateFor(
  data: Pick<FinanceData, "costRates" | "budgetCostRates" | "overhead">,
  userId: string,
  opts?: { budgetId?: string; onDate?: string; isInternal?: boolean },
): { base: number; overhead: number; total: number; source: "budget" | "default" | "none" } {
  const oh = overheadPerHour(data.overhead, opts?.isInternal ?? false);
  const def = rateOnDate(data.costRates, userId, opts?.onDate);

  if (opts?.budgetId) {
    const custom = data.budgetCostRates.find(
      (r) => r.budget_id === opts.budgetId && r.user_id === userId,
    );
    if (custom) {
      const add = def?.add_overhead ? oh : 0;
      return {
        base: Number(custom.rate),
        overhead: add,
        total: Number(custom.rate) + add,
        source: "budget",
      };
    }
  }

  if (!def) return { base: 0, overhead: 0, total: 0, source: "none" };
  const base = hourlyCost(def, opts?.onDate);
  const add = def.add_overhead ? oh : 0;
  return { base, overhead: add, total: base + add, source: "default" };
}

/* ================= Ghi nhận giờ ================= */

export type TimeEntry = {
  id: string;
  namespace_id: string;
  user_id: string;
  service_id: string;
  ticket_id: string | null;
  date: string;
  minutes: number;
  billable_minutes: number;
  note: string | null;
  cost_rate_snapshot: number;
  approved_at: string | null;
  approved_by: string | null;
  change_requested_at: string | null;
  change_request_note: string | null;
  locked_at: string | null;
  timer_started_at: string | null;
  /** Phút từ nửa đêm, null nếu dòng không gắn giờ cụ thể trong ngày. */
  start_min: number | null;
};

/**
 * Đọc số phút từ mọi kiểu gõ mà Productive chấp nhận.
 *
 *   Khoảng giờ:   "9-5" · "9 am-5 pm" · "9-17" · "9 to 5"
 *   Khoảng mở:    "9-" · "9.30-"      (kết thúc = bây giờ)
 *   Đồng hồ:      "2:30"
 *   Chữ:          "1h 30m" · "1.5h" · "45m"
 *   Thập phân:    "30" -> 30 phút · "1.5" -> 1h30
 *
 * Số trần dưới 20 hiểu là giờ, từ 20 trở lên hiểu là phút — vì không ai
 * làm 45 giờ một ngày, nhưng 45 phút thì bình thường.
 */
export function parseDuration(input: string, now = new Date()): number {
  const s = input.trim().toLowerCase().replace(/,/g, ".");
  if (!s) return 0;

  // Một mốc giờ: "9" · "9.30" · "9:30" · "9 am" · "5pm"
  const clock = (raw: string): number | null => {
    const m = raw.trim().match(/^(\d{1,2})(?:[.:h](\d{1,2}))?\s*(am|pm)?$/);
    if (!m) return null;
    let h = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    const ap = m[3];
    if (h > 23 || min > 59) return null;
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return h * 60 + min;
  };

  // Khoảng giờ, kể cả khoảng mở "9-"
  const range = s.match(/^(.+?)\s*(?:-|–|to|đến)\s*(.*)$/);
  if (range) {
    const from = clock(range[1] ?? "");
    if (from !== null) {
      const rest = (range[2] ?? "").trim();
      let to = rest ? clock(rest) : now.getHours() * 60 + now.getMinutes();
      if (to !== null) {
        // "9-5" nghĩa là 9 sáng tới 5 chiều, không phải 5 giờ sáng hôm sau.
        // Chỉ suy diễn khi người dùng gõ giờ trần (không có am/pm) và cả hai
        // mốc đều <= 12 — ca đêm thật thì gõ "22-2" hoặc "9pm-5am".
        const bare = !/am|pm/.test(rest);
        if (bare && to < from && to <= 12 * 60 && from <= 12 * 60) to += 12 * 60;
        // Qua nửa đêm thì cộng thêm một ngày.
        return to >= from ? to - from : to + 24 * 60 - from;
      }
    }
  }

  // "1h 30m" / "1h30"
  const hm = s.match(/^(\d+)\s*h\s*(\d{1,2})\s*m?$/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);

  // "2:30" — đồng hồ hiểu là thời lượng
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  const h = s.match(/^(\d+(?:\.\d+)?)\s*(h|hour|hours|giờ|gio)$/);
  if (h) return Math.round(Number(h[1]) * 60);

  const m = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes|phút|phut)$/);
  if (m) return Math.round(Number(m[1]));

  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n < 20) return Math.round(n * 60);
  return Math.round(n);
}

/** 90 -> "1:30" */
export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** 90 -> "1h30" (gọn hơn, dùng trong câu chữ) */
export function fmtDurationShort(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/** Chi phí một dòng giờ — luôn dùng giá vốn đã chụp lúc log. */
export function entryCost(e: TimeEntry): number {
  return (e.minutes / 60) * Number(e.cost_rate_snapshot);
}

/**
 * Doanh thu một dòng giờ.
 * Chỉ tính phần billable, và chỉ khi hạng mục có tính tiền.
 * Hạng mục trọn gói không tính theo giờ — doanh thu đã cố định ở hợp đồng.
 */
export function entryRevenue(e: TimeEntry, service: BudgetService | undefined): number {
  if (!service || service.billing_type !== "tm") return 0;
  return (e.billable_minutes / 60) * Number(service.price);
}

export const WEEKDAY_LABEL = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Danh sách 7 ngày của tuần chứa `d`, bắt đầu từ thứ Hai. */
export function weekDays(d: Date): Date[] {
  const day = d.getDay();
  const back = day === 0 ? 6 : day - 1;
  const mon = new Date(d);
  mon.setDate(d.getDate() - back);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/* ================= Nộp bảng chấm công & khoá kỳ ================= */

export type TimesheetSubmission = {
  id: string;
  namespace_id: string;
  user_id: string;
  week_start: string;
  status: "submitted" | "partial" | "changes_requested";
  submitted_at: string;
  submitted_by: string | null;
  note: string | null;
};

export type TimeSettings = {
  id: string;
  namespace_id: string;
  require_approval: boolean;
  require_submission: boolean;
  lock_period: "none" | "daily" | "weekly" | "monthly";
  max_hours_per_day: number;
};

/**
 * Vì sao KHÔNG log giờ được vào một hạng mục.
 * Danh sách theo đúng bài "Can't Track Time Against a Budget" của Productive.
 * Trả về câu giải thích, hoặc null nếu log được.
 */
export function whyCannotTrack(
  data: Pick<FinanceData, "budgets" | "services" | "costRates" | "budgetCostRates" | "overhead">,
  serviceId: string,
  userId: string,
  date: string,
): string | null {
  const s = data.services.find((x) => x.id === serviceId);
  if (!s) return "Hạng mục không tồn tại.";

  const b = data.budgets.find((x) => x.id === s.budget_id);
  if (!b) return "Hạng mục không thuộc hợp đồng nào.";

  if (b.status === "delivered")
    return `Hợp đồng "${b.name}" đã bàn giao nên khoá, không log thêm giờ được. Mở lại hợp đồng nếu cần.`;

  if (b.start_date && date < b.start_date)
    return `Ngày ${fmtVn(date)} nằm trước ngày bắt đầu hợp đồng (${fmtVn(b.start_date)}).`;

  if (b.end_date && date > b.end_date)
    return `Ngày ${fmtVn(date)} nằm sau ngày kết thúc hợp đồng (${fmtVn(b.end_date)}).`;

  if (!s.allow_time)
    return `Hạng mục "${s.name}" đã tắt ghi nhận giờ. Bật lại trong phần sửa hạng mục.`;

  const rate = costRateFor(data, userId, { onDate: date });
  if (rate.source === "none")
    return "Người này chưa có giá vốn tại ngày đó. Chưa biết giá vốn thì giờ log ra chi phí bằng 0.";

  return null;
}

function fmtVn(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

/** Thứ Hai của tuần chứa ngày đã cho. */
export function weekStartOf(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : new Date(d);
  const back = x.getDay() === 0 ? 6 : x.getDay() - 1;
  x.setDate(x.getDate() - back);
  return isoDate(x);
}

/**
 * Trạng thái nộp bảng chấm công của một tuần.
 * Productive yêu cầu có dòng cho ĐỦ 7 ngày mới tính là đã nộp đầy đủ —
 * kể cả cuối tuần, để phân biệt "nghỉ" với "quên log".
 */
export function weekSubmission(
  subs: TimesheetSubmission[],
  entries: TimeEntry[],
  userId: string,
  weekStart: string,
): { status: "none" | "partial" | "submitted" | "changes_requested"; daysLogged: number } {
  const days = new Set(
    entries
      .filter((e) => e.user_id === userId && weekStartOf(e.date) === weekStart)
      .map((e) => e.date),
  );
  const sub = subs.find((s) => s.user_id === userId && s.week_start === weekStart);
  if (!sub) return { status: "none", daysLogged: days.size };
  if (sub.status === "changes_requested")
    return { status: "changes_requested", daysLogged: days.size };
  return { status: days.size >= 7 ? "submitted" : "partial", daysLogged: days.size };
}

/** Dòng giờ có bị khoá không — đã duyệt hoặc hết kỳ khoá. */
export function isEntryLocked(e: TimeEntry): boolean {
  return !!e.approved_at || !!e.locked_at;
}

/* ================= Bấm giờ ================= */

export type TimerLog = {
  id: string;
  time_entry_id: string;
  started_at: string;
  stopped_at: string | null;
  minutes: number;
  auto_stopped: boolean;
};

/** Tự dừng sau ngần này giờ không thao tác — theo Productive. */
export const TIMER_AUTO_STOP_HOURS = 24;
/** Nhắc qua email sau ngần này giờ. */
export const TIMER_REMIND_HOURS = 8;

/** Đồng hồ đang chạy của một người, nếu có. */
export function runningTimer(entries: TimeEntry[], userId: string): TimeEntry | null {
  return entries.find((e) => e.user_id === userId && e.timer_started_at) ?? null;
}

/**
 * Số phút đã trôi kể từ lúc bấm play, làm tròn theo luật Productive:
 * lẻ từ 30 giây trở lên thì lên phút, dưới 30 giây thì xuống.
 */
export function timerElapsed(startedAt: string, now = new Date()): number {
  const ms = now.getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

/** Tổng phút hiển thị của một dòng đang chạy: đã ghi + đang đếm. */
export function liveMinutes(e: TimeEntry, now = new Date()): number {
  return e.timer_started_at ? e.minutes + timerElapsed(e.timer_started_at, now) : e.minutes;
}

/** Đồng hồ chạy quá lâu, đáng ngờ là quên tắt. */
export function timerOverrun(startedAt: string, now = new Date()): boolean {
  return timerElapsed(startedAt, now) >= TIMER_REMIND_HOURS * 60;
}

/** Đã quá hạn tự dừng chưa. */
export function timerShouldAutoStop(startedAt: string, now = new Date()): boolean {
  return timerElapsed(startedAt, now) >= TIMER_AUTO_STOP_HOURS * 60;
}

/** "1:05:09" — đồng hồ đang chạy, có giây. */
export function fmtClock(startedAt: string, baseMinutes: number, now = new Date()): string {
  const ms = now.getTime() - new Date(startedAt).getTime();
  const total = Math.max(0, Math.floor(ms / 1000)) + baseMinutes * 60;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ================= Chi phí (Expense) ================= */

export type ExpenseStatus = "submitted" | "approved" | "changes_requested" | "cancelled";

export type Expense = {
  id: string;
  namespace_id: string;
  user_id: string;
  service_id: string;
  ticket_id: string | null;
  reference: string;
  date: string;
  due_date: string | null;
  currency: string;
  vendor: string | null;
  note: string | null;
  attachment_name: string | null;
  markup_type: "percent" | "fixed";
  markup_value: number;
  status: ExpenseStatus;
  approved_at: string | null;
  approved_by: string | null;
  review_note: string | null;
  is_paid: boolean;
  paid_at: string | null;
  is_reimbursed: boolean;
};

export type ExpenseItem = {
  id: string;
  expense_id: string;
  description: string;
  unit_price: number;
  quantity: number;
  tax_rate: number;
  tax_included: boolean;
  position: number;
};

export const EXPENSE_STATUS_LABEL: Record<ExpenseStatus, string> = {
  submitted: "Chờ duyệt",
  approved: "Đã duyệt",
  changes_requested: "Cần sửa lại",
  cancelled: "Đã huỷ",
};

/**
 * Tiền của một dòng chi phí, tách rõ phần trước thuế và phần thuế.
 *
 * `tax_included = true` nghĩa là đơn giá đã gồm thuế, phải bóc ngược ra:
 * net = gộp / (1 + thuế%). Nếu không bóc, phụ giá sẽ tính cả trên phần
 * thuế — mà thuế là tiền trả nhà nước, không phải giá vốn thật.
 */
export function expenseItemAmounts(i: ExpenseItem): {
  net: number;
  tax: number;
  gross: number;
} {
  const raw = Number(i.unit_price) * Number(i.quantity);
  const rate = Number(i.tax_rate) / 100;
  if (i.tax_included) {
    const net = rate ? raw / (1 + rate) : raw;
    return { net, tax: raw - net, gross: raw };
  }
  return { net: raw, tax: raw * rate, gross: raw * (1 + rate) };
}

/**
 * Tổng tiền một phiếu chi phí.
 *
 * Điểm quan trọng: `billable` (tiền tính cho khách) tính từ giá TRƯỚC THUẾ.
 * Thuế đầu vào là thứ ta trả nhà cung cấp; khi xuất hoá đơn cho khách thì
 * áp thuế riêng của mình. Trộn hai thứ lại là tính trùng thuế.
 */
export function expenseTotals(
  e: Expense,
  items: ExpenseItem[],
): { net: number; tax: number; gross: number; billable: number; profit: number } {
  const rows = items.filter((i) => i.expense_id === e.id);
  const net = rows.reduce((a, i) => a + expenseItemAmounts(i).net, 0);
  const tax = rows.reduce((a, i) => a + expenseItemAmounts(i).tax, 0);

  const billable =
    e.markup_type === "fixed"
      ? Number(e.markup_value)
      : net * (1 + Number(e.markup_value) / 100);

  return { net, tax, gross: net + tax, billable, profit: billable - net };
}

/**
 * Chi phí này đóng góp gì vào hợp đồng.
 *
 *   Đã duyệt   -> cả chi phí lẫn doanh thu
 *   Chờ duyệt  -> chỉ chi phí (nguyên tắc thận trọng: không giấu chi phí
 *                 chỉ vì chưa ai bấm duyệt)
 *   Từ chối/huỷ -> không tính gì
 *
 * Hạng mục không tính tiền thì không bao giờ sinh doanh thu.
 */
export function expenseImpact(
  e: Expense,
  items: ExpenseItem[],
  service: BudgetService | undefined,
): { cost: number; revenue: number } {
  if (e.status === "cancelled" || e.status === "changes_requested")
    return { cost: 0, revenue: 0 };

  const { net, billable } = expenseTotals(e, items);
  const free = !service || service.billing_type === "non_billable";
  return {
    cost: net,
    revenue: e.status === "approved" && !free ? billable : 0,
  };
}

/** Hạng mục ghi được chi phí: đơn vị 'gói' và đã bật cho ghi chi phí. */
export function expenseServices(services: BudgetService[]): BudgetService[] {
  return services.filter((s) => s.allow_expense && s.unit === "piece");
}

/**
 * Vì sao KHÔNG ghi được chi phí vào một hạng mục.
 * Theo bài "Can't Log an Expense" của Productive.
 */
export function whyCannotExpense(
  data: Pick<FinanceData, "budgets" | "services">,
  serviceId: string,
): string | null {
  const s = data.services.find((x) => x.id === serviceId);
  if (!s) return "Hạng mục không tồn tại.";

  const b = data.budgets.find((x) => x.id === s.budget_id);
  if (!b) return "Hạng mục không thuộc hợp đồng nào.";

  if (b.status === "delivered")
    return `Hợp đồng "${b.name}" đã bàn giao nên khoá. Mở lại nếu cần ghi thêm chi phí.`;

  if (s.unit !== "piece")
    return `Hạng mục "${s.name}" đang tính theo ${
      UNIT_LABEL[s.unit]
    }. Chỉ hạng mục đơn vị "gói" mới ghi được chi phí — sửa đơn vị trong hợp đồng.`;

  if (!s.allow_expense)
    return `Hạng mục "${s.name}" chưa bật cho ghi chi phí. Bật lại trong phần sửa hạng mục.`;

  return null;
}

/* ================= Tổng quan hợp đồng ================= */

/**
 * Số liệu của một hợp đồng, tách làm hai góc nhìn như Productive.
 *
 * Điểm cốt lõi — BẤT ĐỐI XỨNG CỐ Ý:
 *   Doanh thu tính trên giờ TÍNH TIỀN (billable)
 *   Chi phí   tính trên giờ ĐÃ LÀM   (worked)
 *
 * Làm 131 giờ nhưng chỉ 84 giờ tính được tiền thì vẫn tốn lương đủ 131 giờ.
 * Đây chính là cơ chế khiến làm quá tay ăn vào lợi nhuận. Đừng "sửa" cho đều.
 */
export function budgetSummary(data: FinanceData, budgetId: string) {
  const budget = data.budgets.find((b) => b.id === budgetId);
  const services = data.services.filter((s) => s.budget_id === budgetId);
  const svcIds = new Set(services.map((s) => s.id));
  const entries = data.timeEntries.filter((e) => svcIds.has(e.service_id));
  const expenses = data.expenses.filter((e) => svcIds.has(e.service_id));

  const requireApproval = data.timeSettings?.require_approval ?? true;
  /** Chỉ giờ đã duyệt mới ra doanh thu — nếu tổ chức bật duyệt giờ. */
  const recognized = (e: TimeEntry) =>
    requireApproval && !e.approved_at ? 0 : e.billable_minutes;

  // --- Thời gian
  const soldQty = services.reduce((a, s) => a + Number(s.quantity), 0);
  const estimateQty = services.reduce((a, s) => a + Number(s.estimate ?? s.quantity), 0);
  const workedMin = entries.reduce((a, e) => a + e.minutes, 0);
  const billableMin = entries.reduce((a, e) => a + e.billable_minutes, 0);
  const recognizedRawMin = entries.reduce((a, e) => a + recognized(e), 0);

  // --- Doanh thu, tính trên GIỜ GHI NHẬN (recognized time)
  //
  // Recognized time BỊ CHẶN TRẦN theo số lượng đã bán. Tài liệu Productive:
  // log 12 giờ trên hạng mục có ngân sách 10 giờ thì chỉ 10 giờ được ghi
  // nhận, 2 giờ vượt KHÔNG ra doanh thu — làm không công.
  //
  // Hạng mục trọn gói: doanh thu cố định theo hợp đồng, không theo giờ.
  let revenue = 0;
  let cappedMin = 0;
  for (const s of services) {
    if (s.billing_type === "non_billable") continue;
    // Phần trăm tính sau, vì nó ăn theo tổng các hạng mục còn lại
    if (s.billing_type === "percentage") continue;
    if (s.billing_type === "fixed") {
      revenue += Number(s.quantity) * Number(s.price);
      continue;
    }
    const raw = entries
      .filter((e) => e.service_id === s.id)
      .reduce((a, e) => a + recognized(e), 0);
    // Chặn trần: không vượt số lượng đã bán
    const capMin = Number(s.quantity) * 60;
    const mins = Math.min(raw, capMin);
    cappedMin += raw - mins;
    revenue += (mins / 60) * Number(s.price);
  }

  // Phí theo tỷ lệ: phí quản lý 10% là 10% của doanh thu ĐÃ GHI NHẬN, không
  // phải 10% của giá trị hợp đồng — làm được bao nhiêu mới thu phí bấy nhiêu.
  const pctBase = revenue;
  for (const s of services) {
    if (s.billing_type !== "percentage") continue;
    revenue += (pctBase * Number(s.quantity)) / 100;
  }

  // --- Chi phí: lương theo giờ ĐÃ LÀM + chi phí phát sinh
  const laborCost = entries.reduce((a, e) => a + (e.minutes / 60) * Number(e.cost_rate_snapshot), 0);
  let expenseCost = 0;
  let expenseRevenue = 0;
  for (const e of expenses) {
    const s = services.find((x) => x.id === e.service_id);
    const im = expenseImpact(e, data.expenseItems, s);
    expenseCost += im.cost;
    expenseRevenue += im.revenue;
  }

  const totalRevenue = revenue + expenseRevenue;
  const totalCost = laborCost + expenseCost;
  const profit = totalRevenue - totalCost;

  // --- Ngân sách (góc nhìn đối ngoại): đã tiêu bao nhiêu trong tổng đã bán
  const contractTotal = budgetTotal(services);
  const usedBudget = totalRevenue;

  return {
    budget,
    services,
    entries,
    expenses,
    // thời gian
    soldQty,
    estimateQty,
    workedMin,
    billableMin,
    // Giờ thực sự ra doanh thu = giờ ghi nhận trừ phần vượt trần
    recognizedMin: recognizedRawMin - cappedMin,
    // tiền
    contractTotal,
    usedBudget,
    remainingBudget: contractTotal - usedBudget,
    revenue: totalRevenue,
    laborCost,
    expenseCost,
    cost: totalCost,
    profit,
    margin: totalRevenue ? (profit / totalRevenue) * 100 : 0,
    // giờ làm không ra tiền — chỗ lợi nhuận rò rỉ
    unbillableMin: workedMin - (recognizedRawMin - cappedMin),
    // riêng phần vượt trần hợp đồng, đã làm nhưng quá số lượng đã bán
    cappedMin,
  };
}

/** Gộp số liệu nhiều hợp đồng — dùng cho màn tổng của cả công ty. */
export function totalsAcross(data: FinanceData, budgetIds: string[]) {
  let revenue = 0;
  let cost = 0;
  let contract = 0;
  for (const id of budgetIds) {
    const s = budgetSummary(data, id);
    revenue += s.revenue;
    cost += s.cost;
    contract += s.contractTotal;
  }
  return {
    revenue,
    cost,
    profit: revenue - cost,
    contract,
    margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
  };
}

/* ================= Xếp lịch & dự báo ================= */

/** Các ngày làm việc trong khoảng (bỏ cuối tuần và ngày lễ). */
export function workdaysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(from);
  const end = new Date(to);
  while (d <= end) {
    const iso = isoDate(d);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6 && !VN_HOLIDAYS.has(iso)) out.push(iso);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/**
 * Dự báo tiền theo CÔNG VIỆC đã ước tính, từ ngày mai trở đi.
 *
 * Cách Workload của Productive: rải đều số giờ ước tính của công việc
 * giữa ngày bắt đầu và hạn chót, chia cho số ngày làm việc.
 *
 *   Ước tính 40h, 01/08 → 15/08 (11 ngày làm việc) → 3.6h mỗi ngày
 *
 * Với mỗi ngày công dự kiến:
 *   doanh thu += giờ x đơn giá bán   (chỉ hạng mục tính theo giờ)
 *   chi phí   += giờ x giá vốn người phụ trách
 *
 * Công việc thiếu ước tính giờ, thiếu ngày, hoặc chưa gán hạng mục thì
 * không vào dự báo — vì không đủ dữ kiện để tính.
 */
export function forecastByDate(
  data: Pick<
    FinanceData,
    "services" | "budgets" | "costRates" | "budgetCostRates" | "overhead" | "timeEntries"
  >,
  tickets: ForecastTicket[],
  budgetId?: string,
): Map<string, { revenue: number; cost: number; hours: number }> {
  const out = new Map<string, { revenue: number; cost: number; hours: number }>();
  const today = isoDate(new Date());
  const svcOf = new Map(data.services.map((s) => [s.id, s]));

  for (const t of tickets) {
    if (!t.budget_service_id || !t.estimate_hours || !t.start_date || !t.deadline) continue;
    const s = svcOf.get(t.budget_service_id);
    if (!s) continue;
    if (budgetId && s.budget_id !== budgetId) continue;

    const days = workdaysBetween(t.start_date, t.deadline).filter((d) => d > today);
    if (!days.length) continue;

    // Trừ phần đã log để không đếm hai lần.
    const logged =
      data.timeEntries
        .filter((e) => e.ticket_id === t.id)
        .reduce((a, e) => a + e.minutes, 0) / 60;
    const remain = Math.max(0, Number(t.estimate_hours) - logged);
    if (!remain) continue;

    const perDay = remain / days.length;
    const budget = data.budgets.find((x) => x.id === s.budget_id);
    const isInternal = budget?.is_internal ?? false;
    // Người phụ trách đầu tiên; không có thì lấy giá vốn trung bình.
    const uid = t.assignee_id;

    for (const day of days) {
      const rate = uid
        ? costRateFor(data as FinanceData, uid, {
            onDate: day,
            budgetId: s.budget_id,
            isInternal,
          }).total
        : 0;
      const rev = s.billing_type === "tm" ? perDay * Number(s.price) : 0;
      const cur = out.get(day) ?? { revenue: 0, cost: 0, hours: 0 };
      cur.revenue += rev;
      cur.cost += perDay * rate;
      cur.hours += perDay;
      out.set(day, cur);
    }
  }
  return out;
}

/** Dữ liệu công việc cần cho dự báo. */
export type ForecastTicket = {
  id: string;
  budget_service_id: string | null;
  start_date: string | null;
  deadline: string | null;
  estimate_hours: number | null;
  assignee_id: string | null;
};

/** Khi nào ngân sách cạn theo dự báo — trả về ngày, hoặc null nếu không cạn. */
export function budgetRunsOutOn(
  data: FinanceData,
  tickets: ForecastTicket[],
  budgetId: string,
): { date: string; overBy: number } | null {
  const s = budgetSummary(data, budgetId);
  const fc = forecastByDate(data, tickets, budgetId);
  let used = s.usedBudget;
  for (const day of [...fc.keys()].sort()) {
    used += fc.get(day)!.revenue;
    if (used > s.contractTotal) return { date: day, overBy: used - s.contractTotal };
  }
  return null;
}
