package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.friend.FriendLinkApplyDTO;
import com.butvan.blog.pojo.dto.friend.WebMetaRequestDTO;
import com.butvan.blog.pojo.vo.friend.FriendLinkVO;
import com.butvan.blog.pojo.vo.friend.WebMetaVO;
import com.butvan.blog.service.service.FriendLinkService;
import com.butvan.blog.service.service.WebMetaService;
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
    private final WebMetaService webMetaService;

    /**
     * 获取已批准的友链列表
     *
     * @return 友链列表
     */
    @TrackApi("获取已批准的友链列表")
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
    @TrackApi("申请友链")
    @PostMapping("/apply")
    public Result<Void> applyFriendLink(@Valid @RequestBody FriendLinkApplyDTO dto) {
        log.info("申请友链: {}", dto.getName());
        friendLinkService.applyFriendLink(dto);
        return Result.success();
    }

    /**
     * 从 URL 抓取网站元数据（标题、描述、favicon）
     *
     * @param dto 请求参数
     * @return 网站元数据
     */
    @TrackApi("从 URL 抓取网站元数据（标题、描述、favicon）")
    @PostMapping("/fetch-meta")
    public Result<WebMetaVO> fetchWebMeta(@Valid @RequestBody WebMetaRequestDTO dto) {
        log.info("抓取网站元数据: {}", dto.getUrl());
        var meta = webMetaService.fetchWebMeta(dto.getUrl());

        // 转换为 VO
        WebMetaVO vo = WebMetaVO.builder()
                .title(meta.getTitle())
                .description(meta.getDescription())
                .faviconUrl(meta.getFaviconUrl())
                .domain(meta.getDomain())
                .success(meta.isSuccess())
                .errorMsg(meta.getErrorMsg())
                .build();

        return Result.success(vo);
    }
}
