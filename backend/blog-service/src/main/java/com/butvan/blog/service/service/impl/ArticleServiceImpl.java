package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.utils.SlugUtils;
import com.butvan.blog.pojo.dto.article.ArticleQueryDTO;
import com.butvan.blog.pojo.dto.article.ArticleSaveDTO;
import com.butvan.blog.pojo.entity.Article;
import com.butvan.blog.pojo.entity.ArticleLike;
import com.butvan.blog.pojo.entity.Category;
import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.pojo.vo.article.ArticleDetailVO;
import com.butvan.blog.pojo.vo.article.ArticleItemVO;
import com.butvan.blog.pojo.vo.article.ArticleLikeVO;
import com.butvan.blog.service.repository.ArticleLikeRepository;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CategoryRepository;
import com.butvan.blog.service.repository.DailyStatsRepository;
import com.butvan.blog.service.repository.TagRepository;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.ArticleService;
import jakarta.persistence.criteria.Join;
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
import java.util.*;
import java.util.stream.Collectors;

/**
 * 文章业务服务实现层
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final ArticleLikeRepository articleLikeRepository;
    private final DailyStatsRepository dailyStatsRepository;

    @Override
    public PageResult pageArticles(ArticleQueryDTO queryDTO) {
        log.info("分页检索文章列表，参数: {}", queryDTO);
        try {
            dailyStatsRepository.incrementTodayPv();
        } catch (Exception e) {
            log.warn("累加每日流量PV失败: {}", e.getMessage());
        }
        
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
        Specification<Article> spec = (root, query, cb) -> {
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
            
            // 分类筛选
            if (queryDTO.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), queryDTO.getCategoryId()));
            }
            
            // 标签筛选
            if (queryDTO.getTagId() != null) {
                Join<Article, Tag> tagJoin = root.join("tags");
                predicates.add(cb.equal(tagJoin.get("id"), queryDTO.getTagId()));
            }
            
            // 内容类型筛选
            if (StringUtils.hasText(queryDTO.getContentType())) {
                predicates.add(cb.equal(root.get("contentType"), queryDTO.getContentType()));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<Article> pageResult = articleRepository.findAll(spec, pageable);
        
        // 4. 转换实体为 VO 列表
        List<ArticleItemVO> voList = pageResult.getContent().stream()
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
    public ArticleDetailVO getArticleDetail(String idOrSlug) {
        log.info("获取文章详情，标识: {}", idOrSlug);
        try {
            dailyStatsRepository.incrementTodayPv();
        } catch (Exception e) {
            log.warn("累加每日流量PV失败: {}", e.getMessage());
        }
        Article article = null;
        try {
            Long id = Long.parseLong(idOrSlug);
            article = articleRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            // 忽略异常，按 slug 查找
        }
        
        if (article == null) {
            article = articleRepository.findBySlug(idOrSlug).orElse(null);
        }

        if (article == null) {
            // 尝试将 idOrSlug 转换为 URL 编码的 slug 形式（比如前端传过来的是已解码的中文标题）
            String encodedSlug = SlugUtils.toSlug(idOrSlug);
            article = articleRepository.findBySlug(encodedSlug).orElse(null);
        }

        if (article == null) {
            throw new BusinessException("文章不存在或已被删除");
        }
        return toDetailVO(article);
    }

    @Override
    @Transactional
    public ArticleDetailVO saveArticle(ArticleSaveDTO dto, String username) {
        log.info("创建新文章，标题: {}, 创作者: {}", dto.getTitle(), username);
        
        // 1. 获取作者对象
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("当前操作的账户信息不存在"));
        
        // 2. 构造文章实体并填充基本字段
        Article article = Article.builder()
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .content(dto.getContent())
                .contentHtml(dto.getContent()) // 极简处理：contentHtml 直接先保存 Markdown，由前端渲染
                .coverImageUrl(dto.getCoverImageUrl())
                .status(dto.getStatus())
                .visibility(dto.getVisibility())
                .password(dto.getPassword())
                .isPinned(dto.getIsPinned())
                .isFeatured(dto.getIsFeatured())
                .isAllowComment(dto.getIsAllowComment())
                .contentType(dto.getContentType())
                .template(dto.getTemplate())
                .seoTitle(dto.getSeoTitle())
                .seoDescription(dto.getSeoDescription())
                .seoKeywords(dto.getSeoKeywords())
                .author(author)
                .build();
        
        // 3. 处理 URL 友好 slug (若为空，则根据 title 自动生成)
        if (StringUtils.hasText(dto.getSlug())) {
            article.setSlug(dto.getSlug());
        } else {
            article.setSlug(SlugUtils.toSlug(dto.getTitle()));
        }
        
        // 4. 关联分类
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("指定的分类不存在"));
            article.setCategory(category);
        }
        
        // 5. 关联多对多标签
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(dto.getTagIds());
            article.setTags(new HashSet<>(tags));
        }
        
        Article saved = articleRepository.save(article);
        
        // 6. 更新分类与标签中的已发布文章冗余计数
        refreshCounters();
        
        return toDetailVO(saved);
    }

    @Override
    @Transactional
    public ArticleDetailVO updateArticle(Long id, ArticleSaveDTO dto) {
        log.info("更新文章，ID: {}", id);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在或已被删除"));
        
        // 1. 覆盖基础属性
        article.setTitle(dto.getTitle());
        article.setSummary(dto.getSummary());
        article.setContent(dto.getContent());
        article.setContentHtml(dto.getContent());
        article.setCoverImageUrl(dto.getCoverImageUrl());
        article.setStatus(dto.getStatus());
        article.setVisibility(dto.getVisibility());
        article.setPassword(dto.getPassword());
        article.setIsPinned(dto.getIsPinned());
        article.setIsFeatured(dto.getIsFeatured());
        article.setIsAllowComment(dto.getIsAllowComment());
        article.setContentType(dto.getContentType());
        article.setTemplate(dto.getTemplate());
        article.setSeoTitle(dto.getSeoTitle());
        article.setSeoDescription(dto.getSeoDescription());
        article.setSeoKeywords(dto.getSeoKeywords());
        
        if (StringUtils.hasText(dto.getSlug())) {
            article.setSlug(dto.getSlug());
        } else {
            article.setSlug(SlugUtils.toSlug(dto.getTitle()));
        }
        
        // 2. 覆盖分类关联
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("指定的分类不存在"));
            article.setCategory(category);
        } else {
            article.setCategory(null);
        }
        
        // 3. 覆盖多对多标签关联
        if (dto.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(dto.getTagIds());
            article.setTags(new HashSet<>(tags));
        } else {
            article.getTags().clear();
        }
        
        Article updated = articleRepository.save(article);
        
        // 4. 更新分类与标签计数
        refreshCounters();
        
        return toDetailVO(updated);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        log.info("软删除文章，ID: {}", id);
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在或已被删除"));
        
        // 设置逻辑删除标记
        article.setDeletedAt(LocalDateTime.now());
        articleRepository.save(article);
        
        // 更新分类与标签计数
        refreshCounters();
    }

    @Override
    public List<ArticleItemVO> listSimpleArticles() {
        log.info("查询全部已发布文章极简列表");
        // 获取所有未删除且状态为已发布的文章
        Specification<Article> spec = (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");
        List<Article> list = articleRepository.findAll(spec);
        return list.stream()
                .map(this::toItemVO)
                .collect(Collectors.toList());
    }

    /**
     * 辅助转换：Article -> ArticleItemVO
     */
    private ArticleItemVO toItemVO(Article article) {
        return ArticleItemVO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .coverImageUrl(article.getCoverImageUrl())
                .categoryName(article.getCategory() != null ? article.getCategory().getName() : null)
                .authorName(article.getAuthor() != null ? article.getAuthor().getNickname() : null)
                .status(article.getStatus())
                .visibility(article.getVisibility())
                .contentType(article.getContentType())
                .isPinned(article.getIsPinned())
                .isFeatured(article.getIsFeatured())
                .viewCount(article.getViewCount())
                .commentCount(article.getCommentCount())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    /**
     * 辅助转换：Article -> ArticleDetailVO
     */
    private ArticleDetailVO toDetailVO(Article article) {
        List<Long> tagIds = new ArrayList<>();
        List<String> tagNames = new ArrayList<>();
        if (article.getTags() != null) {
            for (Tag tag : article.getTags()) {
                tagIds.add(tag.getId());
                tagNames.add(tag.getName());
            }
        }
        
        return ArticleDetailVO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .summary(article.getSummary())
                .coverImageUrl(article.getCoverImageUrl())
                .categoryName(article.getCategory() != null ? article.getCategory().getName() : null)
                .authorName(article.getAuthor() != null ? article.getAuthor().getNickname() : null)
                .status(article.getStatus())
                .visibility(article.getVisibility())
                .contentType(article.getContentType())
                .isPinned(article.getIsPinned())
                .isFeatured(article.getIsFeatured())
                .viewCount(article.getViewCount())
                .commentCount(article.getCommentCount())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .content(article.getContent())
                .contentHtml(article.getContentHtml())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .tagIds(tagIds)
                .tagNames(tagNames)
                .password(article.getPassword())
                .isAllowComment(article.getIsAllowComment())
                .likeCount(article.getLikeCount())
                .wordCount(article.getWordCount())
                .readingTime(article.getReadingTime())
                .seoTitle(article.getSeoTitle())
                .seoDescription(article.getSeoDescription())
                .seoKeywords(article.getSeoKeywords())
                .template(article.getTemplate())
                .deletedAt(article.getDeletedAt())
                .build();
    }

    /**
     * 刷新分类和标签下已发布且未删除文章的冗余总数
     */
    private void refreshCounters() {
        try {
            log.info("触发分类与标签关联文章冗余计数刷新");
            
            // 1. 获取所有文章并重新累加分类已发布文章数
            List<Category> categories = categoryRepository.findAll();
            for (Category category : categories) {
                Specification<Article> spec = (root, query, cb) -> cb.and(
                        cb.equal(root.get("category").get("id"), category.getId()),
                        cb.equal(root.get("status"), "PUBLISHED")
                );
                long count = articleRepository.count(spec);
                category.setArticleCount((int) count);
                categoryRepository.save(category);
            }
            
            // 2. 获取所有标签并重新累加标签关联已发布文章数
            List<Tag> tags = tagRepository.findAll();
            for (Tag tag : tags) {
                Specification<Article> spec = (root, query, cb) -> {
                    Join<Article, Tag> tagJoin = root.join("tags");
                    return cb.and(
                            cb.equal(tagJoin.get("id"), tag.getId()),
                            cb.equal(root.get("status"), "PUBLISHED")
                    );
                };
                long count = articleRepository.count(spec);
                tag.setArticleCount((int) count);
                tagRepository.save(tag);
            }
        } catch (Exception e) {
            log.error("刷新文章冗余计数失败", e);
        }
    }

    @Override
    @Transactional
    public Long likeArticle(Long id, String ipAddress, String userAgent, Long userId) {
        log.info("游客或用户尝试切换点赞状态，文章ID: {}, IP: {}, UA: {}, 用户ID: {}", id, ipAddress, userAgent, userId);
        
        // 1. 查找文章
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在或已被删除"));
        
        if (!"PUBLISHED".equalsIgnoreCase(article.getStatus())) {
            throw new BusinessException("只能对已发布的文章进行点赞操作");
        }
        
        // 2. UA 截断以适配数据库字段长度限制
        String truncatedUa = userAgent;
        if (truncatedUa != null && truncatedUa.length() > 500) {
            truncatedUa = truncatedUa.substring(0, 500);
        }
        
        // 3. 校验 24 小时内同一设备/用户账号是否已经点赞过 (以当前时间减去 24 小时为界限)
        LocalDateTime limitTime = LocalDateTime.now().minusHours(24);
        Optional<ArticleLike> existingLike = Optional.empty();
        if (userId != null) {
            // 已登录用户：优先通过用户ID检索
            existingLike = articleLikeRepository.findFirstByArticleIdAndUserIdAndCreatedAtAfter(id, userId, limitTime);
        } else {
            // 游客：通过 IP & UA 联合检索
            existingLike = articleLikeRepository.findFirstByArticleIdAndIpAddressAndUserAgentAndCreatedAtAfter(
                    id, ipAddress, truncatedUa, limitTime
            );
        }
        
        // 4. 双向切换（Toggle）逻辑
        Long currentLikes = article.getLikeCount();
        if (currentLikes == null) {
            currentLikes = 0L;
        }

        if (existingLike.isPresent()) {
            // 已点过赞，执行取消点赞逻辑
            articleLikeRepository.delete(existingLike.get());
            article.setLikeCount(currentLikes > 0 ? currentLikes - 1 : 0L);
            articleRepository.save(article);
            log.info("文章点赞取消成功，当前最新点赞数: {}", article.getLikeCount());
        } else {
            // 未点过赞，执行点赞逻辑
            ArticleLike articleLike = ArticleLike.builder()
                    .articleId(id)
                    .ipAddress(ipAddress)
                    .userAgent(truncatedUa)
                    .userId(userId)
                    .build();
            articleLikeRepository.save(articleLike);
            
            article.setLikeCount(currentLikes + 1);
            articleRepository.save(article);
            log.info("文章点赞成功，当前最新点赞数: {}", article.getLikeCount());
        }
        
        return article.getLikeCount();
    }

    @Override
    public PageResult pageLikes(Integer page, Integer size, String keyword) {
        log.info("分页查询点赞流水记录，page: {}, size: {}, keyword: {}", page, size, keyword);
        
        int pageIndex = page != null && page > 0 ? page - 1 : 0;
        int pageSize = size != null && size > 0 ? size : 10;
        
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Order.desc("createdAt")));
        
        Specification<ArticleLike> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (StringUtils.hasText(keyword)) {
                String likeKeyword = "%" + keyword + "%";
                
                // 1. 通过文章标题模糊查询符合条件的文章 ID 列表
                List<Long> matchedArticleIds = new ArrayList<>();
                Specification<Article> artSpec = (aRoot, aQuery, aCb) -> aCb.like(aRoot.get("title"), likeKeyword);
                List<Article> matchedArticles = articleRepository.findAll(artSpec);
                for (Article art : matchedArticles) {
                    matchedArticleIds.add(art.getId());
                }
                
                // 2. 构建 Predicate: IP 模糊匹配 OR 文章 ID 属于匹配列表
                Predicate ipPredicate = cb.like(root.get("ipAddress"), likeKeyword);
                if (!matchedArticleIds.isEmpty()) {
                    Predicate articlePredicate = root.get("articleId").in(matchedArticleIds);
                    predicates.add(cb.or(ipPredicate, articlePredicate));
                } else {
                    predicates.add(ipPredicate);
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<ArticleLike> result = articleLikeRepository.findAll(spec, pageable);
        
        // 转换 VO 并装配关联属性
        List<ArticleLikeVO> list = result.getContent().stream().map(like -> {
            // 获取文章标题与 slug
            String articleTitle = "未知文章";
            String articleSlug = "";
            Article article = articleRepository.findById(like.getArticleId()).orElse(null);
            if (article != null) {
                articleTitle = article.getTitle();
                articleSlug = article.getSlug();
            }
            
            // 获取点赞用户昵称和头像
            String userNickname = "游客";
            String userAvatar = null;
            if (like.getUserId() != null) {
                User user = userRepository.findById(like.getUserId()).orElse(null);
                if (user != null) {
                    userNickname = user.getNickname();
                    userAvatar = user.getAvatarUrl();
                }
            }
            
            return ArticleLikeVO.builder()
                    .id(like.getId())
                    .articleId(like.getArticleId())
                    .articleTitle(articleTitle)
                    .articleSlug(articleSlug)
                    .ipAddress(like.getIpAddress())
                    .userAgent(like.getUserAgent())
                    .userId(like.getUserId())
                    .userNickname(userNickname)
                    .userAvatar(userAvatar)
                    .createdAt(like.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
        
        return PageResult.builder()
                .total(result.getTotalElements())
                .page(pageIndex + 1)
                .size(pageSize)
                .records(list)
                .build();
    }

    @Override
    @Transactional
    public void deleteLikes(List<Long> ids) {
        log.info("管理端批量物理删除点赞记录，IDs: {}", ids);
        if (ids != null && !ids.isEmpty()) {
            articleLikeRepository.deleteAllByIdInBatch(ids);
        }
    }
}
