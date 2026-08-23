import { BarChart3, Bug, CheckSquare, Inbox, NotebookPen, Settings } from "lucide-react";

const items = [
  { icon: Inbox, label: "Hộp thư" },
  { icon: BarChart3, label: "Thống kê" },
  { icon: CheckSquare, label: "Công việc", active: true },
  { icon: Bug, label: "Vấn đề" },
  { icon: NotebookPen, label: "Notebook" },
];

function RailButton({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Inbox;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
        active ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-brand-soft/60"
      }`}
    >
      <Icon size={17} />
      <span className="text-[10px] leading-none">{label}</span>
    </button>
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
