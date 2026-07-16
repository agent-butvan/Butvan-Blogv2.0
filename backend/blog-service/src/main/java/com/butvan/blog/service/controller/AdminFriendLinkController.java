package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.friend.FriendLinkSaveDTO;
import com.butvan.blog.pojo.entity.FriendLink;
import com.butvan.blog.service.service.FriendLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 友链管理 Controller（后台 API）
 */
@RestController
@RequestMapping("/api/admin/friends")
@RequiredArgsConstructor
@Slf4j
public class AdminFriendLinkController {

    private final FriendLinkService friendLinkService;

    /**
     * 获取所有友链
     *
     * @return 友链列表
     */
    @TrackApi("获取所有友链")
    @GetMapping
    public Result<List<FriendLink>> getAllFriendLinks() {
        log.info("获取所有友链");
        List<FriendLink> list = friendLinkService.getAllFriendLinks();
        return Result.success(list);
    }

    /**
     * 获取友链详情
     *
     * @param id 友链ID
     * @return 友链详情
     */
    @TrackApi("获取友链详情")
    @GetMapping("/{id}")
    public Result<FriendLink> getFriendLinkById(@PathVariable Long id) {
        log.info("获取友链详情: id={}", id);
        FriendLink friendLink = friendLinkService.getFriendLinkById(id);
        return Result.success(friendLink);
    }

    /**
     * 创建友链
     *
     * @param dto 友链信息
     * @return 创建的友链
     */
    @TrackApi("创建友链")
    @PostMapping
    public Result<FriendLink> createFriendLink(@Valid @RequestBody FriendLinkSaveDTO dto) {
        log.info("创建友链: {}", dto.getName());
        FriendLink friendLink = friendLinkService.createFriendLink(dto);
        return Result.success(friendLink);
    }

    /**
     * 更新友链
     *
     * @param id  友链ID
     * @param dto 友链信息
     * @return 更新后的友链
     */
    @TrackApi("更新友链")
    @PutMapping("/{id}")
    public Result<FriendLink> updateFriendLink(@PathVariable Long id, @Valid @RequestBody FriendLinkSaveDTO dto) {
        log.info("更新友链: id={}", id);
        FriendLink friendLink = friendLinkService.updateFriendLink(id, dto);
        return Result.success(friendLink);
    }

    /**
     * 更新友链状态（审核）
     *
     * @param id     友链ID
     * @param params 包含 status 的 JSON
     * @return 结果
     */
    @TrackApi("更新友链状态（审核）")
    @PatchMapping("/{id}/status")
    public Result<Void> updateFriendLinkStatus(@PathVariable Long id, @RequestBody Map<String, String> params) {
        String status = params.get("status");
        log.info("更新友链状态: id={}, status={}", id, status);
        friendLinkService.updateFriendLinkStatus(id, status);
        return Result.success(null);
    }

    /**
     * 删除友链
     *
     * @param id 友链ID
     * @return 结果
     */
    @TrackApi("删除友链")
    @DeleteMapping("/{id}")
    public Result<Void> deleteFriendLink(@PathVariable Long id) {
        log.info("删除友链: id={}", id);
        friendLinkService.deleteFriendLink(id);
        return Result.success(null);
    }

    /**
     * 更新排序
     *
     * @param id        友链ID
     * @param params 包含 sortOrder 的 JSON
     * @return 结果
     */
    @TrackApi("更新排序")
    @PatchMapping("/{id}/sort")
    public Result<Void> updateSortOrder(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer sortOrder = params.get("sortOrder");
        log.info("更新友链排序: id={}, sortOrder={}", id, sortOrder);
        friendLinkService.updateSortOrder(id, sortOrder);
        return Result.success(null);
    }
}
