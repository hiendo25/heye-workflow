import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { IconRail } from "@/components/heye/IconRail";

/** Khung dùng chung: thanh trên + rail trái. Nội dung do từng màn truyền vào. */
export function AppShell({
  namespaceName,
  children,
}: {
  namespaceName?: string | undefined;
  children: ReactNode;
}) {
  const wsName = namespaceName ?? "AIONtech";
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex h-screen flex-col bg-background text-ink">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
        <span className="text-[16px] font-extrabold tracking-tight text-brand">HeyE</span>
        <span className="rounded-md border border-line px-2 py-[3px] text-[12px] text-ink-2">
          {wsName}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Đổi giao diện sáng/tối"
          onClick={() => setDark((d) => !d)}
          className="rounded-md p-1.5 text-ink-2 hover:bg-brand-soft hover:text-brand"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
          H
        </span>
      </header>

      <div className="flex min-h-0 flex-1">
        <IconRail />
        {children}
      </div>
    </div>
  );
}
