-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.7
-- Add Media Management to Content Group in Sidebar
-- ----------------------------------------------------

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

    -- 2. 检查是否已经存在媒体管理菜单
    SELECT EXISTS (
        SELECT 1 
        FROM blog_navigation 
        WHERE position = 'ADMIN_SIDEBAR' AND link_url = '/media' AND parent_id = v_content_id
    ) INTO v_exists;

    -- 3. 若内容管理组存在且媒体管理尚未添加，则进行安全插入
    IF v_content_id IS NOT NULL AND NOT v_exists THEN
        INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
        VALUES (v_content_id, '媒体管理', 'PAGE', '/media', 'Image', 'ADMIN_SIDEBAR', 5, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        
        RAISE NOTICE '媒体管理菜单插入成功，父节点ID: %', v_content_id;
    ELSE
        IF v_content_id IS NULL THEN
            RAISE WARNING '内容管理分组菜单未找到，请确认数据库初始化是否完整。';
        ELSE
            RAISE NOTICE '媒体管理菜单已存在，跳过插入。';
        END IF;
    END IF;
END $$;
