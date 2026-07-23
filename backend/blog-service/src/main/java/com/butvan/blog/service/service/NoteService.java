package com.butvan.blog.service.service;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.note.NoteQueryDTO;
import com.butvan.blog.pojo.dto.note.NoteSaveDTO;
import com.butvan.blog.pojo.vo.note.NoteDetailVO;

/**
 * 手记核心业务逻辑处理服务层接口
 */
public interface NoteService {

    /**
     * 条件分页检索手记列表（已对逻辑删除项默认过滤）
     *
     * @param queryDTO 检索筛选条件 DTO
     * @return 分页结果 PageResult，携带手记简述 VO 列表
     */
    PageResult pageNotes(NoteQueryDTO queryDTO);

    /**
     * 根据主键 ID 或 友好 URL slug 查找手记详细信息
     *
     * @param idOrSlug      手记唯一主键 ID 或短标识 slug
     * @param incrementView 是否递增浏览量计数（公开端浏览传 true，管理端编辑传 false）
     * @return 手记完整详情 VO
     */
    NoteDetailVO getNoteDetail(String idOrSlug, boolean incrementView);

    /**
     * 根据主键 ID 或 友好 URL slug 查找手记详细信息（默认递增浏览量）
     *
     * @param idOrSlug 手记唯一主键 ID 或短标识 slug
     * @return 手记完整详情 VO
     */
    default NoteDetailVO getNoteDetail(String idOrSlug) {
        return getNoteDetail(idOrSlug, true);
    }

    /**
     * 保存创建新手记
     *
     * @param dto      创建内容表单 DTO
     * @param username 创作者（当前登录管理员的登录用户名）
     * @return 最新持久化后的手记详情 VO
     */
    NoteDetailVO saveNote(NoteSaveDTO dto, String username);

    /**
     * 根据 ID 编辑更新已有手记内容
     *
     * @param id  待更新的手记唯一主键
     * @param dto 变更后内容表单 DTO
     * @return 最新持久化后的手记详情 VO
     */
    NoteDetailVO updateNote(Long id, NoteSaveDTO dto);

    /**
     * 根据 ID 逻辑删除指定手记（移入回收站）
     *
     * @param id 待销毁的手记主键
     */
    void deleteNote(Long id);

    /**
     * 手记点赞/取消点赞（Toggle 机制，支持游客，防刷赞）
     *
     * @param id        手记唯一主键 ID
     * @param ipAddress 访客客户端 IP 地址
     * @param userAgent 访客浏览器 User-Agent
     * @param userId    登录用户 ID（游客则为 null）
     * @return 操作后最新点赞总数
     */
    Long likeNote(Long id, String ipAddress, String userAgent, Long userId);
}
