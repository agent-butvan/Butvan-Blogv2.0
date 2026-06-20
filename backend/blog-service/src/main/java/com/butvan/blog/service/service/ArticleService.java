package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.article.ArticleQueryDTO;
import com.butvan.blog.pojo.dto.article.ArticleSaveDTO;
import com.butvan.blog.pojo.vo.article.ArticleDetailVO;
import com.butvan.blog.pojo.vo.article.ArticleItemVO;
import java.util.List;

/**
 * 文章核心业务逻辑处理服务层接口
 */
public interface ArticleService {

    /**
     * 条件分页检索文章列表（已对逻辑删除项默认过滤）
     *
     * @param query 检索筛选条件 DTO
     * @return 分页结果 PageResult，携带文章简述 VO 列表
     */
    PageResult pageArticles(ArticleQueryDTO query);

    /**
     * 根据主键 ID 或 友好 URL slug 查找文章详细信息
     *
     * @param idOrSlug 文章唯一主键 ID 或短标识 slug
     * @return 文章完整详情 VO
     */
    ArticleDetailVO getArticleDetail(String idOrSlug);

    /**
     * 保存创建新文章
     *
     * @param dto      创建内容表单 DTO
     * @param username 创作者（当前登录管理员的登录用户名）
     * @return 最新持久化后的文章详情 VO
     */
    ArticleDetailVO saveArticle(ArticleSaveDTO dto, String username);

    /**
     * 根据 ID 编辑更新已有文章内容
     *
     * @param id  待更新的文章唯一主键
     * @param dto 变更后内容表单 DTO
     * @return 最新持久化后的文章详情 VO
     */
    ArticleDetailVO updateArticle(Long id, ArticleSaveDTO dto);

    /**
     * 根据 ID 逻辑删除指定文章（移入回收站）
     *
     * @param id 待销毁的文章主键
     */
    void deleteArticle(Long id);

    /**
     * 获取全部已发布文章的极简信息列表，供跳转选择关联使用
     *
     * @return 文章极简 VO 列表
     */
    List<ArticleItemVO> listSimpleArticles();

    /**
     * 对文章进行点赞操作（支持游客）
     * 自动记录 IP & 设备信息进行 24 小时防重复刷赞保护
     *
     * @param id        文章唯一主键 ID
     * @param ipAddress 访客客户端真实 IP 地址
     * @param userAgent 访客设备浏览器指纹（User-Agent）信息
     * @return 递增更新后的文章总点赞赞许数
     */
    Long likeArticle(Long id, String ipAddress, String userAgent);
}
