package com.butvan.blog.pojo.vo.friend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 友链 VO（前台展示）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendLinkVO {

    private Long id;
    private String name;
    private String url;
    private String avatarUrl;
    private String description;
    private String category;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}