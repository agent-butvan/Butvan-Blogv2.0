package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.service.ApiLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 接口调用与测速日志管理 Controller
 */
@RestController
@RequestMapping("/api/admin/api-logs")
@RequiredArgsConstructor
@Slf4j
public class ApiLogController {

    private final ApiLogService apiLogService;

    /**
     * 分页查询 API 请求日志列表
     *
     * @param queryDTO 查询参数
     * @return 接口统一返回格式包装的分页数据
     */
    @GetMapping
    @TrackApi("分页获取API日志列表")
    public Result<PageResult> pageLogs(ApiLogQueryDTO queryDTO) {
        log.info("接收到分页获取 API 测速日志请求");
        PageResult pageResult = apiLogService.pageLogs(queryDTO);
        return Result.success(pageResult);
    }

    /**
     * 一键清空数据库中所有 API 日志记录
     *
     * @return 统一返回成功消息
     */
    @DeleteMapping
    @TrackApi("清空全部API日志")
    public Result<Void> clearAllLogs() {
        log.info("接收到清空全部 API 测速日志请求");
        apiLogService.clearAllLogs();
        return Result.success();
    }
}
