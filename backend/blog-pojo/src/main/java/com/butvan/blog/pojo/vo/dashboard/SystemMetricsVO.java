package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 仪表盘系统性能指标
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsVO {

    /** 系统 CPU 使用率 (百分比，如 3.5) */
    private Double cpuUsage;

    /** JVM 内存使用率 (百分比，如 24.8) */
    private Double memoryUsage;

    /** 接口平均延迟 (毫秒，如 12) */
    private Integer apiDelay;
}
