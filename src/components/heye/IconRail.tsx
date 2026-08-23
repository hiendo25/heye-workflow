import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bug,
  CheckSquare,
  Inbox,
  NotebookPen,
  Settings,
  Wallet,
} from "lucide-react";

type Item = { icon: typeof Inbox; label: string; to?: string };

const items: Item[] = [
  { icon: Inbox, label: "Hộp thư" },
  { icon: BarChart3, label: "Thống kê" },
  { icon: CheckSquare, label: "Công việc", to: "/" },
  { icon: Bug, label: "Vấn đề" },
  { icon: NotebookPen, label: "Notebook" },
  { icon: Wallet, label: "Tài chính", to: "/tai-chinh" },
];

const base = "flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 transition-colors";
const off = "text-ink-2 hover:bg-brand-soft/60";
const on = "bg-brand-soft text-brand font-semibold";

function RailButton({ icon: Icon, label, to }: Item) {
  const inner = (
    <>
      <Icon size={17} />
      <span className="text-[10px] leading-none">{label}</span>
    </>
  );

  if (!to) {
    return (
      <button type="button" className={`${base} ${off}`}>
        {inner}
      </button>
    );
  }

  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: `${base} ${on}` }}
      inactiveProps={{ className: `${base} ${off}` }}
    >
      {inner}
    </Link>
  );
}

export function IconRail() {
  return (
    <nav className="flex w-[70px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
      {items.map((i) => (
        <RailButton key={i.label} {...i} />
      ))}
      <div className="flex-1" />
      <RailButton icon={Settings} label="Cài đặt" />
    </nav>
  );
}
