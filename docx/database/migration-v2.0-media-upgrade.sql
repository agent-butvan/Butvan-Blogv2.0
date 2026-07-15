-- ============================================================================
-- migration-v2.0-media-upgrade.sql
-- 描述: 升级媒体文件管理表，添加文件哈希、上传审计字段、状态字段，并清洗历史预签名URL
-- 创建时间: 2026-07-15
-- ============================================================================

-- 1. 为 blog_media 表增设上传审计、文件哈希与状态字段
ALTER TABLE blog_media 
    ADD COLUMN IF NOT EXISTS file_hash   VARCHAR(64),
    ADD COLUMN IF NOT EXISTS ip_address  VARCHAR(50),
    ADD COLUMN IF NOT EXISTS user_agent  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS status      SMALLINT DEFAULT 1;

-- 2. 添加列字段注释
COMMENT ON COLUMN blog_media.file_hash   IS '文件SHA-256哈希值，用于秒传和文件去重';
COMMENT ON COLUMN blog_media.ip_address  IS '上传者的客户端IP';
COMMENT ON COLUMN blog_media.user_agent  IS '上传者的客户端User-Agent';
COMMENT ON COLUMN blog_media.status      IS '文件状态：0-临时(草稿未保存)，1-正常(已关联关联实体)';

-- 3. 为文件哈希字段添加索引，以提升秒查去重的性能
CREATE INDEX IF NOT EXISTS idx_media_hash ON blog_media (file_hash);

-- 4. 历史数据洗数：清洗旧有失效的 MinIO 预签名链接，将其还原为纯净的公共直连永久链接
UPDATE blog_media 
SET file_url = split_part(file_url, '?', 1) 
WHERE file_url LIKE '%?%X-Amz-%';
