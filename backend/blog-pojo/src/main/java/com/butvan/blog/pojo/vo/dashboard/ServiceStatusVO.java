package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 核心微服务连接健康状态 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatusVO {

    /** 数据库是否连通可用 */
    private boolean database;

    /** Redis 缓存是否连通可用 */
    private boolean redis;

    /** 存储媒介是否连通可用 */
    private boolean minio;

    /** 存储介质类型：local 或 minio */
    private String storageType;
}
