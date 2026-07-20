-- 1. 动态数据库连接配置表
CREATE TABLE "public"."db_connection_config" (
  "id" SERIAL PRIMARY KEY,
  "conn_name" VARCHAR(50) NOT NULL UNIQUE,
  "jdbc_url" VARCHAR(255) NOT NULL,
  "username" VARCHAR(50) NOT NULL,
  "password" VARCHAR(150) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 同步操作日志表
CREATE TABLE "public"."db_sync_log" (
  "id" BIGSERIAL PRIMARY KEY,
  "op_type" VARCHAR(20) NOT NULL,
  "table_name" VARCHAR(50) NOT NULL,
  "sql_sync" TEXT NOT NULL,
  "sql_rollback" TEXT NOT NULL,
  "operator" VARCHAR(50) NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_db_sync_log_table ON "public"."db_sync_log" ("table_name");

-- 3. 新增数据库同步菜单项，属于系统管理(22)二级菜单
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
  '数据库同步', 
  22, 
  'PAGE', 
  NULL, 
  '/db-sync', 
  'DatabaseBackup', 
  'ADMIN_SIDEBAR', 
  20, 
  't', 
  'f', 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);
