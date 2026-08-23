import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Bố cục 2 cột kiểu Productive Settings:
 * cột trái giải thích khái niệm, cột phải là thẻ dữ liệu thao tác được.
 */
export function SettingsPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[1080px] gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-9">
      <div className="lg:pt-1">
        <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{description}</p>
      </div>
      <div className="h-fit rounded-xl border border-line bg-surface">{children}</div>
    </div>
  );
}

/** Một hàng trong thẻ: nội dung trái, phụ đề phải, menu ⋯ cuối. */
export function PanelRow({
  children,
  meta,
  actions,
  muted,
}: {
  children: ReactNode;
  meta?: ReactNode;
  actions?: { label: string; onSelect: () => void; danger?: boolean; icon?: ReactNode }[];
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-brand-soft/25">
      <div className={`min-w-0 flex-1 text-[13.5px] ${muted ? "text-ink-3 line-through" : ""}`}>
        {children}
      </div>
      {meta && <div className="shrink-0 text-[12.5px] text-ink-3">{meta}</div>}
      {actions && actions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="shrink-0 rounded-md p-1 text-ink-3 hover:bg-brand-soft hover:text-brand"
            aria-label="Tuỳ chọn"
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {actions.map((a) => (
              <DropdownMenuItem
                key={a.label}
                onSelect={a.onSelect}
                className={a.danger ? "text-bad focus:text-bad" : ""}
              >
                {a.icon}
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Chân thẻ: nút thêm bên trái, liên kết phụ bên phải. */
export function PanelFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 px-4 py-3">{children}</div>;
}
