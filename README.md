# HeyE

Build a Vietnamese project-management app called "HeyE" — a ClickUp-style work tracker.

This is step 1 of a larger build; later steps will add financial/cost-tracking features,

so structure the code and database to be extended.

ALL user-facing text must be in Vietnamese.

=== DATABASE (Supabase) ===

namespaces      id, name, slug

projects        id, namespace_id, name, avatar_letter, color

groups          id, project_id, parent_id (self-ref, nullable), name,

                type ('folder'|'list'), position, is_default

status_templates    id, namespace_id, name

statuses        id, template_id, label, type ('open'|'active'|'done'|'closed'),

                color_bg, color_fg, position

projects.status_template_id -> status_templates.id

users           id, full_name, initial, avatar_color, email

tags            id, namespace_id, name, color_bg, color_fg

tickets         id, key (e.g. "AIE-183"), group_id, title, description,

                status_id, priority ('cao'|'thuong'|'thap'|null),

                created_at, deadline, position

ticket_assignees   ticket_id, user_id   (many-to-many)

ticket_tags        ticket_id, tag_id    (many-to-many)

Enable RLS with permissive policies for now (single-tenant demo).

=== LAYOUT ===

Three columns, full height, no page scroll (each column scrolls independently):

1. TOP BAR (48px): "HeyE" logo (purple), workspace chip, spacer,

   dark/light toggle, user avatar circle.

2. ICON RAIL (70px, far left): vertical buttons, icon above 10px label:

   Hộp thư · Thống kê · Công việc (active) · Vấn đề · Notebook,

   then spacer, then Cài đặt pinned to bottom.

   Active item: purple-tinted background, purple text.

3. SIDEBAR (250px): 

   - "Việc của tôi" pill at top (gradient background) — clicking shows ALL tickets

   - Header "CÁC DỰ ÁN" (uppercase, small, letter-spaced)

   - Recursive tree: project > folder > folder > list (unlimited nesting)

     · Chevron rotates 90° when expanded; only nodes with children get one

     · Project row: colored square with letter, bold text

     · Folder row: folder icon. List row: list icon (star icon if is_default)

     · Right-aligned ticket count in monospace, muted

     · Clicking a node selects it and filters the table

     · Clicking a FOLDER shows tickets from ALL descendant lists (recursive)

     · Selected node: purple-tinted background

     · Indent guide: left border line on nested levels

4. MAIN AREA:

   - Breadcrumb (muted, small) showing full path e.g. "HeyE / Project Cost Control"

   - H1 title = selected node name

   - Tab row: Danh sách (active) · Bảng · Lịch · Gantt · Phát hành

   - Filter chip row: Trạng thái · Người phụ trách · Tag · Độ ưu tiên,

     spacer, purple "+ Thêm việc" button

   - TICKET TABLE grouped by status:

     · One group header row per status: colored pill with the status label +

       muted monospace count. Skip statuses with zero tickets.

     · Columns: Tên công việc (46%) | Nhóm | Người phụ trách | Độ ưu tiên

     · Name cell: empty circle checkbox, monospace ticket key (muted),

       title, then tag pills inline

     · Người phụ trách: overlapping avatar circles (-6px margin), colored

       by user, showing initial, tooltip = full name

     · Độ ưu tiên: flag icon + label, colored (Cao=amber, Bình thường=blue, Thấp=grey)

     · Sticky table header

     · Row hover highlight

   - Empty state when a group has no tickets: "Chưa có công việc"

=== DESIGN ===

Font: 'Be Vietnam Pro' from Google Fonts (critical — renders Vietnamese

diacritics correctly). Use 'JetBrains Mono' for all numbers, ticket keys, counts.

Colors (CSS variables, must support BOTH light and dark theme):

  light: bg #F7F7FB, surface #FFFFFF, ink #16151D, ink-2 #5A5670,

         ink-3 #8B87A0, line #E7E5F0, brand #5B3DF5, brand-soft #EEEBFE

  dark:  bg #0F0E15, surface #17161F, ink #F2F1F7, ink-2 #A9A5BD,

         ink-3 #7A7691, line #282634, brand #8B72FF, brand-soft #241E42

Compact and dense like ClickUp — 13.5px body text, tight row padding (8px),

subtle 1px borders, 8-10px border radius. Not airy or marketing-like.

Numbers use tabular-nums.

=== SEED DATA ===

Namespace "AIONtech". Status template "Mặc định" with statuses:

  BACKLOG (open, grey) · CẦN LÀM (open, blue) · ĐANG LÀM (active, amber)

  · KIỂM THỬ (active, purple) · HOÀN THÀNH (done, green)

Users: Trang(T, orange) · Sơn(S, green) · Linh(L, blue) · Vy(V, purple)

       · Nam(N, cyan) · Cường(C, pink) · An(A, brown)

Tags: frontend, backend, design, feature, bug-fix, data, review, qc

      — each with its own soft background + darker text color

Project "HeyE" (letter H, purple) containing:

  - list "Default" (is_default, star icon)

  - folder "Project Cost Control" containing lists:

      "Khách hàng & Bảng giá", "Hợp đồng", "Ghi nhận giờ"

  - folder "Project Structure" containing lists: "Cây dự án", "Phân quyền"

  - lists: "Work Management", "Ticket Configuration", "Notifications",

           "Users", "Views & Filters"

Project "ESTATE — Sky Realty" (letter E) with lists "Bảng hàng", "Giao dịch"

Seed ~20 tickets spread across those lists, keys AIE-183 through AIE-362,

mixed statuses, 1-4 assignees each, 0-2 tags, mixed priorities.

Vietnamese titles, realistic software-team work, for example:

  "Làm module quản lý khách hàng và bảng giá"

  "Chốt danh mục loại dịch vụ của công ty"

  "Màn tổng quan: 2 tab Ngân sách / Lợi nhuận"

  "Không thể upload nhiều ảnh cùng lúc"

  "Chuẩn hoá các trường Diện tích"

=== SCOPE ===

Read-only browsing for now: tree expand/collapse, node selection, table

filtering. Buttons can be visually present but non-functional.

Do NOT add any time tracking, money, or cost features yet — those come next.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://heye-workflow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a478e43f-2ca2-4c61-94c6-9dc3dd7769a5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
