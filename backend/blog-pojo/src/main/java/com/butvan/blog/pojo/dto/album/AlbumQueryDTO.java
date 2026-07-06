package com.butvan.blog.pojo.dto.album;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 相册分页查询 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumQueryDTO {

    private Integer page; // 当前页码（从 1 开始）

    private Integer size; // 每页显示条数

    private String status; // 状态过滤: DRAFT | PUBLISHED

    private String keyword; // 标题模糊检索关键词
}
