-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.4
-- Left Sidebar Admin Menu Structural Re-organization
-- ----------------------------------------------------

-- 1. 清理现有全部管理端菜单数据，保证脚本重复执行幂等安全
DELETE FROM blog_navigation WHERE position = 'ADMIN_SIDEBAR';

-- 2. 使用 PL/pgSQL 声明段安全建立父子级树菜单关系并写入库
DO $$
DECLARE
    v_content_id BIGINT;
    v_scene_id BIGINT;
    v_profile_id BIGINT;
    v_system_id BIGINT;
BEGIN
    -- 1. 仪表盘（一级直连菜单，无二级子项）
    INSERT INTO blog_navigation (title, link_type, link_url, icon, position, sort_order, is_visible)
    VALUES ('工作台', 'PAGE', '/', 'LayoutDashboard', 'ADMIN_SIDEBAR', 1, TRUE);

    -- 2. 内容管理（一级分组夹）
    INSERT INTO blog_navigation (title, link_type, icon, position, sort_order, is_visible)
    VALUES ('内容管理', 'NONE', 'FileText', 'ADMIN_SIDEBAR', 2, TRUE)
    RETURNING id INTO v_content_id;

    -- 3. 内容管理子菜单（二级项）
    INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible)
    VALUES 
    (v_content_id, '文章列表', 'PAGE', '/articles', 'BookOpen', 'ADMIN_SIDEBAR', 1, TRUE),
    (v_content_id, '分类管理', 'PAGE', '/categories', 'FolderOpen', 'ADMIN_SIDEBAR', 2, TRUE),
    (v_content_id, '标签管理', 'PAGE', '/tags', 'Tag', 'ADMIN_SIDEBAR', 3, TRUE),
    (v_content_id, '评论管理', 'PAGE', '/comments', 'MessageSquare', 'ADMIN_SIDEBAR', 4, TRUE);

    -- 4. 场景空间（一级分组夹）
    INSERT INTO blog_navigation (title, link_type, icon, position, sort_order, is_visible)
    VALUES ('场景空间', 'NONE', 'Sparkles', 'ADMIN_SIDEBAR', 3, TRUE)
    RETURNING id INTO v_scene_id;

    -- 5. 场景空间子菜单（二级项）
    INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible)
    VALUES 
    (v_scene_id, '房间场景', 'PAGE', '/scenes', 'Wallpaper', 'ADMIN_SIDEBAR', 1, TRUE);

    -- 6. 个人中心（一级分组夹）
    INSERT INTO blog_navigation (title, link_type, icon, position, sort_order, is_visible)
    VALUES ('个人中心', 'NONE', 'User', 'ADMIN_SIDEBAR', 4, TRUE)
    RETURNING id INTO v_profile_id;

    -- 7. 个人中心子菜单（二级项）
    INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible)
    VALUES 
    (v_profile_id, '个人资料', 'PAGE', '/settings', 'UserCheck', 'ADMIN_SIDEBAR', 1, TRUE);

    -- 8. 系统管理（一级分组夹）
    INSERT INTO blog_navigation (title, link_type, icon, position, sort_order, is_visible)
    VALUES ('系统管理', 'NONE', 'Settings', 'ADMIN_SIDEBAR', 5, TRUE)
    RETURNING id INTO v_system_id;

    -- 9. 系统管理子菜单（二级项）
    INSERT INTO blog_navigation (parent_id, title, link_type, link_url, icon, position, sort_order, is_visible)
    VALUES 
    (v_system_id, '导航配置', 'PAGE', '/navigation', 'Compass', 'ADMIN_SIDEBAR', 1, TRUE);

END $$;
