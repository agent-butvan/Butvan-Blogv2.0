package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.Notification;
import com.butvan.blog.service.repository.NotificationRepository;
import com.butvan.blog.service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Page<Notification> pageNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable);
    }

    @Override
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
                log.info("系统通知 ID: [{}] 已标记为已读", id);
            }
        });
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
        log.info("所有未读系统通知已一键全部标记为已读");
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
        log.info("删除系统通知 ID: [{}] 成功", id);
    }
}
