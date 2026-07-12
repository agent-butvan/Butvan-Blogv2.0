-- ============================================================================
-- 微信用户关联表 — 记录微信公众号用户与系统用户的关联关系
-- 迁移版本: v1.7
-- 说明: 用户关注公众号后获取 openid，通过 user_id 关联系统用户
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_wechat_user (
    id          BIGSERIAL       PRIMARY KEY,
    open_id     VARCHAR(64)     NOT NULL,
    user_id     BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    status      SMALLINT        NOT NULL DEFAULT 1,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_wechat_user            IS '微信用户关联表 — 公众号用户与系统用户的绑定关系';
COMMENT ON COLUMN blog_wechat_user.id         IS '自增主键';
COMMENT ON COLUMN blog_wechat_user.open_id    IS '微信公众号用户唯一标识（openid）';
COMMENT ON COLUMN blog_wechat_user.user_id    IS '关联系统用户ID（未绑定时为NULL）';
COMMENT ON COLUMN blog_wechat_user.status     IS '关注状态: 1=已关注, 0=已取消关注';
COMMENT ON COLUMN blog_wechat_user.created_at IS '记录创建时间（首次关注时写入）';
COMMENT ON COLUMN blog_wechat_user.updated_at IS '最后更新时间（关注/取消关注时刷新）';

-- openid 全局唯一，同一微信用户只有一条记录
CREATE UNIQUE INDEX uk_wechat_user_open_id ON blog_wechat_user (open_id);

-- 按关联用户查询
CREATE INDEX idx_wechat_user_user_id ON blog_wechat_user (user_id);
