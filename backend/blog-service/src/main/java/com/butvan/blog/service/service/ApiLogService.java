package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;

/**
 * 接口调用测速日志服务接口
 */
public interface ApiLogService {

    /**
     * 分页查询接口测速日志列表
     *
     * @param queryDTO 查询条件
     * @return 分页包装结果
     */
    PageResult pageLogs(ApiLogQueryDTO queryDTO);

    /**
     * 一键清空所有系统测速日志记录
     */
    void clearAllLogs();
}
