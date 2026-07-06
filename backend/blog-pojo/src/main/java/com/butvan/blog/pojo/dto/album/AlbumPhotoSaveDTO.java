package com.butvan.blog.pojo.dto.album;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 相册照片添加 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumPhotoSaveDTO {

    @NotNull(message = "媒体资源ID不能为空")
    private Long mediaId; // 关联媒体资源ID

    @Size(max = 255, message = "说明文字不能超过255字符")
    private String caption; // 照片说明文字

    private Integer sortOrder; // 排序权重
}
