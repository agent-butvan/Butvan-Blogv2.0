-- 创建 API 请求日志与测速表
CREATE TABLE IF NOT EXISTS api_log (
    id BIGSERIAL PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL,    -- 接口功能描述名称
    method VARCHAR(10) NOT NULL,      -- 请求方式 (GET/POST/PUT/DELETE)
    uri VARCHAR(255) NOT NULL,        -- 接口地址
    ip VARCHAR(50) NOT NULL,          -- 请求 IP 客户端真实地址
    cost_time INT NOT NULL,           -- 耗时 (毫秒)
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 记录创建时间
);

CREATE INDEX IF NOT EXISTS idx_api_log_created_at ON api_log(created_at DESC);

-- 将 "API日志" 一级导航菜单项加入后台侧边栏中 (position='ADMIN_SIDEBAR', sort_order=99)
INSERT INTO blog_navigation (title, parent_id, link_type, link_url, icon, position, sort_order, is_visible, is_open_new_tab, created_at, updated_at)
VALUES ('API日志', NULL, 'PAGE', '/api-logs', 'Activity', 'ADMIN_SIDEBAR', 99, true, false, NOW(), NOW());
