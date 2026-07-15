package com.butvan.blog.pojo.vo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 仪表盘 7 日流量及访问走势统计节点
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficTrendVO {

    /** 日期 (MM-dd，如 06-15) */
    private String date;

    /** 访问量 PV 数值 (如 125) */
    private Integer pv;
}
