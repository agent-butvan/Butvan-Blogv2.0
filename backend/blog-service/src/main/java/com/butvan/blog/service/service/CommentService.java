package com.butvan.blog.service.service;

import com.butvan.blog.pojo.dto.comment.CommentCreateDTO;
import com.butvan.blog.pojo.vo.comment.CommentVO;
import java.util.List;

/**
 * 评论业务服务层逻辑接口
 */
public interface CommentService {

    /**
     * 根据文章 ID 查询并组装两级树形结构评论列表 (顶级评论 + replies)
     *
     * @param articleId 文章唯一主键 ID
     * @return 组装树形化包装的评论 VO 列表
     */
    List<CommentVO> listCommentsByArticleId(Long articleId);

    /**
     * 前台访客/注册用户提交新评论接口
     *
     * @param articleId 评论所属的文章唯一主键 ID
     * @param dto 提交的内容表单载荷对象 (昵称、邮箱、网站、正文)
     * @param ipAddress 客户端请求提交时的 IP 地址
     * @param userAgent 客户端请求提交时的 UA 字符串说明
     * @return 生成写入成功后的评论 VO 对象
     */
    CommentVO createComment(Long articleId, CommentCreateDTO dto, String ipAddress, String userAgent);

    /**
     * 根据评论 ID 对本条评论进行点赞增加 1
     *
     * @param commentId 评论主键 ID
     */
    void likeComment(Long commentId);
}
