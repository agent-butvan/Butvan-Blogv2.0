package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 首页可交互物品/热区实体类，映射 blog_homepage_hotspot 表
 */
@Entity
@Table(name = "blog_homepage_hotspot")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 物品唯一ID

    @Column(name = "scene_id", nullable = false)
    private Long sceneId; // 所属场景ID

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName; // 物品名称，如“电脑”

    @Column(name = "item_image_url", length = 500)
    private String itemImageUrl; // v0.2: 透明抠图 PNG 文件地址

    @Column(name = "x_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal xPercent; // v0.2: 左边界 X 坐标百分比（0.00 ~ 100.00）

    @Column(name = "y_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal yPercent; // v0.2: 上边界 Y 坐标百分比（0.00 ~ 100.00）

    @Column(name = "width_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal widthPercent; // v0.2: 物品在背景图中的百分比宽度

    @Column(name = "height_percent", precision = 5, scale = 2)
    private BigDecimal heightPercent; // v0.2: 物品在背景图中的百分比高度（等比例缩放时可为空）

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "geometry_ext", columnDefinition = "jsonb")
    private Map<String, Object> geometryExt; // 扩展几何属性（rotate, opacity, shape, animation等）

    @Column(name = "hover_tips", length = 255)
    private String hoverTips; // 鼠标悬浮提示文字

    @Column(name = "redirect_type", nullable = false, length = 50)
    private String redirectType; // 跳转类型: INTERNAL | EXTERNAL | ARTICLE | CATEGORY

    @Column(name = "redirect_path", length = 500)
    private String redirectPath; // 跳转相对路径或外部 URL（EXTERNAL/INTERNAL时使用）

    @Column(name = "redirect_target_id")
    private Long redirectTargetId; // v0.2: 跳转目标对应实体主键（如文章 ID、分类 ID）

    @Column(name = "zoom_scale", precision = 3, scale = 2)
    private BigDecimal zoomScale; // 点击后镜头的缩放比例，默认 3.00

    @Column(name = "sort_order")
    private Integer sortOrder; // 排序号（用于控制重叠时的渲染层级/z-index）

    @Column(name = "is_visible")
    private Boolean isVisible; // 是否在前台显示

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 创建时间

    /**
     * 保存记录前填充初始默认值
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.zoomScale == null) {
            this.zoomScale = BigDecimal.valueOf(3.00);
        }
        if (this.sortOrder == null) {
            this.sortOrder = 0;
        }
        if (this.isVisible == null) {
            this.isVisible = true;
        }
    }
}
