-- ============================================================================
-- Butvan Blog 2.0 — 数据库升级脚本 (v0.4)
-- 目的: 为 blog_comment 表新增 is_author 字段，用于标记评论是否由作者或被标记为作者所写
-- ============================================================================

-- 1. 在 blog_comment 表中新增 is_author 列
ALTER TABLE blog_comment ADD COLUMN is_author BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. 添加列字段注释说明
COMMENT ON COLUMN blog_comment.is_author IS '标识该评论是否由作者/站长本身发表或被后台标记为作者发表';
