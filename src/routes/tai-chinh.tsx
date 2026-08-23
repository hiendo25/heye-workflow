import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Building2, Plus, Tags } from "lucide-react";
import { AppShell } from "@/components/heye/AppShell";
import { workspaceQuery } from "@/lib/heye-data";
import {
  financeQuery,
  money,
  priceDelta,
  rateCardsForClient,
  UNIT_LABEL,
  type RateCard,
} from "@/lib/finance-data";

export const Route = createFileRoute("/tai-chinh")({
  head: () => ({
    meta: [
      { title: "Tài chính — HeyE" },
      {
        name: "description",
        content:
          "Quản lý khách hàng, danh mục loại dịch vụ và bảng giá bán theo từng khách trong HeyE.",
      },
    ],
  }),
  component: TaiChinh,
});

const SIDE = [
  { id: "clients", label: "Khách hàng", icon: Building2 },
  { id: "rates", label: "Bảng giá", icon: Tags },
] as const;

type Tab = (typeof SIDE)[number]["id"];

function TaiChinh() {
  const { data: ws } = useQuery(workspaceQuery);
  const { data, isLoading, error } = useQuery(financeQuery);
  const [tab, setTab] = useState<Tab>("clients");
  const [clientId, setClientId] = useState<string | null>(null);

  const standardCard = useMemo(
    () => data?.rateCards.find((c) => c.client_id === null && !c.is_archived) ?? null,
    [data],
  );

  return (
    <AppShell namespaceName={ws?.namespace?.name}>
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-line bg-surface">
        <div className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-3">
          Tài chính
        </div>
        <div className="scroll-y flex-1 px-2 pb-4">
          {SIDE.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] ${
                tab === s.id
                  ? "bg-brand-soft font-semibold text-brand"
                  : "text-ink-2 hover:bg-brand-soft/50"
              }`}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}

          <div className="px-2.5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-ink-3">
            Sắp có
          </div>
          {["Hợp đồng", "Giờ của tôi", "Chi phí", "Giá vốn nhân sự"].map((s) => (
            <div
              key={s}
              className="cursor-not-allowed px-2.5 py-1.5 text-[13px] text-ink-3 opacity-60"
            >
              {s}
            </div>
          ))}
        </div>
      </aside>

      <main className="scroll-y min-w-0 flex-1 px-5 py-4">
        {error ? (
          <Notice tone="bad">
            Chưa đọc được dữ liệu tài chính. Hãy chạy migration{" "}
            <code className="rounded bg-background px-1">20260824000000_finance_clients_ratecards.sql</code>{" "}
            trên Supabase trước.
          </Notice>
        ) : isLoading || !data ? (
          <div className="py-16 text-center text-[13px] text-ink-3">Đang tải…</div>
        ) : tab === "clients" ? (
          <Clients data={data} standardCard={standardCard} onOpenRates={(id) => { setClientId(id); setTab("rates"); }} />
        ) : (
          <Rates data={data} clientId={clientId} setClientId={setClientId} />
        )}
      </main>
    </AppShell>
  );
}

/* ---------------- Khách hàng ---------------- */

function Clients({
  data,
  standardCard,
  onOpenRates,
}: {
  data: NonNullable<ReturnType<typeof useQuery<typeof financeQuery>>["data"]> extends never
    ? never
    : import("@/lib/finance-data").FinanceData;
  standardCard: RateCard | null;
  onOpenRates: (id: string) => void;
}) {
  return (
    <>
      <div className="text-[11.5px] text-ink-3">Tài chính / Khách hàng</div>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-[20px] font-bold tracking-tight">Khách hàng</h1>
        <div className="flex-1" />
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-white"
        >
          <Plus size={13} /> Thêm khách hàng
        </button>
      </div>

      <Notice tone="info">
        Hợp đồng và bảng giá đều treo vào <b>khách hàng</b> — nên đây là tầng phải có trước.
        Cùng một loại lao động bán mỗi khách một giá, vì vậy mỗi khách giữ bảng giá riêng của mình.
      </Notice>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              <Th>Khách hàng</Th>
              <Th>Mã số thuế</Th>
              <Th>Người liên hệ</Th>
              <Th>Bảng giá riêng</Th>
              <Th className="text-right">Tiền tệ</Th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((c) => {
              const own = data.rateCards.find((r) => r.client_id === c.id && !r.is_archived);
              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-brand-soft/30">
                  <Td>
                    <div className="font-semibold text-ink">{c.name}</div>
                    {c.short_name && (
                      <div className="text-[11.5px] text-ink-3">{c.short_name}</div>
                    )}
                  </Td>
                  <Td className="num text-ink-2">{c.tax_id ?? "—"}</Td>
                  <Td className="text-ink-2">
                    {c.contact_name ?? "—"}
                    {c.contact_email && (
                      <div className="text-[11.5px] text-ink-3">{c.contact_email}</div>
                    )}
                  </Td>
                  <Td>
                    {own ? (
                      <button
                        type="button"
                        onClick={() => onOpenRates(c.id)}
                        className="rounded-md bg-brand-soft px-2 py-0.5 text-[11.5px] font-semibold text-brand"
                      >
                        {own.name}
                      </button>
                    ) : (
                      <span className="text-[11.5px] text-ink-3">
                        Dùng {standardCard?.name ?? "giá chuẩn"}
                      </span>
                    )}
                  </Td>
                  <Td className="num text-right text-ink-2">{c.currency}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- Bảng giá ---------------- */

function Rates({
  data,
  clientId,
  setClientId,
}: {
  data: import("@/lib/finance-data").FinanceData;
  clientId: string | null;
  setClientId: (id: string | null) => void;
}) {
  const visible = rateCardsForClient(data.rateCards, clientId);
  const standard = data.rateCards.find((c) => c.client_id === null && !c.is_archived) ?? null;
  const stdPrice = new Map(
    data.rateCardItems
      .filter((i) => i.rate_card_id === standard?.id)
      .map((i) => [i.service_type_id, i.price]),
  );

  return (
    <>
      <div className="text-[11.5px] text-ink-3">Tài chính / Bảng giá</div>
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-[20px] font-bold tracking-tight">Bảng giá</h1>
        <div className="flex-1" />
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-white"
        >
          <Plus size={13} /> Bảng giá mới
        </button>
      </div>

      <Notice tone="info">
        Bảng giá <b>chỉ có đơn giá, không có số lượng</b> — số lượng thuộc về hợp đồng.
        Nhờ vậy một bảng giá dùng lại được cho nhiều hợp đồng của cùng một khách,
        không phải nhớ và gõ lại giá đã đàm phán.
      </Notice>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-ink-2">Xem theo khách:</span>
        <Chip on={clientId === null} onClick={() => setClientId(null)}>
          Tất cả
        </Chip>
        {data.clients.map((c) => (
          <Chip key={c.id} on={clientId === c.id} onClick={() => setClientId(c.id)}>
            {c.short_name ?? c.name}
          </Chip>
        ))}
      </div>

      {clientId && (
        <p className="mt-2 text-[12.5px] text-ink-3">
          Khi lập hợp đồng cho khách này, hệ thống chỉ hiện các bảng dưới đây —
          bảng giá riêng của khách khác không bao giờ lộ sang.
        </p>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {visible.map((card) => {
          const items = data.rateCardItems.filter((i) => i.rate_card_id === card.id);
          const client = data.clients.find((c) => c.id === card.client_id);
          const isStd = card.client_id === null;
          return (
            <section key={card.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <header className="flex items-start gap-2 border-b border-line px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[14px] font-bold">{card.name}</h2>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isStd ? "bg-line text-ink-2" : "bg-brand-soft text-brand"
                      }`}
                    >
                      {isStd ? "CHUẨN CÔNG TY" : "RIÊNG KHÁCH"}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-ink-3">
                    {client ? client.name : "Áp dụng cho mọi khách chưa có bảng riêng"}
                  </div>
                </div>
                <span className="num shrink-0 text-[11.5px] text-ink-3">{card.currency}</span>
              </header>

              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <Th>Loại dịch vụ</Th>
                    <Th className="text-right">Đơn vị</Th>
                    <Th className="text-right">Đơn giá bán</Th>
                    {!isStd && <Th className="text-right">So với chuẩn</Th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const st = data.serviceTypes.find((s) => s.id === it.service_type_id);
                    const d = isStd ? null : priceDelta(it.price, stdPrice.get(it.service_type_id) ?? 0);
                    return (
                      <tr key={it.id} className="border-b border-line last:border-0">
                        <Td>
                          <span
                            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                            style={{ background: st?.color }}
                          />
                          {st?.name ?? "—"}
                          {st?.code && <span className="num ml-1.5 text-[11px] text-ink-3">{st.code}</span>}
                        </Td>
                        <Td className="text-right text-ink-2">{UNIT_LABEL[it.unit]}</Td>
                        <Td className="num text-right font-semibold">{money(it.price)}</Td>
                        {!isStd && (
                          <Td className="num text-right">
                            {d === null ? (
                              <span className="text-ink-3">—</span>
                            ) : (
                              <span className={d > 0 ? "text-good" : d < 0 ? "text-bad" : "text-ink-3"}>
                                {d > 0 ? "+" : ""}
                                {d}%
                              </span>
                            )}
                          </Td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {card.note && (
                <div className="border-t border-line px-4 py-2 text-[11.5px] text-ink-3">{card.note}</div>
              )}
            </section>
          );
        })}
      </div>

      <h3 className="mt-8 text-[15px] font-bold">Danh mục loại dịch vụ</h3>
      <p className="mt-0.5 max-w-[70ch] text-[12.5px] text-ink-2">
        Khai một lần cho cả công ty. Đây là <b>trung tâm lợi nhuận</b> — nhờ nó mới gộp được
        báo cáo “mảng Kiểm thử của công ty lãi bao nhiêu” từ mọi dự án, mọi khách.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.serviceTypes.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px]"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.name}
            {s.code && <span className="num text-[11px] text-ink-3">{s.code}</span>}
          </span>
        ))}
      </div>
    </>
  );
}

/* ---------------- phụ trợ ---------------- */

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-ink-3 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function Chip({
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
      className={`rounded-lg border px-2.5 py-1 text-[12.5px] ${
        on
          ? "border-brand bg-brand font-semibold text-white"
          : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "bad" }) {
  const c =
    tone === "bad"
      ? "border-bad/40 bg-bad/10 text-ink"
      : "border-brand/30 bg-brand-soft text-ink";
  return (
    <div className={`mt-3 max-w-[80ch] rounded-lg border-l-[3px] px-3.5 py-2.5 text-[12.5px] ${c}`}>
      {children}
    </div>
  );
}
