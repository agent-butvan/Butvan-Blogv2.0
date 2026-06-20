package com.butvan.blog.pojo.dto.media;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 媒体资源管理后台分页检索传输对象 (DTO)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaQueryDTO {

    private Integer page; // 当前页码 (从 1 开始)

    private Integer size; // 每页显示条数

    private String fileType; // 文件类型大类：IMAGE | VIDEO | DOCUMENT | OTHER

    private String keyword; // 文件名模糊检索关键词
}
