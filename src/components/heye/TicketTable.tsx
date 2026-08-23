import { Fragment } from "react";
import { Flag } from "lucide-react";
import { PRIORITY_LABEL, type Status, type Tag, type Ticket, type User } from "@/lib/heye-data";


export type Row = {
  ticket: Ticket;
  groupName: string;
  users: User[];
  tags: Tag[];
  /** Hạng mục bán mà công việc này nối tới — nơi giờ log chảy về để tính tiền. */
  service?: { name: string; typeName: string; color: string; billable: boolean } | undefined;
};

const prioClass: Record<string, string> = {
  cao: "text-prio-high",
  thuong: "text-prio-mid",
  thap: "text-prio-low",
};

function Avatars({ users }: { users: User[] }) {
  return (
    <div className="flex items-center">
      {users.map((u, i) => (
        <span
          key={u.id}
          title={u.full_name}
          className="flex h-[21px] w-[21px] items-center justify-center rounded-full border border-surface text-[10px] font-semibold text-white"
          style={{ backgroundColor: u.avatar_color, marginLeft: i === 0 ? 0 : -6 }}
        >
          {u.initial}
        </span>
      ))}
    </div>
  );
}

export function TicketTable({
  statuses,
  rows,
  onOpen,
}: {
  statuses: Status[];
  rows: Row[];
  onOpen?: (ticketId: string) => void;
}) {
  const groupsWithRows = statuses
    .map((s) => ({ status: s, items: rows.filter((r) => r.ticket.status_id === s.id) }))
    .filter((g) => g.items.length > 0);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-ink-3">
        Chưa có công việc
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <table className="w-full table-fixed border-collapse">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-3">
            <th className="w-[38%] px-3 py-2 text-left font-medium">Tên công việc</th>
            <th className="w-[15%] px-3 py-2 text-left font-medium">Nhóm</th>
            <th className="w-[19%] px-3 py-2 text-left font-medium">Hạng mục</th>
            <th className="w-[16%] px-3 py-2 text-left font-medium">Người phụ trách</th>
            <th className="w-[12%] px-3 py-2 text-left font-medium">Độ ưu tiên</th>
          </tr>
        </thead>
        <tbody>
          {groupsWithRows.map(({ status, items }) => (
            <Fragment key={status.id}>
              <tr className="border-b border-line bg-background/60">
                <td colSpan={5} className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="rounded-md px-2 py-[2px] text-[11px] font-semibold"
                      style={{ backgroundColor: status.color_bg, color: status.color_fg }}
                    >
                      {status.label}
                    </span>
                    <span className="num text-[11px] text-ink-3">{items.length}</span>
                  </span>
                </td>
              </tr>
              {items.map((r) => (
                <tr
                  key={r.ticket.id}
                  onClick={() => onOpen?.(r.ticket.id)}
                  className="cursor-pointer border-b border-line/70 transition-colors hover:bg-brand-soft/40"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-[13px] w-[13px] shrink-0 rounded-full border border-line" />
                      <span className="num shrink-0 text-[11.5px] text-ink-3">{r.ticket.key}</span>
                      <span className="truncate text-ink">{r.ticket.title}</span>
                      {r.tags.map((t) => (
                        <span
                          key={t.id}
                          className="shrink-0 rounded-md px-1.5 py-[1px] text-[10.5px] font-medium"
                          style={{ backgroundColor: t.color_bg, color: t.color_fg }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="truncate px-3 py-2 text-ink-2">{r.groupName}</td>
                  <td className="px-3 py-2">
                    {r.service ? (
                      <span className="flex min-w-0 items-center gap-1.5" title={r.service.name}>
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: r.service.color }}
                        />
                        <span className="truncate text-[12.5px] text-ink-2">
                          {r.service.typeName}
                        </span>
                        {!r.service.billable && (
                          <span
                            className="shrink-0 rounded bg-line px-1 text-[10px] text-ink-3"
                            title="Hạng mục không tính tiền khách"
                          >
                            0đ
                          </span>
                        )}
                      </span>
                    ) : (
                      <span
                        className="text-[12px] text-warn"
                        title="Chưa nối hạng mục — giờ log sẽ không ra tiền"
                      >
                        chưa gán
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Avatars users={r.users} />
                  </td>
                  <td className="px-3 py-2">
                    {r.ticket.priority ? (
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          prioClass[r.ticket.priority]
                        }`}
                      >
                        <Flag size={12} />
                        {PRIORITY_LABEL[r.ticket.priority]}
                      </span>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
