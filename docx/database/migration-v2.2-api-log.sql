-- 创建 API 请求日志与测速表
CREATE TABLE api_log (
    id BIGSERIAL PRIMARY KEY,
    api_name VARCHAR(100) NOT NULL,    -- 接口功能描述名称
    method VARCHAR(10) NOT NULL,      -- 请求方式 (GET/POST/PUT/DELETE)
    uri VARCHAR(255) NOT NULL,        -- 接口地址
    ip VARCHAR(50) NOT NULL,          -- 请求 IP 客户端真实地址
    cost_time INT NOT NULL,           -- 耗时 (毫秒)
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 记录创建时间
);

-- 为创建时间与耗时建立索引以提高实时查询效率
CREATE INDEX idx_api_log_created_at ON api_log(created_at DESC);
