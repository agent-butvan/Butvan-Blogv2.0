package com.butvan.blog.service.service;

import com.butvan.blog.pojo.entity.DbSyncLog;
import com.butvan.blog.pojo.vo.dbsync.DataDiffVO;
import com.butvan.blog.pojo.vo.dbsync.DbConnectionConfigVO;
import com.butvan.blog.pojo.vo.dbsync.SchemaDiffVO;
import com.butvan.blog.pojo.vo.dbsync.ForeignKeyDepVO;
import com.butvan.blog.pojo.vo.dbsync.TableDataOverviewVO;

import java.util.List;

/**
 * 数据库多维比对与数据同步服务层
 */
public interface DbSyncService {

    /**
     * 临时测试数据库连接参数连通性
     *
     * @param jdbcUrl jdbc 链接串
     * @param username 账号
     * @param password 密码 (明文)
     * @return true 代表测试通过
     */
    boolean testConnection(String jdbcUrl, String username, String password);

    /**
     * 保存或更新数据库连接配置 (本地/线上)
     *
     * @param configVO 连接配置 VO
     * @return 更新后的配置 VO
     */
    DbConnectionConfigVO saveConfig(DbConnectionConfigVO configVO);

    /**
     * 根据连接名查询配置详情
     *
     * @param connName 连接名，如 'local_dev' / 'online_prod'
     * @return 配置 VO，若不存在返回 null
     */
    DbConnectionConfigVO getConfig(String connName);

    /**
     * 对比本地开发库与线上库的表结构差异 (DDL)
     *
     * @return 存在结构不一致的表结构差异 VO 列表
     */
    List<SchemaDiffVO> compareSchema();

    /**
     * 一键全量对比本地开发库与线上部署库的所有物理表的数据记录差异
     *
     * @return 每一个物理表的数据对比概览列表
     */
    List<TableDataOverviewVO> compareDataOverview();

    /**
     * 对比指定数据表的内容记录差异 (DML)
     *
     * @param tableName 表名，如 'article'
     * @return 数据差异对比详情 VO
     */
    DataDiffVO compareData(String tableName);

    /**
     * 执行表结构同步 DDL
     *
     * @param tableName 表名
     * @param sql 待执行的 DDL 语句
     */
    void syncSchema(String tableName, String sql);

    /**
     * 将本地库中的指定记录同步写入到线上库中 (支持 INSERT/UPDATE)
     *
     * @param tableName 表名
     * @param opType 操作类型，'INSERT' / 'UPDATE'
     * @param ids 待同步的主键 ID 列表
     */
    void syncData(String tableName, String opType, List<Long> ids);

    /**
     * 预览数据同步时缺失的外键依赖记录（不执行任何写入）
     *
     * @param tableName 表名
     * @param ids 待同步的主键 ID 列表
     * @return 线上库中缺失的外键依赖记录列表，空列表表示无依赖缺失
     */
    List<ForeignKeyDepVO> previewForeignKeyDependencies(String tableName, List<Long> ids);

    /**
     * 根据日志 ID 回退指定的同步动作
     *
     * @param logId 同步日志 ID
     */
    void rollback(Long logId);

    /**
     * 查询全部的同步操作日志
     *
     * @return 数据库同步日志列表
     */
    List<DbSyncLog> getSyncLogs();
}
