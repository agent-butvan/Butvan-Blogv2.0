package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.DbSyncLog;
import com.butvan.blog.pojo.vo.dbsync.DataDiffVO;
import com.butvan.blog.pojo.vo.dbsync.DbConnectionConfigVO;
import com.butvan.blog.pojo.vo.dbsync.ForeignKeyDepVO;
import com.butvan.blog.pojo.vo.dbsync.SchemaDiffVO;
import com.butvan.blog.pojo.vo.dbsync.TableDataOverviewVO;
import com.butvan.blog.service.annotation.TrackApi;
import com.butvan.blog.service.service.DbSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 数据库多维对比与同步管理控制器
 */
@RestController
@RequestMapping("/api/admin/db")
@RequiredArgsConstructor
@Slf4j
public class DbSyncController {

    private final DbSyncService dbSyncService;

    /**
     * 临时测试数据库连接是否连通
     */
    @PostMapping("/test")
    @TrackApi("测试数据库连接")
    public Result<String> testConnection(@RequestBody DbConnectionConfigVO configVO) {
        log.info("API 测试数据库连接: {}", configVO.getJdbcUrl());
        boolean success = dbSyncService.testConnection(configVO.getJdbcUrl(), configVO.getUsername(), configVO.getPassword());
        return success ? Result.success("连接测试成功") : Result.error("连接测试失败");
    }

    /**
     * 保存或更新数据库连接配置
     */
    @PostMapping("/config")
    @TrackApi("保存数据库连接配置")
    public Result<DbConnectionConfigVO> saveConfig(@RequestBody DbConnectionConfigVO configVO) {
        log.info("API 保存数据库连接配置: {}", configVO.getConnName());
        DbConnectionConfigVO saved = dbSyncService.saveConfig(configVO);
        return Result.success(saved);
    }

    /**
     * 获取数据库连接配置信息
     */
    @GetMapping("/config")
    @TrackApi("查询数据库连接配置")
    public Result<DbConnectionConfigVO> getConfig(@RequestParam String connName) {
        log.info("API 查询数据库连接配置: {}", connName);
        DbConnectionConfigVO config = dbSyncService.getConfig(connName);
        return Result.success(config);
    }

    /**
     * 执行表结构对比
     */
    @GetMapping("/compare/schema")
    @TrackApi("数据库结构对比")
    public Result<List<SchemaDiffVO>> compareSchema() {
        log.info("API 触发数据库结构对比请求");
        List<SchemaDiffVO> diffs = dbSyncService.compareSchema();
        return Result.success(diffs);
    }

    /**
     * 一键全表数据差异对比概览
     */
    @GetMapping("/compare/data/overview")
    @TrackApi("全表数据对比")
    public Result<List<TableDataOverviewVO>> compareDataOverview() {
        log.info("API 触发全表数据库记录对比请求");
        List<TableDataOverviewVO> overview = dbSyncService.compareDataOverview();
        return Result.success(overview);
    }

    /**
     * 执行特定表的数据差异对比
     */
    @GetMapping("/compare/data")
    @TrackApi("数据库记录对比")
    public Result<DataDiffVO> compareData(@RequestParam String tableName) {
        log.info("API 触发数据库记录对比请求, 表名: {}", tableName);
        DataDiffVO diff = dbSyncService.compareData(tableName);
        return Result.success(diff);
    }

    /**
     * 执行线上库表结构同步 (DDL)
     */
    @PostMapping("/sync/schema")
    @TrackApi("执行表结构同步")
    public Result<String> syncSchema(@RequestBody Map<String, String> payload) {
        String tableName = payload.get("tableName");
        String sql = payload.get("sql");
        log.info("API 执行结构同步, 表名: {}", tableName);
        dbSyncService.syncSchema(tableName, sql);
        return Result.success("结构同步成功");
    }

    /**
     * 预览数据同步时缺失的外键依赖（不执行任何写入）
     */
    @PostMapping("/sync/data/preview-fk")
    @TrackApi("预览外键依赖")
    public Result<List<ForeignKeyDepVO>> previewForeignKeyDependencies(@RequestBody Map<String, Object> payload) {
        String tableName = (String) payload.get("tableName");
        @SuppressWarnings("unchecked")
        List<Number> idNums = (List<Number>) payload.get("ids");
        List<Long> ids = idNums.stream().map(Number::longValue).collect(Collectors.toList());

        log.info("API 预览外键依赖, 表名: {}, 记录数: {}", tableName, ids.size());
        List<ForeignKeyDepVO> deps = dbSyncService.previewForeignKeyDependencies(tableName, ids);
        return Result.success(deps);
    }

    /**
     * 执行本地记录同步至线上 (DML)
     */
    @PostMapping("/sync/data")
    @TrackApi("执行记录数据同步")
    public Result<String> syncData(@RequestBody Map<String, Object> payload) {
        String tableName = (String) payload.get("tableName");
        String opType = (String) payload.get("opType");
        
        @SuppressWarnings("unchecked")
        List<Number> idNums = (List<Number>) payload.get("ids");
        List<Long> ids = idNums.stream().map(Number::longValue).collect(Collectors.toList());

        log.info("API 执行记录数据同步, 表名: {}, 类型: {}, 同步行数: {}", tableName, opType, ids.size());
        dbSyncService.syncData(tableName, opType, ids);
        return Result.success("数据同步成功");
    }

    /**
     * 撤销指定的同步动作，执行回退
     */
    @PostMapping("/rollback")
    @TrackApi("执行同步动作回退")
    public Result<String> rollback(@RequestParam Long logId) {
        log.info("API 执行同步回退, 日志ID: {}", logId);
        dbSyncService.rollback(logId);
        return Result.success("回退动作执行成功");
    }

    /**
     * 查询同步操作历史日志列表
     */
    @GetMapping("/logs")
    @TrackApi("获取数据库同步操作日志")
    public Result<List<DbSyncLog>> getSyncLogs() {
        log.info("API 获取数据库同步操作日志请求");
        List<DbSyncLog> logs = dbSyncService.getSyncLogs();
        return Result.success(logs);
    }
}
