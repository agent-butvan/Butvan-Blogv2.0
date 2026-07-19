package com.butvan.blog.service.controller.admin;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.Notification;
import com.butvan.blog.service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 分页查询系统通知列表
     *
     * @param page 页码，从 1 开始
     * @param size 每页大小
     * @return 分页通知结果
     */
    @GetMapping("/page")
    public Result<PageResult> pageNotifications(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        log.info("管理端：分页查询系统通知列表，页码: {}, 每页大小: {}", page, size);
        
        // 默认按创建时间倒序排列（最新发布的展示在最上）
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationService.pageNotifications(pageable);
        
        PageResult pageResult = PageResult.builder()
                .total(notificationPage.getTotalElements())
                .page(page)
                .size(size)
                .records(notificationPage.getContent())
                .build();
                
        return Result.success(pageResult);
    }

    /**
     * 获取当前系统所有的未读通知数量
     *
     * @return 未读总数
     */
    @GetMapping("/unread-count")
    public Result<Long> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return Result.success(count);
    }

    /**
     * 将单条通知标记为已读
     *
     * @param id 通知 ID
     * @return 统一响应体
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        log.info("管理端：将系统通知 ID: [{}] 标记为已读", id);
        notificationService.markAsRead(id);
        return Result.success();
    }

    /**
     * 一键将所有未读系统通知标记为已读
     *
     * @return 统一响应体
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead() {
        log.info("管理端：一键标记所有系统通知为已读");
        notificationService.markAllAsRead();
        return Result.success();
    }

    /**
     * 根据 ID 删除指定的通知记录
     *
     * @param id 通知 ID
     * @return 统一响应体
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteNotification(@PathVariable Long id) {
        log.info("管理端：删除系统通知记录 ID: [{}]", id);
        notificationService.deleteNotification(id);
        return Result.success();
    }
}
