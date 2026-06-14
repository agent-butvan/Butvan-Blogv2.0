package com.butvan.blog.pojo.dto.navigation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 导航菜单创建 / 编辑请求数据传递对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavigationSaveDTO {

    @NotBlank(message = "菜单标题不能为空")
    @Size(max = 50, message = "标题长度不能超过 50 个字符")
    private String title; // 菜单显示名称

    private Long parentId; // 父菜单ID，为 null 表示一级菜单

    @NotBlank(message = "链接类型不能为空")
    private String linkType; // PAGE | CATEGORY | ARTICLE | EXTERNAL | NONE

    private Long linkTargetId; // 关联目标实体ID

    @Size(max = 500, message = "外部链接长度不能超过 500 个字符")
    private String linkUrl; // 外部超链接

    @Size(max = 100, message = "图标标识长度不能超过 100 个字符")
    private String icon; // 图标识别码

    @NotBlank(message = "菜单位置不能为空")
    private String position; // HEADER | FOOTER | SIDEBAR | ADMIN_SIDEBAR

    private Integer sortOrder; // 排序权重，默认0

    private Boolean isVisible; // 是否可见，默认true

    private Boolean isOpenNewTab; // 是否新标签页打开，默认false
}
