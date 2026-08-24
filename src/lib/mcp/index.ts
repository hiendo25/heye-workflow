import { defineMcp } from "@lovable.dev/mcp-js";
import listProjects from "./tools/list-projects";
import listGroups from "./tools/list-groups";
import listTickets from "./tools/list-tickets";
import getTicket from "./tools/get-ticket";
import listPeople from "./tools/list-people";

export default defineMcp({
  name: "heye-c-ng-vi-c-c-a-b-n",
  title: "HeyE: Công việc Của Bạn",
  version: "0.1.0",
  instructions:
    "Read-only tools for the HeyE work tracker (Vietnamese project management). Use `list_projects` and `list_groups` to explore the project tree, `list_tickets` to browse work items with filters, `get_ticket` for one item by key (e.g. AIE-183), and `list_people` for members and tags.",
  tools: [listProjects, listGroups, listTickets, getTicket, listPeople],
});
