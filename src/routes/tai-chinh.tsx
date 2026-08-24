import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Building2,
  Clock,
  Coins,
  Receipt,
  Users2,
  FileSignature,
  Layers,
  Pencil,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/heye/AppShell";
import { PanelFooter, PanelRow, SettingsPanel } from "@/components/heye/SettingsPanel";
import { BudgetDetail } from "@/components/heye/BudgetDetail";
import { EmptyState, ListToolbar } from "@/components/heye/BudgetChrome";
import { CostRatePanel } from "@/components/heye/CostRatePanel";
import { MyTime } from "@/components/heye/MyTime";
import { CompanyTime } from "@/components/heye/CompanyTime";
import { Expenses } from "@/components/heye/Expenses";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workspaceQuery, type Ticket, type User } from "@/lib/heye-data";
import {
  budgetTotal,
  deleteRow,
  financeQuery,
  insertRow,
  insertReturning,
  money,
  priceDelta,
  effectivePrice,
  estimatedMargin,
  updateRow,
  UNIT_LABEL,
  BILLING_LABEL,
  timerElapsed,
  type BillingType,
  type Budget,
  type ClientCompany,
  type FinanceData,
  type RateCard,
  type ServiceType,
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

// Xếp theo THỨ TỰ KHAI BÁO, không theo mức độ quan trọng:
// loại dịch vụ (danh mục) → khách hàng (chủ thể) → bảng giá (cần cả hai).
// Người dùng lần đầu đi từ trên xuống là ra dữ liệu hợp lệ.
const NAV = [
  { id: "types", label: "Loại dịch vụ", icon: Layers },
  { id: "clients", label: "Khách hàng", icon: Building2 },
  { id: "rates", label: "Bảng giá", icon: Tags },
  { id: "budgets", label: "Hợp đồng", icon: FileSignature },
  { id: "cost", label: "Giá vốn nhân sự", icon: Coins },
  { id: "time", label: "Giờ của tôi", icon: Clock },
  { id: "company", label: "Giờ toàn công ty", icon: Users2 },
  { id: "expenses", label: "Chi phí", icon: Receipt },
] as const;
type Tab = (typeof NAV)[number]["id"];

const PALETTE = ["#2563EB", "#7C3AED", "#0E9F6E", "#D97706", "#DB2777", "#0891B2", "#DC2626"];

function TaiChinh() {
  const { data: ws } = useQuery(workspaceQuery);
  const { data, isLoading, error } = useQuery(financeQuery);
  const [tab, setTab] = useState<Tab>("types");
  const [clientId, setClientId] = useState<string | null>(null);

  // Nguồn tin cậy duy nhất cho namespace_id. KHÔNG suy ra từ hàng dữ liệu con:
  // khi người dùng xoá hết khách/loại dịch vụ để tự tạo lại thì mảng rỗng,
  // giá trị rơi về "" và Postgres báo invalid input syntax for type uuid.
  const nsId = ws?.namespace?.id ?? null;

  return (
    <AppShell namespaceName={ws?.namespace?.name}>
      <aside className="flex w-[230px] shrink-0 flex-col border-r border-line bg-surface">
        <div className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-3">
          Tài chính
        </div>
        <div className="scroll-y flex-1 px-2 pb-4">
          {NAV.map((s) => (
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

        </div>
      </aside>

      <main className="scroll-y min-w-0 flex-1 px-6 py-5">
        {error ? (
          <div className="max-w-[70ch] rounded-lg border-l-[3px] border-bad bg-bad-soft px-4 py-3 text-[13px]">
            Chưa đọc được dữ liệu tài chính. Hãy chạy migration{" "}
            <code className="rounded bg-background px-1 text-[12px]">
              20260824000000_finance_clients_ratecards.sql
            </code>{" "}
            và{" "}
            <code className="rounded bg-background px-1 text-[12px]">
              20260824010000_service_type_archive.sql
            </code>{" "}
            trên Supabase.
          </div>
        ) : isLoading || !data || !nsId ? (
          <div className="py-16 text-center text-[13px] text-ink-3">Đang tải…</div>
        ) : tab === "clients" ? (
          <ClientsPanel data={data} nsId={nsId} />
        ) : tab === "types" ? (
          <TypesPanel data={data} nsId={nsId} />
        ) : tab === "budgets" ? (
          <BudgetsPanel
            data={data}
            nsId={nsId}
            users={ws?.users ?? []}
            tickets={ws?.tickets ?? []}
            assignees={ws?.assignees ?? []}
          />
        ) : tab === "cost" ? (
          <CostPanel data={data} users={ws?.users ?? []} nsId={nsId} />

        ) : tab === "expenses" ? (
          <ExpensePanel data={data} users={ws?.users ?? []} nsId={nsId} />
        ) : tab === "company" ? (
          <CompanyPanel
            data={data}
            users={ws?.users ?? []}
            tickets={ws?.tickets ?? []}
            nsId={nsId}
          />
        ) : tab === "time" ? (
          <TimePanel
            data={data}
            users={ws?.users ?? []}
            tickets={ws?.tickets ?? []}
            nsId={nsId}
          />
        ) : (
          <RatesPanel data={data} nsId={nsId} clientId={clientId} setClientId={setClientId} />
        )}
      </main>
    </AppShell>
  );
}

/* ================= hook lưu dữ liệu ================= */

function useSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Đã lưu");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Không lưu được, thử lại sau.";
      toast.error(msg);
    },
  });
}

/* ================= Khách hàng ================= */

function ClientsPanel({ data, nsId }: { data: FinanceData; nsId: string }) {
  const save = useSave();
  const [edit, setEdit] = useState<ClientCompany | "new" | null>(null);
  const [del, setDel] = useState<ClientCompany | null>(null);

  return (
    <>
      <SettingsPanel
        title="Khách hàng"
        description={
          <>
            Hợp đồng và bảng giá đều treo vào khách hàng, nên đây là tầng phải có trước.
            Cùng một loại lao động bán cho mỗi khách một giá, vì vậy mỗi khách giữ bảng giá riêng.
          </>
        }
      >
        {data.clients.map((c) => {
          const own = data.rateCards.find((r) => r.client_id === c.id && !r.is_archived);
          return (
            <PanelRow
              key={c.id}
              meta={
                own ? (
                  <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                    {own.name}
                  </span>
                ) : (
                  "Dùng giá chuẩn"
                )
              }
              actions={[
                { label: "Sửa", icon: <Pencil size={14} />, onSelect: () => setEdit(c) },
                {
                  label: "Xoá",
                  icon: <Trash2 size={14} />,
                  danger: true,
                  onSelect: () => setDel(c),
                },
              ]}
            >
              <div className="font-medium text-ink">{c.name}</div>
              <div className="text-[11.5px] text-ink-3">
                {[c.short_name, c.tax_id, c.contact_name].filter(Boolean).join(" · ") || "—"}
              </div>
            </PanelRow>
          );
        })}
        <PanelFooter>
          <Button size="sm" onClick={() => setEdit("new")}>
            Thêm khách hàng
          </Button>
        </PanelFooter>
      </SettingsPanel>

      <ClientDialog
        key={edit === "new" ? "new" : (edit?.id ?? "closed")}
        open={edit !== null}
        value={edit === "new" ? null : edit}
        onClose={() => setEdit(null)}
        onSubmit={(v) =>
          save.mutate(
            () =>
              edit === "new"
                ? insertRow("client_companies", { ...v, namespace_id: nsId })
                : updateRow("client_companies", (edit as ClientCompany).id, v),
            { onSuccess: () => setEdit(null) },
          )
        }
      />

      <ConfirmDialog
        open={del !== null}
        title={`Xoá khách hàng "${del?.name ?? ""}"?`}
        body="Bảng giá riêng của khách này cũng bị xoá theo. Thao tác không hoàn tác được."
        onCancel={() => setDel(null)}
        onConfirm={() =>
          save.mutate(() => deleteRow("client_companies", del!.id), {
            onSuccess: () => setDel(null),
          })
        }
      />
    </>
  );
}

function ClientDialog({
  open,
  value,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: ClientCompany | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={value ? "Sửa khách hàng" : "Thêm khách hàng"}
      description="Khách hàng là chủ thể ký hợp đồng. Bảng giá riêng gắn vào đây."
      fields={[
        { name: "name", label: "Tên khách hàng", required: true, value: value?.name ?? "" },
        { name: "short_name", label: "Tên gọi tắt", value: value?.short_name ?? "" },
        { name: "tax_id", label: "Mã số thuế", value: value?.tax_id ?? "" },
        { name: "contact_name", label: "Người liên hệ", value: value?.contact_name ?? "" },
        { name: "contact_email", label: "Email", value: value?.contact_email ?? "" },
        { name: "contact_phone", label: "Điện thoại", value: value?.contact_phone ?? "" },
      ]}
      onSubmit={onSubmit}
    />
  );
}

/* ================= Loại dịch vụ ================= */

function TypesPanel({ data, nsId }: { data: FinanceData; nsId: string }) {
  const save = useSave();
  const [edit, setEdit] = useState<ServiceType | "new" | null>(null);
  const [del, setDel] = useState<ServiceType | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of data.rateCardItems)
      m.set(i.service_type_id, (m.get(i.service_type_id) ?? 0) + 1);
    return m;
  }, [data.rateCardItems]);

  const list = data.serviceTypes.filter((s) => showArchived || !s.is_archived);

  return (
    <>
      <SettingsPanel
        title="Loại dịch vụ"
        description={
          <>
            Danh mục loại lao động của công ty, khai một lần dùng mãi. Đây là{" "}
            <b>trung tâm lợi nhuận</b> — nhờ nó mới gộp được báo cáo “mảng Kiểm thử lãi bao nhiêu”
            từ mọi dự án, mọi khách. Đặt tên theo <i>loại việc</i> (Kiểm thử), không theo{" "}
            <i>việc cụ thể</i> (Test màn đăng nhập).
          </>
        }
      >
        {list.map((s) => {
          const used = usage.get(s.id) ?? 0;
          return (
            <PanelRow
              key={s.id}
              muted={s.is_archived}
              meta={used ? `${used} bảng giá` : "chưa dùng"}
              actions={[
                { label: "Sửa", icon: <Pencil size={14} />, onSelect: () => setEdit(s) },
                {
                  label: s.is_archived ? "Bỏ lưu trữ" : "Lưu trữ",
                  icon: s.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />,
                  onSelect: () =>
                    save.mutate(() =>
                      updateRow("service_types", s.id, { is_archived: !s.is_archived }),
                    ),
                },
                {
                  label: "Xoá",
                  icon: <Trash2 size={14} />,
                  danger: true,
                  onSelect: () => setDel(s),
                },
              ]}
            >
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ background: s.color }}
              />
              <span className="font-medium text-ink">{s.name}</span>
              {s.code && <span className="num ml-2 text-[11px] text-ink-3">{s.code}</span>}
            </PanelRow>
          );
        })}
        <PanelFooter>
          <Button size="sm" onClick={() => setEdit("new")}>
            Thêm loại dịch vụ
          </Button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-[12.5px] text-ink-2 hover:text-brand"
          >
            {showArchived ? "Ẩn mục lưu trữ" : "Xem mục lưu trữ"}
          </button>
        </PanelFooter>
      </SettingsPanel>

      <TypeDialog
        key={edit === "new" ? "new" : (edit?.id ?? "closed")}
        open={edit !== null}
        value={edit === "new" ? null : edit}
        onClose={() => setEdit(null)}
        onSubmit={(v) =>
          save.mutate(
            () =>
              edit === "new"
                ? insertRow("service_types", {
                    ...v,
                    namespace_id: nsId,
                    position: data.serviceTypes.length + 1,
                  })
                : updateRow("service_types", (edit as ServiceType).id, v),
            { onSuccess: () => setEdit(null) },
          )
        }
      />

      <DeleteMergeTypeDialog
        type={del}
        types={data.serviceTypes}
        inUse={(usage.get(del?.id ?? "") ?? 0) > 0}
        onCancel={() => setDel(null)}
        onConfirm={(intoId) =>
          save.mutate(
            async () => {
              // Chuyển hết dòng giá sang loại đích RỒI mới xoá, để không mất
              // dữ liệu. Đây là điểm khác cốt lõi với cách làm cũ.
              if (intoId) {
                for (const it of data.rateCardItems.filter((i) => i.service_type_id === del!.id)) {
                  await updateRow("rate_card_items", it.id, { service_type_id: intoId });
                }
              }
              await deleteRow("service_types", del!.id);
            },
            { onSuccess: () => setDel(null) },
          )
        }
      />
    </>
  );
}

/**
 * Xoá loại dịch vụ = GỘP sang loại khác, không phải xoá trắng.
 *
 * Cách cũ xoá thẳng, kéo theo mất hết dòng giá đang trỏ vào loại đó.
 * Productive bắt chọn một loại đích, chuyển toàn bộ dòng giá / giờ / chi phí
 * sang đó rồi mới xoá — số liệu lịch sử không mất, chỉ đổi nhãn.
 */
function DeleteMergeTypeDialog({
  type,
  types,
  inUse,
  onCancel,
  onConfirm,
}: {
  type: ServiceType | null;
  types: ServiceType[];
  inUse: boolean;
  onCancel: () => void;
  onConfirm: (intoId: string | null) => void;
}) {
  const [into, setInto] = useState("");
  const options = types.filter((t) => t.id !== type?.id && !t.is_archived);

  useEffect(() => {
    if (type) setInto("");
  }, [type]);

  return (
    <Dialog open={type !== null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Xoá và gộp loại dịch vụ</DialogTitle>
        </DialogHeader>

        {inUse ? (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-2">
              Chuyển mọi dòng giá đang dùng &ldquo;{type?.name}&rdquo; sang loại nào?
            </p>
            <Select value={into} onValueChange={setInto}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại thay thế" />
              </SelectTrigger>
              <SelectContent>
                {options.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-lg border border-warn/40 bg-warn-soft px-3 py-2.5 text-[12.5px] text-ink">
              Mọi dòng giá, giờ và chi phí đang gắn với &ldquo;{type?.name}&rdquo; sẽ chuyển sang
              loại đã chọn. <strong>Không hoàn tác được.</strong>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-ink-2">
            Loại này chưa được dùng ở đâu, xoá được ngay. Không hoàn tác được.
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Huỷ
          </Button>
          <Button
            disabled={inUse && !into}
            onClick={() => onConfirm(inUse ? into : null)}
            className="bg-bad text-white hover:bg-bad/90"
          >
            {inUse ? "Gộp và xoá" : "Xoá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TypeDialog({
  open,
  value,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: ServiceType | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [color, setColor] = useState(value?.color ?? PALETTE[0]);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={value ? "Sửa loại dịch vụ" : "Thêm loại dịch vụ"}
      description="Đặt tên theo loại lao động: Phát triển, Kiểm thử, Quản lý dự án…"
      fields={[
        { name: "name", label: "Tên loại dịch vụ", required: true, value: value?.name ?? "" },
        { name: "code", label: "Mã viết tắt", value: value?.code ?? "", placeholder: "DEV, QC…" },
      ]}
      extra={
        <div>
          <div className="mb-1.5 text-[12.5px] font-medium text-ink-2">Màu nhận diện</div>
          <div className="flex gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Chọn màu ${c}`}
                className={`h-7 w-7 rounded-full transition ${
                  color === c ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      }
      onSubmit={(v) => onSubmit({ ...v, color })}
    />
  );
}

/* ================= Bảng giá ================= */

function RatesPanel({
  data,
  nsId,
  clientId,
  setClientId,
}: {
  data: FinanceData;
  nsId: string;
  clientId: string | null;
  setClientId: (id: string | null) => void;
}) {
  const save = useSave();
  const [cardEdit, setCardEdit] = useState<RateCard | "new" | null>(null);
  const [cardDel, setCardDel] = useState<RateCard | null>(null);
  const [lineFor, setLineFor] = useState<{ card: RateCard; itemId?: string } | null>(null);

  const visible = data.rateCards.filter(
    (c) => !c.is_archived && (clientId === null || c.client_id === null || c.client_id === clientId),
  );
  const standard = data.rateCards.find((c) => c.client_id === null && !c.is_archived) ?? null;
  const stdPrice = new Map(
    data.rateCardItems.filter((i) => i.rate_card_id === standard?.id).map((i) => [i.service_type_id, i.price]),
  );

  return (
    <>
      <SettingsPanel
        title="Bảng giá"
        description={
          <>
            Bảng giá <b>chỉ có đơn giá, không có số lượng</b> — số lượng thuộc về hợp đồng.
            Nhờ vậy một bảng dùng lại được cho nhiều hợp đồng của cùng một khách, không phải nhớ
            và gõ lại giá đã đàm phán. Khách không có bảng riêng thì rơi về giá chuẩn công ty.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2.5">
          <span className="mr-1 text-[12px] text-ink-3">Khách:</span>
          <FilterChip on={clientId === null} onClick={() => setClientId(null)}>
            Tất cả
          </FilterChip>
          {data.clients.map((c) => (
            <FilterChip key={c.id} on={clientId === c.id} onClick={() => setClientId(c.id)}>
              {c.short_name ?? c.name}
            </FilterChip>
          ))}
        </div>

        {visible.map((card) => {
          const items = data.rateCardItems.filter((i) => i.rate_card_id === card.id);
          const client = data.clients.find((c) => c.id === card.client_id);
          const isStd = card.client_id === null;
          return (
            <div key={card.id} className="border-b border-line last:border-0">
              <div className="flex items-center gap-2 bg-surface-2 px-4 py-2">
                <span className="text-[13.5px] font-bold">{card.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    isStd ? "bg-line text-ink-2" : "bg-brand-soft text-brand"
                  }`}
                >
                  {isStd ? "CHUẨN CÔNG TY" : "RIÊNG KHÁCH"}
                </span>
                <span className="text-[11.5px] text-ink-3">
                  {client ? client.name : "Áp dụng khi khách chưa có bảng riêng"}
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setLineFor({ card })}
                  className="rounded-md border border-line px-2 py-0.5 text-[12px] text-ink-2 hover:border-brand hover:text-brand"
                >
                  + Thêm dòng giá
                </button>
                {!isStd && (
                  <button
                    type="button"
                    onClick={() => setCardDel(card)}
                    className="rounded-md p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"
                    aria-label="Xoá bảng giá"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-4 text-[12.5px] text-ink-3">
                  Bảng giá này chưa có dòng nào.
                </div>
              ) : (
                items.map((it) => {
                  const st = data.serviceTypes.find((s) => s.id === it.service_type_id);
                  const d = isStd ? null : priceDelta(it.price, stdPrice.get(it.service_type_id) ?? 0);
                  return (
                    <PanelRow
                      key={it.id}
                      meta={
                        <span className="flex items-center gap-4">
                          <span className="text-ink-3">{UNIT_LABEL[it.unit]}</span>
                          {estimatedMargin(it) !== null && (
                            <span
                              className={`num text-[11.5px] ${
                                (estimatedMargin(it) ?? 0) >= 40 ? "text-good" : "text-warn"
                              }`}
                              title="Biên lãi dự kiến"
                            >
                              lãi {estimatedMargin(it)}%
                            </span>
                          )}
                          <span className="num w-24 text-right font-semibold text-ink">
                            {money(Math.round(effectivePrice(it)))}
                          </span>
                          <span className="num w-12 text-right">
                            {d === null ? (
                              <span className="text-ink-3">—</span>
                            ) : (
                              <span className={d > 0 ? "text-good" : d < 0 ? "text-bad" : "text-ink-3"}>
                                {d > 0 ? "+" : ""}
                                {d}%
                              </span>
                            )}
                          </span>
                        </span>
                      }
                      actions={[
                        {
                          label: "Sửa giá",
                          icon: <Pencil size={14} />,
                          onSelect: () => setLineFor({ card, itemId: it.id }),
                        },
                        {
                          label: "Xoá dòng",
                          icon: <Trash2 size={14} />,
                          danger: true,
                          onSelect: () => save.mutate(() => deleteRow("rate_card_items", it.id)),
                        },
                      ]}
                    >
                      <span
                        className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                        style={{ background: st?.color }}
                      />
                      {st?.name ?? "—"}
                      {it.billing_type && it.billing_type !== "tm" && (
                        <span className="ml-2 rounded bg-line px-1.5 py-0.5 text-[10.5px] text-ink-3">
                          {BILLING_LABEL[it.billing_type]}
                        </span>
                      )}
                      {it.description && (
                        <div className="text-[11.5px] text-ink-3">{it.description}</div>
                      )}
                    </PanelRow>
                  );
                })
              )}
            </div>
          );
        })}

        <PanelFooter>
          <Button size="sm" onClick={() => setCardEdit("new")}>
            Thêm bảng giá
          </Button>
        </PanelFooter>
      </SettingsPanel>

      <RateCardDialog
        key={cardEdit === "new" ? "new-card" : "closed-card"}
        open={cardEdit !== null}
        clients={data.clients}
        onClose={() => setCardEdit(null)}
        onSubmit={(v) =>
          save.mutate(() => insertRow("rate_cards", { ...v, namespace_id: nsId }), {
            onSuccess: () => setCardEdit(null),
          })
        }
      />

      <RateLineDialog
        key={lineFor ? `${lineFor.card.id}:${lineFor.itemId ?? "new"}` : "closed-line"}
        open={lineFor !== null}
        data={data}
        target={lineFor}
        onClose={() => setLineFor(null)}
        onSubmit={(v) =>
          save.mutate(
            () =>
              lineFor?.itemId
                ? updateRow("rate_card_items", lineFor.itemId, v)
                : insertRow("rate_card_items", { ...v, rate_card_id: lineFor!.card.id }),
            { onSuccess: () => setLineFor(null) },
          )
        }
      />

      <ConfirmDialog
        open={cardDel !== null}
        title={`Xoá bảng giá "${cardDel?.name ?? ""}"?`}
        body="Mọi dòng giá trong bảng cũng bị xoá. Khách này sẽ rơi về giá chuẩn công ty."
        onCancel={() => setCardDel(null)}
        onConfirm={() =>
          save.mutate(() => deleteRow("rate_cards", cardDel!.id), {
            onSuccess: () => setCardDel(null),
          })
        }
      />
    </>
  );
}

function RateCardDialog({
  open,
  clients,
  onClose,
  onSubmit,
}: {
  open: boolean;
  clients: ClientCompany[];
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState("");
  const [client, setClient] = useState<string>("none");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Thêm bảng giá</DialogTitle>
          <DialogDescription>
            Để trống khách hàng nếu đây là bảng giá chuẩn dùng chung cho cả công ty.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Tên bảng giá" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bảng giá Bank X 2026"
            />
          </Field>
          <Field label="Áp dụng cho khách">
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Giá chuẩn công ty (mọi khách)</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              onSubmit({ name: name.trim(), client_id: client === "none" ? null : client });
              setName("");
              setClient("none");
            }}
          >
            Tạo bảng giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RateLineDialog({
  open,
  data,
  target,
  onClose,
  onSubmit,
}: {
  open: boolean;
  data: FinanceData;
  target: { card: RateCard; itemId?: string } | null;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const existing = target?.itemId
    ? data.rateCardItems.find((i) => i.id === target.itemId)
    : undefined;
  const [typeId, setTypeId] = useState(existing?.service_type_id ?? "");
  const [unit, setUnit] = useState(existing?.unit ?? "hour");
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [desc, setDesc] = useState(existing?.description ?? "");
  const [billing, setBilling] = useState<BillingType>(existing?.billing_type ?? "tm");
  const [markup, setMarkup] = useState(existing ? String(existing.markup_pct ?? 0) : "0");
  const [costEst, setCostEst] = useState(
    existing?.cost_estimate ? String(existing.cost_estimate) : "",
  );
  const [allowTime, setAllowTime] = useState(existing?.allow_time ?? true);
  const [allowExp, setAllowExp] = useState(existing?.allow_expense ?? false);

  const used = new Set(
    data.rateCardItems
      .filter((i) => i.rate_card_id === target?.card.id && i.id !== target?.itemId)
      .map((i) => i.service_type_id),
  );
  const options = data.serviceTypes.filter((s) => !s.is_archived && !used.has(s.id));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]" key={target?.itemId ?? "new"}>
        <DialogHeader>
          <DialogTitle>{existing ? "Sửa dòng giá" : "Thêm dòng giá"}</DialogTitle>
          <DialogDescription>
            Mỗi loại dịch vụ chỉ có một dòng trong bảng — đây là đơn giá bán cho khách.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Loại dịch vụ" required>
            <Select value={typeId} onValueChange={setTypeId} disabled={!!existing}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {(existing
                  ? data.serviceTypes.filter((s) => s.id === existing.service_type_id)
                  : options
                ).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Đơn vị">
              <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">giờ</SelectItem>
                  <SelectItem value="day">ngày</SelectItem>
                  <SelectItem value="piece">gói</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Đơn giá bán" required>
              <Input
                className="num"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="700000"
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Hiện kèm hạng mục khi báo giá cho khách"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cách tính tiền mặc định">
              <Select value={billing} onValueChange={(v) => setBilling(v as BillingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(BILLING_LABEL) as BillingType[]).map((b) => (
                    <SelectItem key={b} value={b}>
                      {BILLING_LABEL[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Giảm giá / phụ giá (%)">
              <Input
                className="num"
                inputMode="numeric"
                value={markup}
                placeholder="0"
                onChange={(e) => setMarkup(e.target.value.replace(/[^\d-]/g, ""))}
              />
            </Field>
          </div>

          <Field label="Giá vốn dự kiến mỗi đơn vị">
            <Input
              className="num"
              inputMode="numeric"
              value={costEst}
              placeholder="Mua vào / thuê ngoài bao nhiêu"
              onChange={(e) => setCostEst(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>

          <div className="flex gap-4 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px]">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={allowTime}
                onChange={(e) => setAllowTime(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
              Cho log giờ
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={allowExp}
                onChange={(e) => setAllowExp(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
              Cho ghi chi phí
            </label>
          </div>

          {price && (
            <div className="rounded-lg bg-brand-soft px-3 py-2 text-[12.5px]">
              <div className="flex justify-between text-ink-2">
                <span>Đơn giá bán</span>
                <span className="num">
                  {money(Math.round(Number(price) * (1 + Number(markup || 0) / 100)))} đ /{" "}
                  {UNIT_LABEL[unit]}
                </span>
              </div>
              {costEst && Number(costEst) > 0 && (
                <div className="mt-0.5 flex justify-between font-semibold">
                  <span>Biên lãi dự kiến</span>
                  <span className="num text-brand">
                    {Math.round(
                      ((Number(price) * (1 + Number(markup || 0) / 100) - Number(costEst)) /
                        (Number(price) * (1 + Number(markup || 0) / 100))) *
                        100,
                    )}
                    %
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!typeId || !price}
            onClick={() =>
              onSubmit({
                service_type_id: typeId,
                unit,
                price: Number(price),
                description: desc.trim() || null,
                billing_type: billing,
                markup_pct: Number(markup || 0),
                cost_estimate: costEst ? Number(costEst) : null,
                allow_time: allowTime,
                allow_expense: allowExp,
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

/* ================= dùng chung ================= */

type FieldDef = {
  name: string;
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
};

function FormDialog({
  open,
  title,
  description,
  fields,
  extra,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  fields: FieldDef[];
  extra?: React.ReactNode;
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, f.value])),
  );
  const required = fields.filter((f) => f.required);
  const ok = required.every((f) => (form[f.name] ?? "").trim());

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <Field key={f.name} label={f.label} required={f.required}>
              <Input
                value={form[f.name] ?? ""}
                placeholder={f.placeholder ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
              />
            </Field>
          ))}
          {extra}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!ok}
            onClick={() =>
              onSubmit(
                Object.fromEntries(
                  Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]),
                ),
              )
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
  required?: boolean | undefined;
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

function ConfirmDialog({
  open,
  title,
  body,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-bad text-white hover:bg-bad/90"
          >
            Xoá
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FilterChip({
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
      className={`rounded-md border px-2 py-0.5 text-[12px] ${
        on
          ? "border-brand bg-brand font-semibold text-white"
          : "border-line bg-surface text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* ================= Hợp đồng ================= */

function BudgetsPanel({
  data,
  nsId,
  users,
  tickets,
  assignees,
}: {
  data: FinanceData;
  nsId: string;
  users: User[];
  tickets: Ticket[];
  assignees: { ticket_id: string; user_id: string }[];
}) {
  const save = useSave();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<Budget | null>(null);

  const current = openId ? data.budgets.find((b) => b.id === openId) : null;

  // Công việc kèm người phụ trách đầu tiên — cơ sở dự báo.
  const forecastTickets = useMemo(
    () =>
      tickets.map((t) => ({
        id: t.id,
        budget_service_id: t.budget_service_id,
        start_date: t.start_date,
        deadline: t.deadline,
        estimate_hours: t.estimate_hours,
        assignee_id: assignees.find((a) => a.ticket_id === t.id)?.user_id ?? null,
      })),
    [tickets, assignees],
  );

  if (current) {
    return (
      <BudgetDetail
        budget={current}
        data={data}
        users={users}
        forecastTickets={forecastTickets}
        onBack={() => setOpenId(null)}
        onAddService={(v) => save.mutate(() => insertRow("budget_services", v))}
        onEditService={(id, v) => save.mutate(() => updateRow("budget_services", id, v))}
        onDeleteService={(id) => save.mutate(() => deleteRow("budget_services", id))}
        onEditSection={(id, name) => save.mutate(() => updateRow("budget_sections", id, { name }))}
        onDeleteSection={(id) => save.mutate(() => deleteRow("budget_sections", id))}
        onEditBudget={(v) => save.mutate(() => updateRow("budgets", current.id, v))}
        onSaveBudgetCostRate={(userId, rate) =>
          save.mutate(() =>
            insertRow("budget_cost_rates", { budget_id: current.id, user_id: userId, rate }),
          )
        }
        onRemoveBudgetCostRate={(id) => save.mutate(() => deleteRow("budget_cost_rates", id))}
        renderTab={(key) =>
          key === "expenses" ? (
            <ExpensePanel data={data} users={users} nsId={nsId} budgetId={current.id} />
          ) : (
            <BudgetTimeTab data={data} users={users} budgetId={current.id} />
          )
        }
        onAddSection={(name) =>
          save.mutate(() =>
            insertRow("budget_sections", {
              budget_id: current.id,
              name,
              position: data.sections.filter((s) => s.budget_id === current.id).length + 1,
            }),
          )
        }
      />
    );
  }

  return (
    <>
      <SettingsPanel
        title="Hợp đồng"
        description={
          <>
            Bảng giá chỉ có đơn giá. Hợp đồng thêm <b>số lượng</b> để ra <b>tổng tiền</b> — và
            đây là nơi duy nhất log giờ, ghi chi phí vào được. Một dự án có thể có nhiều hợp đồng
            (chia theo giai đoạn), vì mỗi hợp đồng tính lời lỗ riêng.
          </>
        }
      >
        {data.budgets.length === 0 && (
          <div className="px-4 py-5 text-[12.5px] text-ink-3">
            Chưa có hợp đồng nào. Tạo hợp đồng đầu tiên để bắt đầu bán hàng.
          </div>
        )}
        {data.budgets.map((b) => {
          const client = data.clients.find((c) => c.id === b.client_id);
          const svcs = data.services.filter((s) => s.budget_id === b.id);
          return (
            <PanelRow
              key={b.id}
              meta={
                <span className="flex items-center gap-3">
                  <span className="text-[11.5px] text-ink-3">{svcs.length} hạng mục</span>
                  <span className="num w-32 text-right font-semibold text-ink">
                    {money(budgetTotal(svcs))}
                  </span>
                </span>
              }
              actions={[
                { label: "Mở hợp đồng", icon: <Pencil size={14} />, onSelect: () => setOpenId(b.id) },
                {
                  label: b.status === "open" ? "Đánh dấu đã bàn giao" : "Mở lại",
                  icon: <Archive size={14} />,
                  onSelect: () =>
                    save.mutate(() =>
                      updateRow("budgets", b.id, {
                        status: b.status === "open" ? "delivered" : "open",
                      }),
                    ),
                },
                { label: "Xoá", icon: <Trash2 size={14} />, danger: true, onSelect: () => setDel(b) },
              ]}
            >
              <button
                type="button"
                onClick={() => setOpenId(b.id)}
                className="text-left font-medium text-ink hover:text-brand"
              >
                {b.name}
              </button>
              <div className="text-[11.5px] text-ink-3">
                {client?.name}
                {b.status === "delivered" && " · đã bàn giao"}
              </div>
            </PanelRow>
          );
        })}
        <PanelFooter>
          <Button size="sm" onClick={() => setCreating(true)} disabled={data.clients.length === 0}>
            Thêm hợp đồng
          </Button>
          {data.clients.length === 0 && (
            <span className="text-[12px] text-ink-3">Cần có khách hàng trước</span>
          )}
        </PanelFooter>
      </SettingsPanel>

      <BudgetDialog
        key={creating ? "new-budget" : "closed-budget"}
        open={creating}
        clients={data.clients}
        onClose={() => setCreating(false)}
        onSubmit={(v) =>
          save.mutate(() => insertRow("budgets", { ...v, namespace_id: nsId }), {
            onSuccess: () => setCreating(false),
          })
        }
      />

      <ConfirmDialog
        open={del !== null}
        title={`Xoá hợp đồng "${del?.name ?? ""}"?`}
        body="Toàn bộ hạng mục bán trong hợp đồng cũng bị xoá. Thao tác không hoàn tác được."
        onCancel={() => setDel(null)}
        onConfirm={() =>
          save.mutate(() => deleteRow("budgets", del!.id), { onSuccess: () => setDel(null) })
        }
      />
    </>
  );
}

function BudgetDialog({
  open,
  clients,
  onClose,
  onSubmit,
}: {
  open: boolean;
  clients: ClientCompany[];
  onClose: () => void;
  onSubmit: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [code, setCode] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Thêm hợp đồng</DialogTitle>
          <DialogDescription>
            Mỗi hợp đồng tính lời lỗ riêng. Dự án dài có thể chia thành nhiều hợp đồng theo giai đoạn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Tên hợp đồng" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Core Banking — Giai đoạn 1"
            />
          </Field>
          <Field label="Khách hàng" required>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Số hợp đồng">
            <Input
              className="num"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="HD-2026-001"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Từ ngày">
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Đến ngày">
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!name.trim() || !clientId}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                client_id: clientId,
                code: code.trim() || null,
                start_date: start || null,
                end_date: end || null,
              })
            }
          >
            Tạo hợp đồng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Giá vốn nhân sự ================= */

function CostPanel({
  data,
  users,
  nsId,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
}) {
  const save = useSave();

  return (
    <CostRatePanel
      data={data}
      users={users}
      nsId={nsId}
      onSaveRate={(v) => save.mutate(() => insertRow("cost_rates", v))}
      onUpdateRate={(id, v) => save.mutate(() => updateRow("cost_rates", id, v))}
      onDeleteRate={(id) => save.mutate(() => deleteRow("cost_rates", id))}
      onSaveOverhead={(v) =>
        save.mutate(() =>
          data.overhead
            ? updateRow("overhead_settings", data.overhead.id, v)
            : insertRow("overhead_settings", v),
        )
      }
    />
  );
}

/* ================= Giờ của tôi ================= */

function TimePanel({
  data,
  users,
  tickets,
  nsId,
}: {
  data: FinanceData;
  users: User[];
  tickets: Ticket[];
  nsId: string;
}) {
  const save = useSave();
  // "Giờ của tôi" chỉ hiện giờ của chính mình, giống Productive.
  // Muốn xem hoặc ghi hộ người khác thì sang màn Giờ toàn công ty.
  const currentUser = users[0] ?? null;

  return (
    <MyTime
      data={data}
      users={users}
      tickets={tickets}
      nsId={nsId}
      currentUser={currentUser}
      onSubmitWeek={(weekStart) =>
        save.mutate(() =>
          insertRow("timesheet_submissions", {
            namespace_id: nsId,
            user_id: currentUser!.id,
            week_start: weekStart,
            status: "submitted",
          }),
        )
      }
      onSave={(v) => save.mutate(() => insertRow("time_entries", v))}
      onUpdate={(id, v) => save.mutate(() => updateRow("time_entries", id, v))}
      onDelete={(id) => save.mutate(() => deleteRow("time_entries", id))}
      onCopyYesterday={(rows) =>
        save.mutate(async () => {
          const today = new Date().toISOString().slice(0, 10);
          for (const r of rows) {
            await insertRow("time_entries", {
              namespace_id: nsId,
              user_id: r.user_id,
              service_id: r.service_id,
              ticket_id: r.ticket_id,
              date: today,
              minutes: r.minutes,
              billable_minutes: r.billable_minutes,
              note: r.note,
              cost_rate_snapshot: r.cost_rate_snapshot,
            });
          }
        })
      }
      onStartTimer={(id) =>
        save.mutate(async () => {
          // Mỗi người chỉ một đồng hồ: dừng cái đang chạy trước khi bật cái mới.
          const running = data.timeEntries.find(
            (e) => e.user_id === currentUser?.id && e.timer_started_at,
          );
          if (running?.timer_started_at) {
            const mins = timerElapsed(running.timer_started_at);
            await insertRow("timer_logs", {
              time_entry_id: running.id,
              started_at: running.timer_started_at,
              stopped_at: new Date().toISOString(),
              minutes: mins,
            });
            await updateRow("time_entries", running.id, {
              minutes: running.minutes + mins,
              billable_minutes:
                running.billable_minutes > 0 ? running.billable_minutes + mins : 0,
              timer_started_at: null,
            });
          }
          await updateRow("time_entries", id, {
            timer_started_at: new Date().toISOString(),
          });
        })
      }
      onStopTimer={(id) =>
        save.mutate(async () => {
          const e = data.timeEntries.find((x) => x.id === id);
          if (!e?.timer_started_at) return;
          const mins = timerElapsed(e.timer_started_at);
          await insertRow("timer_logs", {
            time_entry_id: e.id,
            started_at: e.timer_started_at,
            stopped_at: new Date().toISOString(),
            minutes: mins,
          });
          const total = e.minutes + mins;
          await updateRow("time_entries", e.id, {
            minutes: total,
            billable_minutes: e.billable_minutes > 0 ? total : 0,
            timer_started_at: null,
          });
        })
      }
    />
  );
}

/** Phút -> "12:30", cách Productive hiển thị giờ trong mọi bảng. */
function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ================= Tab Giờ trong hợp đồng =================
   Khác màn Giờ toàn công ty: ở đây là BẢNG PHẲNG lọc theo hợp đồng, cột
   Người · Ngày · Hạng mục · Giờ làm · Giờ tính tiền · Ghi chú — đúng như
   tab Time của Productive. Lưới tuần chỉ dùng ở màn toàn công ty. */

function BudgetTimeTab({
  data,
  users,
  budgetId,
}: {
  data: FinanceData;
  users: User[];
  budgetId: string;
}) {
  const svcIds = new Set(
    data.services.filter((s) => s.budget_id === budgetId).map((s) => s.id),
  );
  const rows = data.timeEntries
    .filter((e) => svcIds.has(e.service_id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalMin = rows.reduce((a, e) => a + e.minutes, 0);
  const billMin = rows.reduce((a, e) => a + (e.billable_minutes ?? 0), 0);

  return (
    <div className="space-y-3">
      <ListToolbar fieldCount={6} filterCount={1} />
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {rows.length === 0 ? (
          <EmptyState hint="Chưa ai ghi giờ vào hợp đồng này." onReset={() => undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] font-semibold text-ink-2">
                  <th className="px-4 py-3">Người</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Hạng mục</th>
                  <th className="px-4 py-3 text-right">Giờ làm</th>
                  <th className="px-4 py-3 text-right">Giờ tính tiền</th>
                  <th className="px-4 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const u = users.find((x) => x.id === e.user_id);
                  const sv = data.services.find((x) => x.id === e.service_id);
                  return (
                    <tr key={e.id} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-2.5">{u?.full_name ?? "—"}</td>
                      <td className="num px-4 py-2.5 text-ink-2">{e.date}</td>
                      <td className="px-4 py-2.5">{sv?.name ?? "—"}</td>
                      <td className="num px-4 py-2.5 text-right">{hm(e.minutes)}</td>
                      <td className="num px-4 py-2.5 text-right">{hm(e.billable_minutes ?? 0)}</td>
                      <td className="px-4 py-2.5 text-ink-2">{e.note ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-bg/50 font-semibold">
                  <td className="px-4 py-2.5" colSpan={3}>
                    TỔNG
                  </td>
                  <td className="num px-4 py-2.5 text-right">{hm(totalMin)}</td>
                  <td className="num px-4 py-2.5 text-right">{hm(billMin)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Giờ toàn công ty ================= */

function CompanyPanel({
  data,
  users,
  tickets,
  nsId,
}: {
  data: FinanceData;
  users: User[];
  tickets: Ticket[];
  nsId: string;
}) {
  const save = useSave();
  const approver = users[0]?.id ?? null;

  return (
    <CompanyTime
      data={data}
      users={users}
      tickets={tickets}
      nsId={nsId}
      onSave={(v) => save.mutate(() => insertRow("time_entries", v))}
      onApprove={(ids) =>
        save.mutate(async () => {
          const now = new Date().toISOString();
          for (const id of ids) {
            await updateRow("time_entries", id, {
              approved_at: now,
              approved_by: approver,
              change_requested_at: null,
              change_request_note: null,
            });
          }
        })
      }
      onUnapprove={(id) =>
        save.mutate(() =>
          updateRow("time_entries", id, { approved_at: null, approved_by: null }),
        )
      }
      onRequestChange={(id, note) =>
        save.mutate(() =>
          updateRow("time_entries", id, {
            change_requested_at: new Date().toISOString(),
            change_request_note: note,
          }),
        )
      }
      onDelete={(id) => save.mutate(() => deleteRow("time_entries", id))}
    />
  );
}

/* ================= Chi phí ================= */

function ExpensePanel({
  data,
  users,
  nsId,
  budgetId,
}: {
  data: FinanceData;
  users: User[];
  nsId: string;
  budgetId?: string | undefined;
}) {
  const save = useSave();
  const approver = users[0]?.id ?? null;

  return (
    <Expenses
      data={data}
      users={users}
      nsId={nsId}
      budgetId={budgetId}
      onCreate={(expense, items) =>
        save.mutate(async () => {
          const created = await insertReturning("expenses", expense);
          if (!created) return;
          for (const it of items) {
            await insertRow("expense_items", { ...it, expense_id: created.id });
          }
        })
      }
      onUpdate={(id, v) => save.mutate(() => updateRow("expenses", id, v))}
      onDuplicate={(e) =>
        save.mutate(async () => {
          // Ngày đặt lại về hôm nay, nội dung thêm tiền tố; ngày hạn và ngày
          // thanh toán KHÔNG chép sang — theo đúng cách Productive làm.
          const created = await insertReturning("expenses", {
            namespace_id: e.namespace_id,
            user_id: e.user_id,
            service_id: e.service_id,
            ticket_id: e.ticket_id,
            reference: `Bản sao của ${e.reference}`,
            date: new Date().toISOString().slice(0, 10),
            currency: e.currency,
            vendor: e.vendor,
            attachment_name: e.attachment_name,
            markup_type: e.markup_type,
            markup_value: e.markup_value,
            is_reimbursed: e.is_reimbursed,
            status: "submitted",
          });
          if (!created) return;
          for (const it of data.expenseItems.filter((i) => i.expense_id === e.id)) {
            await insertRow("expense_items", {
              expense_id: created.id,
              description: it.description,
              unit_price: it.unit_price,
              quantity: it.quantity,
              tax_rate: it.tax_rate,
              tax_included: it.tax_included,
              position: it.position,
            });
          }
        })
      }
      onDelete={(id) => save.mutate(() => deleteRow("expenses", id))}
      onSetStatus={(id, status, note) =>
        save.mutate(() =>
          updateRow("expenses", id, {
            status,
            review_note: note ?? null,
            approved_at: status === "approved" ? new Date().toISOString() : null,
            approved_by: status === "approved" ? approver : null,
          }),
        )
      }
    />
  );
}
