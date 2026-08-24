import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_people",
  title: "Danh sách thành viên",
  description: "List workspace members (thành viên) and the tags used to label work items.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = supabaseAnon();
    const [{ data: users, error: usersError }, { data: tags, error: tagsError }] =
      await Promise.all([
        supabase.from("users").select("id, full_name, initial, email").order("full_name"),
        supabase.from("tags").select("id, name").order("name"),
      ]);
    const error = usersError ?? tagsError;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { users: users ?? [], tags: tags ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
