
CREATE TABLE public.namespaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.namespaces TO authenticated;
GRANT SELECT ON public.namespaces TO anon;
GRANT ALL ON public.namespaces TO service_role;
ALTER TABLE public.namespaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "namespaces_read" ON public.namespaces FOR SELECT USING (true);

CREATE TABLE public.status_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id uuid NOT NULL REFERENCES public.namespaces(id) ON DELETE CASCADE,
  name text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_templates TO authenticated;
GRANT SELECT ON public.status_templates TO anon;
GRANT ALL ON public.status_templates TO service_role;
ALTER TABLE public.status_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status_templates_read" ON public.status_templates FOR SELECT USING (true);

CREATE TABLE public.statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.status_templates(id) ON DELETE CASCADE,
  label text NOT NULL,
  type text NOT NULL CHECK (type IN ('open','active','done','closed')),
  color_bg text NOT NULL,
  color_fg text NOT NULL,
  position int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.statuses TO authenticated;
GRANT SELECT ON public.statuses TO anon;
GRANT ALL ON public.statuses TO service_role;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "statuses_read" ON public.statuses FOR SELECT USING (true);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id uuid NOT NULL REFERENCES public.namespaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_letter text NOT NULL DEFAULT 'P',
  color text NOT NULL DEFAULT '#5B3DF5',
  status_template_id uuid REFERENCES public.status_templates(id) ON DELETE SET NULL,
  position int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_read" ON public.projects FOR SELECT USING (true);

CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('folder','list')),
  position int NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT SELECT ON public.groups TO anon;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_read" ON public.groups FOR SELECT USING (true);

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  initial text NOT NULL,
  avatar_color text NOT NULL,
  email text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read" ON public.users FOR SELECT USING (true);

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id uuid NOT NULL REFERENCES public.namespaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  color_bg text NOT NULL,
  color_fg text NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT ON public.tags TO anon;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_read" ON public.tags FOR SELECT USING (true);

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status_id uuid REFERENCES public.statuses(id) ON DELETE SET NULL,
  priority text CHECK (priority IN ('cao','thuong','thap')),
  created_at timestamptz NOT NULL DEFAULT now(),
  deadline timestamptz,
  position int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;
GRANT SELECT ON public.tickets TO anon;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_read" ON public.tickets FOR SELECT USING (true);

CREATE TABLE public.ticket_assignees (
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_assignees TO authenticated;
GRANT SELECT ON public.ticket_assignees TO anon;
GRANT ALL ON public.ticket_assignees TO service_role;
ALTER TABLE public.ticket_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_assignees_read" ON public.ticket_assignees FOR SELECT USING (true);

CREATE TABLE public.ticket_tags (
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_tags TO authenticated;
GRANT SELECT ON public.ticket_tags TO anon;
GRANT ALL ON public.ticket_tags TO service_role;
ALTER TABLE public.ticket_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_tags_read" ON public.ticket_tags FOR SELECT USING (true);

-- ============ SEED ============
INSERT INTO public.namespaces (name, slug) VALUES ('AIONtech','aiontech');

INSERT INTO public.status_templates (namespace_id, name)
SELECT id, 'Mặc định' FROM public.namespaces WHERE slug='aiontech';

INSERT INTO public.statuses (template_id, label, type, color_bg, color_fg, position)
SELECT t.id, v.label, v.type, v.bg, v.fg, v.pos
FROM public.status_templates t,
(VALUES
  ('BACKLOG','open','#E7E5F0','#5A5670',1),
  ('CẦN LÀM','open','#DEEAFE','#1E4FBF',2),
  ('ĐANG LÀM','active','#FDEBCF','#96620C',3),
  ('KIỂM THỬ','active','#EAE2FE','#5B3DF5',4),
  ('HOÀN THÀNH','done','#D9F3E3','#116B45',5)
) AS v(label,type,bg,fg,pos)
WHERE t.name='Mặc định';

INSERT INTO public.users (full_name, initial, avatar_color, email) VALUES
  ('Trang','T','#F97316','trang@aiontech.vn'),
  ('Sơn','S','#16A34A','son@aiontech.vn'),
  ('Linh','L','#2563EB','linh@aiontech.vn'),
  ('Vy','V','#7C3AED','vy@aiontech.vn'),
  ('Nam','N','#0891B2','nam@aiontech.vn'),
  ('Cường','C','#DB2777','cuong@aiontech.vn'),
  ('An','A','#92400E','an@aiontech.vn');

INSERT INTO public.tags (namespace_id, name, color_bg, color_fg)
SELECT n.id, v.name, v.bg, v.fg
FROM public.namespaces n,
(VALUES
  ('frontend','#DEEAFE','#1E4FBF'),
  ('backend','#D9F3E3','#116B45'),
  ('design','#FCE7F3','#9D174D'),
  ('feature','#EAE2FE','#5B3DF5'),
  ('bug-fix','#FEE2E2','#B91C1C'),
  ('data','#CFFAFE','#155E75'),
  ('review','#FDEBCF','#96620C'),
  ('qc','#E7E5F0','#5A5670')
) AS v(name,bg,fg)
WHERE n.slug='aiontech';

INSERT INTO public.projects (namespace_id, name, avatar_letter, color, status_template_id, position)
SELECT n.id, 'HeyE', 'H', '#5B3DF5', t.id, 1
FROM public.namespaces n JOIN public.status_templates t ON t.namespace_id=n.id
WHERE n.slug='aiontech';

INSERT INTO public.projects (namespace_id, name, avatar_letter, color, status_template_id, position)
SELECT n.id, 'ESTATE — Sky Realty', 'E', '#0891B2', t.id, 2
FROM public.namespaces n JOIN public.status_templates t ON t.namespace_id=n.id
WHERE n.slug='aiontech';

-- top-level groups of HeyE
INSERT INTO public.groups (project_id, parent_id, name, type, position, is_default)
SELECT p.id, NULL, v.name, v.type, v.pos, v.def
FROM public.projects p,
(VALUES
  ('Default','list',1,true),
  ('Project Cost Control','folder',2,false),
  ('Project Structure','folder',3,false),
  ('Work Management','list',4,false),
  ('Ticket Configuration','list',5,false),
  ('Notifications','list',6,false),
  ('Users','list',7,false),
  ('Views & Filters','list',8,false)
) AS v(name,type,pos,def)
WHERE p.name='HeyE';

INSERT INTO public.groups (project_id, parent_id, name, type, position, is_default)
SELECT g.project_id, g.id, v.name, 'list', v.pos, false
FROM public.groups g,
(VALUES ('Khách hàng & Bảng giá',1),('Hợp đồng',2),('Ghi nhận giờ',3)) AS v(name,pos)
WHERE g.name='Project Cost Control';

INSERT INTO public.groups (project_id, parent_id, name, type, position, is_default)
SELECT g.project_id, g.id, v.name, 'list', v.pos, false
FROM public.groups g,
(VALUES ('Cây dự án',1),('Phân quyền',2)) AS v(name,pos)
WHERE g.name='Project Structure';

INSERT INTO public.groups (project_id, parent_id, name, type, position, is_default)
SELECT p.id, NULL, v.name, 'list', v.pos, false
FROM public.projects p,
(VALUES ('Bảng hàng',1),('Giao dịch',2)) AS v(name,pos)
WHERE p.name='ESTATE — Sky Realty';

INSERT INTO public.tickets (key, group_id, title, status_id, priority, deadline, position)
SELECT v.key, g.id, v.title, s.id, v.priority, now() + (v.days || ' days')::interval, v.pos
FROM (VALUES
  ('AIE-183','Khách hàng & Bảng giá','Làm module quản lý khách hàng và bảng giá','ĐANG LÀM','cao',7,1),
  ('AIE-190','Khách hàng & Bảng giá','Chốt danh mục loại dịch vụ của công ty','CẦN LÀM','thuong',12,2),
  ('AIE-196','Khách hàng & Bảng giá','Import bảng giá từ file Excel','BACKLOG','thap',30,3),
  ('AIE-201','Hợp đồng','Thiết kế màn danh sách hợp đồng','KIỂM THỬ','thuong',5,1),
  ('AIE-207','Hợp đồng','Sinh mã hợp đồng tự động theo năm','HOÀN THÀNH','thap',-2,2),
  ('AIE-214','Ghi nhận giờ','Màn tổng quan: 2 tab Ngân sách / Lợi nhuận','ĐANG LÀM','cao',9,1),
  ('AIE-221','Ghi nhận giờ','Chuẩn hoá các trường Diện tích','CẦN LÀM','thuong',14,2),
  ('AIE-229','Cây dự án','Dựng cây dự án đa cấp không giới hạn','ĐANG LÀM','cao',4,1),
  ('AIE-235','Cây dự án','Kéo thả sắp xếp thứ tự nhánh','BACKLOG','thap',25,2),
  ('AIE-242','Phân quyền','Phân quyền theo vai trò cho từng dự án','CẦN LÀM','cao',11,1),
  ('AIE-250','Work Management','Bộ lọc nhanh theo người phụ trách','KIỂM THỬ','thuong',6,1),
  ('AIE-258','Work Management','Không thể upload nhiều ảnh cùng lúc','ĐANG LÀM','cao',2,2),
  ('AIE-266','Work Management','Thêm chế độ xem Bảng (Kanban)','BACKLOG','thuong',40,3),
  ('AIE-274','Ticket Configuration','Cấu hình bộ trạng thái dùng chung','HOÀN THÀNH','thuong',-5,1),
  ('AIE-281','Ticket Configuration','Thêm trường tuỳ chỉnh cho công việc','CẦN LÀM','thap',18,2),
  ('AIE-290','Notifications','Gửi thông báo khi được gán việc','ĐANG LÀM','thuong',8,1),
  ('AIE-298','Users','Đồng bộ danh sách nhân sự từ HR','BACKLOG','thap',35,1),
  ('AIE-311','Views & Filters','Lưu bộ lọc cá nhân theo người dùng','CẦN LÀM','thuong',16,1),
  ('AIE-320','Default','Rà soát chính tả tiếng Việt toàn hệ thống','KIỂM THỬ','thap',10,1),
  ('AIE-334','Bảng hàng','Chuẩn hoá dữ liệu bảng hàng theo toà','ĐANG LÀM','cao',3,1),
  ('AIE-348','Bảng hàng','Sai định dạng số khi xuất báo cáo','CẦN LÀM','cao',5,2),
  ('AIE-362','Giao dịch','Theo dõi trạng thái giao dịch đặt cọc','HOÀN THÀNH','thuong',-1,1)
) AS v(key,gname,title,status,priority,days,pos)
JOIN public.groups g ON g.name = v.gname
JOIN public.statuses s ON s.label = v.status;

INSERT INTO public.ticket_assignees (ticket_id, user_id)
SELECT t.id, u.id
FROM public.tickets t
JOIN public.users u ON true
WHERE (abs(hashtext(t.key || u.full_name)) % 100) < 32;

INSERT INTO public.ticket_assignees (ticket_id, user_id)
SELECT t.id, (SELECT u.id FROM public.users u ORDER BY abs(hashtext(t.key || u.initial)) LIMIT 1)
FROM public.tickets t
WHERE NOT EXISTS (SELECT 1 FROM public.ticket_assignees a WHERE a.ticket_id = t.id)
ON CONFLICT DO NOTHING;

INSERT INTO public.ticket_tags (ticket_id, tag_id)
SELECT t.id, g.id
FROM public.tickets t
JOIN public.tags g ON true
WHERE (abs(hashtext(t.key || g.name)) % 100) < 18;
