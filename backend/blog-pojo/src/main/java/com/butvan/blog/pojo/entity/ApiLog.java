package com.butvan.blog.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 接口调用与测速日志模型，其底层持久化现已由 Logback 本地日志与内存滑动队列完全接管
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiLog {

    private Long id; // 唯一标识

    private String apiName; // 接口功能描述名称

    private String method; // 请求方式 (GET/POST/PUT/DELETE)

    private String uri; // 接口请求地址

    private String ip; // 客户端真实 IP

    private Integer costTime; // 接口耗时 (毫秒)

    private LocalDateTime createdAt; // 记录创建时间
}
