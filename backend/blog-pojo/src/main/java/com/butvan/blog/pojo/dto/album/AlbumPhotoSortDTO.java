package com.butvan.blog.pojo.dto.album;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 相册照片排序 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumPhotoSortDTO {

    @NotNull(message = "排序列表不能为空")
    private List<SortItem> items; // 排序项列表

    /**
     * 单张照片的排序数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SortItem {
        @NotNull(message = "照片关联ID不能为空")
        private Long photoId;  // blog_album_photo 主键

        @NotNull(message = "排序号不能为空")
        private Integer sortOrder; // 新排序位置
    }
}
