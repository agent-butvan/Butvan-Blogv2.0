package com.butvan.blog.service.controller;

import com.butvan.blog.service.annotation.TrackApi;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.article.ArticleQueryDTO;
import com.butvan.blog.pojo.dto.article.ArticleSaveDTO;
import com.butvan.blog.pojo.vo.article.ArticleDetailVO;
import com.butvan.blog.pojo.vo.article.ArticleItemVO;
import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.service.service.ArticleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

/**
 * 文章业务 API 接口控制器
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;

    /**
     * 【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)
     *
     * @param query 查询传参 DTO
     * @return 统一格式 Result 包装的分页结果 PageResult
     */
    @TrackApi("【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)")
    @GetMapping("/articles")
    public Result<PageResult> pageArticles(ArticleQueryDTO query) {
        log.info("分页查询文章列表 API 请求");
        PageResult pageResult = articleService.pageArticles(query);
        return Result.success(pageResult);
    }

    /**
     * 【管理端】获取已发布文章的极简信息列表 (仅含 id, title, slug)
     *
     * @return 统一格式 Result 包装的极简文章列表
     */
    @TrackApi("【管理端】获取已发布文章的极简信息列表 (仅含 id, title, slug)")
    @GetMapping("/articles/simple")
    public Result<List<ArticleItemVO>> listSimpleArticles() {
        log.info("获取极简已发布文章列表 API 请求");
        List<ArticleItemVO> list = articleService.listSimpleArticles();
        return Result.success(list);
    }

    /**
     * 【公开/管理端】获取文章完整详情信息
     *
     * @param idOrSlug      文章唯一主键 ID 或短链接 slug
     * @param incrementView 是否增加浏览量计数（可选，默认 true；管理端编辑传 false）
     * @return 统一格式 Result 包装的文章详情 VO
     */
    @TrackApi("【公开/管理端】获取文章完整详情信息")
    @GetMapping("/articles/{idOrSlug}")
    public Result<ArticleDetailVO> getArticleDetail(
            @PathVariable String idOrSlug,
            @RequestParam(required = false, defaultValue = "true") Boolean incrementView
    ) {
        log.info("获取文章详情 API 请求，idOrSlug: {}, incrementView: {}", idOrSlug, incrementView);
        ArticleDetailVO detail = articleService.getArticleDetail(idOrSlug, Boolean.TRUE.equals(incrementView));
        return Result.success(detail);
    }

    /**
     * 【管理端】获取文章详情用于编辑（不增加浏览量）
     *
     * @param id 文章唯一主键 ID
     * @return 统一格式 Result 包装的文章详情 VO
     */
    @TrackApi("【管理端】获取文章详情用于编辑（不增加浏览量）")
    @GetMapping("/admin/articles/{id}")
    public Result<ArticleDetailVO> getAdminArticleDetail(@PathVariable Long id) {
        log.info("管理端获取文章编辑详情 API 请求，ID: {}", id);
        ArticleDetailVO detail = articleService.getArticleDetail(String.valueOf(id), false);
        return Result.success(detail);
    }

    /**
     * 【管理端】新增保存一篇文章
     *
     * @param dto       新增文章表单 DTO
     * @param principal 当前登录管理员认证实体，由 Spring Security 注入获取作者名
     * @return 统一格式 Result 包装的最新文章详情 VO
     */
    @TrackApi("【管理端】新增保存一篇文章")
    @PostMapping("/articles")
    public Result<ArticleDetailVO> saveArticle(@RequestBody ArticleSaveDTO dto, Principal principal) {
        String username = principal.getName();
        log.info("管理端新增文章 API 请求，title: {}, 操作者: {}", dto.getTitle(), username);
        ArticleDetailVO detail = articleService.saveArticle(dto, username);
        return Result.success(detail);
    }

    /**
     * 【管理端】根据 ID 编辑更新已有文章
     *
     * @param id  待更新的文章主键 ID
     * @param dto 修改表单数据 DTO
     * @return 统一格式 Result 包装的最新的文章详情 VO
     */
    @TrackApi("【管理端】根据 ID 编辑更新已有文章")
    @PutMapping("/articles/{id}")
    public Result<ArticleDetailVO> updateArticle(@PathVariable Long id, @RequestBody ArticleSaveDTO dto) {
        log.info("管理端修改文章 API 请求，ID: {}", id);
        ArticleDetailVO detail = articleService.updateArticle(id, dto);
        return Result.success(detail);
    }

    /**
     * 【管理端】根据 ID 逻辑删除文章 (移入回收站)
     *
     * @param id 待删除文章主键 ID
     * @return 统一格式 Result，Void 成功标识
     */
    @TrackApi("【管理端】根据 ID 逻辑删除文章 (移入回收站)")
    @DeleteMapping("/articles/{id}")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        log.info("管理端逻辑删除文章 API 请求，ID: {}", id);
        articleService.deleteArticle(id);
        return Result.success();
    }

    /**
     * 【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)
     *
     * @param id      文章唯一主键 ID
     * @param request HttpServletRequest 请求实体
     * @return 统一格式 Result 包装的最新点赞总数
     */
    @TrackApi("【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)")
    @PostMapping("/articles/{id}/like")
    public Result<Long> likeArticle(@PathVariable Long id, HttpServletRequest request) {
        String ipAddress = IpUtils.getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        // 尝试从 Security 上下文中提取当前登录用户信息
        Long userId = null;
        org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            com.butvan.blog.pojo.entity.User user = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(username))
                    .orElse(null);
            if (user != null) {
                // 校验登录用户账号是否被禁用
                if ("DISABLED".equalsIgnoreCase(user.getStatus())) {
                    throw new BusinessException("您的账号已被禁用，无法进行点赞操作");
                }
                userId = user.getId();
            }
        }
        
        log.info("公开端点赞文章请求，文章ID: {}, 客户端IP: {}, UA: {}, 登录用户ID: {}", id, ipAddress, userAgent, userId);
        Long newLikeCount = articleService.likeArticle(id, ipAddress, userAgent, userId);
        return Result.success(newLikeCount);
    }

    /**
     * 【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)
     *
     * @param page    分页页码
     * @param size    每页数量
     * @param keyword 检索过滤字
     * @return 分页列表
     */
    @TrackApi("【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)")
    @GetMapping("/admin/likes")
    public Result<PageResult> pageLikes(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword
    ) {
        log.info("管理端分页获取点赞记录，page: {}, size: {}, keyword: {}", page, size, keyword);
        PageResult pageResult = articleService.pageLikes(page, size, keyword);
        return Result.success(pageResult);
    }

    /**
     * 【管理端】批量删除点赞流水记录 (物理删除)
     *
     * @param ids 点赞记录 ID 集合
     * @return 成功标识
     */
    @TrackApi("【管理端】批量删除点赞流水记录 (物理删除)")
    @DeleteMapping("/admin/likes")
    public Result<Void> deleteLikes(@RequestBody List<Long> ids) {
        log.info("管理端批量删除点赞记录，待删除数: {}", ids != null ? ids.size() : 0);
        articleService.deleteLikes(ids);
        return Result.success();
    }
}
