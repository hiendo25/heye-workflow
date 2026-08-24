import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_groups",
  title: "Danh sách thư mục & danh sách việc",
  description:
    "List the folders (thư mục) and lists (danh sách) of the workspace, optionally filtered by project id.",
  inputSchema: {
    project_id: z.string().uuid().optional().describe("Only groups belonging to this project."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ project_id }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("groups")
      .select("id, project_id, parent_id, name, type, position, is_default")
      .order("position");
    if (project_id) query = query.eq("project_id", project_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { groups: data ?? [] },
    };
  },
});
