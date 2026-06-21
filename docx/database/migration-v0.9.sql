-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.9
-- Add GitHub Bindings and 2FA (Two-Factor Authentication) Columns
-- ----------------------------------------------------

-- 1. 新增 GitHub 绑定相关字段
ALTER TABLE blog_user ADD COLUMN IF NOT EXISTS github_id VARCHAR(100);
ALTER TABLE blog_user ADD COLUMN IF NOT EXISTS github_username VARCHAR(100);

COMMENT ON COLUMN blog_user.github_id IS '绑定的 GitHub 用户唯一标识 ID';
COMMENT ON COLUMN blog_user.github_username IS '绑定的 GitHub 用户名';

-- 2. 新增 2FA (双重验证) 相关字段
ALTER TABLE blog_user ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(100);
ALTER TABLE blog_user ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN blog_user.two_factor_secret IS '双重验证 TOTP 密钥 (Base32)';
COMMENT ON COLUMN blog_user.two_factor_enabled IS '是否启用双重验证';
