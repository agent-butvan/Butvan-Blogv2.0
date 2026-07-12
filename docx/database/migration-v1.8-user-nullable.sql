-- ================================================================
-- migration-v1.8.sql
-- 放宽 blog_user 表的 username / password_hash / nickname 非空约束
-- 支持微信扫码登录场景：普通用户仅需 email 即可，无需用户名和密码
-- ================================================================

-- 1. 放宽 username 约束：允许为空（普通用户不需要用户名）
ALTER TABLE blog_user ALTER COLUMN username DROP NOT NULL;

-- 2. 放宽 password_hash 约束：允许为空（微信登录用户无密码）
ALTER TABLE blog_user ALTER COLUMN password_hash DROP NOT NULL;

-- 3. 放宽 nickname 约束：允许为空（前端使用 email 作为展示名）
ALTER TABLE blog_user ALTER COLUMN nickname DROP NOT NULL;
