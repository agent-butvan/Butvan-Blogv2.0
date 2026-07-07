-- ============================================================================
-- Butvan Blog 2.0 — 手记模块 v1.3
-- 创建时间: 2026-07-07
-- 描述: 新建手记表，并在管理后台侧边栏注册手记管理菜单
-- ============================================================================

-- ====================================================
-- 一、数据库结构变更 (新建手记表)
-- ====================================================

-- 1. 手记表
CREATE TABLE IF NOT EXISTS blog_note (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    slug            VARCHAR(200)    NOT NULL,
    content         TEXT            NOT NULL,
    content_html    TEXT,
    summary         VARCHAR(500),
    cover_image_url VARCHAR(500),
    mood            VARCHAR(50),
    weather         VARCHAR(50),
    location        VARCHAR(200),
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    is_pinned       BOOLEAN         DEFAULT FALSE,
    view_count      BIGINT          DEFAULT 0,
    like_count      BIGINT          DEFAULT 0,
    comment_count   BIGINT          DEFAULT 0,
    word_count      INTEGER         DEFAULT 0,
    reading_time    INTEGER         DEFAULT 0,
    author_id       BIGINT          NOT NULL REFERENCES blog_user(id) ON DELETE CASCADE,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

-- 表注释
COMMENT ON TABLE blog_note IS '手记表 — 轻量随笔/日常记录，独立于文章体系';

-- 字段注释
COMMENT ON COLUMN blog_note.id              IS '主键ID';
COMMENT ON COLUMN blog_note.title           IS '手记标题';
COMMENT ON COLUMN blog_note.slug            IS 'URL友好标识（英文/拼音）';
COMMENT ON COLUMN blog_note.content         IS 'Markdown正文';
COMMENT ON COLUMN blog_note.content_html    IS '渲染后HTML缓存';
COMMENT ON COLUMN blog_note.summary         IS '摘要简介';
COMMENT ON COLUMN blog_note.cover_image_url IS '配图URL';
COMMENT ON COLUMN blog_note.mood            IS '心情: 开心/思考中/忙碌/放松/感动/平静';
COMMENT ON COLUMN blog_note.weather         IS '天气: 晴/多云/阴/雨/雪/风';
COMMENT ON COLUMN blog_note.location        IS '位置描述';
COMMENT ON COLUMN blog_note.status          IS '状态: DRAFT(草稿)|PUBLISHED(已发布)';
COMMENT ON COLUMN blog_note.is_pinned       IS '是否置顶';
COMMENT ON COLUMN blog_note.view_count      IS '冗余：累计浏览量';
COMMENT ON COLUMN blog_note.like_count      IS '冗余：累计点赞数';
COMMENT ON COLUMN blog_note.comment_count   IS '冗余：已通过评论数';
COMMENT ON COLUMN blog_note.word_count      IS '正文字数';
COMMENT ON COLUMN blog_note.reading_time    IS '预估阅读时间（分钟，按300字/分钟估算）';
COMMENT ON COLUMN blog_note.author_id       IS '作者ID';
COMMENT ON COLUMN blog_note.published_at    IS '正式发布时间';
COMMENT ON COLUMN blog_note.created_at      IS '创建时间';
COMMENT ON COLUMN blog_note.updated_at      IS '更新时间';
COMMENT ON COLUMN blog_note.deleted_at      IS '软删除标记（非NULL=已删除）';

-- 索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_note_slug ON blog_note (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_note_status_pub ON blog_note (status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_note_author ON blog_note (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_mood ON blog_note (mood) WHERE deleted_at IS NULL AND status = 'PUBLISHED';


-- ====================================================
-- 二、导航菜单变更 (在「内容管理」下添加「手记管理」子菜单)
-- ====================================================
DO $$
DECLARE
    v_content_id BIGINT;
    v_exists BOOLEAN;
BEGIN
    -- 1. 查找 'ADMIN_SIDEBAR' 下的 '内容管理' 一级分组 ID
    SELECT id INTO v_content_id
    FROM blog_navigation
    WHERE position = 'ADMIN_SIDEBAR' AND title = '内容管理' AND link_type = 'NONE'
    LIMIT 1;

    -- 2. 检查是否已经存在手记管理菜单
    SELECT EXISTS (
        SELECT 1
        FROM blog_navigation
        WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/notes' AND parent_id = v_content_id
    ) INTO v_exists;

    -- 3. 若内容管理组存在且手记管理尚未添加，则进行安全插入
    IF v_content_id IS NOT NULL AND NOT v_exists THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (v_content_id, '手记管理', 'PAGE', '/notes', 'NotebookPen', 'ADMIN_SIDEBAR', 6, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        RAISE NOTICE '手记管理菜单插入成功，父节点ID: %', v_content_id;
    ELSE
        IF v_content_id IS NULL THEN
            RAISE WARNING '内容管理分组菜单未找到，请确认数据库初始化是否完整。';
        ELSE
            RAISE NOTICE '手记管理菜单已存在，跳过插入。';
        END IF;
    END IF;
END $$;


-- ====================================================
-- 三、前台顶栏导航变更 (HEADER 位置添加「手记」入口)
-- ====================================================
DO $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- 检查是否已存在前台手记导航
    SELECT EXISTS (
        SELECT 1
        FROM blog_navigation
        WHERE position = 'HEADER' AND link_url = '/notes'
    ) INTO v_exists;

    -- 若不存在则插入
    IF NOT v_exists THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (NULL, '手记', 'PAGE', '/notes', 'NotebookPen', 'HEADER', 5, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        RAISE NOTICE '前台手记导航插入成功';
    ELSE
        RAISE NOTICE '前台手记导航已存在，跳过插入。';
    END IF;
END $$;
