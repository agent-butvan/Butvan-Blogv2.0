package com.butvan.blog.pojo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 文章标签实体类，映射 blog_tag 表，扁平化标签结构
 */
@Entity
@Table(name = "blog_tag")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // 标签唯一主键

    @Column(name = "name", nullable = false, length = 50)
    private String name; // 标签名称（如 React）

    @Column(name = "slug", nullable = false, unique = true, length = 50)
    private String slug; // URL 友好标识符（拼音/英文，如 react）

    @Column(name = "article_count")
    private Integer articleCount; // 冗余：关联的已发布文章总数

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 标签创建时间

    /**
     * 在持久化保存实体对象前，自动装载初始值和创建时间
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.articleCount == null) {
            this.articleCount = 0;
        }
    }
}
