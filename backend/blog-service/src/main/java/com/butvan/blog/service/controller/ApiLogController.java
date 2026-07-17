package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.pojo.vo.log.LogArchiveVO;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.service.ApiLogService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

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

    /**
     * 获取服务器历史日志归档包列表
     *
     * @return 日志归档包列表
     */
    @GetMapping("/archives")
    @TrackApi("获取API归档日志列表")
    public Result<List<LogArchiveVO>> listArchives() {
        log.info("接收到获取 API 日志归档压缩包列表请求");
        List<LogArchiveVO> list = apiLogService.listArchives();
        return Result.success(list);
    }

    /**
     * 流式下载指定的历史日志归档压缩包文件
     *
     * @param filename 归档日志包名称
     * @param response 响应对象
     */
    @GetMapping("/archives/download")
    @TrackApi("下载API归档日志文件")
    public void downloadArchive(@RequestParam String filename, HttpServletResponse response) throws IOException {
        log.info("接收到下载 API 日志归档压缩包请求: {}", filename);
        File file = apiLogService.getArchiveFile(filename);
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        response.setContentLengthLong(file.length());

        try (InputStream is = new BufferedInputStream(new FileInputStream(file));
             OutputStream os = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
            os.flush();
        }
    }

    /**
     * 物理删除指定的历史日志归档压缩包文件
     *
     * @param filename 归档日志包名称
     * @return 统一成功返回
     */
    @DeleteMapping("/archives")
    @TrackApi("删除单个API归档日志文件")
    public Result<Void> deleteArchive(@RequestParam String filename) {
        log.info("接收到物理删除 API 日志归档包请求: {}", filename);
        apiLogService.deleteArchive(filename);
        return Result.success();
    }
}
