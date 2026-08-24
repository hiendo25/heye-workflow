import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_ticket",
  title: "Chi tiết công việc",
  description:
    "Get one work item by its key (e.g. AIE-183), including status, tags and assignees.",
  inputSchema: { key: z.string().trim().min(1).describe("Ticket key, e.g. AIE-183.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ key }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id, key, group_id, title, description, priority, start_date, deadline, estimate_hours, statuses(label, type), ticket_tags(tags(name)), ticket_assignees(users(full_name, initial))",
      )
      .eq("key", key.toUpperCase())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return {
        content: [{ type: "text", text: `Không tìm thấy công việc ${key}` }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { ticket: data },
    };
  },
});
