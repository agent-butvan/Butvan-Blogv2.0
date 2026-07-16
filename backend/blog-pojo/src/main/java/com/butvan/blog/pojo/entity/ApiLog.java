package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 接口调用与测速日志实体类，映射 api_log 表
 */
@Entity
@Table(name = "api_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 唯一主键

    @Column(name = "api_name", nullable = false, length = 100)
    private String apiName; // 接口功能描述名称

    @Column(name = "method", nullable = false, length = 10)
    private String method; // 请求方式 (GET/POST/PUT/DELETE)

    @Column(name = "uri", nullable = false, length = 255)
    private String uri; // 接口请求地址

    @Column(name = "ip", nullable = false, length = 50)
    private String ip; // 客户端真实 IP

    @Column(name = "cost_time", nullable = false)
    private Integer costTime; // 接口耗时 (毫秒)

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt; // 记录创建时间
}
