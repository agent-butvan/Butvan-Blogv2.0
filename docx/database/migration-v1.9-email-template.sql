-- ============================================================================
-- migration-v1.9-email-template.sql
-- 描述: 在 blog_site_config 表中预置邮件标题与内容模版配置项
-- 创建时间: 2026-07-14
-- ============================================================================

INSERT INTO blog_site_config (config_key, config_value, config_type, description)
VALUES 
('email_verify_subject', '【可梵的个人博客】登录验证码', 'string', '邮箱验证码登录邮件主题'),
('email_verify_template', '您的验证码是：${code}，该验证码 5 分钟内有效。如非本人操作，请忽略此邮件。', 'string', '邮箱验证码登录邮件内容模版（支持 ${code} 变量）')
ON CONFLICT (config_key) DO NOTHING;
