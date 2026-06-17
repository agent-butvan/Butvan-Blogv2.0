package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.vo.tag.TagSimpleVO;
import com.butvan.blog.service.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/**
 * 标签业务 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class TagController {

    private final TagService tagService;

    /**
     * 【公开/管理端】获取全部标签的完整实体列表
     *
     * @return 统一格式 Result 包装的标签实体列表
     */
    @GetMapping("/tags")
    public Result<List<Tag>> listAllTags() {
        log.info("获取全部标签实体列表 API 请求");
        List<Tag> list = tagService.listAllTags();
        return Result.success(list);
    }

    /**
     * 【公开/管理端】获取全部标签的极简下拉信息列表 (仅含 id, name, slug)
     *
     * @return 统一格式 Result 包装的极简标签列表
     */
    @GetMapping("/tags/simple")
    public Result<List<TagSimpleVO>> listSimpleTags() {
        log.info("获取极简标签列表 API 请求");
        List<TagSimpleVO> list = tagService.listSimpleTags();
        return Result.success(list);
    }
}
