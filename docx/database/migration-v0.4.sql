-- ============================================================================
-- Butvan Blog 2.0 — 数据库升级脚本 (v0.4)
-- 目的: 支持评论标记为作者、评论置顶、以及封禁评论者邮箱与 IP 的拦截功能
-- ============================================================================

-- 1. 在 blog_comment 表中新增 is_author 列 (防御性添加)
ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS is_author BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN blog_comment.is_author IS '标识该评论是否由作者/站长本身发表或被后台标记为作者发表';

-- 2. 在 blog_comment 表中新增 is_pinned 列 (用于评论置顶，防御性添加)
ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN blog_comment.is_pinned IS '是否置顶该评论';

-- 3. 创建 blog_comment_ban 评论封禁拦截表
CREATE TABLE IF NOT EXISTS blog_comment_ban (
    id          BIGSERIAL       PRIMARY KEY,
    ip_address  VARCHAR(45),
    email       VARCHAR(100),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  blog_comment_ban              IS '评论封禁表 — 存储被封禁的IP和邮箱';
COMMENT ON COLUMN blog_comment_ban.id           IS '主键唯一标识 ID';
COMMENT ON COLUMN blog_comment_ban.ip_address   IS '被封禁的客户端 IP 地址';
COMMENT ON COLUMN blog_comment_ban.email        IS '被封禁的访客电子邮箱地址';
COMMENT ON COLUMN blog_comment_ban.created_at   IS '执行封禁的时间';

-- 创建唯一或联合索引加快高并发评论校验
CREATE INDEX idx_comment_ban_email ON blog_comment_ban (email) WHERE email IS NOT NULL;
CREATE INDEX idx_comment_ban_ip    ON blog_comment_ban (ip_address) WHERE ip_address IS NOT NULL;
