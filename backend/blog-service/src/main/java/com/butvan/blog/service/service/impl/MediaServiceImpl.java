package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.media.MediaQueryDTO;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.service.repository.MediaRepository;
import com.butvan.blog.service.service.MediaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 媒体资源管理服务实现类
 */
@Service
@Slf4j
public class MediaServiceImpl implements MediaService {

    @Autowired
    private MediaRepository mediaRepository;

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

        // 3. 构建本地存储路径
        String userDir = System.getProperty("user.dir");
        String uploadDirPath = userDir + File.separator + "uploads";
        File uploadDir = new File(uploadDirPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destFile = new File(uploadDir, newFilename);
        try {
            // 4. 保存文件到本地
            file.transferTo(destFile);
            log.info("文件上传成功: {}", destFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("文件物理存储失败", e);
            throw new BusinessException("文件上传写入磁盘失败：" + e.getMessage());
        }

        // 5. 判定文件类型并拼装 URL 相对地址
        String fileType = "OTHER";
        if (IMAGE_EXTENSIONS.contains(extension)) {
            fileType = "IMAGE";
        }
        
        // 相对路径，前端可直接根据 baseURL 自行加载
        String relativePath = "/uploads/" + newFilename;

        // 6. 持久化记录到数据库中
        Media media = Media.builder()
                .fileName(originalFilename)
                .filePath(destFile.getAbsolutePath())
                .fileUrl(relativePath)
                .fileType(fileType)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .bucketName("local")
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

        // 3. 构建本地存储路径
        String userDir = System.getProperty("user.dir");
        String uploadDirPath = userDir + File.separator + "uploads";
        File uploadDir = new File(uploadDirPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destFile = new File(uploadDir, newFilename);
        try {
            // 4. 保存文件到本地
            file.transferTo(destFile);
            log.info("公开接口文件上传成功: {}", destFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("文件物理存储失败", e);
            throw new BusinessException("文件上传写入磁盘失败：" + e.getMessage());
        }

        // 5. 返回相对路径
        return "/uploads/" + newFilename;
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

        // 1. 尝试物理清除本地存储中的文件，防垃圾冗余
        String absolutePath = media.getFilePath();
        if (org.springframework.util.StringUtils.hasText(absolutePath)) {
            File diskFile = new File(absolutePath);
            if (diskFile.exists() && diskFile.isFile()) {
                boolean isDeleted = diskFile.delete();
                if (isDeleted) {
                    log.info("本地磁盘物理媒体文件成功删除: {}", absolutePath);
                } else {
                    log.warn("本地磁盘物理媒体文件删除失败: {}", absolutePath);
                }
            }
        }

        // 2. 从数据库删除记录
        mediaRepository.delete(media);
    }
}
