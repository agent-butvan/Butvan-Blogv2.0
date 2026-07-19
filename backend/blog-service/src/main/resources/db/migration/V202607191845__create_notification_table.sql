-- 创建系统通知记录表
CREATE TABLE blog_notification (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(100),
    target_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP
);

-- 为通知创建时间、是否已读等创建索引以优化查询和计数性能
CREATE INDEX idx_notification_created_at ON blog_notification(created_at DESC);
CREATE INDEX idx_notification_is_read ON blog_notification(is_read);
