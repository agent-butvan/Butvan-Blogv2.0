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
     * @param idOrSlug 手记唯一主键 ID 或短标识 slug
     * @return 手记完整详情 VO
     */
    NoteDetailVO getNoteDetail(String idOrSlug);

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
}
