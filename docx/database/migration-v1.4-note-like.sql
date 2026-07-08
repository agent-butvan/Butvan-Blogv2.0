-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v1.4
-- 新增手记点赞记录表，支持游客与登录用户点赞
-- ----------------------------------------------------

-- 1. 创建手记点赞记录表
CREATE TABLE IF NOT EXISTS blog_note_like (
    id            BIGSERIAL       PRIMARY KEY,
    note_id       BIGINT          NOT NULL,
    ip_address    VARCHAR(45)     NOT NULL,
    user_agent    VARCHAR(500),
    user_id       BIGINT,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 添加联合索引：支持游客 24 小时内防刷赞查询（IP + UA + 时间）
CREATE INDEX IF NOT EXISTS idx_note_like_ip_ua ON blog_note_like (note_id, ip_address, user_agent, created_at);

-- 3. 添加索引：支持登录用户 24 小时内防刷赞查询（用户ID + 时间）
CREATE INDEX IF NOT EXISTS idx_note_like_user ON blog_note_like (note_id, user_id, created_at);

-- 4. 字段注释
COMMENT ON TABLE blog_note_like               IS '手记点赞记录表';
COMMENT ON COLUMN blog_note_like.id           IS '点赞记录唯一自增ID';
COMMENT ON COLUMN blog_note_like.note_id      IS '被点赞手记关联ID';
COMMENT ON COLUMN blog_note_like.ip_address   IS '访客真实客户端IP地址（支持IPv4/IPv6）';
COMMENT ON COLUMN blog_note_like.user_agent   IS '访客设备浏览器User-Agent指纹';
COMMENT ON COLUMN blog_note_like.user_id      IS '绑定的登录用户ID（游客为NULL）';
COMMENT ON COLUMN blog_note_like.created_at   IS '点赞创建时间';
