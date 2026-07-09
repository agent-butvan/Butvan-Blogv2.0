-- ============================================================================
-- 添加用户管理菜单到后台侧边栏 "系统管理" 分组下
-- 创建时间: 2025-07-14
-- ============================================================================

DO $$
DECLARE
    v_system_id BIGINT;
    v_exists BOOLEAN;
BEGIN
    -- 1. 查找 'ADMIN_SIDEBAR' 下的 '系统管理' 一级分组 ID
    SELECT id INTO v_system_id
    FROM blog_navigation
    WHERE position = 'ADMIN_SIDEBAR' AND title = '系统管理' AND link_type = 'NONE'
    LIMIT 1;

    IF v_system_id IS NOT NULL THEN
        -- 2. 检查是否已存在用户管理菜单（幂等）
        SELECT EXISTS (
            SELECT 1
            FROM blog_navigation
            WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/users' AND parent_id = v_system_id
        ) INTO v_exists;

        IF NOT v_exists THEN
            INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
            VALUES (v_system_id, '用户管理', 'PAGE', '/users', 'Users', 'ADMIN_SIDEBAR', 2, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            RAISE NOTICE '用户管理菜单插入成功，父节点ID: %', v_system_id;
        ELSE
            RAISE NOTICE '用户管理菜单已存在，跳过插入';
        END IF;
    ELSE
        RAISE WARNING '未找到 "系统管理" 一级分组，请先创建该分组后再执行此脚本';
    END IF;
END $$;
