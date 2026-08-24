import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_tickets",
  title: "Danh sách công việc",
  description:
    "List work items (công việc) with status, priority and deadline. Filter by group (list/folder), status label or priority.",
  inputSchema: {
    group_id: z.string().uuid().optional().describe("Only tickets in this group (list)."),
    priority: z.enum(["cao", "thuong", "thap"]).optional().describe("Priority filter."),
    search: z.string().trim().min(1).optional().describe("Case-insensitive match on the title."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows, default 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ group_id, priority, search, limit }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("tickets")
      .select(
        "id, key, group_id, title, description, priority, start_date, deadline, estimate_hours, position, statuses(label, type)",
      )
      .order("position")
      .limit(limit ?? 50);
    if (group_id) query = query.eq("group_id", group_id);
    if (priority) query = query.eq("priority", priority);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { tickets: data ?? [] },
    };
  },
});
