-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.7
-- Add Resource Management (Parent) and Media Content Management (Child) to Sidebar
-- ----------------------------------------------------

DO $$
DECLARE
    v_res_id BIGINT;
    v_exists_parent BOOLEAN;
    v_exists_child BOOLEAN;
BEGIN
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
