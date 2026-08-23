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

export type BillingType = "tm" | "fixed" | "non_billable";

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
  monthly_cost: number;
  monthly_hours: number;
  is_enabled: boolean;
  note: string | null;
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
    costRates, budgetCostRates, overhead,
  ] = await Promise.all([
      all<ClientCompany>("client_companies", "name"),
      all<ServiceType>("service_types", "position"),
      all<RateCard>("rate_cards", "name"),
      all<RateCardItem>("rate_card_items", "position"),
      all<Budget>("budgets", "created_at"),
      all<BudgetSection>("budget_sections", "position"),
      all<BudgetService>("budget_services", "position"),
      all<CostRate>("cost_rates", "valid_from"),
      all<BudgetCostRate>("budget_cost_rates"),
      all<OverheadSettings>("overhead_settings"),
    ]);
  return {
    clients, serviceTypes, rateCards, rateCardItems, budgets, sections, services,
    costRates, budgetCostRates, overhead: overhead[0] ?? null,
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
  non_billable: "Không tính tiền",
};

/** Ai chịu rủi ro khi làm quá dự kiến — điểm quyết định của cách tính tiền. */
export const BILLING_NOTE: Record<BillingType, string> = {
  tm: "Làm bao nhiêu tính bấy nhiêu. Vượt dự kiến thì khách trả thêm.",
  fixed: "Giá cố định. Vượt dự kiến thì công ty tự chịu — nên vẫn phải theo dõi giờ.",
  non_billable: "Không thu tiền khách nhưng vẫn tính chi phí: họp nội bộ, đào tạo, bảo hành.",
};

/** Thành tiền một hạng mục. Không tính tiền thì doanh thu bằng 0. */
export function serviceTotal(s: Pick<BudgetService, "billing_type" | "quantity" | "price">): number {
  if (s.billing_type === "non_billable") return 0;
  return s.quantity * s.price;
}

/** Tổng giá trị hợp đồng. */
export function budgetTotal(services: BudgetService[]): number {
  return services.reduce((sum, s) => sum + serviceTotal(s), 0);
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
 * Chi phí gián tiếp phân bổ lên mỗi giờ làm việc.
 * Mặt bằng, điện nước, HR, kế toán — không gắn dự án nào nhưng vẫn phải trả.
 */
export function overheadPerHour(o: OverheadSettings | null): number {
  if (!o || !o.is_enabled || !o.monthly_hours) return 0;
  return Number(o.monthly_cost) / Number(o.monthly_hours);
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
  opts?: { budgetId?: string; onDate?: string },
): { base: number; overhead: number; total: number; source: "budget" | "default" | "none" } {
  const oh = overheadPerHour(data.overhead);
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
