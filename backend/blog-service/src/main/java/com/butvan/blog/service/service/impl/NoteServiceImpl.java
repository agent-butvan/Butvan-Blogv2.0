package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.utils.SlugUtils;
import com.butvan.blog.pojo.dto.note.NoteQueryDTO;
import com.butvan.blog.pojo.dto.note.NoteSaveDTO;
import com.butvan.blog.pojo.entity.Note;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.note.NoteDetailVO;
import com.butvan.blog.pojo.vo.note.NoteItemVO;
import com.butvan.blog.service.repository.NoteRepository;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.NoteService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 手记业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Override
    public PageResult pageNotes(NoteQueryDTO queryDTO) {
        log.info("分页检索手记列表，参数: {}", queryDTO);

        // 1. 解析分页参数 (前端传来的页码是 1-based, JPA 需要 0-based)
        int pageIndex = queryDTO.getPage() != null && queryDTO.getPage() > 0 ? queryDTO.getPage() - 1 : 0;
        int pageSize = queryDTO.getSize() != null && queryDTO.getSize() > 0 ? queryDTO.getSize() : 10;

        // 2. 解析排序规则 (默认按置顶降序、创建时间降序)
        Sort sort = Sort.by(Sort.Order.desc("isPinned"), Sort.Order.desc("createdAt"));
        if (StringUtils.hasText(queryDTO.getSortBy())) {
            Sort.Direction direction = "asc".equalsIgnoreCase(queryDTO.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(direction, queryDTO.getSortBy());
        }

        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        // 3. 动态构建查询 Specification
        Specification<Note> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 关键词模糊查询（匹配标题、摘要或正文）
            if (StringUtils.hasText(queryDTO.getKeyword())) {
                String likeKeyword = "%" + queryDTO.getKeyword() + "%";
                predicates.add(cb.or(
                        cb.like(root.get("title"), likeKeyword),
                        cb.like(root.get("summary"), likeKeyword),
                        cb.like(root.get("content"), likeKeyword)
                ));
            }

            // 发布状态筛选
            if (StringUtils.hasText(queryDTO.getStatus())) {
                predicates.add(cb.equal(root.get("status"), queryDTO.getStatus()));
            }

            // 心情标签筛选
            if (StringUtils.hasText(queryDTO.getMood())) {
                predicates.add(cb.equal(root.get("mood"), queryDTO.getMood()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Note> pageResult = noteRepository.findAll(spec, pageable);

        // 4. 转换实体为 VO 列表
        List<NoteItemVO> voList = pageResult.getContent().stream()
                .map(this::toItemVO)
                .collect(Collectors.toList());

        return PageResult.builder()
                .total(pageResult.getTotalElements())
                .page(pageIndex + 1)
                .size(pageSize)
                .records(voList)
                .build();
    }

    @Override
    public NoteDetailVO getNoteDetail(String idOrSlug) {
        log.info("获取手记详情，标识: {}", idOrSlug);
        Note note = null;
        try {
            Long id = Long.parseLong(idOrSlug);
            note = noteRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            // 忽略异常，按 slug 查找
        }

        if (note == null) {
            note = noteRepository.findBySlug(idOrSlug)
                    .orElseThrow(() -> new BusinessException("手记不存在或已被删除"));
        }
        return toDetailVO(note);
    }

    @Override
    @Transactional
    public NoteDetailVO saveNote(NoteSaveDTO dto, String username) {
        log.info("创建新手记，标题: {}, 创作者: {}", dto.getTitle(), username);

        // 1. 获取作者对象
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("当前操作的账户信息不存在"));

        // 2. 构造手记实体并填充基本字段
        Note note = Note.builder()
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .content(dto.getContent())
                .contentHtml(dto.getContent()) // contentHtml 先保存 Markdown，由前端渲染
                .coverImageUrl(dto.getCoverImageUrl())
                .mood(dto.getMood())
                .weather(dto.getWeather())
                .location(dto.getLocation())
                .status(dto.getStatus())
                .isPinned(dto.getIsPinned())
                .author(author)
                .build();

        // 3. 处理 URL 友好 slug (若为空，则根据 title 自动生成)
        if (StringUtils.hasText(dto.getSlug())) {
            note.setSlug(dto.getSlug());
        } else {
            note.setSlug(SlugUtils.toSlug(dto.getTitle()));
        }

        Note saved = noteRepository.save(note);

        return toDetailVO(saved);
    }

    @Override
    @Transactional
    public NoteDetailVO updateNote(Long id, NoteSaveDTO dto) {
        log.info("更新手记，ID: {}", id);
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("手记不存在或已被删除"));

        // 覆盖基础属性
        note.setTitle(dto.getTitle());
        note.setSummary(dto.getSummary());
        note.setContent(dto.getContent());
        note.setContentHtml(dto.getContent());
        note.setCoverImageUrl(dto.getCoverImageUrl());
        note.setMood(dto.getMood());
        note.setWeather(dto.getWeather());
        note.setLocation(dto.getLocation());
        note.setStatus(dto.getStatus());
        note.setIsPinned(dto.getIsPinned());

        if (StringUtils.hasText(dto.getSlug())) {
            note.setSlug(dto.getSlug());
        }

        Note updated = noteRepository.save(note);

        return toDetailVO(updated);
    }

    @Override
    @Transactional
    public void deleteNote(Long id) {
        log.info("软删除手记，ID: {}", id);
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("手记不存在或已被删除"));

        // 设置逻辑删除标记
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    /**
     * 辅助转换：Note -> NoteItemVO
     */
    private NoteItemVO toItemVO(Note note) {
        return NoteItemVO.builder()
                .id(note.getId())
                .title(note.getTitle())
                .slug(note.getSlug())
                .summary(note.getSummary())
                .coverImageUrl(note.getCoverImageUrl())
                .mood(note.getMood())
                .weather(note.getWeather())
                .location(note.getLocation())
                .authorName(note.getAuthor() != null ? note.getAuthor().getNickname() : null)
                .status(note.getStatus())
                .isPinned(note.getIsPinned())
                .viewCount(note.getViewCount())
                .likeCount(note.getLikeCount())
                .commentCount(note.getCommentCount())
                .publishedAt(note.getPublishedAt())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }

    /**
     * 辅助转换：Note -> NoteDetailVO
     */
    private NoteDetailVO toDetailVO(Note note) {
        return NoteDetailVO.builder()
                .id(note.getId())
                .title(note.getTitle())
                .slug(note.getSlug())
                .summary(note.getSummary())
                .coverImageUrl(note.getCoverImageUrl())
                .mood(note.getMood())
                .weather(note.getWeather())
                .location(note.getLocation())
                .authorName(note.getAuthor() != null ? note.getAuthor().getNickname() : null)
                .status(note.getStatus())
                .isPinned(note.getIsPinned())
                .viewCount(note.getViewCount())
                .likeCount(note.getLikeCount())
                .commentCount(note.getCommentCount())
                .publishedAt(note.getPublishedAt())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .content(note.getContent())
                .contentHtml(note.getContentHtml())
                .wordCount(note.getWordCount())
                .readingTime(note.getReadingTime())
                .build();
    }
}
