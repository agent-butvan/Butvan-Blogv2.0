-- ============================================================================
-- 友链模块 v1.0
-- 创建时间: 2026-06-29
-- ============================================================================

-- 友链表
CREATE TABLE IF NOT EXISTS blog_friend_link (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,                -- 博客名称
    url             VARCHAR(500)    NOT NULL,                -- 博客地址
    avatar_url      VARCHAR(500),                            -- 头像URL
    description     VARCHAR(255),                            -- 简介描述
    category        VARCHAR(50)     NOT NULL DEFAULT 'TECH', -- 分类: TECH|DESIGN|LIFE|PERSONAL
    email           VARCHAR(100),                            -- 邮箱（不公开）
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING|APPROVED|REJECTED
    sort_order      INTEGER         DEFAULT 0,               -- 排序
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP                                   -- 软删除
);

-- 表注释
COMMENT ON TABLE blog_friend_link IS '友链表 — 存储友链信息';

-- 字段注释
COMMENT ON COLUMN blog_friend_link.id           IS '主键ID';
COMMENT ON COLUMN blog_friend_link.name         IS '博客名称';
COMMENT ON COLUMN blog_friend_link.url          IS '博客地址';
COMMENT ON COLUMN blog_friend_link.avatar_url   IS '头像URL';
COMMENT ON COLUMN blog_friend_link.description  IS '简介描述';
COMMENT ON COLUMN blog_friend_link.category     IS '分类: TECH(技术博客)|DESIGN(设计创意)|LIFE(生活记录)|PERSONAL(个人站点)';
COMMENT ON COLUMN blog_friend_link.email        IS '邮箱（不公开，仅用于联系）';
COMMENT ON COLUMN blog_friend_link.status       IS '状态: PENDING(待审核)|APPROVED(已通过)|REJECTED(已拒绝)';
COMMENT ON COLUMN blog_friend_link.sort_order   IS '排序号（数字越大越靠前）';
COMMENT ON COLUMN blog_friend_link.created_at   IS '创建时间';
COMMENT ON COLUMN blog_friend_link.updated_at   IS '更新时间';
COMMENT ON COLUMN blog_friend_link.deleted_at   IS '软删除时间';

-- 索引
CREATE INDEX idx_friend_link_status ON blog_friend_link (status);
CREATE INDEX idx_friend_link_category ON blog_friend_link (category);
CREATE INDEX idx_friend_link_sort_order ON blog_friend_link (sort_order DESC);

-- 插入示例数据（测试用）
INSERT INTO blog_friend_link (name, url, avatar_url, description, category, status, sort_order) VALUES
('技术博客', 'https://example.com', 'https://api.dicebear.com/7.x/identicon/svg?seed=tech', '一个分享技术的博客', 'TECH', 'APPROVED', 1),
('设计创意', 'https://design.example.com', 'https://api.dicebear.com/7.x/identicon/svg?seed=design', '设计灵感与创意分享', 'DESIGN', 'APPROVED', 2),
('生活记录', 'https://life.example.com', 'https://api.dicebear.com/7.x/identicon/svg?seed=life', '记录生活的点滴', 'LIFE', 'APPROVED', 3),
('个人站点', 'https://personal.example.com', 'https://api.dicebear.com/7.x/identicon/svg?seed=personal', '个人主页', 'PERSONAL', 'APPROVED', 4);