package com.butvan.blog.service.controller;

import com.butvan.blog.common.result.PageResult;
import com.butvan.blog.common.result.Result;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSaveDTO;
import com.butvan.blog.pojo.dto.album.AlbumPhotoSortDTO;
import com.butvan.blog.pojo.dto.album.AlbumQueryDTO;
import com.butvan.blog.pojo.dto.album.AlbumSaveDTO;
import com.butvan.blog.pojo.vo.album.AlbumListVO;
import com.butvan.blog.pojo.vo.album.AlbumVO;
import com.butvan.blog.pojo.vo.album.PhotoWallVO;
import com.butvan.blog.service.service.AlbumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 相册管理接口控制器
 * <p>
 * 管理后台接口路径前缀: /api/admin/albums
 * 客户端公开接口路径前缀: /api/public/albums
 * </p>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AlbumController {

    private final AlbumService albumService;

    // ==================== 管理后台接口 ====================

    /**
     * 【管理后台】创建相册
     *
     * @param dto 相册保存DTO
     * @return 相册详情VO
     */
    @PostMapping("/admin/albums")
    public Result<AlbumVO> createAlbum(@Valid @RequestBody AlbumSaveDTO dto) {
        log.info("管理后台创建相册: title={}", dto.getTitle());
        AlbumVO vo = albumService.createAlbum(dto);
        return Result.success(vo);
    }

    /**
     * 【管理后台】更新相册
     *
     * @param id  相册ID
     * @param dto 相册保存DTO
     * @return 相册详情VO
     */
    @PutMapping("/admin/albums/{id}")
    public Result<AlbumVO> updateAlbum(@PathVariable Long id, @Valid @RequestBody AlbumSaveDTO dto) {
        log.info("管理后台更新相册: id={}", id);
        AlbumVO vo = albumService.updateAlbum(id, dto);
        return Result.success(vo);
    }

    /**
     * 【管理后台】删除相册
     *
     * @param id 相册ID
     * @return 成功状态
     */
    @DeleteMapping("/admin/albums/{id}")
    public Result<Void> deleteAlbum(@PathVariable Long id) {
        log.info("管理后台删除相册: id={}", id);
        albumService.deleteAlbum(id);
        return Result.success();
    }

    /**
     * 【管理后台】分页获取相册列表
     *
     * @param queryDTO 查询DTO
     * @return 分页结果
     */
    @GetMapping("/admin/albums")
    public Result<PageResult> pageAlbums(AlbumQueryDTO queryDTO) {
        log.info("管理后台分页获取相册列表: {}", queryDTO);
        PageResult pageResult = albumService.pageAlbums(queryDTO);
        return Result.success(pageResult);
    }

    /**
     * 【管理后台】获取相册详情（含照片列表）
     *
     * @param id 相册ID
     * @return 相册详情VO
     */
    @GetMapping("/admin/albums/{id}")
    public Result<AlbumVO> getAlbumById(@PathVariable Long id) {
        log.info("管理后台获取相册详情: id={}", id);
        AlbumVO vo = albumService.getAlbumById(id);
        return Result.success(vo);
    }

    /**
     * 【管理后台】向相册添加照片
     *
     * @param id  相册ID
     * @param dto 照片添加DTO
     * @return 相册详情VO
     */
    @PostMapping("/admin/albums/{id}/photos")
    public Result<AlbumVO> addPhoto(@PathVariable Long id, @Valid @RequestBody AlbumPhotoSaveDTO dto) {
        log.info("管理后台向相册添加照片: albumId={}, mediaId={}", id, dto.getMediaId());
        AlbumVO vo = albumService.addPhoto(id, dto);
        return Result.success(vo);
    }

    /**
     * 【管理后台】从相册移除照片
     *
     * @param id      相册ID
     * @param photoId 照片关联ID
     * @return 成功状态
     */
    @DeleteMapping("/admin/albums/{id}/photos/{photoId}")
    public Result<Void> removePhoto(@PathVariable Long id, @PathVariable Long photoId) {
        log.info("管理后台从相册移除照片: albumId={}, photoId={}", id, photoId);
        albumService.removePhoto(id, photoId);
        return Result.success();
    }

    /**
     * 【管理后台】调整相册照片排序
     *
     * @param id  相册ID
     * @param dto 排序DTO
     * @return 成功状态
     */
    @PutMapping("/admin/albums/{id}/photos/sort")
    public Result<Void> sortPhotos(@PathVariable Long id, @Valid @RequestBody AlbumPhotoSortDTO dto) {
        log.info("管理后台调整相册照片排序: albumId={}, itemsCount={}", id, dto.getItems().size());
        albumService.sortPhotos(id, dto);
        return Result.success();
    }

    /**
     * 【管理后台】上传图片并直接添加到相册
     *
     * @param id      相册ID
     * @param file    上传的图片文件
     * @param caption 照片说明（可选）
     * @return 相册详情VO
     */
    @PostMapping("/admin/albums/{id}/photos/upload")
    public Result<AlbumVO> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {
        log.info("管理后台上传照片到相册: albumId={}, fileName={}", id, file.getOriginalFilename());
        AlbumVO vo = albumService.uploadPhoto(id, file, caption);
        return Result.success(vo);
    }

    // ==================== 客户端公开接口 ====================

    /**
     * 【公开】获取已发布的相册列表
     *
     * @return 相册列表VO
     */
    @GetMapping("/public/albums")
    public Result<List<AlbumListVO>> listPublicAlbums() {
        log.info("前台获取公开相册列表");
        List<AlbumListVO> list = albumService.listPublicAlbums();
        return Result.success(list);
    }

    /**
     * 【公开】根据 slug 获取相册详情
     *
     * @param slug 相册URL标识
     * @return 相册详情VO
     */
    @GetMapping("/public/albums/{slug}")
    public Result<AlbumVO> getAlbumBySlug(@PathVariable String slug) {
        log.info("前台获取相册详情: slug={}", slug);
        AlbumVO vo = albumService.getAlbumBySlug(slug);
        return Result.success(vo);
    }

    /**
     * 【公开】分页获取全部已发布相册中的照片（时间线照片墙）
     *
     * @param page 页码（默认1）
     * @param size 每页大小（默认20，最大50）
     * @return 照片墙分页结果
     */
    @GetMapping("/public/photos")
    public Result<PageResult> pagePublicPhotos(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("前台分页获取照片墙: page={}, size={}", page, size);
        PageResult pageResult = albumService.pagePublicPhotos(page, size);
        return Result.success(pageResult);
    }
}
