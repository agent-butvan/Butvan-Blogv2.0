package com.butvan.blog.pojo.dto.album;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 相册保存/更新 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumSaveDTO {

    @NotBlank(message = "相册标题不能为空")
    @Size(max = 100, message = "相册标题不能超过100字符")
    private String title;

    @Size(max = 100, message = "URL标识不能超过100字符")
    private String slug;

    @Size(max = 500, message = "描述不能超过500字符")
    private String description;

    private Long coverImageId; // 封面图媒体ID

    private String status; // DRAFT | PUBLISHED

    private Integer sortOrder; // 排序权重
}
