package com.butvan.blog.service.service;

import com.butvan.blog.pojo.entity.Tag;
import com.butvan.blog.pojo.vo.tag.TagSimpleVO;
import java.util.List;

/**
 * 标签业务逻辑处理服务层接口
 */
public interface TagService {

    /**
     * 获取全部已配置标签的实体列表，供列表或表格过滤使用
     *
     * @return 标签实体列表
     */
    List<Tag> listAllTags();

    /**
     * 获取全部已配置标签的极简信息列表，供关联配置或多选框拉取
     *
     * @return 标签极简 VO 列表
     */
    List<TagSimpleVO> listSimpleTags();

    /**
     * 新增或编辑保存标签
     *
     * @param tag 标签实体数据
     * @return 保存后的标签实体
     */
    Tag saveTag(Tag tag);

    /**
     * 根据主键 ID 删除标签
     *
     * @param id 标签主键 ID
     */
    void deleteTag(Long id);
}
