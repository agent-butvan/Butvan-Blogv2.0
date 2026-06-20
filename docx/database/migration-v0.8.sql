-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.8
-- Add Article Like Record Table for IP & Device Tracking
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS blog_article_like (
    id            BIGSERIAL       PRIMARY KEY,
    article_id    BIGINT          NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    ip_address    VARCHAR(45)     NOT NULL,
    user_agent    VARCHAR(500),
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_article_like              IS '文章点赞记录表 — 记录游客点赞防止重复刷赞';
COMMENT ON COLUMN blog_article_like.article_id   IS '被点赞文章ID';
COMMENT ON COLUMN blog_article_like.ip_address   IS '访客IP地址';
COMMENT ON COLUMN blog_article_like.user_agent   IS '访客设备浏览器UA';
COMMENT ON COLUMN blog_article_like.created_at   IS '点赞时间';

-- 索引：优化根据文章、IP和UA快速检查点赞记录的效率
CREATE INDEX IF NOT EXISTS idx_article_like_ip_ua ON blog_article_like (article_id, ip_address, user_agent);
