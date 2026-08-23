import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/heye/AppShell";
import { Sidebar } from "@/components/heye/Sidebar";
import { TicketTable, type Row } from "@/components/heye/TicketTable";
import { buildTree, findNode, workspaceQuery, type TreeNode } from "@/lib/heye-data";
import { financeQuery } from "@/lib/finance-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HeyE — Quản lý công việc dự án" },
      {
        name: "description",
        content:
          "HeyE: công cụ quản lý công việc dự án theo cây thư mục, trạng thái, người phụ trách và độ ưu tiên.",
      },
      { property: "og:title", content: "HeyE — Quản lý công việc dự án" },
      {
        property: "og:description",
        content: "Theo dõi công việc theo dự án, thư mục và trạng thái trong một giao diện gọn nhẹ.",
      },
    ],
  }),
  component: Index,
});

const TABS = ["Danh sách", "Bảng", "Lịch", "Gantt", "Phát hành"];
const FILTERS = ["Trạng thái", "Người phụ trách", "Tag", "Độ ưu tiên"];

function Index() {
  const { data } = useQuery(workspaceQuery);
  const { data: fin } = useQuery(financeQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const tree = useMemo<TreeNode[]>(() => (data ? buildTree(data) : []), [data]);

  useEffect(() => {
    if (tree.length > 0 && Object.keys(expanded).length === 0) {
      setExpanded(Object.fromEntries(tree.map((p) => [p.id, true])));
    }
  }, [tree, expanded]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of data?.tickets ?? []) m.set(t.group_id, (m.get(t.group_id) ?? 0) + 1);
    return m;
  }, [data]);

  const countFor = (node: TreeNode) =>
    node.groupIds.reduce((sum, id) => sum + (counts.get(id) ?? 0), 0);

  const selected = selectedId && tree.length ? findNode(tree, selectedId) : null;

  const rows: Row[] = useMemo(() => {
    if (!data) return [];
    const allowed = selected ? new Set(selected.groupIds) : null;
    const groupName = new Map(data.groups.map((g) => [g.id, g.name]));
    const userById = new Map(data.users.map((u) => [u.id, u]));
    const tagById = new Map(data.tags.map((t) => [t.id, t]));
    // Nối công việc -> hạng mục bán, để thấy giờ log sẽ chảy về đâu.
    const svcById = new Map((fin?.services ?? []).map((s) => [s.id, s]));
    const typeById = new Map((fin?.serviceTypes ?? []).map((t) => [t.id, t]));
    return data.tickets
      .filter((t) => !allowed || allowed.has(t.group_id))
      .map((ticket) => ({
        ticket,
        groupName: groupName.get(ticket.group_id) ?? "",
        users: data.assignees
          .filter((a) => a.ticket_id === ticket.id)
          .map((a) => userById.get(a.user_id))
          .filter(Boolean) as Row["users"],
        tags: data.ticketTags
          .filter((tt) => tt.ticket_id === ticket.id)
          .map((tt) => tagById.get(tt.tag_id))
          .filter(Boolean) as Row["tags"],
        service: (() => {
          const sv = ticket.budget_service_id ? svcById.get(ticket.budget_service_id) : null;
          if (!sv) return undefined;
          const ty = typeById.get(sv.service_type_id);
          return {
            name: sv.name,
            typeName: ty?.name ?? sv.name,
            color: ty?.color ?? "#8B87A0",
            billable: sv.billing_type !== "non_billable",
          };
        })(),
      }));
  }, [data, fin, selected]);

  const title = selected ? selected.name : "Việc của tôi";
  const breadcrumb = selected
    ? selected.path.join(" / ")
    : `${data?.namespace?.name ?? "AIONtech"} / Việc của tôi`;

  return (
    <AppShell namespaceName={data?.namespace?.name}>
        <Sidebar
          tree={tree}
          selectedId={selectedId}
          onSelect={setSelectedId}
          expanded={expanded}
          onToggle={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
          countFor={countFor}
        />

        <main className="scroll-y min-w-0 flex-1 px-5 py-4">
          <div className="text-[11.5px] text-ink-3">{breadcrumb}</div>
          <h1 className="mt-1 text-[20px] font-bold tracking-tight text-ink">{title}</h1>

          <div className="mt-3 flex items-center gap-1 border-b border-line">
            {TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`-mb-px border-b-2 px-2.5 py-1.5 text-[13px] ${
                  i === 0
                    ? "border-brand font-semibold text-brand"
                    : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[12.5px] text-ink-2 hover:text-ink"
              >
                {f}
                <ChevronDown size={12} />
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-white"
            >
              <Plus size={13} /> Thêm việc
            </button>
          </div>

          <div className="mt-3 pb-8">
            <TicketTable statuses={data?.statuses ?? []} rows={rows} />
          </div>
        </main>
    </AppShell>
  );
}
