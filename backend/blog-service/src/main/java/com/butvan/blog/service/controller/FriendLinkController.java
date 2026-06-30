package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.friend.FriendLinkApplyDTO;
import com.butvan.blog.pojo.vo.friend.FriendLinkVO;
import com.butvan.blog.service.service.FriendLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 友链 Controller（前台 API）
 */
@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendLinkController {

    private final FriendLinkService friendLinkService;

    /**
     * 获取已批准的友链列表
     *
     * @return 友链列表
     */
    @GetMapping
    public Result<List<FriendLinkVO>> getApprovedFriendLinks(
            @RequestParam(required = false) String category) {
        log.info("获取友链列表: category={}", category);
        List<FriendLinkVO> list;
        if (category != null && !category.isEmpty()) {
            list = friendLinkService.getApprovedFriendLinksByCategory(category);
        } else {
            list = friendLinkService.getApprovedFriendLinks();
        }
        return Result.success(list);
    }

    /**
     * 申请友链
     *
     * @param dto 申请信息
     * @return 结果
     */
    @PostMapping("/apply")
    public Result<Void> applyFriendLink(@Valid @RequestBody FriendLinkApplyDTO dto) {
        log.info("申请友链: {}", dto.getName());
        friendLinkService.applyFriendLink(dto);
        return Result.success();
    }
}