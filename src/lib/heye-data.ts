import { supabase } from "@/integrations/supabase/client";

export type Namespace = { id: string; name: string; slug: string };
export type Project = {
  id: string;
  namespace_id: string;
  name: string;
  avatar_letter: string;
  color: string;
  position: number;
};
export type Group = {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  type: "folder" | "list";
  position: number;
  is_default: boolean;
};
export type Status = {
  id: string;
  label: string;
  type: "open" | "active" | "done" | "closed";
  color_bg: string;
  color_fg: string;
  position: number;
};
export type User = {
  id: string;
  full_name: string;
  initial: string;
  avatar_color: string;
  email: string | null;
};
export type Tag = { id: string; name: string; color_bg: string; color_fg: string };
export type Ticket = {
  id: string;
  key: string;
  group_id: string;
  title: string;
  status_id: string | null;
  priority: "cao" | "thuong" | "thap" | null;
  deadline: string | null;
  position: number;
};

export type Workspace = {
  namespace: Namespace | null;
  projects: Project[];
  groups: Group[];
  statuses: Status[];
  users: User[];
  tags: Tag[];
  tickets: Ticket[];
  assignees: { ticket_id: string; user_id: string }[];
  ticketTags: { ticket_id: string; tag_id: string }[];
};

async function all<T>(table: string, order?: string): Promise<T[]> {
  const client = supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => Promise<{ data: unknown; error: unknown }> & {
        order: (
          c: string,
          o: { ascending: boolean },
        ) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  };
  const base = client.from(table).select("*");
  const { data, error } = await (order ? base.order(order, { ascending: true }) : base);
  if (error) throw error;
  return (data ?? []) as T[];
}


export async function fetchWorkspace(): Promise<Workspace> {
  const [namespaces, projects, groups, statuses, users, tags, tickets, assignees, ticketTags] =
    await Promise.all([
      all<Namespace>("namespaces"),
      all<Project>("projects", "position"),
      all<Group>("groups", "position"),
      all<Status>("statuses", "position"),
      all<User>("users", "full_name"),
      all<Tag>("tags", "name"),
      all<Ticket>("tickets", "position"),
      all<{ ticket_id: string; user_id: string }>("ticket_assignees"),
      all<{ ticket_id: string; tag_id: string }>("ticket_tags"),
    ]);

  return {
    namespace: namespaces[0] ?? null,
    projects,
    groups,
    statuses,
    users,
    tags,
    tickets,
    assignees,
    ticketTags,
  };
}

export const workspaceQuery = {
  queryKey: ["heye-workspace"],
  queryFn: fetchWorkspace,
  staleTime: 60_000,
};

export const PRIORITY_LABEL: Record<string, string> = {
  cao: "Cao",
  thuong: "Bình thường",
  thap: "Thấp",
};

/** Tree node used by the sidebar. */
export type TreeNode = {
  id: string;
  kind: "project" | "folder" | "list";
  name: string;
  color?: string;
  letter?: string;
  isDefault?: boolean;
  children: TreeNode[];
  /** ids of every group in this subtree (used for recursive filtering) */
  groupIds: string[];
  path: string[];
};

export function buildTree(ws: Workspace): TreeNode[] {
  const byParent = new Map<string, Group[]>();
  for (const g of ws.groups) {
    const key = g.parent_id ?? `root:${g.project_id}`;
    const list = byParent.get(key) ?? [];
    list.push(g);
    byParent.set(key, list);
  }

  const buildGroup = (g: Group, path: string[]): TreeNode => {
    const children = (byParent.get(g.id) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((c) => buildGroup(c, [...path, g.name]));
    return {
      id: g.id,
      kind: g.type,
      name: g.name,
      isDefault: g.is_default,
      children,
      groupIds: [g.id, ...children.flatMap((c) => c.groupIds)],
      path: [...path, g.name],
    };
  };

  return ws.projects.map((p) => {
    const base = [ws.namespace?.name ?? "HeyE"];
    const children = (byParent.get(`root:${p.id}`) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((g) => buildGroup(g, [...base, p.name]));
    return {
      id: p.id,
      kind: "project" as const,
      name: p.name,
      color: p.color,
      letter: p.avatar_letter,
      children,
      groupIds: children.flatMap((c) => c.groupIds),
      path: [...base, p.name],
    };
  });
}

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = findNode(n.children, id);
    if (hit) return hit;
  }
  return null;
}
