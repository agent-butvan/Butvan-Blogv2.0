package com.butvan.blog.pojo.dto.friend;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 网站元数据抓取请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebMetaRequestDTO {

    @NotBlank(message = "URL不能为空")
    private String url;
}
