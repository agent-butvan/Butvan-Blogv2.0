package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.entity.Article;
import com.butvan.blog.pojo.entity.Comment;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import com.butvan.blog.pojo.entity.User;
import com.butvan.blog.service.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.service.repository.ArticleRepository;
import com.butvan.blog.service.repository.CommentRepository;
import com.butvan.blog.service.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 评论业务服务层接口实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Override
    public List<CommentVO> listCommentsByArticleId(Long articleId) {
        log.info("查询文章评论树: articleId={}", articleId);
        
        // 1. 查询全部已审核通过 (APPROVED) 的评论
        List<Comment> comments = commentRepository.findByArticleIdAndStatusOrderByCreatedAtAsc(articleId, "APPROVED");
        
        // 2. 将实体列表批量转化为 VO，并利用 Map 进行缓存检索
        Map<Long, CommentVO> voMap = comments.stream()
                .map(c -> {
                    String nickname = c.getUser() != null ? c.getUser().getNickname() : c.getVisitorName();
                    String avatarUrl = null;
                    if (c.getUser() != null) {
                        avatarUrl = c.getUser().getAvatarUrl();
                        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                            avatarUrl = getGravatarUrl(c.getUser().getEmail());
                        }
                    } else {
                        avatarUrl = getGravatarUrl(c.getVisitorEmail());
                    }
                    return CommentVO.builder()
                            .id(c.getId())
                            .articleId(c.getArticle().getId())
                            .parentId(c.getParentId())
                            .userId(c.getUser() != null ? c.getUser().getId() : null)
                            .nickname(nickname)
                            .avatarUrl(avatarUrl)
                            .visitorWebsite(c.getVisitorWebsite())
                            .content(c.getContent())
                            .likeCount(c.getLikeCount())
                            .isAuthorReplied(c.getIsAuthorReplied())
                            .userAgent(c.getUserAgent())
                            .createdAt(c.getCreatedAt())
                            .replies(new ArrayList<>())
                            .build();
                })
                .collect(Collectors.toMap(CommentVO::getId, vo -> vo));

        List<CommentVO> rootComments = new ArrayList<>();

        // 3. 构建大厂经典清晰的两级树形回复盖楼结构 (顶级评论为一级，子孙回复全部放在顶级评论的 replies 列表里)
        for (Comment c : comments) {
            CommentVO vo = voMap.get(c.getId());
            if (c.getParentId() == null) {
                rootComments.add(vo);
            } else {
                CommentVO parentVO = voMap.get(c.getParentId());
                if (parentVO != null) {
                    // 设置被回复人的昵称
                    vo.setReplyTo(parentVO.getNickname());
                    // 沿着 parent 链往上追溯，找到最顶层的顶级评论
                    CommentVO rootVO = findRootComment(vo, voMap);
                    if (rootVO != null) {
                        rootVO.getReplies().add(vo);
                    } else {
                        rootComments.add(vo); // 兜底处理
                    }
                } else {
                    rootComments.add(vo); // 父级丢失，则升级为顶级评论
                }
            }
        }

        return rootComments;
    }

    @Transactional
    @Override
    public CommentVO createComment(Long articleId, CommentCreateDTO dto, String ipAddress, String userAgent) {
        log.info("提交评论: articleId={}, visitorName={}", articleId, dto.getVisitorName());

        // 1. 检验文章及是否开放评论状态
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new BusinessException("目标文章不存在"));
        
        if (!Boolean.TRUE.equals(article.getIsAllowComment())) {
            throw new BusinessException("该文章目前已关闭评论模块，无法发布评论");
        }

        // 2. 字段空校验
        if (dto.getVisitorName() == null || dto.getVisitorName().trim().isEmpty()) {
            throw new BusinessException("评论昵称不能为空");
        }
        if (dto.getVisitorEmail() == null || dto.getVisitorEmail().trim().isEmpty()) {
            throw new BusinessException("电子邮箱不能为空");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new BusinessException("评论正文内容不能为空");
        }

        // 3. 校验 parentId 关联父评论合法性
        if (dto.getParentId() != null) {
            commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new BusinessException("被回复的目标评论不存在或已被删除"));
        }

        // 查询是否有绑定的 User，如果邮箱匹配，则自动关联为注册用户评论
        User matchedUser = null;
        if (dto.getVisitorEmail() != null && !dto.getVisitorEmail().trim().isEmpty()) {
            matchedUser = userRepository.findByEmail(dto.getVisitorEmail().trim()).orElse(null);
        }

        // 4. 构建实体类并持久化保存
        Comment comment = Comment.builder()
                .article(article)
                .parentId(dto.getParentId())
                .user(matchedUser)
                .visitorName(dto.getVisitorName().trim())
                .visitorEmail(dto.getVisitorEmail().trim())
                .visitorWebsite(dto.getVisitorWebsite() != null ? dto.getVisitorWebsite().trim() : null)
                .content(dto.getContent().trim())
                .status("APPROVED") // 默认设置为 APPROVED 直接前台可见
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .likeCount(0)
                .isAuthorReplied(matchedUser != null && ("ADMIN".equalsIgnoreCase(matchedUser.getRole()) || "AUTHOR".equalsIgnoreCase(matchedUser.getRole())))
                .build();

        Comment saved = commentRepository.save(comment);

        // 5. 更新文章表的 comment_count 冗余计数字段
        long approvedCount = commentRepository.countByArticleIdAndStatus(articleId, "APPROVED");
        article.setCommentCount(approvedCount);
        articleRepository.save(article);

        // 6. 转换构建为当前最新保存的评论 VO 返回对象
        String avatarUrl = null;
        if (saved.getUser() != null) {
            avatarUrl = saved.getUser().getAvatarUrl();
            if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                avatarUrl = getGravatarUrl(saved.getUser().getEmail());
            }
        } else {
            avatarUrl = getGravatarUrl(saved.getVisitorEmail());
        }
        String replyToName = null;
        if (saved.getParentId() != null) {
            Comment parent = commentRepository.findById(saved.getParentId()).orElse(null);
            if (parent != null) {
                replyToName = parent.getUser() != null ? parent.getUser().getNickname() : parent.getVisitorName();
            }
        }

        return CommentVO.builder()
                .id(saved.getId())
                .articleId(saved.getArticle().getId())
                .parentId(saved.getParentId())
                .userId(saved.getUser() != null ? saved.getUser().getId() : null)
                .nickname(saved.getVisitorName())
                .avatarUrl(avatarUrl)
                .visitorWebsite(saved.getVisitorWebsite())
                .content(saved.getContent())
                .likeCount(saved.getLikeCount())
                .isAuthorReplied(saved.getIsAuthorReplied())
                .userAgent(saved.getUserAgent())
                .createdAt(saved.getCreatedAt())
                .replyTo(replyToName)
                .replies(new ArrayList<>())
                .build();
    }

    @Transactional
    @Override
    public void likeComment(Long commentId) {
        log.info("评论被点赞: id={}", commentId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException("目标点赞评论不存在"));
        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepository.save(comment);
    }

    /**
     * 辅助算法：迭代追溯最顶级的评论
     */
    private CommentVO findRootComment(CommentVO child, Map<Long, CommentVO> voMap) {
        CommentVO current = child;
        while (current.getParentId() != null) {
            CommentVO parent = voMap.get(current.getParentId());
            if (parent == null) {
                break;
            }
            current = parent;
        }
        return current;
    }

    /**
     * 辅助算法：对邮箱地址作 MD5 处理拉取 Gravatar 随机但固定的极客风头像
     */
    private String getGravatarUrl(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(email.trim().toLowerCase().getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(Integer.toHexString((b & 0xFF) | 0x100).substring(1, 3));
            }
            // 使用 identicon 生成极富美感的对称像素风格头像，极佳契合博客整体设计
            return "https://www.gravatar.com/avatar/" + sb.toString() + "?d=identicon";
        } catch (Exception e) {
            log.error("Gravatar 头像哈希解析失败: {}", e.getMessage());
            return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        }
    }

    @Override
    public PageResult listAdminComments(String status, String keyword, Integer page, Integer size) {
        log.info("后台查询评论列表: status={}, keyword={}, page={}, size={}", status, keyword, page, size);

        // 1. 解析分页参数 (前端传来的页码是 1-based, JPA 需要 0-based)
        int pageIndex = page != null && page > 0 ? page - 1 : 0;
        int pageSize = size != null && size > 0 ? size : 10;
        
        // 默认按创建时间降序
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        Specification<Comment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 状态筛选
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            // 2. 关键词模糊检索 (匹配 visitorName、visitorEmail、content 或 user.nickname)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likePattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate visitorNameLike = cb.like(cb.lower(root.get("visitorName")), likePattern);
                Predicate visitorEmailLike = cb.like(cb.lower(root.get("visitorEmail")), likePattern);
                Predicate contentLike = cb.like(cb.lower(root.get("content")), likePattern);
                Predicate userNicknameLike = cb.like(cb.lower(root.join("user", jakarta.persistence.criteria.JoinType.LEFT).get("nickname")), likePattern);

                predicates.add(cb.or(visitorNameLike, visitorEmailLike, contentLike, userNicknameLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Comment> commentPage = commentRepository.findAll(spec, pageable);

        List<CommentVO> voList = commentPage.getContent().stream()
                .map(c -> {
                    String nickname = c.getUser() != null ? c.getUser().getNickname() : c.getVisitorName();
                    String avatarUrl = null;
                    if (c.getUser() != null) {
                        avatarUrl = c.getUser().getAvatarUrl();
                        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
                            avatarUrl = getGravatarUrl(c.getUser().getEmail());
                        }
                    } else {
                        avatarUrl = getGravatarUrl(c.getVisitorEmail());
                    }
                    
                    String replyTo = null;
                    if (c.getParentId() != null) {
                        Comment parent = commentRepository.findById(c.getParentId()).orElse(null);
                        if (parent != null) {
                            replyTo = parent.getUser() != null ? parent.getUser().getNickname() : parent.getVisitorName();
                        }
                    }

                    return CommentVO.builder()
                            .id(c.getId())
                            .articleId(c.getArticle().getId())
                            .parentId(c.getParentId())
                            .userId(c.getUser() != null ? c.getUser().getId() : null)
                            .nickname(nickname)
                            .avatarUrl(avatarUrl)
                            .visitorWebsite(c.getVisitorWebsite())
                            .content(c.getContent())
                            .likeCount(c.getLikeCount())
                            .isAuthorReplied(c.getIsAuthorReplied())
                            .replyTo(replyTo)
                            .status(c.getStatus())
                            .articleTitle(c.getArticle().getTitle())
                            .articleSlug(c.getArticle().getSlug())
                            .createdAt(c.getCreatedAt())
                            .visitorEmail(c.getVisitorEmail())
                            .ipAddress(c.getIpAddress())
                            .userAgent(c.getUserAgent())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResult.builder()
                .total(commentPage.getTotalElements())
                .page(commentPage.getNumber() + 1)
                .size(commentPage.getSize())
                .records(voList)
                .build();
    }

    @Transactional
    @Override
    public void updateCommentStatus(Long id, String status) {
        log.info("修改评论状态: id={}, status={}", id, status);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标评论不存在"));
        
        String oldStatus = comment.getStatus();
        comment.setStatus(status);
        commentRepository.save(comment);

        if (!oldStatus.equals(status)) {
            Article article = comment.getArticle();
            long approvedCount = commentRepository.countByArticleIdAndStatus(article.getId(), "APPROVED");
            article.setCommentCount(approvedCount);
            articleRepository.save(article);
        }
    }

    @Transactional
    @Override
    public CommentVO replyComment(Long id, String content, String username) {
        log.info("管理员回复评论: id={}, username={}, content={}", id, username, content);
        
        Comment parent = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("要回复的评论不存在"));
        
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("当前登录管理员账号异常"));

        Comment reply = Comment.builder()
                .article(parent.getArticle())
                .parentId(parent.getId())
                .user(admin)
                .visitorName(admin.getNickname())
                .visitorEmail(admin.getEmail())
                .content(content.trim())
                .status("APPROVED")
                .ipAddress("127.0.0.1")
                .userAgent("System Admin Panel")
                .likeCount(0)
                .isAuthorReplied(false)
                .build();
        
        Comment savedReply = commentRepository.save(reply);

        parent.setIsAuthorReplied(true);
        commentRepository.save(parent);

        Article article = parent.getArticle();
        long approvedCount = commentRepository.countByArticleIdAndStatus(article.getId(), "APPROVED");
        article.setCommentCount(approvedCount);
        articleRepository.save(article);

        return CommentVO.builder()
                .id(savedReply.getId())
                .articleId(savedReply.getArticle().getId())
                .parentId(savedReply.getParentId())
                .userId(admin.getId())
                .nickname(admin.getNickname())
                .avatarUrl(admin.getAvatarUrl())
                .content(savedReply.getContent())
                .likeCount(savedReply.getLikeCount())
                .isAuthorReplied(savedReply.getIsAuthorReplied())
                .replyTo(parent.getUser() != null ? parent.getUser().getNickname() : parent.getVisitorName())
                .status(savedReply.getStatus())
                .articleTitle(article.getTitle())
                .articleSlug(article.getSlug())
                .createdAt(savedReply.getCreatedAt())
                .build();
    }

    @Transactional
    @Override
    public void deleteComment(Long id) {
        log.info("物理删除评论: id={}", id);
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("目标删除评论不存在"));
        
        Article article = comment.getArticle();
        commentRepository.delete(comment);

        long approvedCount = commentRepository.countByArticleIdAndStatus(article.getId(), "APPROVED");
        article.setCommentCount(approvedCount);
        articleRepository.save(article);
    }
}
