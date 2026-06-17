package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.vo.tag.TagSimpleVO;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.TagRepository;
import com.butvan.blog.service.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 标签业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final ArticleRepository articleRepository;

    @Override
    public List<Tag> listAllTags() {
        log.info("查询全部标签实体列表");
        return tagRepository.findAll();
    }

    @Override
    public List<TagSimpleVO> listSimpleTags() {
        log.info("查询全部极简标签列表");
        List<Tag> list = tagRepository.findAll();
        return list.stream()
                .map(tag -> TagSimpleVO.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .slug(tag.getSlug())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Tag saveTag(Tag tag) {
        log.info("新增或编辑保存标签: {}", tag.getName());

        // 1. 校验 slug 是否唯一
        Optional<Tag> optBySlug = tagRepository.findBySlug(tag.getSlug());
        if (tag.getId() == null) {
            // 新增
            if (optBySlug.isPresent()) {
                throw new BusinessException("标签标识(slug)已存在，请重新输入");
            }
        } else {
            // 编辑
            if (optBySlug.isPresent() && !optBySlug.get().getId().equals(tag.getId())) {
                throw new BusinessException("标签标识(slug)已存在，请重新输入");
            }
        }

        // 2. 校验 name 是否唯一
        Optional<Tag> optByName = tagRepository.findByName(tag.getName());
        if (tag.getId() == null) {
            if (optByName.isPresent()) {
                throw new BusinessException("标签名称已存在，请重新输入");
            }
        } else {
            if (optByName.isPresent() && !optByName.get().getId().equals(tag.getId())) {
                throw new BusinessException("标签名称已存在，请重新输入");
            }
        }

        return tagRepository.save(tag);
    }

    @Override
    public void deleteTag(Long id) {
        log.info("根据 ID 删除标签: {}", id);

        // 1. 校验标签是否存在
        tagRepository.findById(id)
                .orElseThrow(() -> new BusinessException("标签不存在"));

        // 2. 校验是否被文章关联
        if (articleRepository.existsByTagsId(id)) {
            throw new BusinessException("该标签已被文章关联使用，无法删除");
        }

        tagRepository.deleteById(id);
    }
}
