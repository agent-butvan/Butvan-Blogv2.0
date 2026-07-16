package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.vo.tag.TagSimpleVO;
import com.butvan.blog.service.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
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
    @TrackApi("【公开/管理端】获取全部标签的完整实体列表")
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
    @TrackApi("【公开/管理端】获取全部标签的极简下拉信息列表 (仅含 id, name, slug)")
    @GetMapping("/tags/simple")
    public Result<List<TagSimpleVO>> listSimpleTags() {
        log.info("获取极简标签列表 API 请求");
        List<TagSimpleVO> list = tagService.listSimpleTags();
        return Result.success(list);
    }

    /**
     * 【管理端】新建标签
     *
     * @param tag 标签实体数据
     * @return 统一格式 Result 包装的新增实体数据
     */
    @TrackApi("【管理端】新建标签")
    @PostMapping("/tags")
    public Result<Tag> createTag(@RequestBody Tag tag) {
        log.info("新建标签 API 请求: {}", tag.getName());
        Tag saved = tagService.saveTag(tag);
        return Result.success(saved);
    }

    /**
     * 【管理端】更新标签
     *
     * @param id 标签主键 ID
     * @param tag 标签实体数据
     * @return 统一格式 Result 包装的修改后实体数据
     */
    @TrackApi("【管理端】更新标签")
    @PutMapping("/tags/{id}")
    public Result<Tag> updateTag(@PathVariable Long id, @RequestBody Tag tag) {
        log.info("更新标签 API 请求: id={}, name={}", id, tag.getName());
        tag.setId(id);
        Tag updated = tagService.saveTag(tag);
        return Result.success(updated);
    }

    /**
     * 【管理端】根据 ID 删除标签
     *
     * @param id 待删除标签主键 ID
     * @return 统一格式 Result 包装的空返回
     */
    @TrackApi("【管理端】根据 ID 删除标签")
    @DeleteMapping("/tags/{id}")
    public Result<Void> deleteTag(@PathVariable Long id) {
        log.info("删除标签 API 请求: id={}", id);
        tagService.deleteTag(id);
        return Result.success();
    }
}
