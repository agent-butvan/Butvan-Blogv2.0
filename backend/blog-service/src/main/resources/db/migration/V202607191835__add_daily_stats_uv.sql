-- 每日流量表 blog_daily_stats 字段扩增：添加 uv_count 字段
ALTER TABLE blog_daily_stats ADD COLUMN uv_count BIGINT DEFAULT 0;
