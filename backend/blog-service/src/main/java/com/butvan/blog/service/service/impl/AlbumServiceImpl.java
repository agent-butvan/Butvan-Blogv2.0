package com.butvan.blog.service.service.impl;

import com.butvan.blog.common.exception.BusinessException;
import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSaveDTO;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSortDTO;
import com.butvan.blog.pojo.dto.album.AlbumQueryDTO;
import com.butvan.blog.pojo.dto.album.AlbumSaveDTO;
import com.butvan.blog.pojo.entity.Album;
import com.butvan.blog.pojo.entity.AlbumPhoto;
import com.butvan.blog.pojo.entity.Media;
import com.butvan.blog.pojo.vo.album.AlbumListVO;
import com.butvan.blog.pojo.vo.album.AlbumPhotoVO;
import com.butvan.blog.pojo.vo.album.AlbumVO;
import com.butvan.blog.service.repository.AlbumPhotoRepository;
import com.butvan.blog.service.repository.AlbumRepository;
import com.butvan.blog.service.repository.MediaRepository;
import com.butvan.blog.service.service.AlbumService;
import com.butvan.blog.common.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 相册管理服务实现类
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AlbumServiceImpl implements AlbumService {

    private final AlbumRepository albumRepository;
    private final AlbumPhotoRepository albumPhotoRepository;
    private final MediaRepository mediaRepository;

    @Override
    @Transactional
    public AlbumVO createAlbum(AlbumSaveDTO dto) {
        // 自动生成 slug（如果未提供）
        String slug = Optional.ofNullable(dto.getSlug())
                .filter(s -> !s.isBlank())
                .orElseGet(() -> SlugUtils.toSlug(dto.getTitle()));

        // 检查 slug 唯一性
        if (albumRepository.findBySlug(slug).isPresent()) {
            throw new BusinessException("URL标识 '" + slug + "' 已被占用，请更换相册标题或手动指定slug");
        }

        Album album = Album.builder()
                .title(dto.getTitle())
                .slug(slug)
                .description(dto.getDescription())
                .coverImageId(dto.getCoverImageId())
                .status(Optional.ofNullable(dto.getStatus()).orElse(Album.STATUS_DRAFT))
                .sortOrder(Optional.ofNullable(dto.getSortOrder()).orElse(0))
                .build();

        album = albumRepository.save(album);
        log.info("相册创建成功: id={}, title={}", album.getId(), album.getTitle());
        return toAlbumVO(album);
    }

    @Override
    @Transactional
    public AlbumVO updateAlbum(Long id, AlbumSaveDTO dto) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new BusinessException("相册不存在"));

        // slug 变更时检查唯一性
        if (dto.getSlug() != null && !dto.getSlug().isBlank() && !dto.getSlug().equals(album.getSlug())) {
            if (albumRepository.findBySlug(dto.getSlug()).isPresent()) {
                throw new BusinessException("URL标识 '" + dto.getSlug() + "' 已被占用");
            }
            album.setSlug(dto.getSlug());
        }

        album.setTitle(dto.getTitle());
        if (dto.getDescription() != null) album.setDescription(dto.getDescription());
        album.setCoverImageId(dto.getCoverImageId());
        if (dto.getStatus() != null) album.setStatus(dto.getStatus());
        if (dto.getSortOrder() != null) album.setSortOrder(dto.getSortOrder());

        album = albumRepository.save(album);
        log.info("相册更新成功: id={}", album.getId());
        return toAlbumVO(album);
    }

    @Override
    @Transactional
    public void deleteAlbum(Long id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new BusinessException("相册不存在"));

        // 级联删除照片关联
        albumPhotoRepository.deleteByAlbumId(id);
        albumRepository.delete(album);
        log.info("相册删除成功: id={}, title={}", id, album.getTitle());
    }

    @Override
    public PageResult pageAlbums(AlbumQueryDTO queryDTO) {
        int page = Math.max(Optional.ofNullable(queryDTO.getPage()).orElse(1), 1);
        int size = Math.min(Optional.ofNullable(queryDTO.getSize()).orElse(10), 100);
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "sortOrder").and(Sort.by(Sort.Direction.DESC, "createdAt")));

        Specification<Album> spec = Specification.where(null);

        // 状态过滤
        if (queryDTO.getStatus() != null && !queryDTO.getStatus().isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), queryDTO.getStatus()));
        }

        // 关键词搜索
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().isBlank()) {
            String keyword = "%" + queryDTO.getKeyword() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(root.get("title"), keyword),
                            cb.like(root.get("description"), keyword)
                    ));
        }

        Page<Album> pageData = albumRepository.findAll(spec, pageable);

        List<AlbumVO> records = pageData.getContent().stream()
                .map(this::toAlbumVO)
                .collect(Collectors.toList());

        return PageResult.builder()
                        .total(pageData.getTotalElements())
                        .page(page)
                        .size(size)
                        .records(records)
                        .build();
    }

    @Override
    public AlbumVO getAlbumById(Long id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new BusinessException("相册不存在"));
        return toAlbumVO(album);
    }

    @Override
    public AlbumVO getAlbumBySlug(String slug) {
        Album album = albumRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException("相册不存在"));

        // 仅允许查看已发布的相册（前台场景）
        if (!Album.STATUS_PUBLISHED.equals(album.getStatus())) {
            throw new BusinessException("相册暂未发布");
        }

        // 增加浏览次数
        album.setViewCount(album.getViewCount() + 1);
        albumRepository.save(album);

        return toAlbumVO(album);
    }

    @Override
    public List<AlbumListVO> listPublicAlbums() {
        List<Album> albums = albumRepository.findAll(
                (Specification<Album>) (root, query, cb) -> {
                    query.orderBy(cb.desc(root.get("sortOrder")), cb.desc(root.get("createdAt")));
                    return cb.equal(root.get("status"), Album.STATUS_PUBLISHED);
                }
        );

        return albums.stream().map(this::toAlbumListVO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AlbumVO addPhoto(Long albumId, AlbumPhotoSaveDTO dto) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new BusinessException("相册不存在"));

        // 检查媒体资源是否存在
        Media media = mediaRepository.findById(dto.getMediaId())
                .orElseThrow(() -> new BusinessException("媒体资源不存在"));

        // 检查重复添加
        if (albumPhotoRepository.existsByAlbumIdAndMediaId(albumId, dto.getMediaId())) {
            throw new BusinessException("该照片已在相册中，请勿重复添加");
        }

        AlbumPhoto albumPhoto = AlbumPhoto.builder()
                .albumId(albumId)
                .mediaId(dto.getMediaId())
                .caption(dto.getCaption())
                .sortOrder(Optional.ofNullable(dto.getSortOrder()).orElse(0))
                .build();

        albumPhotoRepository.save(albumPhoto);
        log.info("照片已添加到相册: albumId={}, mediaId={}", albumId, dto.getMediaId());
        return toAlbumVO(album);
    }

    @Override
    @Transactional
    public void removePhoto(Long albumId, Long photoId) {
        AlbumPhoto photo = albumPhotoRepository.findById(photoId)
                .orElseThrow(() -> new BusinessException("照片关联记录不存在"));

        if (!photo.getAlbumId().equals(albumId)) {
            throw new BusinessException("照片不属于该相册");
        }

        albumPhotoRepository.delete(photo);
        log.info("照片已从相册移除: albumId={}, photoId={}, mediaId={}", albumId, photoId, photo.getMediaId());
    }

    @Override
    @Transactional
    public void sortPhotos(Long albumId, AlbumPhotoSortDTO dto) {
        // 验证相册存在
        if (!albumRepository.existsById(albumId)) {
            throw new BusinessException("相册不存在");
        }

        // 批量更新排序
        for (AlbumPhotoSortDTO.SortItem item : dto.getItems()) {
            AlbumPhoto photo = albumPhotoRepository.findById(item.getPhotoId())
                    .orElseThrow(() -> new BusinessException("照片关联记录不存在: " + item.getPhotoId()));

            if (!photo.getAlbumId().equals(albumId)) {
                throw new BusinessException("照片不属于该相册: " + item.getPhotoId());
            }

            photo.setSortOrder(item.getSortOrder());
            albumPhotoRepository.save(photo);
        }

        log.info("相册照片排序已更新: albumId={}, 更新数量={}", albumId, dto.getItems().size());
    }

    // ==================== 私有转换方法 ====================

    /**
     * 将 Album 实体转换为 AlbumVO（含照片列表）
     */
    private AlbumVO toAlbumVO(Album album) {
        List<AlbumPhoto> photos = albumPhotoRepository.findByAlbumIdOrderBySortOrderAsc(album.getId());

        List<AlbumPhotoVO> photoVOs = photos.stream()
                .map(this::toAlbumPhotoVO)
                .collect(Collectors.toList());

        // 获取封面图URL
        String coverImageUrl = null;
        if (album.getCoverImageId() != null) {
            coverImageUrl = mediaRepository.findById(album.getCoverImageId())
                    .map(Media::getFileUrl)
                    .orElse(null);
        }

        return AlbumVO.builder()
                .id(album.getId())
                .title(album.getTitle())
                .slug(album.getSlug())
                .description(album.getDescription())
                .coverImageId(album.getCoverImageId())
                .coverImageUrl(coverImageUrl)
                .status(album.getStatus())
                .sortOrder(album.getSortOrder())
                .viewCount(album.getViewCount())
                .photoCount(photos.size())
                .photos(photoVOs)
                .createdAt(album.getCreatedAt())
                .updatedAt(album.getUpdatedAt())
                .build();
    }

    /**
     * 将 Album 实体转换为 AlbumListVO（精简列表）
     */
    private AlbumListVO toAlbumListVO(Album album) {
        String coverImageUrl = null;
        if (album.getCoverImageId() != null) {
            coverImageUrl = mediaRepository.findById(album.getCoverImageId())
                    .map(Media::getFileUrl)
                    .orElse(null);
        }

        int photoCount = albumPhotoRepository.countByAlbumId(album.getId());

        return AlbumListVO.builder()
                .id(album.getId())
                .title(album.getTitle())
                .slug(album.getSlug())
                .description(album.getDescription())
                .coverImageUrl(coverImageUrl)
                .photoCount(photoCount)
                .createdAt(album.getCreatedAt())
                .build();
    }

    /**
     * 将 AlbumPhoto 实体转换为 AlbumPhotoVO
     */
    private AlbumPhotoVO toAlbumPhotoVO(AlbumPhoto albumPhoto) {
        AlbumPhotoVO.AlbumPhotoVOBuilder builder = AlbumPhotoVO.builder()
                .id(albumPhoto.getId())
                .mediaId(albumPhoto.getMediaId())
                .caption(albumPhoto.getCaption())
                .sortOrder(albumPhoto.getSortOrder())
                .createdAt(albumPhoto.getCreatedAt());

        // 补充媒体详细信息
        mediaRepository.findById(albumPhoto.getMediaId()).ifPresent(media -> {
            builder.fileName(media.getFileName())
                   .fileUrl(media.getFileUrl())
                   .mimeType(media.getMimeType())
                   .fileSize(media.getFileSize())
                   .width(media.getWidth())
                   .height(media.getHeight())
                   .altText(media.getAltText());
        });

        return builder.build();
    }
}
