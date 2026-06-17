package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.vo.tag.TagSimpleVO;
import com.butvan.blog.service.repository.TagRepository;
import com.butvan.blog.service.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 标签业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

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
}
