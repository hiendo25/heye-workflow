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

export type CostRate = {
  id: string;
  namespace_id: string;
  user_id: string;
  rate: number;
  valid_from: string;
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

/**
 * Chi phí gián tiếp phân bổ lên mỗi giờ làm việc.
 *
 *   Overhead/giờ = chi phí gián tiếp tháng / tổng giờ làm việc tháng
 *
 * Gồm mặt bằng, điện nước, máy móc, HR, kế toán, quản lý — những thứ
 * không gắn vào dự án nào nhưng vẫn phải trả. Bỏ qua thì biên lợi nhuận
 * luôn đẹp giả tạo.
 */
export function overheadPerHour(o: OverheadSettings | null): number {
  if (!o || !o.is_enabled || !o.monthly_hours) return 0;
  return o.monthly_cost / o.monthly_hours;
}

/**
 * Giá vốn 1 giờ của một người, theo thứ tự ưu tiên:
 *
 *   1. Giá riêng của hợp đồng   (nếu đang tính trong 1 hợp đồng cụ thể)
 *   2. Giá mặc định của người   (bản có hiệu lực gần nhất tính tới ngày cần)
 *
 * Overhead chỉ cộng khi người đó bật `add_overhead`.
 */
export function costRateFor(
  data: Pick<FinanceData, "costRates" | "budgetCostRates" | "overhead">,
  userId: string,
  opts?: { budgetId?: string; onDate?: string },
): { base: number; overhead: number; total: number; source: "budget" | "default" | "none" } {
  const oh = overheadPerHour(data.overhead);

  if (opts?.budgetId) {
    const custom = data.budgetCostRates.find(
      (r) => r.budget_id === opts.budgetId && r.user_id === userId,
    );
    if (custom) {
      // Giá riêng theo hợp đồng vẫn cộng overhead nếu người đó bật.
      const def = latestRate(data.costRates, userId, opts.onDate);
      const add = def?.add_overhead ? oh : 0;
      return { base: custom.rate, overhead: add, total: custom.rate + add, source: "budget" };
    }
  }

  const def = latestRate(data.costRates, userId, opts?.onDate);
  if (!def) return { base: 0, overhead: 0, total: 0, source: "none" };
  const add = def.add_overhead ? oh : 0;
  return { base: def.rate, overhead: add, total: def.rate + add, source: "default" };
}

/**
 * Bản giá vốn có hiệu lực tại một ngày.
 * Tăng lương thì tạo bản mới với valid_from mới — chi phí của những giờ
 * đã log trước đó vẫn tính theo bản cũ, số liệu lịch sử không đổi.
 */
export function latestRate(
  rates: CostRate[],
  userId: string,
  onDate?: string,
): CostRate | null {
  const day = onDate ?? new Date().toISOString().slice(0, 10);
  const mine = rates
    .filter((r) => r.user_id === userId && r.valid_from <= day)
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from));
  return mine[0] ?? null;
}

/** Toàn bộ lịch sử giá vốn của một người, mới nhất trước. */
export function rateHistory(rates: CostRate[], userId: string): CostRate[] {
  return rates
    .filter((r) => r.user_id === userId)
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from));
}
