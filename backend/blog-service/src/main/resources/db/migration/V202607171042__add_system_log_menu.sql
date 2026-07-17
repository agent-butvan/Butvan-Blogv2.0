-- 新增系统控制台实时日志菜单项
INSERT INTO "public"."blog_navigation" (
  "title", 
  "parent_id", 
  "link_type", 
  "link_target_id", 
  "link_url", 
  "icon", 
  "position", 
  "sort_order", 
  "is_visible", 
  "is_open_new_tab", 
  "created_at", 
  "updated_at"
) VALUES (
  '系统控制台日志', 
  NULL, 
  'PAGE', 
  NULL, 
  '/system-logs', 
  'Terminal', 
  'ADMIN_SIDEBAR', 
  100, 
  't', 
  'f', 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);
