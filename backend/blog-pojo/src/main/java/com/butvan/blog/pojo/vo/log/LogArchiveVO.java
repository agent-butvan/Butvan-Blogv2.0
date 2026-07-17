package com.butvan.blog.pojo.vo.log;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 历史日志归档包数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogArchiveVO {

    private String fileName; // 归档压缩包文件名

    private String fileSize; // 格式化后的大小（如 12 KB, 1.5 MB）

    private LocalDateTime lastModified; // 归档文件最后修改时间
}
