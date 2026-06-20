-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.7
-- Add Source Tracking Columns to blog_media & 
-- Add Resource Management (Parent) and Media Content Management (Child) to Sidebar
-- ----------------------------------------------------

-- ====================================================
-- 一、数据库结构变更 (追加来源跟踪列)
-- ====================================================

-- 1. 向媒体资源表追加来源关联字段与索引
ALTER TABLE blog_media 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS source_id BIGINT,
ADD COLUMN IF NOT EXISTS source_detail VARCHAR(255);

-- 补充字段注释
COMMENT ON COLUMN blog_media.source_type IS '来源类型/归属模块: ARTICLE|SCENE|USER_AVATAR|SYSTEM_CONFIG|MANUAL';
COMMENT ON COLUMN blog_media.source_id IS '来源实体唯一ID';
COMMENT ON COLUMN blog_media.source_detail IS '详细来源说明文本（如：文章《xxx》的插图）';

-- 创建索引以优化来源检索性能
CREATE INDEX IF NOT EXISTS idx_media_source ON blog_media (source_type, source_id);


-- ====================================================
-- 二、导航菜单变更 (安全创建 资源管理 一级菜单及 媒体内容管理 二级子菜单)
-- ====================================================
DO $$
DECLARE
    v_res_id BIGINT;
    v_exists_parent BOOLEAN;
    v_exists_child BOOLEAN;
BEGIN
    -- 0. 彻底清理之前残留或误插入的旧“媒体管理”菜单，防止与新的“媒体内容管理”菜单冲突
    DELETE FROM blog_navigation 
    WHERE position = 'ADMIN_SIDEBAR' 
      AND (
        title = '媒体管理' 
        OR (
          link_url = '/media' 
          AND parent_id = (
              SELECT id 
              FROM blog_navigation 
              WHERE position = 'ADMIN_SIDEBAR' AND title = '内容管理' AND link_type = 'NONE' 
              LIMIT 1
          )
        )
      );

    -- 1. 检查一级菜单 '资源管理' 是否已存在
    SELECT EXISTS (
        SELECT 1 
        FROM blog_navigation 
        WHERE position = 'ADMIN_SIDEBAR' AND title = '资源管理' AND parent_id IS NULL AND link_type = 'NONE'
    ) INTO v_exists_parent;

    -- 2. 若不存在，则插入一级菜单 '资源管理'
    IF NOT v_exists_parent THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (NULL, '资源管理', 'NONE', NULL, 'HardDrive', 'ADMIN_SIDEBAR', 6, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        RAISE NOTICE '一级菜单 "资源管理" 插入成功';
    END IF;

    -- 3. 获取 '资源管理' 的 ID
    SELECT id INTO v_res_id 
    FROM blog_navigation 
    WHERE position = 'ADMIN_SIDEBAR' AND title = '资源管理' AND parent_id IS NULL AND link_type = 'NONE'
    LIMIT 1;

    -- 4. 检查是否已经存在 '媒体内容管理' 二级菜单
    SELECT EXISTS (
        SELECT 1 
        FROM blog_navigation 
        WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/media' AND parent_id = v_res_id
    ) INTO v_exists_child;

    -- 5. 若媒体内容管理尚未添加，则进行插入
    IF NOT v_exists_child THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (v_res_id, '媒体内容管理', 'PAGE', '/media', 'Image', 'ADMIN_SIDEBAR', 1, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        RAISE NOTICE '二级菜单 "媒体内容管理" 插入成功，父节点ID: %', v_res_id;
    ELSE
        RAISE NOTICE '二级菜单 "媒体内容管理" 已存在，跳过插入。';
    END IF;
END $$;
