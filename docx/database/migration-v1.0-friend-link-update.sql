-- ============================================================================
-- 友链表结构升级 v1.0
-- 创建时间: 2026-06-29
-- 说明: 为现有 blog_friend_link 表添加新字段支持完整友链功能
-- ============================================================================

-- 添加分类字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'TECH';
COMMENT ON COLUMN blog_friend_link.category IS '分类: TECH(技术博客)|DESIGN(设计创意)|LIFE(生活记录)|PERSONAL(个人站点)';

-- 添加邮箱字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS email VARCHAR(100);
COMMENT ON COLUMN blog_friend_link.email IS '邮箱（不公开，仅用于联系）';

-- 添加状态字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
COMMENT ON COLUMN blog_friend_link.status IS '状态: PENDING(待审核)|APPROVED(已通过)|REJECTED(已拒绝)';

-- 添加更新时间字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
COMMENT ON COLUMN blog_friend_link.updated_at IS '更新时间';

-- 添加软删除字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
COMMENT ON COLUMN blog_friend_link.deleted_at IS '软删除时间';

-- 添加备注字段
ALTER TABLE blog_friend_link ADD COLUMN IF NOT EXISTS remark VARCHAR(500);
COMMENT ON COLUMN blog_friend_link.remark IS '备注';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_friend_link_status ON blog_friend_link (status);
CREATE INDEX IF NOT EXISTS idx_friend_link_category ON blog_friend_link (category);

-- 更新现有数据：将 is_visible=true 的记录状态设为 APPROVED
UPDATE blog_friend_link SET status = 'APPROVED' WHERE is_visible = true;
UPDATE blog_friend_link SET status = 'PENDING' WHERE is_visible IS NULL OR is_visible = false;

-- 字段重命名（可选，如果想保持兼容可以跳过）
-- ALTER TABLE blog_friend_link RENAME COLUMN site_name TO name;
-- ALTER TABLE blog_friend_link RENAME COLUMN site_url TO url;
-- ALTER TABLE blog_friend_link RENAME COLUMN site_logo TO avatar_url;