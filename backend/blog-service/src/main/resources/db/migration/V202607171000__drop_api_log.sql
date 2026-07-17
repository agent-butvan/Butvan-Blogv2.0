-- 物理下线高频写入的旧日志数据表，其功能已被 Logback 本地日志与内存高性能滑动缓存队列完全取代
DROP TABLE IF EXISTS api_log;
