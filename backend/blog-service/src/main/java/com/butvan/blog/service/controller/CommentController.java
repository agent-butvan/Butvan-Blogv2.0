package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import com.butvan.blog.service.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 评论业务 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    /**
     * 【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表
     *
     * @param articleId 文章唯一主键 ID
     * @return 统一格式 Result 包装的树形评论 VO 列表
     */
    @GetMapping("/articles/{articleId}/comments")
    public Result<List<CommentVO>> getCommentsByArticleId(@PathVariable Long articleId) {
        log.info("前台获取文章评论树 API 请求: articleId={}", articleId);
        List<CommentVO> comments = commentService.listCommentsByArticleId(articleId);
        return Result.success(comments);
    }

    /**
     * 【公开前台】提交发表新评论 (支持独立评论及嵌套回复)
     *
     * @param articleId 评论所属的文章唯一主键 ID
     * @param dto 评论的载荷数据 (昵称、邮箱、网站、内容)
     * @param request HTTP Servlet 请求对象，用于解析 IP 与 UA
     * @return 统一格式 Result 包装的新增评论 VO 实体对象
     */
    @PostMapping("/articles/{articleId}/comments")
    public Result<CommentVO> createComment(
            @PathVariable Long articleId,
            @RequestBody CommentCreateDTO dto,
            HttpServletRequest request) {
        log.info("前台提交文章评论 API 请求: articleId={}, visitorName={}", articleId, dto.getVisitorName());
        
        // 解析真实 IP，考虑代理层情况
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        CommentVO savedVO = commentService.createComment(articleId, dto, ipAddress, userAgent);
        return Result.success(savedVO);
    }

    /**
     * 【公开前台】评论点赞喜欢自增
     *
     * @param commentId 评论唯一主键 ID
     * @return 空成功 Result 响应
     */
    @PostMapping("/comments/{commentId}/like")
    public Result<Void> likeComment(@PathVariable Long commentId) {
        log.info("前台评论点赞 API 请求: commentId={}", commentId);
        commentService.likeComment(commentId);
        return Result.success();
    }
}
