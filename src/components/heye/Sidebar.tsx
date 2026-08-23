import { ChevronRight, Folder, List, Star } from "lucide-react";
import type { TreeNode } from "@/lib/heye-data";

type Props = {
  tree: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  countFor: (node: TreeNode) => number;
};

function Row({
  node,
  depth,
  ...p
}: Props & { node: TreeNode; depth: number }) {
  const { selectedId, onSelect, expanded, onToggle, countFor } = p;
  const hasChildren = node.children.length > 0;
  const isOpen = !!expanded[node.id];
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(node.id)}
        className={`group flex cursor-pointer items-center gap-1.5 rounded-md py-[5px] pr-2 transition-colors ${
          isSelected ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-brand-soft/60"
        }`}
        style={{ paddingLeft: 6 + depth * 12 }}
      >
        <button
          type="button"
          aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
          className={`flex h-4 w-4 shrink-0 items-center justify-center ${
            hasChildren ? "" : "invisible"
          }`}
        >
          <ChevronRight
            size={13}
            className={`transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          />
        </button>

        {node.kind === "project" ? (
          <span
            className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] text-[10px] font-bold text-white"
            style={{ backgroundColor: node.color }}
          >
            {node.letter}
          </span>
        ) : node.kind === "folder" ? (
          <Folder size={14} className="shrink-0" />
        ) : node.isDefault ? (
          <Star size={14} className="shrink-0" />
        ) : (
          <List size={14} className="shrink-0" />
        )}

        <span
          className={`truncate ${
            node.kind === "project" ? "font-semibold text-ink" : ""
          } ${isSelected ? "text-brand" : ""}`}
        >
          {node.name}
        </span>
        <span className="num ml-auto pl-2 text-[11px] text-ink-3">{countFor(node) || ""}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="ml-[13px] border-l border-line pl-0">
          {node.children.map((c) => (
            <Row key={c.id} {...p} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar(props: Props) {
  const { selectedId, onSelect } = props;
  return (
    <aside className="scroll-y flex w-[250px] shrink-0 flex-col border-r border-line bg-surface px-2 py-3">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition-opacity ${
          selectedId === null ? "opacity-100" : "opacity-85 hover:opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #5B3DF5 0%, #8B72FF 100%)",
          color: "#fff",
        }}
      >
        Việc của tôi
      </button>

      <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
        Các dự án
      </div>

      <nav className="flex flex-col">
        {props.tree.map((n) => (
          <Row key={n.id} {...props} node={n} depth={0} />
        ))}
      </nav>
    </aside>
  );
}
