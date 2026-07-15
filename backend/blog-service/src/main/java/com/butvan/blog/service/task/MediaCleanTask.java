package com.butvan.blog.service.task;

import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.repository.MediaRepository;
import com.butvan.blog.service.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 临时媒体垃圾文件自动定时清理任务类
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class MediaCleanTask {

    private final MediaRepository mediaRepository;
    private final MediaService mediaService;

    /**
     * 每日凌晨 2 点执行：扫描 status 为 0（临时状态）且上传时间已超过 24 小时的媒体记录，并执行物理与数据清理
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanOrphanedTempFiles() {
        log.info("开始执行临时孤儿媒体文件定时清理任务...");
        
        // 计算一天前的时间点
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        
        // 状态 0 为临时草稿状态
        List<Media> tempMedias = mediaRepository.findByStatusAndCreatedAtBefore(0, oneDayAgo);
        if (tempMedias.isEmpty()) {
            log.info("未检索到超期未关联的临时媒体文件。");
            return;
        }
        
        log.info("共发现 {} 条超期临时媒体记录，开始批量清除...", tempMedias.size());
        int successCount = 0;
        for (Media media : tempMedias) {
            try {
                mediaService.deleteMedia(media.getId());
                successCount++;
            } catch (Exception e) {
                log.error("清理临时媒体资源记录异常, ID: {}, 原始路径: {}", media.getId(), media.getFilePath(), e);
            }
        }
        log.info("临时孤儿媒体文件清理执行完毕，成功清除 {}/{} 条记录。", successCount, tempMedias.size());
    }
}
