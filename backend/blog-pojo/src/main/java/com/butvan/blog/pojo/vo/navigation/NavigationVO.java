package com.butvan.blog.pojo.vo.navigation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 导航菜单树形展示视图对象 (VO)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavigationVO implements Serializable {

    private Long id;                  // 导航唯一ID
    private String title;             // 显示文字
    private Long parentId;            // 父导航ID
    private String linkType;          // 链接类型：PAGE | CATEGORY | ARTICLE | EXTERNAL | NONE
    private Long linkTargetId;        // 关联目标ID
    private String linkUrl;           // 外部超链接
    private String icon;              // 图标 Key 码
    private String position;          // 位置
    private Integer sortOrder;        // 排序权重
    private Boolean isOpenNewTab;     // 是否新开窗口

    @Builder.Default
    private List<NavigationVO> children = new ArrayList<>(); // 子菜单节点列表
}
