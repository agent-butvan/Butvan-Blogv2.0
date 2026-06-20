-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.8
-- Add Article Like Record Table with User Link & Menu Configuration
-- ----------------------------------------------------

-- 1. 安全创建文章点赞记录表（关联用户）
CREATE TABLE IF NOT EXISTS blog_article_like (
    id            BIGSERIAL       PRIMARY KEY,
    article_id    BIGINT          NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    ip_address    VARCHAR(45)     NOT NULL,
    user_agent    VARCHAR(500),
    user_id       BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_article_like              IS '文章点赞记录表 — 记录游客与用户点赞防止重复刷赞';
COMMENT ON COLUMN blog_article_like.article_id   IS '被点赞文章ID';
COMMENT ON COLUMN blog_article_like.ip_address   IS '访客IP地址';
COMMENT ON COLUMN blog_article_like.user_agent   IS '访客设备浏览器UA';
COMMENT ON COLUMN blog_article_like.user_id      IS '点赞绑定的用户ID（游客点赞则为NULL）';
COMMENT ON COLUMN blog_article_like.created_at   IS '点赞时间';

-- 联合索引以支持针对文章和设备的查重，并支持查询特定用户的点赞记录
CREATE INDEX IF NOT EXISTS idx_article_like_ip_ua ON blog_article_like (article_id, ip_address, user_agent);
CREATE INDEX IF NOT EXISTS idx_article_like_user ON blog_article_like (user_id);


-- 2. 插入后台“点赞记录管理”菜单
DO $$
DECLARE
    v_res_id BIGINT;
    v_exists BOOLEAN;
BEGIN
    -- 获取 '资源管理' 一级菜单的 ID
    SELECT id INTO v_res_id 
    FROM blog_navigation 
    WHERE position = 'ADMIN_SIDEBAR' AND title = '资源管理' AND parent_id IS NULL AND link_type = 'NONE'
    LIMIT 1;

    -- 若一级菜单存在，且点赞子菜单尚不存在，则进行安全插入
    IF v_res_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 
            FROM blog_navigation 
            WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/likes' AND parent_id = v_res_id
        ) INTO v_exists;

        IF NOT v_exists THEN
            INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
            VALUES (v_res_id, '点赞记录管理', 'PAGE', '/likes', 'Heart', 'ADMIN_SIDEBAR', 2, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            RAISE NOTICE '二级菜单 "点赞记录管理" 插入成功';
        END IF;
    END IF;
END $$;
