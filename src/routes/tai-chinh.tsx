import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Building2,
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
import { workspaceQuery } from "@/lib/heye-data";
import {
  budgetTotal,
  deleteRow,
  financeQuery,
  insertRow,
  money,
  priceDelta,
  updateRow,
  UNIT_LABEL,
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
          <div className="px-2.5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-ink-3">
            Sắp có
          </div>
          {["Giờ của tôi", "Chi phí", "Giá vốn nhân sự"].map((s) => (
            <div key={s} className="px-2.5 py-1.5 text-[13px] text-ink-3 opacity-60">
              {s}
            </div>
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
          <BudgetsPanel data={data} nsId={nsId} />
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

      <ConfirmDialog
        open={del !== null}
        title={`Xoá loại dịch vụ "${del?.name ?? ""}"?`}
        body={
          (usage.get(del?.id ?? "") ?? 0) > 0
            ? "Loại này đang được dùng trong bảng giá. Xoá sẽ mất luôn các dòng giá đó — cân nhắc dùng Lưu trữ để giữ số liệu lịch sử."
            : "Thao tác không hoàn tác được."
        }
        onCancel={() => setDel(null)}
        onConfirm={() =>
          save.mutate(() => deleteRow("service_types", del!.id), { onSuccess: () => setDel(null) })
        }
      />
    </>
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
                          <span className="num w-24 text-right font-semibold text-ink">
                            {money(it.price)}
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
          {price && (
            <p className="text-[12px] text-ink-3">
              = <span className="num font-semibold text-ink-2">{money(Number(price))}</span> đ /{" "}
              {UNIT_LABEL[unit]}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!typeId || !price}
            onClick={() =>
              onSubmit({ service_type_id: typeId, unit, price: Number(price) })
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

function BudgetsPanel({ data, nsId }: { data: FinanceData; nsId: string }) {
  const save = useSave();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<Budget | null>(null);

  const current = openId ? data.budgets.find((b) => b.id === openId) : null;

  if (current) {
    return (
      <BudgetDetail
        budget={current}
        data={data}
        onBack={() => setOpenId(null)}
        onAddService={(v) => save.mutate(() => insertRow("budget_services", v))}
        onEditService={(id, v) => save.mutate(() => updateRow("budget_services", id, v))}
        onDeleteService={(id) => save.mutate(() => deleteRow("budget_services", id))}
        onEditSection={(id, name) => save.mutate(() => updateRow("budget_sections", id, { name }))}
        onDeleteSection={(id) => save.mutate(() => deleteRow("budget_sections", id))}
        onEditBudget={(v) => save.mutate(() => updateRow("budgets", current.id, v))}
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
