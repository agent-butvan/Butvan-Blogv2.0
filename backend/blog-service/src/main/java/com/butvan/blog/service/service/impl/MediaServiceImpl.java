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

        // 2. 生成唯一的 UUID 文件名
        String newFilename = UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);

        // 3. 通过 FileStorageService 上传文件（自动适配本地 / MinIO）
        String accessUrl;
        try {
            accessUrl = fileStorageService.upload(file, newFilename, file.getContentType());
            log.info("文件上传成功: {}", accessUrl);
        } catch (IOException e) {
            log.error("文件存储失败", e);
            throw new BusinessException("文件上传存储失败：" + e.getMessage());
        }

        // 5. 判定文件类型
        String fileType = "OTHER";
        if (IMAGE_EXTENSIONS.contains(extension)) {
            fileType = "IMAGE";
        }

        // 6. 持久化记录到数据库中
        String bucketName = storageProperties.getType();
        Media media = Media.builder()
                .fileName(originalFilename)
                .filePath(newFilename)
                .fileUrl(accessUrl)
                .fileType(fileType)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .bucketName(bucketName)
                .sourceType(org.springframework.util.StringUtils.hasText(sourceType) ? sourceType : "MANUAL")
                .sourceId(sourceId)
                .sourceDetail(sourceDetail)
                .build();

        return mediaRepository.save(media);
    }

    /**
     * 上传图片但不记录到数据库（用于公开上传场景，如友链头像）
     * 仅支持图片格式，返回相对路径 /uploads/filename.ext
     *
     * @param file 上传的图片文件
     * @return 相对路径
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

        // 3. 通过 FileStorageService 上传文件（自动适配本地 / MinIO）
        String accessUrl;
        try {
            accessUrl = fileStorageService.upload(file, newFilename, file.getContentType());
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

        // 1. 通过 FileStorageService 删除存储中的文件（自动适配本地 / MinIO）
        String objectName = media.getFilePath();
        if (org.springframework.util.StringUtils.hasText(objectName)) {
            boolean deleted = fileStorageService.delete(objectName);
            if (deleted) {
                log.info("存储文件删除成功: {}", objectName);
            } else {
                log.warn("存储文件删除失败: {}", objectName);
            }
        }

        // 2. 从数据库删除记录
        mediaRepository.delete(media);
    }
}
