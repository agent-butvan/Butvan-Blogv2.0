package com.butvan.blog.pojo.dto.log;

import lombok.Data;

/**
 * API 测速日志查询传输 DTO 类
 */
@Data
public class ApiLogQueryDTO {

    /**
     * 当前请求页码
     */
    private Integer page;

    /**
     * 每页数量上限
     */
    private Integer size;

    /**
     * 模糊匹配关键字
     */
    private String keyword;

    /**
     * 请求方式 (GET, POST等)
     */
    private String method;

    /**
     * 最小响应耗时 (ms)
     */
    private Integer minCost;

    /**
     * 最大响应耗时 (ms)
     */
    private Integer maxCost;
}
