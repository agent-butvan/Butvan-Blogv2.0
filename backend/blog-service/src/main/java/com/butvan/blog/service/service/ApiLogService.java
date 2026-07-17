package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.log.ApiLogQueryDTO;
import com.butvan.blog.pojo.vo.log.LogArchiveVO;
import java.io.File;
import java.util.List;

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

    /**
     * 获取服务器上所有的历史日志归档包列表
     *
     * @return 归档日志包 VO 列表
     */
    List<LogArchiveVO> listArchives();

    /**
     * 获取指定归档包的物理 File 对象以供下载
     *
     * @param filename 归档压缩包文件名
     * @return 物理 File 对象
     */
    File getArchiveFile(String filename);

    /**
     * 物理删除指定的历史日志归档包文件
     *
     * @param filename 归档压缩包文件名
     */
    void deleteArchive(String filename);
}
