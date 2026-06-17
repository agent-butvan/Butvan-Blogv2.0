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
}
