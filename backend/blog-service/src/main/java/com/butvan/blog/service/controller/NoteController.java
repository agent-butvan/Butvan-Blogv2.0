package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.common.utils.IpUtils;
import com.butvan.blog.pojo.dto.note.NoteQueryDTO;
import com.butvan.blog.pojo.dto.note.NoteSaveDTO;
import com.butvan.blog.pojo.vo.note.NoteDetailVO;
import com.butvan.blog.service.service.NoteService;
import com.butvan.blog.service.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

/**
 * 手记业务 API 接口控制器
 * 管理端接口: /api/admin/notes — 需要管理员认证
 * 公开端接口: /api/notes — 无需认证，仅返回已发布手记
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NoteController {

    private final NoteService noteService;
    private final UserRepository userRepository;

    /**
     * 【管理端】分页检索手记列表 (支持 keyword、status、mood 筛选)
     *
     * @param query 查询传参 DTO
     * @return 统一格式 Result 包装的分页结果 PageResult
     */
    @GetMapping("/admin/notes")
    public Result<PageResult> pageAdminNotes(NoteQueryDTO query) {
        log.info("管理端分页查询手记列表 API 请求");
        PageResult pageResult = noteService.pageNotes(query);
        return Result.success(pageResult);
    }

    /**
     * 【管理端】获取手记完整详情信息
     *
     * @param idOrSlug 手记唯一主键 ID 或短链接 slug
     * @return 统一格式 Result 包装的手记详情 VO
     */
    @GetMapping("/admin/notes/{idOrSlug}")
    public Result<NoteDetailVO> getAdminNoteDetail(@PathVariable String idOrSlug) {
        log.info("管理端获取手记详情 API 请求，idOrSlug: {}", idOrSlug);
        NoteDetailVO detail = noteService.getNoteDetail(idOrSlug);
        return Result.success(detail);
    }

    /**
     * 【管理端】新增保存一篇手记
     *
     * @param dto       新增手记表单 DTO
     * @param principal 当前登录管理员认证实体，由 Spring Security 注入获取作者名
     * @return 统一格式 Result 包装的最新创建手记详情 VO
     */
    @PostMapping("/admin/notes")
    public Result<NoteDetailVO> saveNote(@RequestBody NoteSaveDTO dto, Principal principal) {
        String username = principal.getName();
        log.info("管理端新增手记 API 请求，title: {}, 操作者: {}", dto.getTitle(), username);
        NoteDetailVO detail = noteService.saveNote(dto, username);
        return Result.success(detail);
    }

    /**
     * 【管理端】根据 ID 编辑更新已有手记
     *
     * @param id  待更新的手记主键 ID
     * @param dto 修改表单数据 DTO
     * @return 统一格式 Result 包装的最新更新后手记详情 VO
     */
    @PutMapping("/admin/notes/{id}")
    public Result<NoteDetailVO> updateNote(@PathVariable Long id, @RequestBody NoteSaveDTO dto) {
        log.info("管理端修改手记 API 请求，ID: {}", id);
        NoteDetailVO detail = noteService.updateNote(id, dto);
        return Result.success(detail);
    }

    /**
     * 【管理端】根据 ID 逻辑删除手记 (移入回收站)
     *
     * @param id 待删除手记主键 ID
     * @return 统一格式 Result，Void 成功标识
     */
    @DeleteMapping("/admin/notes/{id}")
    public Result<Void> deleteNote(@PathVariable Long id) {
        log.info("管理端逻辑删除手记 API 请求，ID: {}", id);
        noteService.deleteNote(id);
        return Result.success();
    }

    /**
     * 【公开端】分页获取已发布的手记列表（按时间倒序）
     *
     * @param page 页码 (1-based)
     * @param size 每页条数
     * @param mood 可选的心情筛选
     * @return 统一格式 Result 包装的分页结果
     */
    @GetMapping("/notes")
    public Result<PageResult> pagePublicNotes(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String mood) {
        log.info("公开端分页查询手记列表 API 请求，page: {}, size: {}, mood: {}", page, size, mood);
        NoteQueryDTO query = NoteQueryDTO.builder()
                .page(page)
                .size(size)
                .status("PUBLISHED")
                .mood(mood)
                .build();
        PageResult pageResult = noteService.pageNotes(query);
        return Result.success(pageResult);
    }

    /**
     * 【公开端】根据 slug 获取手记详情
     *
     * @param slug 手记 URL 友好标识
     * @return 统一格式 Result 包装的手记详情 VO
     */
    @GetMapping("/notes/{slug}")
    public Result<NoteDetailVO> getPublicNoteDetail(@PathVariable String slug) {
        log.info("公开端获取手记详情 API 请求，slug: {}", slug);
        NoteDetailVO detail = noteService.getNoteDetail(slug);
        return Result.success(detail);
    }

    /**
     * 【公开端】对手记进行点赞（支持游客，防刷赞，记录登录用户）
     *
     * @param id      手记唯一主键 ID
     * @param request HttpServletRequest 请求实体
     * @return 统一格式 Result 包装的最新点赞总数
     */
    @PostMapping("/notes/{id}/like")
    public Result<Long> likeNote(@PathVariable Long id, HttpServletRequest request) {
        String ipAddress = IpUtils.getClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        // 尝试从 Security 上下文中提取当前登录用户信息
        Long userId = null;
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String username = auth.getName();
            com.butvan.blog.pojo.entity.User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                userId = user.getId();
            }
        }

        log.info("公开端点赞手记请求，手记ID: {}, 客户端IP: {}, UA: {}, 登录用户ID: {}", id, ipAddress, userAgent, userId);
        Long newLikeCount = noteService.likeNote(id, ipAddress, userAgent, userId);
        return Result.success(newLikeCount);
    }
}
