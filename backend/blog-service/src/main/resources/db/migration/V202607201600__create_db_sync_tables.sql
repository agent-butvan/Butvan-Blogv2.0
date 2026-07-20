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
