-- ============================================================================
-- 添加友链管理菜单到后台侧边栏
-- 创建时间: 2026-06-29
-- ============================================================================

-- 在"内容管理" (parent_id=14) 下添加友链管理菜单
INSERT INTO blog_navigation (title, parent_id, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
VALUES ('友链管理', 14, 'PAGE', '/friends', 'Link', 'ADMIN_SIDEBAR', 4, true, false, NOW(), NOW());

-- 同时添加前台顶部导航的友链入口（可选）
-- INSERT INTO blog_navigation (title, parent_id, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
-- VALUES ('友链', NULL, 'EXTERNAL', '/friend', 'Leaf', 'HEADER', 3, true, false, NOW(), NOW());