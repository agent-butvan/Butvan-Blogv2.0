package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.properties.StorageProperties;
import com.butvan.blog.common.storage.FileStorageService;
import com.butvan.blog.pojo.dto.media.MediaQueryDTO;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.repository.MediaRepository;
import com.butvan.blog.service.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 媒体资源管理服务实现类
 * <p>
 * 通过 {@link FileStorageService} 抽象文件存储层，
 * 支持本地磁盘 / MinIO 对象存储的动态切换。
 * </p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;
    private final StorageProperties storageProperties;
    private final jakarta.servlet.http.HttpServletRequest request;

    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp", "bmp");

    @Override
    @Transactional
    public Media uploadFile(MultipartFile file, String sourceType, Long sourceId, String sourceDetail) {
        if (file.isEmpty()) {
            throw new BusinessException("上传的文件不能为空");
        }

        // 1. 获取原文件名及文件后缀
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名为空，上传失败");
        }
        
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        // 2. 计算文件的 SHA-256 哈希值用于去重及秒传
        String sha256 = calculateSha256(file);

        // 3. 获取客户端 IP 和 User-Agent
        String ip = getClientIp(request);
        String ua = request != null ? request.getHeader("User-Agent") : "UNKNOWN";

        // 4. 判断是否触发秒传
        List<Media> existingMedias = mediaRepository.findByFileHash(sha256);
        if (!existingMedias.isEmpty()) {
            Media existingMedia = existingMedias.get(0);
            log.info("触发秒传，文件 SHA-256 为: {}, 物理路径: {}", sha256, existingMedia.getFilePath());
            
            Media newMedia = Media.builder()
                    .fileName(originalFilename)
                    .filePath(existingMedia.getFilePath())
                    .fileUrl(existingMedia.getFileUrl())
                    .fileType(existingMedia.getFileType())
                    .mimeType(existingMedia.getMimeType())
                    .fileSize(existingMedia.getFileSize())
                    .bucketName(existingMedia.getBucketName())
                    .width(existingMedia.getWidth())
                    .height(existingMedia.getHeight())
                    .altText(existingMedia.getAltText())
                    .sourceType(org.springframework.util.StringUtils.hasText(sourceType) ? sourceType : "MANUAL")
                    .sourceId(sourceId)
                    .sourceDetail(sourceDetail)
                    .fileHash(sha256)
                    .ipAddress(ip)
                    .userAgent(ua)
                    .status(1) // 正常使用状态
                    .build();
            return mediaRepository.save(newMedia);
        }

        // 5. 生成唯一的 UUID 文件名
        String newFilename = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

        // 6. 确定存储分类目录（category），如果前端没传 sourceType 则默认为 MANUAL
        String category = org.springframework.util.StringUtils.hasText(sourceType) ? sourceType.toUpperCase() : "MANUAL";

        // 7. 通过 FileStorageService 上传文件（支持自动按分类归档）
        String accessUrl;
        try {
            accessUrl = fileStorageService.upload(file, newFilename, category, file.getContentType());
            log.info("文件物理存储上传成功: {}", accessUrl);
        } catch (IOException e) {
            log.error("文件存储失败", e);
            throw new BusinessException("文件上传存储失败：" + e.getMessage());
        }

        // 8. 判定文件大类
        String fileType = "OTHER";
        if (IMAGE_EXTENSIONS.contains(extension)) {
            fileType = "IMAGE";
        }

        // 9. 拼接保存在数据库中的 filePath 相对路径（统一使用 / 作为对象路径分隔符）
        String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String savedFilePath = category + "/" + dateStr + "/" + newFilename;

        // 10. 持久化记录到数据库中
        String bucketName = storageProperties.getType();
        Media media = Media.builder()
                .fileName(originalFilename)
                .filePath(savedFilePath)
                .fileUrl(accessUrl)
                .fileType(fileType)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .bucketName(bucketName)
                .sourceType(category)
                .sourceId(sourceId)
                .sourceDetail(sourceDetail)
                .fileHash(sha256)
                .ipAddress(ip)
                .userAgent(ua)
                .status(1) // 默认正常使用状态
                .build();

        return mediaRepository.save(media);
    }

    /**
     * 上传图片但不记录到数据库（用于公开上传场景，如友链头像）
     * 仅支持图片格式，返回相对路径或完整 URL
     *
     * @param file 上传的图片文件
     * @return 访问 URL 链接
     */
    public String uploadFileWithoutDb(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("上传的文件不能为空");
        }

        // 1. 获取原文件名及文件后缀
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名为空，上传失败");
        }
        
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        // 验证图片格式
        if (!IMAGE_EXTENSIONS.contains(extension)) {
            throw new BusinessException("只支持图片格式: " + String.join(", ", IMAGE_EXTENSIONS));
        }

        // 2. 生成唯一的 UUID 文件名
        String newFilename = UUID.randomUUID().toString() + "." + extension;

        // 3. 通过 FileStorageService 上传文件（指定公开分类目录为 FRIEND_LINK）
        String accessUrl;
        try {
            accessUrl = fileStorageService.upload(file, newFilename, "FRIEND_LINK", file.getContentType());
            log.info("公开接口文件上传成功: {}", accessUrl);
        } catch (IOException e) {
            log.error("文件存储失败", e);
            throw new BusinessException("文件上传存储失败：" + e.getMessage());
        }

        // 4. 返回访问 URL
        return accessUrl;
    }

    @Override
    public PageResult pageMedia(MediaQueryDTO queryDTO) {
        log.info("分页检索媒体资源列表，参数: {}", queryDTO);

        int pageIndex = queryDTO.getPage() != null && queryDTO.getPage() > 0 ? queryDTO.getPage() - 1 : 0;
        int pageSize = queryDTO.getSize() != null && queryDTO.getSize() > 0 ? queryDTO.getSize() : 12;

        Sort sort = Sort.by(Sort.Order.desc("id")); // 按上传主键倒序
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        Specification<Media> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // 类型大类过滤
            if (org.springframework.util.StringUtils.hasText(queryDTO.getFileType())) {
                predicates.add(cb.equal(root.get("fileType"), queryDTO.getFileType()));
            }

            // 文件名称模糊过滤
            if (org.springframework.util.StringUtils.hasText(queryDTO.getKeyword())) {
                predicates.add(cb.like(root.get("fileName"), "%" + queryDTO.getKeyword() + "%"));
            }

            // 来源大类过滤
            if (org.springframework.util.StringUtils.hasText(queryDTO.getSourceType())) {
                predicates.add(cb.equal(root.get("sourceType"), queryDTO.getSourceType()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Media> pageResult = mediaRepository.findAll(spec, pageable);

        return PageResult.builder()
                .total(pageResult.getTotalElements())
                .page(pageIndex + 1)
                .size(pageSize)
                .records(pageResult.getContent())
                .build();
    }

    @Override
    @Transactional
    public void deleteMedia(Long id) {
        log.info("物理删除媒体文件，ID: {}", id);
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("媒体资源不存在或已被删除"));

        String fileHash = media.getFileHash();
        boolean shouldPhysicalDelete = true;

        // 1. 若存在文件 Hash，校验当前系统中的引用计数
        if (org.springframework.util.StringUtils.hasText(fileHash)) {
            long count = mediaRepository.countByFileHash(fileHash);
            if (count > 1) {
                log.info("媒体文件 Hash 引用数为 {}, 大于 1, 仅删除当前数据库记录, 暂不执行物理存储删除", count);
                shouldPhysicalDelete = false;
            }
        }

        // 2. 没有其他秒传引用时，真正发起物理删除
        if (shouldPhysicalDelete) {
            String objectName = media.getFilePath();
            if (org.springframework.util.StringUtils.hasText(objectName)) {
                boolean deleted = fileStorageService.delete(objectName);
                if (deleted) {
                    log.info("存储物理文件删除成功: {}", objectName);
                } else {
                    log.warn("存储物理文件删除失败: {}", objectName);
                }
            }
        }

        // 3. 从数据库删除记录
        mediaRepository.delete(media);
    }

    /**
     * 计算文件的 SHA-256 哈希值
     */
    private String calculateSha256(MultipartFile file) {
        try (java.io.InputStream is = file.getInputStream()) {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) > 0) {
                digest.update(buffer, 0, read);
            }
            byte[] hash = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("计算文件 SHA-256 异常", e);
            throw new BusinessException("文件哈希解析失败: " + e.getMessage());
        }
    }

    /**
     * 获取客户端真实 IP
     */
    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) {
            return "UNKNOWN";
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null && ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
