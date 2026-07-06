-- ============================================================================
-- Butvan Blog 2.0 — 站点全局背景图片配置迁移
-- 版本: v1.1
-- 描述: 在 blog_site_config 表中预置 background_image_url 配置项
-- 创建日期: 2026-07-05
-- ============================================================================

-- 预置站点全局背景图片配置项（值为空时不展示背景图）
INSERT INTO blog_site_config (config_key, config_value, config_type, description)
VALUES ('background_image_url', '', 'string', '站点全局背景图片URL，为空则不展示背景图')
ON CONFLICT (config_key) DO NOTHING;
