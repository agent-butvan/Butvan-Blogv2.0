-- ============================================================================
-- Butvan Blog 2.0 — 相册模块 v1.2
-- 创建时间: 2026-07-06
-- 描述: 新建相册与相册照片关联表，并在管理后台侧边栏注册相册管理菜单
-- ============================================================================

-- ====================================================
-- 一、数据库结构变更 (新建相册相关表)
-- ====================================================

-- 1. 相册表
CREATE TABLE IF NOT EXISTS blog_album (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(100)    NOT NULL,
    slug            VARCHAR(100)    NOT NULL,
    description     VARCHAR(500),
    cover_image_id  BIGINT          REFERENCES blog_media(id) ON DELETE SET NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    sort_order      INTEGER         DEFAULT 0,
    view_count      BIGINT          DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 表注释
COMMENT ON TABLE blog_album IS '相册表 — 管理相册元数据';

-- 字段注释
COMMENT ON COLUMN blog_album.id             IS '主键ID';
COMMENT ON COLUMN blog_album.title          IS '相册标题';
COMMENT ON COLUMN blog_album.slug           IS 'URL友好标识（英文/拼音）';
COMMENT ON COLUMN blog_album.description    IS '相册简介描述';
COMMENT ON COLUMN blog_album.cover_image_id IS '封面图媒体ID（关联blog_media表）';
COMMENT ON COLUMN blog_album.status         IS '状态: DRAFT(草稿)|PUBLISHED(已发布)';
COMMENT ON COLUMN blog_album.sort_order     IS '排序权重（数字越大越靠前）';
COMMENT ON COLUMN blog_album.view_count     IS '冗余：累计浏览次数';
COMMENT ON COLUMN blog_album.created_at     IS '创建时间';
COMMENT ON COLUMN blog_album.updated_at     IS '更新时间';

-- 索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_album_slug ON blog_album (slug);
CREATE INDEX IF NOT EXISTS idx_album_status ON blog_album (status, sort_order DESC);

-- ----------------------------------------------------------------------------

-- 2. 相册照片关联表
CREATE TABLE IF NOT EXISTS blog_album_photo (
    id              BIGSERIAL       PRIMARY KEY,
    album_id        BIGINT          NOT NULL REFERENCES blog_album(id) ON DELETE CASCADE,
    media_id        BIGINT          NOT NULL REFERENCES blog_media(id) ON DELETE CASCADE,
    caption         VARCHAR(255),
    sort_order      INTEGER         DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 表注释
COMMENT ON TABLE blog_album_photo IS '相册照片关联表 — 维护相册与媒体资源的关联关系';

-- 字段注释
COMMENT ON COLUMN blog_album_photo.id         IS '主键ID';
COMMENT ON COLUMN blog_album_photo.album_id   IS '所属相册ID';
COMMENT ON COLUMN blog_album_photo.media_id   IS '关联媒体资源ID（复用blog_media表）';
COMMENT ON COLUMN blog_album_photo.caption    IS '照片说明文字';
COMMENT ON COLUMN blog_album_photo.sort_order IS '在相册中的排序权重';
COMMENT ON COLUMN blog_album_photo.created_at IS '添加时间';

-- 索引
CREATE INDEX IF NOT EXISTS idx_album_photo_album ON blog_album_photo (album_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS uk_album_photo ON blog_album_photo (album_id, media_id);


-- ====================================================
-- 二、导航菜单变更 (在「内容管理」下添加「相册管理」子菜单)
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

    -- 2. 检查是否已经存在相册管理菜单
    SELECT EXISTS (
        SELECT 1
        FROM blog_navigation
        WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/albums' AND parent_id = v_content_id
    ) INTO v_exists;

    -- 3. 若内容管理组存在且相册管理尚未添加，则进行安全插入
    IF v_content_id IS NOT NULL AND NOT v_exists THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (v_content_id, '相册管理', 'PAGE', '/albums', 'Images', 'ADMIN_SIDEBAR', 5, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        RAISE NOTICE '相册管理菜单插入成功，父节点ID: %', v_content_id;
    ELSE
        IF v_content_id IS NULL THEN
            RAISE WARNING '内容管理分组菜单未找到，请确认数据库初始化是否完整。';
        ELSE
            RAISE NOTICE '相册管理菜单已存在，跳过插入。';
        END IF;
    END IF;
END $$;
