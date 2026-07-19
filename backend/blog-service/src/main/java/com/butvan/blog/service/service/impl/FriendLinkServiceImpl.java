package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.dto.friend.FriendLinkApplyDTO;
import com.butvan.blog.pojo.dto.friend.FriendLinkSaveDTO;
import com.butvan.blog.pojo.entity.FriendLink;
import com.butvan.blog.pojo.vo.friend.FriendLinkVO;
import com.butvan.blog.service.repository.FriendLinkRepository;
import com.butvan.blog.service.service.FriendLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 友链 Service 实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendLinkServiceImpl implements FriendLinkService {

    private final FriendLinkRepository friendLinkRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<FriendLinkVO> getApprovedFriendLinks() {
        log.info("获取已批准的友链列表");
        List<FriendLink> links = friendLinkRepository.findByStatusOrderBySortOrderDesc(FriendLink.STATUS_APPROVED);
        return links.stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendLinkVO> getApprovedFriendLinksByCategory(String category) {
        log.info("获取分类 [{}] 的已批准友链列表", category);
        List<FriendLink> links = friendLinkRepository.findByCategoryAndStatusOrderBySortOrderDesc(category, FriendLink.STATUS_APPROVED);
        return links.stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void applyFriendLink(FriendLinkApplyDTO dto) {
        log.info("申请友链: {}", dto.getName());
        FriendLink friendLink = FriendLink.builder()
                .name(dto.getName())
                .url(dto.getUrl())
                .avatarUrl(dto.getAvatarUrl())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .email(dto.getEmail())
                .status(FriendLink.STATUS_PENDING)
                .sortOrder(0)
                .build();
        friendLinkRepository.save(friendLink);
        log.info("友链申请成功，等待审核");

        // 发布友链申请创建的业务事件以触系统通知告警
        eventPublisher.publishEvent(new com.butvan.blog.service.event.NotificationEvents.FriendLinkAppliedEvent(
                this,
                friendLink.getName(), // 申请者名称/站点名称
                friendLink.getName(),
                friendLink.getUrl(),
                friendLink.getId()
        ));
    }

    @Override
    public List<FriendLink> getAllFriendLinks() {
        log.info("获取所有友链（后台）");
        return friendLinkRepository.findAll();
    }

    @Override
    public FriendLink getFriendLinkById(Long id) {
        log.info("获取友链详情: id={}", id);
        return friendLinkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("友链不存在: " + id));
    }

    @Override
    @Transactional
    public FriendLink createFriendLink(FriendLinkSaveDTO dto) {
        log.info("创建友链: {}", dto.getName());
        FriendLink friendLink = FriendLink.builder()
                .name(dto.getName())
                .url(dto.getUrl())
                .avatarUrl(dto.getAvatarUrl())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .email(dto.getEmail())
                .status(FriendLink.STATUS_APPROVED)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .build();
        return friendLinkRepository.save(friendLink);
    }

    @Override
    @Transactional
    public FriendLink updateFriendLink(Long id, FriendLinkSaveDTO dto) {
        log.info("更新友链: id={}", id);
        FriendLink friendLink = getFriendLinkById(id);
        friendLink.setName(dto.getName());
        friendLink.setUrl(dto.getUrl());
        friendLink.setAvatarUrl(dto.getAvatarUrl());
        friendLink.setDescription(dto.getDescription());
        friendLink.setCategory(dto.getCategory());
        friendLink.setEmail(dto.getEmail());
        if (dto.getSortOrder() != null) {
            friendLink.setSortOrder(dto.getSortOrder());
        }
        return friendLinkRepository.save(friendLink);
    }

    @Override
    @Transactional
    public void updateFriendLinkStatus(Long id, String status) {
        log.info("更新友链状态: id={}, status={}", id, status);
        FriendLink friendLink = getFriendLinkById(id);
        friendLink.setStatus(status);
        friendLinkRepository.save(friendLink);
    }

    @Override
    @Transactional
    public void deleteFriendLink(Long id) {
        log.info("删除友链: id={}", id);
        FriendLink friendLink = getFriendLinkById(id);
        friendLink.setDeletedAt(LocalDateTime.now());
        friendLinkRepository.save(friendLink);
    }

    @Override
    @Transactional
    public void updateSortOrder(Long id, Integer sortOrder) {
        log.info("更新友链排序: id={}, sortOrder={}", id, sortOrder);
        FriendLink friendLink = getFriendLinkById(id);
        friendLink.setSortOrder(sortOrder);
        friendLinkRepository.save(friendLink);
    }

    /**
     * 转换为 VO
     */
    private FriendLinkVO toVO(FriendLink entity) {
        return FriendLinkVO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .url(entity.getUrl())
                .avatarUrl(entity.getAvatarUrl())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}