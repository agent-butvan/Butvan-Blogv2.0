/*
 Navicat Premium Dump SQL

 Source Server         : postgresql-docker
 Source Server Type    : PostgreSQL
 Source Server Version : 170010 (170010)
 Source Host           : localhost:5432
 Source Catalog        : butvan_blog
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170010 (170010)
 File Encoding         : 65001

 Date: 12/07/2026 16:02:55
*/


-- ----------------------------
-- Sequence structure for blog_album_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_album_id_seq";
CREATE SEQUENCE "public"."blog_album_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_album_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_album_photo_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_album_photo_id_seq";
CREATE SEQUENCE "public"."blog_album_photo_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_album_photo_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_article_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_article_id_seq";
CREATE SEQUENCE "public"."blog_article_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_article_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_article_like_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_article_like_id_seq";
CREATE SEQUENCE "public"."blog_article_like_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_article_like_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_article_version_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_article_version_id_seq";
CREATE SEQUENCE "public"."blog_article_version_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_article_version_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_category_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_category_id_seq";
CREATE SEQUENCE "public"."blog_category_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_category_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_comment_ban_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_comment_ban_id_seq";
CREATE SEQUENCE "public"."blog_comment_ban_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_comment_ban_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_comment_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_comment_id_seq";
CREATE SEQUENCE "public"."blog_comment_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_comment_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_friend_link_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_friend_link_id_seq";
CREATE SEQUENCE "public"."blog_friend_link_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_friend_link_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_homepage_hotspot_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_homepage_hotspot_id_seq";
CREATE SEQUENCE "public"."blog_homepage_hotspot_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_homepage_hotspot_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_homepage_scene_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_homepage_scene_id_seq";
CREATE SEQUENCE "public"."blog_homepage_scene_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_homepage_scene_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_media_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_media_id_seq";
CREATE SEQUENCE "public"."blog_media_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_media_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_navigation_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_navigation_id_seq";
CREATE SEQUENCE "public"."blog_navigation_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_navigation_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_note_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_note_id_seq";
CREATE SEQUENCE "public"."blog_note_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_note_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_note_like_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_note_like_id_seq";
CREATE SEQUENCE "public"."blog_note_like_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_note_like_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_operation_log_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_operation_log_id_seq";
CREATE SEQUENCE "public"."blog_operation_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_operation_log_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_page_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_page_id_seq";
CREATE SEQUENCE "public"."blog_page_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_page_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_series_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_series_id_seq";
CREATE SEQUENCE "public"."blog_series_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_series_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_site_config_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_site_config_id_seq";
CREATE SEQUENCE "public"."blog_site_config_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_site_config_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_subscriber_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_subscriber_id_seq";
CREATE SEQUENCE "public"."blog_subscriber_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_subscriber_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_tag_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_tag_id_seq";
CREATE SEQUENCE "public"."blog_tag_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_tag_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_user_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_user_id_seq";
CREATE SEQUENCE "public"."blog_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_user_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_visit_log_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_visit_log_id_seq";
CREATE SEQUENCE "public"."blog_visit_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_visit_log_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Sequence structure for blog_wechat_user_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_wechat_user_id_seq";
CREATE SEQUENCE "public"."blog_wechat_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_wechat_user_id_seq" OWNER TO "butvan";

-- ----------------------------
-- Table structure for blog_album
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_album";
CREATE TABLE "public"."blog_album" (
  "id" int8 NOT NULL DEFAULT nextval('blog_album_id_seq'::regclass),
  "title" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "description" varchar(500) COLLATE "pg_catalog"."default",
  "cover_image_id" int8,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DRAFT'::character varying,
  "sort_order" int4 DEFAULT 0,
  "view_count" int8 DEFAULT 0,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_album" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_album"."id" IS '主键ID';
COMMENT ON COLUMN "public"."blog_album"."title" IS '相册标题';
COMMENT ON COLUMN "public"."blog_album"."slug" IS 'URL友好标识（英文/拼音）';
COMMENT ON COLUMN "public"."blog_album"."description" IS '相册简介描述';
COMMENT ON COLUMN "public"."blog_album"."cover_image_id" IS '封面图媒体ID（关联blog_media表）';
COMMENT ON COLUMN "public"."blog_album"."status" IS '状态: DRAFT(草稿)|PUBLISHED(已发布)';
COMMENT ON COLUMN "public"."blog_album"."sort_order" IS '排序权重（数字越大越靠前）';
COMMENT ON COLUMN "public"."blog_album"."view_count" IS '冗余：累计浏览次数';
COMMENT ON COLUMN "public"."blog_album"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_album"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_album" IS '相册表 — 管理相册元数据';

-- ----------------------------
-- Records of blog_album
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_album" ("id", "title", "slug", "description", "cover_image_id", "status", "sort_order", "view_count", "created_at", "updated_at") VALUES (1, 'butvan', 'butvan', NULL, NULL, 'PUBLISHED', 0, 2, '2026-07-06 20:36:00.31383', '2026-07-06 20:39:49.316954');
COMMIT;

-- ----------------------------
-- Table structure for blog_album_photo
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_album_photo";
CREATE TABLE "public"."blog_album_photo" (
  "id" int8 NOT NULL DEFAULT nextval('blog_album_photo_id_seq'::regclass),
  "album_id" int8 NOT NULL,
  "media_id" int8 NOT NULL,
  "caption" varchar(255) COLLATE "pg_catalog"."default",
  "sort_order" int4 DEFAULT 0,
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_album_photo" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_album_photo"."id" IS '主键ID';
COMMENT ON COLUMN "public"."blog_album_photo"."album_id" IS '所属相册ID';
COMMENT ON COLUMN "public"."blog_album_photo"."media_id" IS '关联媒体资源ID（复用blog_media表）';
COMMENT ON COLUMN "public"."blog_album_photo"."caption" IS '照片说明文字';
COMMENT ON COLUMN "public"."blog_album_photo"."sort_order" IS '在相册中的排序权重';
COMMENT ON COLUMN "public"."blog_album_photo"."created_at" IS '添加时间';
COMMENT ON TABLE "public"."blog_album_photo" IS '相册照片关联表 — 维护相册与媒体资源的关联关系';

-- ----------------------------
-- Records of blog_album_photo
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_album_photo" ("id", "album_id", "media_id", "caption", "sort_order", "created_at") VALUES (1, 1, 43, '', 0, '2026-07-06 20:36:13.039464');
INSERT INTO "public"."blog_album_photo" ("id", "album_id", "media_id", "caption", "sort_order", "created_at") VALUES (2, 1, 47, NULL, 0, '2026-07-06 20:52:59.326399');
INSERT INTO "public"."blog_album_photo" ("id", "album_id", "media_id", "caption", "sort_order", "created_at") VALUES (3, 1, 48, NULL, 0, '2026-07-07 14:51:13.720691');
COMMIT;

-- ----------------------------
-- Table structure for blog_article
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_article";
CREATE TABLE "public"."blog_article" (
  "id" int8 NOT NULL DEFAULT nextval('blog_article_id_seq'::regclass),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "summary" varchar(500) COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "content_html" text COLLATE "pg_catalog"."default",
  "cover_image_url" varchar(500) COLLATE "pg_catalog"."default",
  "category_id" int8,
  "author_id" int8 NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DRAFT'::character varying,
  "visibility" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PUBLIC'::character varying,
  "password" varchar(100) COLLATE "pg_catalog"."default",
  "is_pinned" bool DEFAULT false,
  "is_featured" bool DEFAULT false,
  "is_allow_comment" bool DEFAULT true,
  "view_count" int8 DEFAULT 0,
  "like_count" int8 DEFAULT 0,
  "comment_count" int8 DEFAULT 0,
  "word_count" int4 DEFAULT 0,
  "reading_time" int4 DEFAULT 0,
  "seo_title" varchar(200) COLLATE "pg_catalog"."default",
  "seo_description" varchar(500) COLLATE "pg_catalog"."default",
  "seo_keywords" varchar(300) COLLATE "pg_catalog"."default",
  "template" varchar(50) COLLATE "pg_catalog"."default",
  "content_type" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ARTICLE'::character varying,
  "extra" jsonb,
  "published_at" timestamp(6),
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6)
)
;
ALTER TABLE "public"."blog_article" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_article"."title" IS '文章标题';
COMMENT ON COLUMN "public"."blog_article"."slug" IS 'URL唯一标识（拼音/英文）';
COMMENT ON COLUMN "public"."blog_article"."summary" IS '文章摘要（列表展示用）';
COMMENT ON COLUMN "public"."blog_article"."content" IS 'Markdown源文本';
COMMENT ON COLUMN "public"."blog_article"."content_html" IS '服务端渲染后的HTML缓存';
COMMENT ON COLUMN "public"."blog_article"."cover_image_url" IS '封面/头图URL';
COMMENT ON COLUMN "public"."blog_article"."category_id" IS '所属分类ID';
COMMENT ON COLUMN "public"."blog_article"."author_id" IS '作者ID';
COMMENT ON COLUMN "public"."blog_article"."status" IS '状态: DRAFT|PUBLISHED|PRIVATE|ARCHIVED';
COMMENT ON COLUMN "public"."blog_article"."visibility" IS '可见性: PUBLIC|PRIVATE|PASSWORD_PROTECTED';
COMMENT ON COLUMN "public"."blog_article"."password" IS '访问密码';
COMMENT ON COLUMN "public"."blog_article"."is_pinned" IS '是否置顶';
COMMENT ON COLUMN "public"."blog_article"."is_featured" IS '是否精选推荐';
COMMENT ON COLUMN "public"."blog_article"."is_allow_comment" IS '是否开放评论';
COMMENT ON COLUMN "public"."blog_article"."view_count" IS '累计阅读量';
COMMENT ON COLUMN "public"."blog_article"."like_count" IS '累计点赞数';
COMMENT ON COLUMN "public"."blog_article"."comment_count" IS '已通过评论数';
COMMENT ON COLUMN "public"."blog_article"."word_count" IS '正文字数';
COMMENT ON COLUMN "public"."blog_article"."reading_time" IS '预估阅读时间';
COMMENT ON COLUMN "public"."blog_article"."seo_title" IS 'SEO标题';
COMMENT ON COLUMN "public"."blog_article"."seo_description" IS 'SEO描述';
COMMENT ON COLUMN "public"."blog_article"."seo_keywords" IS 'SEO关键词';
COMMENT ON COLUMN "public"."blog_article"."template" IS '自定义渲染模板名';
COMMENT ON COLUMN "public"."blog_article"."content_type" IS '内容类型: ARTICLE|NOTE|GALLERY|PROJECT';
COMMENT ON COLUMN "public"."blog_article"."extra" IS '类型专属字段JSON';
COMMENT ON COLUMN "public"."blog_article"."published_at" IS '正式发布时间';
COMMENT ON COLUMN "public"."blog_article"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_article"."updated_at" IS '最后修改时间';
COMMENT ON COLUMN "public"."blog_article"."deleted_at" IS '软删除标记（非NULL=已删除）';
COMMENT ON TABLE "public"."blog_article" IS '文章核心表 — 完整生命周期管理';

-- ----------------------------
-- Records of blog_article
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "seo_title", "seo_description", "seo_keywords", "template", "content_type", "extra", "published_at", "created_at", "updated_at", "deleted_at") VALUES (1, 'test', 'test', 'test articles', '```java
package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.dto.navigation.NavigationSaveDTO;
import com.butvan.blog.pojo.entity.Navigation;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.repository.NavigationRepository;
import com.butvan.blog.service.service.NavigationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 导航菜单业务逻辑层实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NavigationServiceImpl implements NavigationService {

    private final NavigationRepository navigationRepository;

    /**
     * 根据菜单展示位置构筑并获取树状级联导航菜单列表（仅可见菜单）
     */
    @Override
    public List<NavigationVO> getNavigationTree(String position) {
        List<Navigation> flatNavs = navigationRepository.findVisibleNavigations(position);
        return buildTree(flatNavs);
    }

    /**
     * 根据菜单展示位置获取全部菜单的树状结构（含隐藏项，供管理后台使用）
     */
    @Override
    public List<NavigationVO> getNavigationTreeForAdmin(String position) {
        List<Navigation> flatNavs = navigationRepository.findByPositionOrderBySortOrderAsc(position);
        return buildTree(flatNavs);
    }

    /**
     * 创建新的导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO createNavigation(NavigationSaveDTO dto) {
        log.info("创建新导航菜单项: title={}, position={}, parentId={}", dto.getTitle(), dto.getPosition(), dto.getParentId());

        // 若父级ID有值，验证其存在性
        if (dto.getParentId() != null) {
            navigationRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("指定的父级菜单不存在，ID: " + dto.getParentId()));
        }

        Navigation entity = Navigation.builder()
                .title(dto.getTitle())
                .parentId(dto.getParentId())
                .linkType(dto.getLinkType())
                .linkTargetId(dto.getLinkTargetId())
                .linkUrl(dto.getLinkUrl())
                .icon(dto.getIcon())
                .position(dto.getPosition())
                .sortOrder(dto.getSortOrder())
                .isVisible(dto.getIsVisible())
                .isOpenNewTab(dto.getIsOpenNewTab())
                .build();

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项创建成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 更新指定导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO updateNavigation(Long id, NavigationSaveDTO dto) {
        log.info("更新导航菜单项: id={}, title={}", id, dto.getTitle());

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要更新的菜单项不存在，ID: " + id));

        // 防止将菜单项的父级设为自己，造成循环引用
        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new IllegalArgumentException("菜单项的父级不能是它自己");
        }

        entity.setTitle(dto.getTitle());
        entity.setParentId(dto.getParentId());
        entity.setLinkType(dto.getLinkType());
        entity.setLinkTargetId(dto.getLinkTargetId());
        entity.setLinkUrl(dto.getLinkUrl());
        entity.setIcon(dto.getIcon());
        entity.setPosition(dto.getPosition());
        entity.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : entity.getSortOrder());
        entity.setIsVisible(dto.getIsVisible() != null ? dto.getIsVisible() : entity.getIsVisible());
        entity.setIsOpenNewTab(dto.getIsOpenNewTab() != null ? dto.getIsOpenNewTab() : entity.getIsOpenNewTab());

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项更新成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 删除指定导航菜单项并递归清理其所有子孙节点
     */
    @Override
    @Transactional
    public void deleteNavigation(Long id) {
        log.info("删除导航菜单项及其子节点: id={}", id);

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要删除的菜单项不存在，ID: " + id));

        // 递归删除所有子孙节点
        deleteRecursively(entity);

        log.info("导航菜单项及其子孙节点已全部删除，根ID: {}", id);
    }

    /**
     * 递归删除菜单及其所有子菜单
     */
    private void deleteRecursively(Navigation parent) {
        // 查找所有直接子节点
        List<Navigation> children = navigationRepository.findAll().stream()
                .filter(n -> parent.getId().equals(n.getParentId()))
                .collect(Collectors.toList());

        // 先递归删除子节点
        for (Navigation child : children) {
            deleteRecursively(child);
        }

        // 最后删除自身
        navigationRepository.delete(parent);
    }

    // ==================== 内部工具方法 ====================

    /**
     * 将平铺的 Entity 列表构筑成树状 VO 结构
     */
    private List<NavigationVO> buildTree(List<Navigation> flatNavs) {
        if (flatNavs == null || flatNavs.isEmpty()) {
            return new ArrayList<>();
        }

        // 1. 将 Entity 转换为 VO
        List<NavigationVO> voList = flatNavs.stream()
                .map(this::entityToVO)
                .collect(Collectors.toList());

        // 2. 构建 ID → VO 映射
        Map<Long, NavigationVO> voMap = voList.stream()
                .collect(Collectors.toMap(NavigationVO::getId, vo -> vo));

        // 3. 组装树状结构
        List<NavigationVO> rootTree = new ArrayList<>();
        for (NavigationVO vo : voList) {
            Long parentId = vo.getParentId();
            if (parentId == null) {
                rootTree.add(vo);
            } else {
                NavigationVO parentVO = voMap.get(parentId);
                if (parentVO != null) {
                    parentVO.getChildren().add(vo);
                } else {
                    // 父节点缺失时，防御性提升为根节点
                    rootTree.add(vo);
                }
            }
        }

        return rootTree;
    }

    /**
     * 将 Entity 转换为 VO（不含 children）
     */
    private NavigationVO entityToVO(Navigation entity) {
        return NavigationVO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .parentId(entity.getParentId())
                .linkType(entity.getLinkType())
                .linkTargetId(entity.getLinkTargetId())
                .linkUrl(entity.getLinkUrl())
                .icon(entity.getIcon())
                .position(entity.getPosition())
                .sortOrder(entity.getSortOrder())
                .isVisible(entity.getIsVisible())
                .isOpenNewTab(entity.getIsOpenNewTab())
                .build();
    }
}

```

', '```java
package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.dto.navigation.NavigationSaveDTO;
import com.butvan.blog.pojo.entity.Navigation;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.repository.NavigationRepository;
import com.butvan.blog.service.service.NavigationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 导航菜单业务逻辑层实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NavigationServiceImpl implements NavigationService {

    private final NavigationRepository navigationRepository;

    /**
     * 根据菜单展示位置构筑并获取树状级联导航菜单列表（仅可见菜单）
     */
    @Override
    public List<NavigationVO> getNavigationTree(String position) {
        List<Navigation> flatNavs = navigationRepository.findVisibleNavigations(position);
        return buildTree(flatNavs);
    }

    /**
     * 根据菜单展示位置获取全部菜单的树状结构（含隐藏项，供管理后台使用）
     */
    @Override
    public List<NavigationVO> getNavigationTreeForAdmin(String position) {
        List<Navigation> flatNavs = navigationRepository.findByPositionOrderBySortOrderAsc(position);
        return buildTree(flatNavs);
    }

    /**
     * 创建新的导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO createNavigation(NavigationSaveDTO dto) {
        log.info("创建新导航菜单项: title={}, position={}, parentId={}", dto.getTitle(), dto.getPosition(), dto.getParentId());

        // 若父级ID有值，验证其存在性
        if (dto.getParentId() != null) {
            navigationRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("指定的父级菜单不存在，ID: " + dto.getParentId()));
        }

        Navigation entity = Navigation.builder()
                .title(dto.getTitle())
                .parentId(dto.getParentId())
                .linkType(dto.getLinkType())
                .linkTargetId(dto.getLinkTargetId())
                .linkUrl(dto.getLinkUrl())
                .icon(dto.getIcon())
                .position(dto.getPosition())
                .sortOrder(dto.getSortOrder())
                .isVisible(dto.getIsVisible())
                .isOpenNewTab(dto.getIsOpenNewTab())
                .build();

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项创建成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 更新指定导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO updateNavigation(Long id, NavigationSaveDTO dto) {
        log.info("更新导航菜单项: id={}, title={}", id, dto.getTitle());

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要更新的菜单项不存在，ID: " + id));

        // 防止将菜单项的父级设为自己，造成循环引用
        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new IllegalArgumentException("菜单项的父级不能是它自己");
        }

        entity.setTitle(dto.getTitle());
        entity.setParentId(dto.getParentId());
        entity.setLinkType(dto.getLinkType());
        entity.setLinkTargetId(dto.getLinkTargetId());
        entity.setLinkUrl(dto.getLinkUrl());
        entity.setIcon(dto.getIcon());
        entity.setPosition(dto.getPosition());
        entity.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : entity.getSortOrder());
        entity.setIsVisible(dto.getIsVisible() != null ? dto.getIsVisible() : entity.getIsVisible());
        entity.setIsOpenNewTab(dto.getIsOpenNewTab() != null ? dto.getIsOpenNewTab() : entity.getIsOpenNewTab());

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项更新成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 删除指定导航菜单项并递归清理其所有子孙节点
     */
    @Override
    @Transactional
    public void deleteNavigation(Long id) {
        log.info("删除导航菜单项及其子节点: id={}", id);

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要删除的菜单项不存在，ID: " + id));

        // 递归删除所有子孙节点
        deleteRecursively(entity);

        log.info("导航菜单项及其子孙节点已全部删除，根ID: {}", id);
    }

    /**
     * 递归删除菜单及其所有子菜单
     */
    private void deleteRecursively(Navigation parent) {
        // 查找所有直接子节点
        List<Navigation> children = navigationRepository.findAll().stream()
                .filter(n -> parent.getId().equals(n.getParentId()))
                .collect(Collectors.toList());

        // 先递归删除子节点
        for (Navigation child : children) {
            deleteRecursively(child);
        }

        // 最后删除自身
        navigationRepository.delete(parent);
    }

    // ==================== 内部工具方法 ====================

    /**
     * 将平铺的 Entity 列表构筑成树状 VO 结构
     */
    private List<NavigationVO> buildTree(List<Navigation> flatNavs) {
        if (flatNavs == null || flatNavs.isEmpty()) {
            return new ArrayList<>();
        }

        // 1. 将 Entity 转换为 VO
        List<NavigationVO> voList = flatNavs.stream()
                .map(this::entityToVO)
                .collect(Collectors.toList());

        // 2. 构建 ID → VO 映射
        Map<Long, NavigationVO> voMap = voList.stream()
                .collect(Collectors.toMap(NavigationVO::getId, vo -> vo));

        // 3. 组装树状结构
        List<NavigationVO> rootTree = new ArrayList<>();
        for (NavigationVO vo : voList) {
            Long parentId = vo.getParentId();
            if (parentId == null) {
                rootTree.add(vo);
            } else {
                NavigationVO parentVO = voMap.get(parentId);
                if (parentVO != null) {
                    parentVO.getChildren().add(vo);
                } else {
                    // 父节点缺失时，防御性提升为根节点
                    rootTree.add(vo);
                }
            }
        }

        return rootTree;
    }

    /**
     * 将 Entity 转换为 VO（不含 children）
     */
    private NavigationVO entityToVO(Navigation entity) {
        return NavigationVO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .parentId(entity.getParentId())
                .linkType(entity.getLinkType())
                .linkTargetId(entity.getLinkTargetId())
                .linkUrl(entity.getLinkUrl())
                .icon(entity.getIcon())
                .position(entity.getPosition())
                .sortOrder(entity.getSortOrder())
                .isVisible(entity.getIsVisible())
                .isOpenNewTab(entity.getIsOpenNewTab())
                .build();
    }
}

```

', NULL, NULL, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 'f', 't', 0, 0, 0, 6746, 23, NULL, NULL, NULL, NULL, 'ARTICLE', NULL, '2026-06-17 10:06:03.233954', '2026-06-17 10:05:46.3517', '2026-06-17 10:16:36.345172', '2026-06-17 10:16:36.314557');
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "seo_title", "seo_description", "seo_keywords", "template", "content_type", "extra", "published_at", "created_at", "updated_at", "deleted_at") VALUES (2, 'test', 'test', NULL, '```java
package com.butvan.blog.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.butvan.blog")
@EntityScan(basePackages = "com.butvan.blog.pojo.entity")
@EnableJpaRepositories(basePackages = "com.butvan.blog.service.repository")
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}

```

### 感悟

> 今天天气还算可以

![](http://localhost:8080/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png)



## hhh

### 今天的感悟

![](http://localhost:8080/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png)

', '```java
package com.butvan.blog.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.butvan.blog")
@EntityScan(basePackages = "com.butvan.blog.pojo.entity")
@EnableJpaRepositories(basePackages = "com.butvan.blog.service.repository")
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}

```

### 感悟

> 今天天气还算可以

![](http://localhost:8080/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png)



## hhh

### 今天的感悟

![](http://localhost:8080/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png)

', NULL, 2, 1, 'PUBLISHED', 'PUBLIC', NULL, 't', 't', 't', 0, 2, 3, 845, 3, NULL, NULL, NULL, NULL, 'ARTICLE', NULL, '2026-06-17 10:17:12.50725', '2026-06-17 10:17:12.507211', '2026-07-09 13:20:12.586922', NULL);
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "seo_title", "seo_description", "seo_keywords", "template", "content_type", "extra", "published_at", "created_at", "updated_at", "deleted_at") VALUES (3, '111', '111', NULL, '', '', NULL, 3, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 'f', 't', 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 'ARTICLE', NULL, '2026-07-07 21:45:05.331527', '2026-07-07 21:45:05.331484', '2026-07-07 21:45:05.331508', NULL);
COMMIT;

-- ----------------------------
-- Table structure for blog_article_like
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_article_like";
CREATE TABLE "public"."blog_article_like" (
  "id" int8 NOT NULL DEFAULT nextval('blog_article_like_id_seq'::regclass),
  "article_id" int8 NOT NULL,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default" NOT NULL,
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "user_id" int8
)
;
ALTER TABLE "public"."blog_article_like" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_article_like"."article_id" IS '被点赞文章ID';
COMMENT ON COLUMN "public"."blog_article_like"."ip_address" IS '访客IP地址';
COMMENT ON COLUMN "public"."blog_article_like"."user_agent" IS '访客设备浏览器UA';
COMMENT ON COLUMN "public"."blog_article_like"."created_at" IS '点赞时间';
COMMENT ON TABLE "public"."blog_article_like" IS '文章点赞记录表 — 记录游客与用户点赞防止重复刷赞';

-- ----------------------------
-- Records of blog_article_like
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_article_like" ("id", "article_id", "ip_address", "user_agent", "created_at", "user_id") VALUES (3, 2, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15', '2026-06-20 18:08:31.447065', NULL);
INSERT INTO "public"."blog_article_like" ("id", "article_id", "ip_address", "user_agent", "created_at", "user_id") VALUES (5, 2, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-09 13:20:12.583904', NULL);
COMMIT;

-- ----------------------------
-- Table structure for blog_article_tag
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_article_tag";
CREATE TABLE "public"."blog_article_tag" (
  "article_id" int8 NOT NULL,
  "tag_id" int8 NOT NULL
)
;
ALTER TABLE "public"."blog_article_tag" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_article_tag"."article_id" IS '文章ID';
COMMENT ON COLUMN "public"."blog_article_tag"."tag_id" IS '标签ID';
COMMENT ON TABLE "public"."blog_article_tag" IS '文章-标签关联表 — 多对多中间表';

-- ----------------------------
-- Records of blog_article_tag
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_article_tag" ("article_id", "tag_id") VALUES (2, 4);
COMMIT;

-- ----------------------------
-- Table structure for blog_article_version
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_article_version";
CREATE TABLE "public"."blog_article_version" (
  "id" int8 NOT NULL DEFAULT nextval('blog_article_version_id_seq'::regclass),
  "article_id" int8 NOT NULL,
  "version_number" int4 NOT NULL,
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "change_summary" varchar(500) COLLATE "pg_catalog"."default",
  "word_count" int4 DEFAULT 0,
  "editor_id" int8 NOT NULL,
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_article_version" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_article_version"."article_id" IS '所属文章ID';
COMMENT ON COLUMN "public"."blog_article_version"."version_number" IS '版本号（从1递增）';
COMMENT ON COLUMN "public"."blog_article_version"."title" IS '该版本的标题';
COMMENT ON COLUMN "public"."blog_article_version"."content" IS '该版本的Markdown正文';
COMMENT ON COLUMN "public"."blog_article_version"."change_summary" IS '变更说明';
COMMENT ON COLUMN "public"."blog_article_version"."word_count" IS '该版本字数';
COMMENT ON COLUMN "public"."blog_article_version"."editor_id" IS '编辑者ID';
COMMENT ON COLUMN "public"."blog_article_version"."created_at" IS '版本创建时间';
COMMENT ON TABLE "public"."blog_article_version" IS '文章版本历史表 — 记录每次编辑快照';

-- ----------------------------
-- Records of blog_article_version
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_category
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_category";
CREATE TABLE "public"."blog_category" (
  "id" int8 NOT NULL DEFAULT nextval('blog_category_id_seq'::regclass),
  "name" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "parent_id" int8,
  "icon" varchar(100) COLLATE "pg_catalog"."default",
  "sort_order" int4 DEFAULT 0,
  "article_count" int4 DEFAULT 0,
  "is_visible" bool DEFAULT true,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_category" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_category"."name" IS '分类名称，如"前端开发"';
COMMENT ON COLUMN "public"."blog_category"."slug" IS 'URL友好标识，如frontend';
COMMENT ON COLUMN "public"."blog_category"."description" IS '分类简要描述';
COMMENT ON COLUMN "public"."blog_category"."parent_id" IS '父分类ID（NULL=顶级分类）';
COMMENT ON COLUMN "public"."blog_category"."icon" IS '图标（emoji或class名）';
COMMENT ON COLUMN "public"."blog_category"."sort_order" IS '同级排序权重';
COMMENT ON COLUMN "public"."blog_category"."article_count" IS '该分类下已发布文章数';
COMMENT ON COLUMN "public"."blog_category"."is_visible" IS '是否在前台导航显示';
COMMENT ON COLUMN "public"."blog_category"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_category"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_category" IS '分类表 — 支持两级树状分类';

-- ----------------------------
-- Records of blog_category
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (2, '后端开发', 'backend', 'Java, Spring Boot, Spring Cloud, PostgreSQL 等后端技术', NULL, NULL, 2, 1, 't', '2026-06-17 02:08:03.3425', '2026-06-17 10:17:12.536321');
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (1, '前端开发', 'frontend', 'React, Next.js, Tailwind CSS 等前端前沿技术', NULL, NULL, 1, 0, 't', '2026-06-17 02:08:03.3425', '2026-06-18 16:04:41.625118');
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (3, '随笔感悟', 'life', '生活记录、读书心得与个人感悟', NULL, NULL, 3, 1, 't', '2026-06-17 02:08:03.3425', '2026-07-07 21:45:05.394698');
COMMIT;

-- ----------------------------
-- Table structure for blog_comment
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_comment";
CREATE TABLE "public"."blog_comment" (
  "id" int8 NOT NULL DEFAULT nextval('blog_comment_id_seq'::regclass),
  "article_id" int8 NOT NULL,
  "parent_id" int8,
  "user_id" int8,
  "visitor_name" varchar(50) COLLATE "pg_catalog"."default",
  "visitor_email" varchar(100) COLLATE "pg_catalog"."default",
  "visitor_website" varchar(255) COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PENDING'::character varying,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "like_count" int4 DEFAULT 0,
  "is_author_replied" bool DEFAULT false,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6),
  "is_pinned" bool DEFAULT false,
  "is_author" bool DEFAULT false
)
;
ALTER TABLE "public"."blog_comment" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_comment"."article_id" IS '评论所属文章ID';
COMMENT ON COLUMN "public"."blog_comment"."parent_id" IS '父评论ID（NULL=顶级评论）';
COMMENT ON COLUMN "public"."blog_comment"."user_id" IS '评论者ID（登录用户时填写）';
COMMENT ON COLUMN "public"."blog_comment"."visitor_name" IS '访客昵称（未登录时填写）';
COMMENT ON COLUMN "public"."blog_comment"."visitor_email" IS '访客邮箱（用于回复通知）';
COMMENT ON COLUMN "public"."blog_comment"."visitor_website" IS '访客个人网站URL';
COMMENT ON COLUMN "public"."blog_comment"."content" IS '评论正文内容';
COMMENT ON COLUMN "public"."blog_comment"."status" IS '状态: APPROVED|PENDING|SPAM|TRASH';
COMMENT ON COLUMN "public"."blog_comment"."ip_address" IS '评论者IP（IPv4/IPv6）';
COMMENT ON COLUMN "public"."blog_comment"."user_agent" IS '浏览器User-Agent';
COMMENT ON COLUMN "public"."blog_comment"."like_count" IS '被点赞数';
COMMENT ON COLUMN "public"."blog_comment"."is_author_replied" IS '文章作者是否已回复此评论';
COMMENT ON COLUMN "public"."blog_comment"."created_at" IS '评论时间';
COMMENT ON COLUMN "public"."blog_comment"."updated_at" IS '修改时间';
COMMENT ON COLUMN "public"."blog_comment"."deleted_at" IS '软删除标记';
COMMENT ON COLUMN "public"."blog_comment"."is_pinned" IS '是否置顶该评论';
COMMENT ON COLUMN "public"."blog_comment"."is_author" IS '标识该评论是否由作者/站长本身发表或被后台标记为作者发表';
COMMENT ON TABLE "public"."blog_comment" IS '评论表 — 支持登录/访客评论和嵌套回复';

-- ----------------------------
-- Records of blog_comment
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (4, 2, 3, 1, '可梵', '1973578950@qq.com', NULL, 'thanks', 'APPROVED', '127.0.0.1', 'System Admin Panel', 0, 'f', '2026-06-18 16:42:19.020796', '2026-06-18 16:42:19.020819', NULL, 'f', 'f');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (3, 2, NULL, NULL, 'test', '12312321@qq.com', NULL, '### hhh
> dasiuhd
# dadadasdsadasd', 'APPROVED', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 0, 't', '2026-06-18 16:14:43.945458', '2026-06-20 11:08:00.496973', NULL, 'f', 'f');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (6, 2, NULL, NULL, '4yshop', '4763ydbiweh@qq.com', NULL, '可以的做的不错', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15', 0, 'f', '2026-06-20 16:14:58.629693', '2026-06-20 16:14:58.629709', NULL, 'f', 'f');
COMMIT;

-- ----------------------------
-- Table structure for blog_comment_ban
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_comment_ban";
CREATE TABLE "public"."blog_comment_ban" (
  "id" int8 NOT NULL DEFAULT nextval('blog_comment_ban_id_seq'::regclass),
  "created_at" timestamp(6) NOT NULL,
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "ip_address" varchar(45) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."blog_comment_ban" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_comment_ban"."id" IS '主键唯一标识 ID';
COMMENT ON COLUMN "public"."blog_comment_ban"."created_at" IS '执行封禁的时间';
COMMENT ON COLUMN "public"."blog_comment_ban"."email" IS '被封禁的访客电子邮箱地址';
COMMENT ON COLUMN "public"."blog_comment_ban"."ip_address" IS '被封禁的客户端 IP 地址';
COMMENT ON TABLE "public"."blog_comment_ban" IS '评论封禁表 — 存储被封禁的IP和邮箱';

-- ----------------------------
-- Records of blog_comment_ban
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_friend_link
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_friend_link";
CREATE TABLE "public"."blog_friend_link" (
  "id" int8 NOT NULL DEFAULT nextval('blog_friend_link_id_seq'::regclass),
  "site_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "site_url" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "site_logo" varchar(500) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "sort_order" int4 DEFAULT 0,
  "is_visible" bool DEFAULT true,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "category" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'TECH'::character varying,
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PENDING'::character varying,
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6),
  "remark" varchar(500) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."blog_friend_link" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_friend_link"."site_name" IS '对方站点名称';
COMMENT ON COLUMN "public"."blog_friend_link"."site_url" IS '对方站点URL';
COMMENT ON COLUMN "public"."blog_friend_link"."site_logo" IS '对方Logo图片URL';
COMMENT ON COLUMN "public"."blog_friend_link"."description" IS '简短介绍语';
COMMENT ON COLUMN "public"."blog_friend_link"."sort_order" IS '排序权重';
COMMENT ON COLUMN "public"."blog_friend_link"."is_visible" IS '是否在前台显示';
COMMENT ON COLUMN "public"."blog_friend_link"."created_at" IS '添加时间';
COMMENT ON COLUMN "public"."blog_friend_link"."category" IS '分类: TECH(技术博客)|DESIGN(设计创意)|LIFE(生活记录)|PERSONAL(个人站点)';
COMMENT ON COLUMN "public"."blog_friend_link"."email" IS '邮箱（不公开，仅用于联系）';
COMMENT ON COLUMN "public"."blog_friend_link"."status" IS '状态: PENDING(待审核)|APPROVED(已通过)|REJECTED(已拒绝)';
COMMENT ON COLUMN "public"."blog_friend_link"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."blog_friend_link"."deleted_at" IS '软删除时间';
COMMENT ON COLUMN "public"."blog_friend_link"."remark" IS '备注';
COMMENT ON TABLE "public"."blog_friend_link" IS '友链表 — 管理友情链接列表';

-- ----------------------------
-- Records of blog_friend_link
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_friend_link" ("id", "site_name", "site_url", "site_logo", "description", "sort_order", "is_visible", "created_at", "category", "email", "status", "updated_at", "deleted_at", "remark") VALUES (4, '云语匀雨--把刹那的光影与潮汐，悄悄写进云语匀雨的半页清欢', 'https://4yshop.top', 'https://4yshop.top/favicon.ico', '本网站为个人非经营性网站，分享自用小工具与学习笔记，仅用于个人学习与交流。', 0, 't', '2026-07-02 13:41:05.075821', 'TECH', '46542354432@qq.com', 'APPROVED', '2026-07-02 13:41:11.18529', NULL, NULL);
INSERT INTO "public"."blog_friend_link" ("id", "site_name", "site_url", "site_logo", "description", "sort_order", "is_visible", "created_at", "category", "email", "status", "updated_at", "deleted_at", "remark") VALUES (1, 'shy', 'https://4yshop.top', '', '软件中心', 0, 't', '2026-06-30 09:53:17.51539', 'TECH', '1973578950@qq.com', 'APPROVED', '2026-07-06 18:49:14.184275', '2026-07-06 18:49:14.182783', NULL);
INSERT INTO "public"."blog_friend_link" ("id", "site_name", "site_url", "site_logo", "description", "sort_order", "is_visible", "created_at", "category", "email", "status", "updated_at", "deleted_at", "remark") VALUES (2, 'test', 'https://blog.grtsinry43.com/', '', 'test', 0, 't', '2026-06-30 12:59:25.869853', 'TECH', '12376232@qq.com', 'APPROVED', '2026-07-06 18:49:17.209729', '2026-07-06 18:49:17.209224', NULL);
INSERT INTO "public"."blog_friend_link" ("id", "site_name", "site_url", "site_logo", "description", "sort_order", "is_visible", "created_at", "category", "email", "status", "updated_at", "deleted_at", "remark") VALUES (3, '4yshop', 'https://4yshop.top', 'http://localhost:8080/uploads/77ad0346-df0f-4f2c-a71e-8997e98f21af.jpg', '一个很棒的软件中心', 0, 't', '2026-07-02 13:25:43.304755', 'PERSONAL', '3424325324@qq.com', 'APPROVED', '2026-07-06 18:49:21.728231', '2026-07-06 18:49:21.727707', NULL);
COMMIT;

-- ----------------------------
-- Table structure for blog_homepage_hotspot
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_homepage_hotspot";
CREATE TABLE "public"."blog_homepage_hotspot" (
  "id" int8 NOT NULL DEFAULT nextval('blog_homepage_hotspot_id_seq'::regclass),
  "scene_id" int8 NOT NULL,
  "item_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "item_image_url" varchar(500) COLLATE "pg_catalog"."default",
  "x_percent" numeric(5,2) NOT NULL,
  "y_percent" numeric(5,2) NOT NULL,
  "width_percent" numeric(5,2) NOT NULL,
  "height_percent" numeric(5,2),
  "geometry_ext" jsonb,
  "hover_tips" varchar(255) COLLATE "pg_catalog"."default",
  "redirect_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "redirect_path" varchar(500) COLLATE "pg_catalog"."default",
  "redirect_target_id" int8,
  "zoom_scale" numeric(3,2) DEFAULT 3.0,
  "sort_order" int4 DEFAULT 0,
  "is_visible" bool DEFAULT true,
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_homepage_hotspot" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."scene_id" IS '所属场景ID';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."item_name" IS '物品名称，如"电脑"、"台灯"';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."item_image_url" IS 'v0.2: 透明抠图PNG文件地址';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."x_percent" IS 'v0.2: 左边界X坐标百分比(0.00~100.00)';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."y_percent" IS 'v0.2: 上边界Y坐标百分比(0.00~100.00)';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."width_percent" IS 'v0.2: 物品宽度百分比';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."height_percent" IS 'v0.3: 物品高度百分比';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."geometry_ext" IS '扩展几何属性JSON: rotate, opacity, shape, animation';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."hover_tips" IS '悬浮提示文案';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."redirect_type" IS '跳转类型: INTERNAL|EXTERNAL|ARTICLE|CATEGORY';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."redirect_path" IS '跳转URL（EXTERNAL或INTERNAL时用）';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."redirect_target_id" IS 'v0.2: 跳转目标ID（ARTICLE或CATEGORY时用）';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."zoom_scale" IS '镜头缩放比例（1.0=不缩放）';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."sort_order" IS '排序号（控制z-index渲染层级）';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."is_visible" IS 'v0.2: 是否在前台显示';
COMMENT ON COLUMN "public"."blog_homepage_hotspot"."created_at" IS '创建时间';
COMMENT ON TABLE "public"."blog_homepage_hotspot" IS '热区/物品表 — 场景中可交互的物品';

-- ----------------------------
-- Records of blog_homepage_hotspot
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_homepage_hotspot" ("id", "scene_id", "item_name", "item_image_url", "x_percent", "y_percent", "width_percent", "height_percent", "geometry_ext", "hover_tips", "redirect_type", "redirect_path", "redirect_target_id", "zoom_scale", "sort_order", "is_visible", "created_at") VALUES (28, 8, '椅子', '/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', 53.31, 50.46, 8.47, 19.93, NULL, '休息会', 'INTERNAL', '/about', NULL, 3.00, 10, 't', '2026-06-15 17:12:47.009843');
INSERT INTO "public"."blog_homepage_hotspot" ("id", "scene_id", "item_name", "item_image_url", "x_percent", "y_percent", "width_percent", "height_percent", "geometry_ext", "hover_tips", "redirect_type", "redirect_path", "redirect_target_id", "zoom_scale", "sort_order", "is_visible", "created_at") VALUES (27, 8, '电脑', '/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', 12.64, 50.25, 9.30, 14.84, NULL, '来看看我最近在干嘛吧', 'INTERNAL', '/guestbook', NULL, 3.00, 10, 't', '2026-06-15 17:06:35.954691');
INSERT INTO "public"."blog_homepage_hotspot" ("id", "scene_id", "item_name", "item_image_url", "x_percent", "y_percent", "width_percent", "height_percent", "geometry_ext", "hover_tips", "redirect_type", "redirect_path", "redirect_target_id", "zoom_scale", "sort_order", "is_visible", "created_at") VALUES (29, 8, '书籍', '/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', 31.96, 58.31, 7.63, 16.75, NULL, '看看我最近写了什么吧', 'INTERNAL', '/article', NULL, 3.00, 10, 't', '2026-06-15 17:23:19.005584');
INSERT INTO "public"."blog_homepage_hotspot" ("id", "scene_id", "item_name", "item_image_url", "x_percent", "y_percent", "width_percent", "height_percent", "geometry_ext", "hover_tips", "redirect_type", "redirect_path", "redirect_target_id", "zoom_scale", "sort_order", "is_visible", "created_at") VALUES (30, 8, '枕头', '/uploads/52b9560b-bdc9-4633-a421-2a5af0c9be65.png', 83.29, 67.65, 11.83, 17.94, NULL, '框选裁剪的物品', 'INTERNAL', '/guestbook', NULL, 3.00, 10, 't', '2026-06-29 17:36:24.745017');
COMMIT;

-- ----------------------------
-- Table structure for blog_homepage_scene
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_homepage_scene";
CREATE TABLE "public"."blog_homepage_scene" (
  "id" int8 NOT NULL DEFAULT nextval('blog_homepage_scene_id_seq'::regclass),
  "title" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "image_url" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "is_active" bool NOT NULL DEFAULT false,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_homepage_scene" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_homepage_scene"."title" IS '场景标题，如"我的书房"';
COMMENT ON COLUMN "public"."blog_homepage_scene"."image_url" IS '房间背景图URL（高分辨率）';
COMMENT ON COLUMN "public"."blog_homepage_scene"."is_active" IS '是否当前启用（全局唯一为true）';
COMMENT ON COLUMN "public"."blog_homepage_scene"."created_at" IS '创建时间（自动填充）';
COMMENT ON COLUMN "public"."blog_homepage_scene"."updated_at" IS '更新时间（自动更新）';
COMMENT ON TABLE "public"."blog_homepage_scene" IS '首页场景表 — 存储房间场景数据';

-- ----------------------------
-- Records of blog_homepage_scene
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_homepage_scene" ("id", "title", "image_url", "is_active", "created_at", "updated_at") VALUES (4, '大树', '/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', 'f', '2026-06-15 09:17:06.152767', '2026-06-15 15:56:47.50927');
INSERT INTO "public"."blog_homepage_scene" ("id", "title", "image_url", "is_active", "created_at", "updated_at") VALUES (6, '主场景', '/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', 'f', '2026-06-15 16:28:52.497753', '2026-06-15 16:29:34.544306');
INSERT INTO "public"."blog_homepage_scene" ("id", "title", "image_url", "is_active", "created_at", "updated_at") VALUES (7, '真实风格', '/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', 'f', '2026-06-15 16:30:16.515745', '2026-06-15 16:53:47.278839');
INSERT INTO "public"."blog_homepage_scene" ("id", "title", "image_url", "is_active", "created_at", "updated_at") VALUES (8, 'xiaohongshu', '/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', 't', '2026-06-15 16:53:45.649704', '2026-06-15 16:53:47.283227');
COMMIT;

-- ----------------------------
-- Table structure for blog_media
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_media";
CREATE TABLE "public"."blog_media" (
  "id" int8 NOT NULL DEFAULT nextval('blog_media_id_seq'::regclass),
  "file_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "file_path" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "file_url" varchar(500) COLLATE "pg_catalog"."default" NOT NULL,
  "file_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "mime_type" varchar(100) COLLATE "pg_catalog"."default",
  "file_size" int8,
  "width" int4,
  "height" int4,
  "alt_text" varchar(255) COLLATE "pg_catalog"."default",
  "bucket_name" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'local'::character varying,
  "uploader_id" int8,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "source_type" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'MANUAL'::character varying,
  "source_id" int8,
  "source_detail" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "public"."blog_media" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_media"."file_name" IS '原始文件名（含扩展名）';
COMMENT ON COLUMN "public"."blog_media"."file_path" IS '存储相对路径';
COMMENT ON COLUMN "public"."blog_media"."file_url" IS '完整访问URL';
COMMENT ON COLUMN "public"."blog_media"."file_type" IS '文件大类: IMAGE|VIDEO|DOCUMENT|OTHER';
COMMENT ON COLUMN "public"."blog_media"."mime_type" IS 'MIME类型，如image/png';
COMMENT ON COLUMN "public"."blog_media"."file_size" IS '文件大小（字节）';
COMMENT ON COLUMN "public"."blog_media"."width" IS '图片/视频宽度（px）';
COMMENT ON COLUMN "public"."blog_media"."height" IS '图片/视频高度（px）';
COMMENT ON COLUMN "public"."blog_media"."alt_text" IS '图片替代文字（无障碍）';
COMMENT ON COLUMN "public"."blog_media"."bucket_name" IS '存储桶标识: local|aliyun-oss等';
COMMENT ON COLUMN "public"."blog_media"."uploader_id" IS '上传者ID';
COMMENT ON COLUMN "public"."blog_media"."created_at" IS '上传时间';
COMMENT ON COLUMN "public"."blog_media"."source_type" IS '来源类型/归属模块: ARTICLE|SCENE|USER_AVATAR|SYSTEM_CONFIG|MANUAL';
COMMENT ON COLUMN "public"."blog_media"."source_id" IS '来源实体唯一ID';
COMMENT ON COLUMN "public"."blog_media"."source_detail" IS '详细来源说明文本（如：文章《xxx》的插图）';
COMMENT ON TABLE "public"."blog_media" IS '媒体资源表 — 统一管理上传的静态资源';

-- ----------------------------
-- Records of blog_media
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (1, 'fWdgJuAOF.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', '/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', 'IMAGE', 'image/jpeg', 1023770, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:13.578147', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (2, 'crop-1781440432479.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', '/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', 'IMAGE', 'image/png', 46768, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:52.4931', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (3, 'crop-1781441144723.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', '/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', 'IMAGE', 'image/png', 196002, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:44.741133', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (4, 'crop-1781441152613.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', '/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', 'IMAGE', 'image/png', 223736, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:52.627417', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (5, 'crop-1781441158032.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', '/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', 'IMAGE', 'image/png', 228626, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:58.046616', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (6, 'crop-1781441413702.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', '/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', 'IMAGE', 'image/png', 290588, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:13.731449', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (7, 'crop-1781441449421.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', '/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', 'IMAGE', 'image/png', 208139, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:49.43597', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (8, 'crop-1781441664900.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', '/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', 'IMAGE', 'image/png', 196322, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:54:24.94014', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (9, 'crop-1781441841386.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', '/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', 'IMAGE', 'image/png', 221932, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:57:21.42216', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (10, 'crop-1781442973142.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', '/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', 'IMAGE', 'image/png', 207769, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:16:13.180014', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (11, 'crop-1781444106016.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', '/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', 'IMAGE', 'image/png', 50964, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:06.055588', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (12, 'crop-1781444118983.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', '/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', 'IMAGE', 'image/png', 98563, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:18.998345', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (13, 'crop-1781444139339.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', '/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', 'IMAGE', 'image/png', 74407, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:39.354885', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (14, 'crop-1781444212668.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', '/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', 'IMAGE', 'image/png', 424584, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:36:52.68792', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (15, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', '/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:37:44.760827', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (16, 'crop-1781444308361.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', '/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', 'IMAGE', 'image/png', 27677, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:28.371855', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (17, 'crop-1781444339391.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', '/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', 'IMAGE', 'image/png', 82954, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:59.4049', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (18, 'crop-1781444563530.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', '/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', 'IMAGE', 'image/png', 75860, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:42:43.542653', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (19, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', '/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:22.391892', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (20, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', '/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:36.47345', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (21, 'crop-1781445918890.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', '/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', 'IMAGE', 'image/png', 83094, NULL, NULL, NULL, 'local', NULL, '2026-06-14 22:05:18.928014', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (22, 'crop-1781481053968.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', '/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', 'IMAGE', 'image/png', 58620, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:50:54.009721', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (23, 'crop-1781481411972.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', '/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', 'IMAGE', 'image/png', 25289, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:56:51.988539', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (24, 'crop-1781482539995.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', '/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', 'IMAGE', 'image/png', 74669, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:40.028816', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (25, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', '/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:46.563153', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (26, 'crop-1781482602982.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', '/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', 'IMAGE', 'image/png', 64576, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:42.996483', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (27, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', '/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:48.034915', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (28, 'crop-1781484024860.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', '/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', 'IMAGE', 'image/png', 220818, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:24.880864', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (29, 'crop-1781484046981.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', '/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', 'IMAGE', 'image/png', 129071, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:46.99655', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (30, '椅子-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', '/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', 'IMAGE', 'image/jpeg', 296840, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:53.765589', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (31, 'crop-1781484646428.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', '/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', 'IMAGE', 'image/png', 44499, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:46.445246', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (32, '桌子上的书籍-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', '/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', 'IMAGE', 'image/jpeg', 413948, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:52.062866', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (33, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', '/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:16:57.389299', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (34, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', '/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:23:50.30581', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (35, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', '/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 10:12:03.049569', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (36, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', '/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:28:44.980526', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (37, 'IMG_8747.jpg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', '/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', 'IMAGE', 'image/jpeg', 264532, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:30:11.314881', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (38, 'fWlTaMZsT.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', '/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', 'IMAGE', 'image/png', 1644415, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:53:40.335232', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (39, 'crop-1781514395901.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', '/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', 'IMAGE', 'image/png', 673475, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:06:35.923915', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (40, 'crop-1781514766967.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', '/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', 'IMAGE', 'image/png', 910697, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:12:46.992397', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (41, 'crop-1781515398951.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', '/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', 'IMAGE', 'image/png', 515992, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:23:18.975993', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (42, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png', '/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-20 16:21:28.519611', 'MANUAL', NULL, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (43, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png', '/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-20 17:25:53.640912', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (44, 'crop-1782725784671.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/52b9560b-bdc9-4633-a421-2a5af0c9be65.png', '/uploads/52b9560b-bdc9-4633-a421-2a5af0c9be65.png', 'IMAGE', 'image/png', 935218, NULL, NULL, NULL, 'local', NULL, '2026-06-29 17:36:24.719641', 'SCENE', 8, '房间场景 - xiaohongshu - 框选自动裁剪物品');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (45, 'butvan_.png', '87a371bd-7bb1-425c-a161-af27112b5b41.png', 'http://47.102.205.85:19000/blog2/87a371bd-7bb1-425c-a161-af27112b5b41.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260705T004357Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7ceba0d11e820c6579428cb9fbfaab18b665b4d6875d692c25ec105ede955d40', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-05 08:43:57.332995', 'USER_AVATAR', NULL, '用户头像');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (46, '大树仰拍-4K.png', 'f07a827c-9341-4681-b5db-18cb536c85f0.png', 'http://47.102.205.85:19000/blog2/f07a827c-9341-4681-b5db-18cb536c85f0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260705T010745Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ec98861cbc3c1d86489ee4d31e460cb4ee02dd7ff8d10648dc34cd7e29558354', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'minio', NULL, '2026-07-05 09:07:45.796439', 'SYSTEM_CONFIG', NULL, '站点全局背景图片');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (47, '场景.png', '372e0077-a1fe-4579-ac5f-4e655f453d1e.png', 'http://47.102.205.85:19000/blog2/372e0077-a1fe-4579-ac5f-4e655f453d1e.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260706%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260706T125259Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=257a11166d788dc636d59fea8b748779afdad9ffef37820102f5a4ff3d69b84f', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'minio', NULL, '2026-07-06 20:52:59.301957', 'ALBUM', 1, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (48, 'butvan_.png', '498bf7a8-c3ff-4e4c-bd95-5c3795eb527f.png', 'http://47.102.205.85:19000/blog2/498bf7a8-c3ff-4e4c-bd95-5c3795eb527f.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260707%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260707T065113Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=a86a96f98bb9e7fbdf0d15906d591799ccef7f171ebafd9c80ea2305183803fc', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-07 14:51:13.713778', 'ALBUM', 1, NULL);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (49, 'butvan_person.jpeg', 'bea69d1b-f0b8-48b6-a8b1-ad2e34c4f852.jpeg', 'http://47.102.205.85:19000/blog2/bea69d1b-f0b8-48b6-a8b1-ad2e34c4f852.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T024438Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d1938ebe1e716d24dec280902af070ff7fea5b1d495c5e7df622c6064bb1aabd', 'IMAGE', 'image/jpeg', 205786, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 10:44:38.786071', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (50, '64988.JPG', '3430805c-350c-47a9-8069-652e037e7853.jpg', 'http://47.102.205.85:19000/blog2/3430805c-350c-47a9-8069-652e037e7853.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T024459Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b486132ad9b388e7e2234cca63f9b405a47c6b1296896a293132ddd3a0dc81fb', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 10:44:59.233372', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (51, 'butvan_.png', '5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png', 'http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=53c75cf9ff65dc9ef5a0743ca224fba4a7aa4d0492b70044566be2a8be307e20', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:02:27.552205', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (52, '物品信息.png', 'ff4c5588-580c-4ad9-abfd-48d59cd395c0.png', 'http://47.102.205.85:19000/blog2/ff4c5588-580c-4ad9-abfd-48d59cd395c0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6edbd316bcb6ee772b92c9b08421961d0aa960f62be1a14453c87981c3c87c91', 'IMAGE', 'image/png', 1714750, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:02:41.814491', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (53, '64988.JPG', '21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg', 'http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f3c2a32348762d4188ede566ab2ed11277eef4e2b60d6d3c2177198cf42fed6', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:09:22.827473', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (54, 'butvan_bak.png', 'dd4ebffb-addf-4684-8479-ecf8aa66eca5.png', 'http://47.102.205.85:19000/blog2/dd4ebffb-addf-4684-8479-ecf8aa66eca5.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030936Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=278260a79ac34c4acbce91b91f1f4b0b900087157598d8ef48cb8e876745ff56', 'IMAGE', 'image/png', 1853926, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:09:36.821196', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (56, 'butvan_.png', 'f38e5a12-c9f2-4417-bcff-c80cd6f94941.png', 'http://47.102.205.85:19000/blog2/f38e5a12-c9f2-4417-bcff-c80cd6f94941.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031828Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43b373d2a64203ee90006fde679d55ec1b5411ad9c7abbdb77a10679c1ac4284', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:18:28.46905', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (55, '64988.JPG', '35589100-d66e-48c1-8881-de16ce92ca63.jpg', 'http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bcf26a83290eb5a3cde7c8ab89d090a81f5a4bfcd8e8cc27dc1713bd3f4a6c3', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:18:19.506978', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (57, 'butvan_.png', 'e87d9a6f-55db-4859-a350-e3444c5dc805.png', 'http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084050Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43d72d0d95537804824dcce3e234c6b9f09f5d856d080a83ea0a22c8bd839359', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:40:50.530776', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (58, 'butvan.png', '751bb102-fa2a-4289-9cd1-cf139aedadc3.png', 'http://47.102.205.85:19000/blog2/751bb102-fa2a-4289-9cd1-cf139aedadc3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084059Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ac13661142998f2ee6512d959ea4f0178ba12f171872c3b3ec41d6d1ce5d7ce9', 'IMAGE', 'image/png', 1801501, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:40:59.809453', 'ARTICLE', NULL, '文章正文插图');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail") VALUES (59, '大树仰拍-4K.png', '580c4014-b1da-485f-bd7a-1fa12a3f52f2.png', 'http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084537Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f5b26909c5140e6991f494050ffe51f281d63e76b900ccf42ccf488ce5acb9db', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:45:37.877547', 'ARTICLE', NULL, '文章正文插图');
COMMIT;

-- ----------------------------
-- Table structure for blog_navigation
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_navigation";
CREATE TABLE "public"."blog_navigation" (
  "id" int8 NOT NULL DEFAULT nextval('blog_navigation_id_seq'::regclass),
  "title" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "parent_id" int8,
  "link_type" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PAGE'::character varying,
  "link_target_id" int8,
  "link_url" varchar(500) COLLATE "pg_catalog"."default",
  "icon" varchar(100) COLLATE "pg_catalog"."default",
  "position" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'HEADER'::character varying,
  "sort_order" int4 DEFAULT 0,
  "is_visible" bool DEFAULT true,
  "is_open_new_tab" bool DEFAULT false,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_navigation" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_navigation"."title" IS '菜单显示文字';
COMMENT ON COLUMN "public"."blog_navigation"."parent_id" IS '父菜单ID（NULL=一级菜单）';
COMMENT ON COLUMN "public"."blog_navigation"."link_type" IS '链接类型: PAGE|CATEGORY|ARTICLE|EXTERNAL|NONE';
COMMENT ON COLUMN "public"."blog_navigation"."link_target_id" IS '关联目标ID';
COMMENT ON COLUMN "public"."blog_navigation"."link_url" IS '自定义URL（link_type=EXTERNAL时用）';
COMMENT ON COLUMN "public"."blog_navigation"."icon" IS '菜单图标（emoji或class名）';
COMMENT ON COLUMN "public"."blog_navigation"."position" IS '菜单位置: HEADER|FOOTER|SIDEBAR';
COMMENT ON COLUMN "public"."blog_navigation"."sort_order" IS '同级排序权重';
COMMENT ON COLUMN "public"."blog_navigation"."is_visible" IS '是否显示';
COMMENT ON COLUMN "public"."blog_navigation"."is_open_new_tab" IS '是否新窗口打开';
COMMENT ON COLUMN "public"."blog_navigation"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_navigation"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_navigation" IS '导航菜单表 — 多级树形菜单管理';

-- ----------------------------
-- Records of blog_navigation
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (36, '友链管理', 39, 'PAGE', NULL, '/friends', 'Link', 'ADMIN_SIDEBAR', 30, 't', 'f', '2026-06-30 00:42:34.200174', '2026-07-07 14:50:39.273797');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (40, '手记管理', 14, 'PAGE', NULL, '/notes', 'NotebookPen', 'ADMIN_SIDEBAR', 6, 't', 'f', '2026-07-07 07:30:27.109205', '2026-07-07 07:30:27.109205');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (42, '手记', NULL, 'PAGE', NULL, '/notes', 'FileText', 'SIDEBAR', 0, 't', 'f', '2026-07-07 15:35:41.812532', '2026-07-07 15:35:41.81255');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (43, '用户管理', 22, 'PAGE', NULL, '/users', 'Users', 'ADMIN_SIDEBAR', 2, 't', 'f', '2026-07-09 04:54:33.521618', '2026-07-09 04:54:33.521618');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (32, '媒体内容管理', 31, 'PAGE', NULL, '/media', 'Image', 'ADMIN_SIDEBAR', 20, 't', 'f', '2026-06-20 08:52:25.055261', '2026-06-21 09:43:26.458517');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (35, '友链', NULL, 'PAGE', NULL, '/friend', 'Sparkles', 'SIDEBAR', 0, 't', 'f', '2026-06-29 21:34:44.399178', '2026-06-30 08:59:10.01622');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (34, '文章', NULL, 'PAGE', NULL, '/article', 'BookOpen', 'SIDEBAR', 0, 't', 'f', '2026-06-29 21:34:12.291405', '2026-07-02 12:24:07.013085');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (37, '相册管理', 14, 'PAGE', NULL, '/albums', 'Images', 'ADMIN_SIDEBAR', 5, 't', 'f', '2026-07-06 12:28:47.385285', '2026-07-06 12:28:47.385285');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (38, '相册', NULL, 'PAGE', NULL, '/albums', 'Camera', 'SIDEBAR', 0, 't', 'f', '2026-07-06 20:39:37.545931', '2026-07-06 20:39:37.545937');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (33, '点赞记录管理', 39, 'PAGE', NULL, '/likes', 'Heart', 'ADMIN_SIDEBAR', 10, 't', 'f', '2026-06-21 00:08:02.556268', '2026-07-07 14:49:54.245415');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (27, '评论管理', 39, 'PAGE', NULL, '/comments', 'MessageSquare', 'ADMIN_SIDEBAR', 20, 't', 'f', '2026-06-18 08:08:57.5345', '2026-07-07 14:49:57.930483');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (15, '文章列表', 14, 'PAGE', NULL, '/articles', 'BookOpen', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (16, '分类管理', 14, 'PAGE', NULL, '/categories', 'FolderOpen', 'ADMIN_SIDEBAR', 2, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (17, '标签管理', 14, 'PAGE', NULL, '/tags', 'Tag', 'ADMIN_SIDEBAR', 3, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (19, '房间场景', 18, 'PAGE', NULL, '/scenes', 'Wallpaper', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (21, '个人资料', 20, 'PAGE', NULL, '/settings', 'UserCheck', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (23, '导航配置', 22, 'PAGE', NULL, '/navigation', 'Compass', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (39, '内容数据', NULL, 'NONE', NULL, NULL, 'Layers3', 'ADMIN_SIDEBAR', 30, 't', 'f', '2026-07-07 14:48:48.974438', '2026-07-07 14:50:16.830933');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (14, '内容管理', NULL, 'NONE', NULL, NULL, 'FileText', 'ADMIN_SIDEBAR', 20, 't', 'f', '2026-06-15 02:00:42.534223', '2026-07-07 14:50:16.830946');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (13, '工作台', NULL, 'PAGE', NULL, '/', 'Home', 'ADMIN_SIDEBAR', 10, 't', 'f', '2026-06-15 02:00:42.534223', '2026-07-07 14:50:16.831648');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (22, '系统管理', NULL, 'NONE', NULL, NULL, 'Settings', 'ADMIN_SIDEBAR', 70, 't', 'f', '2026-06-15 02:00:42.534223', '2026-07-07 14:50:34.150897');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (31, '资源管理', NULL, 'NONE', NULL, NULL, 'HardDrive', 'ADMIN_SIDEBAR', 80, 't', 'f', '2026-06-20 08:52:25.055261', '2026-07-07 14:50:34.150934');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (20, '个人中心', NULL, 'NONE', NULL, NULL, 'User', 'ADMIN_SIDEBAR', 60, 't', 'f', '2026-06-15 02:00:42.534223', '2026-07-07 14:50:34.151206');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (18, '场景空间', NULL, 'NONE', NULL, NULL, 'Sparkles', 'ADMIN_SIDEBAR', 50, 't', 'f', '2026-06-15 02:00:42.534223', '2026-07-07 14:50:34.15098');
COMMIT;

-- ----------------------------
-- Table structure for blog_note
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_note";
CREATE TABLE "public"."blog_note" (
  "id" int8 NOT NULL DEFAULT nextval('blog_note_id_seq'::regclass),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "content_html" text COLLATE "pg_catalog"."default",
  "summary" varchar(500) COLLATE "pg_catalog"."default",
  "cover_image_url" varchar(500) COLLATE "pg_catalog"."default",
  "mood" varchar(50) COLLATE "pg_catalog"."default",
  "weather" varchar(50) COLLATE "pg_catalog"."default",
  "location" varchar(200) COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DRAFT'::character varying,
  "is_pinned" bool DEFAULT false,
  "view_count" int8 DEFAULT 0,
  "like_count" int8 DEFAULT 0,
  "comment_count" int8 DEFAULT 0,
  "word_count" int4 DEFAULT 0,
  "reading_time" int4 DEFAULT 0,
  "author_id" int8 NOT NULL,
  "published_at" timestamp(6),
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "deleted_at" timestamp(6),
  "cover_image_urls" jsonb
)
;
ALTER TABLE "public"."blog_note" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_note"."id" IS '主键ID';
COMMENT ON COLUMN "public"."blog_note"."title" IS '手记标题';
COMMENT ON COLUMN "public"."blog_note"."slug" IS 'URL友好标识（英文/拼音）';
COMMENT ON COLUMN "public"."blog_note"."content" IS 'Markdown正文';
COMMENT ON COLUMN "public"."blog_note"."content_html" IS '渲染后HTML缓存';
COMMENT ON COLUMN "public"."blog_note"."summary" IS '摘要简介';
COMMENT ON COLUMN "public"."blog_note"."cover_image_url" IS '配图URL';
COMMENT ON COLUMN "public"."blog_note"."mood" IS '心情: 开心/思考中/忙碌/放松/感动/平静';
COMMENT ON COLUMN "public"."blog_note"."weather" IS '天气: 晴/多云/阴/雨/雪/风';
COMMENT ON COLUMN "public"."blog_note"."location" IS '位置描述';
COMMENT ON COLUMN "public"."blog_note"."status" IS '状态: DRAFT(草稿)|PUBLISHED(已发布)';
COMMENT ON COLUMN "public"."blog_note"."is_pinned" IS '是否置顶';
COMMENT ON COLUMN "public"."blog_note"."view_count" IS '冗余：累计浏览量';
COMMENT ON COLUMN "public"."blog_note"."like_count" IS '冗余：累计点赞数';
COMMENT ON COLUMN "public"."blog_note"."comment_count" IS '冗余：已通过评论数';
COMMENT ON COLUMN "public"."blog_note"."word_count" IS '正文字数';
COMMENT ON COLUMN "public"."blog_note"."reading_time" IS '预估阅读时间（分钟，按300字/分钟估算）';
COMMENT ON COLUMN "public"."blog_note"."author_id" IS '作者ID';
COMMENT ON COLUMN "public"."blog_note"."published_at" IS '正式发布时间';
COMMENT ON COLUMN "public"."blog_note"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_note"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."blog_note"."deleted_at" IS '软删除标记（非NULL=已删除）';
COMMENT ON TABLE "public"."blog_note" IS '手记表 — 轻量随笔/日常记录，独立于文章体系';

-- ----------------------------
-- Records of blog_note
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_note" ("id", "title", "slug", "content", "content_html", "summary", "cover_image_url", "mood", "weather", "location", "status", "is_pinned", "view_count", "like_count", "comment_count", "word_count", "reading_time", "author_id", "published_at", "created_at", "updated_at", "deleted_at", "cover_image_urls") VALUES (3, '的撒的饭撒', '%e7%9a%84%e6%92%92%e7%9a%84%e9%a5%ad%e6%92%92', '![](http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bcf26a83290eb5a3cde7c8ab89d090a81f5a4bfcd8e8cc27dc1713bd3f4a6c3)

fdsfds 

> dsff



![](http://47.102.205.85:19000/blog2/f38e5a12-c9f2-4417-bcff-c80cd6f94941.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031828Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43b373d2a64203ee90006fde679d55ec1b5411ad9c7abbdb77a10679c1ac4284)

', '![](http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bcf26a83290eb5a3cde7c8ab89d090a81f5a4bfcd8e8cc27dc1713bd3f4a6c3)

fdsfds 

> dsff



![](http://47.102.205.85:19000/blog2/f38e5a12-c9f2-4417-bcff-c80cd6f94941.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031828Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43b373d2a64203ee90006fde679d55ec1b5411ad9c7abbdb77a10679c1ac4284)

', NULL, 'http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bcf26a83290eb5a3cde7c8ab89d090a81f5a4bfcd8e8cc27dc1713bd3f4a6c3', NULL, NULL, NULL, 'PUBLISHED', 'f', 0, 0, 0, 687, 3, 1, '2026-07-08 11:18:35.512679', '2026-07-08 11:18:35.512666', '2026-07-08 16:38:20.520057', '2026-07-08 16:38:20.519364', '["http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7bcf26a83290eb5a3cde7c8ab89d090a81f5a4bfcd8e8cc27dc1713bd3f4a6c3", "http://47.102.205.85:19000/blog2/f38e5a12-c9f2-4417-bcff-c80cd6f94941.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T031828Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43b373d2a64203ee90006fde679d55ec1b5411ad9c7abbdb77a10679c1ac4284"]');
INSERT INTO "public"."blog_note" ("id", "title", "slug", "content", "content_html", "summary", "cover_image_url", "mood", "weather", "location", "status", "is_pinned", "view_count", "like_count", "comment_count", "word_count", "reading_time", "author_id", "published_at", "created_at", "updated_at", "deleted_at", "cover_image_urls") VALUES (1, 'test', 'test', '![](http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=53c75cf9ff65dc9ef5a0743ca224fba4a7aa4d0492b70044566be2a8be307e20)

hhh

![](http://47.102.205.85:19000/blog2/ff4c5588-580c-4ad9-abfd-48d59cd395c0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6edbd316bcb6ee772b92c9b08421961d0aa960f62be1a14453c87981c3c87c91)

', '![](http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=53c75cf9ff65dc9ef5a0743ca224fba4a7aa4d0492b70044566be2a8be307e20)

hhh

![](http://47.102.205.85:19000/blog2/ff4c5588-580c-4ad9-abfd-48d59cd395c0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6edbd316bcb6ee772b92c9b08421961d0aa960f62be1a14453c87981c3c87c91)

', NULL, 'http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=53c75cf9ff65dc9ef5a0743ca224fba4a7aa4d0492b70044566be2a8be307e20', '思考中', '晴', NULL, 'PUBLISHED', 't', 0, 0, 0, 673, 3, 1, '2026-07-08 10:45:23.774376', '2026-07-08 10:45:23.77434', '2026-07-08 11:08:56.614286', '2026-07-08 11:08:56.613356', '["http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030227Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=53c75cf9ff65dc9ef5a0743ca224fba4a7aa4d0492b70044566be2a8be307e20", "http://47.102.205.85:19000/blog2/ff4c5588-580c-4ad9-abfd-48d59cd395c0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6edbd316bcb6ee772b92c9b08421961d0aa960f62be1a14453c87981c3c87c91"]');
INSERT INTO "public"."blog_note" ("id", "title", "slug", "content", "content_html", "summary", "cover_image_url", "mood", "weather", "location", "status", "is_pinned", "view_count", "like_count", "comment_count", "word_count", "reading_time", "author_id", "published_at", "created_at", "updated_at", "deleted_at", "cover_image_urls") VALUES (2, 'test', 'test', 'dsd 

![](http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f3c2a32348762d4188ede566ab2ed11277eef4e2b60d6d3c2177198cf42fed6)

dskfk 

> dhisad 



![](http://47.102.205.85:19000/blog2/dd4ebffb-addf-4684-8479-ecf8aa66eca5.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030936Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=278260a79ac34c4acbce91b91f1f4b0b900087157598d8ef48cb8e876745ff56)

', 'dsd 

![](http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f3c2a32348762d4188ede566ab2ed11277eef4e2b60d6d3c2177198cf42fed6)

dskfk 

> dhisad 



![](http://47.102.205.85:19000/blog2/dd4ebffb-addf-4684-8479-ecf8aa66eca5.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030936Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=278260a79ac34c4acbce91b91f1f4b0b900087157598d8ef48cb8e876745ff56)

', NULL, 'http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f3c2a32348762d4188ede566ab2ed11277eef4e2b60d6d3c2177198cf42fed6', '思考中', '晴', NULL, 'PUBLISHED', 't', 0, 0, 0, 695, 3, 1, '2026-07-08 11:10:00.718355', '2026-07-08 11:09:49.070898', '2026-07-08 11:18:09.047876', '2026-07-08 11:18:09.047407', '["http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030922Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f3c2a32348762d4188ede566ab2ed11277eef4e2b60d6d3c2177198cf42fed6", "http://47.102.205.85:19000/blog2/dd4ebffb-addf-4684-8479-ecf8aa66eca5.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T030936Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=278260a79ac34c4acbce91b91f1f4b0b900087157598d8ef48cb8e876745ff56"]');
INSERT INTO "public"."blog_note" ("id", "title", "slug", "content", "content_html", "summary", "cover_image_url", "mood", "weather", "location", "status", "is_pinned", "view_count", "like_count", "comment_count", "word_count", "reading_time", "author_id", "published_at", "created_at", "updated_at", "deleted_at", "cover_image_urls") VALUES (4, 'test', 'test', 'dsad

![](http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084050Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43d72d0d95537804824dcce3e234c6b9f09f5d856d080a83ea0a22c8bd839359)



hdusain

![](http://47.102.205.85:19000/blog2/751bb102-fa2a-4289-9cd1-cf139aedadc3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084059Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ac13661142998f2ee6512d959ea4f0178ba12f171872c3b3ec41d6d1ce5d7ce9)

', 'dsad

![](http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084050Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43d72d0d95537804824dcce3e234c6b9f09f5d856d080a83ea0a22c8bd839359)



hdusain

![](http://47.102.205.85:19000/blog2/751bb102-fa2a-4289-9cd1-cf139aedadc3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084059Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ac13661142998f2ee6512d959ea4f0178ba12f171872c3b3ec41d6d1ce5d7ce9)

', NULL, 'http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084050Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43d72d0d95537804824dcce3e234c6b9f09f5d856d080a83ea0a22c8bd839359', NULL, NULL, NULL, 'PUBLISHED', 'f', 0, 0, 0, 685, 3, 1, '2026-07-08 16:41:06.056716', '2026-07-08 16:41:06.056698', '2026-07-08 16:41:06.056705', NULL, '["http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084050Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=43d72d0d95537804824dcce3e234c6b9f09f5d856d080a83ea0a22c8bd839359", "http://47.102.205.85:19000/blog2/751bb102-fa2a-4289-9cd1-cf139aedadc3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084059Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ac13661142998f2ee6512d959ea4f0178ba12f171872c3b3ec41d6d1ce5d7ce9"]');
INSERT INTO "public"."blog_note" ("id", "title", "slug", "content", "content_html", "summary", "cover_image_url", "mood", "weather", "location", "status", "is_pinned", "view_count", "like_count", "comment_count", "word_count", "reading_time", "author_id", "published_at", "created_at", "updated_at", "deleted_at", "cover_image_urls") VALUES (5, '今天', 'sdasda', 'iasdfhiehohfhdsbnfdsffdffdffdhuggjbghgjvghhjfd的撒的

> jdfsifhn 



&nbsp;

# dskfbidn



## fodskhfksdn



### fdskhfbsd



# husdkfghikjsd

## ksdhfksdn



&nbsp;

```javascript
import * as React from "react"
import { cn } from "@/lib/utils" // Your utility for merging class names
import { Button, type ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, Mail, Sparkles } from "lucide-react"
import {useTheme} from "next-themes"

// Simple SVG components for brand icons as placeholders
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <img src= "https://svgl.app/library/google.svg" { ...props }/>
)

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <img src= "https://svgl.app/library/microsoft.svg" { ...props }/>
)

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const {theme} = useTheme();
  return <>
  <img src= {`https://svgl.app/library/apple${theme===''dark'' ? ''_dark'': ''''}.svg`} { ...props }/>

  </>
}

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onEmailSubmit?: (data: { email: string; password?: string }) => void
  onSocialSignIn?: (provider: ''google'' | ''microsoft'' | ''apple'' | ''sso'') => void
  onEmailLink?: () => void
}

const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  ({ className, onEmailSubmit, onSocialSignIn, onEmailLink, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      onEmailSubmit?.({ email, password })
    }

    return (
      <Card ref= { ref } className = { cn("w-full max-w-md mx-auto", className) } {...props}>
        <CardHeader className="text-left" >
          <CardTitle className="text-2xl" > Sign in with email < /CardTitle>
          <CardDescription>
            Make a new doc to bring your words, data, and teams together.For free.
          < /CardDescription>
  < /CardHeader>
  < CardContent >
  <div className="space-y-4" >
    {/* Social Sign-in */ }
    < div className = "space-y-2" >
      <Label className="text-xs text-muted-foreground" > Sign in with</Label>
      < div className = "grid grid-cols-4 gap-2" >
        <Button variant="outline" onClick = {() => onSocialSignIn?.(''google'')}>
          <GoogleIcon className="size-4 fill-primary" />
            </Button>
            < Button variant = "outline" onClick = {() => onSocialSignIn?.(''microsoft'')}>
              <MicrosoftIcon className="size-4 fill-primary" />
                </Button>
                < Button variant = "outline" onClick = {() => onSocialSignIn?.(''apple'')}>
                  <AppleIcon className="size-5" />
                    </Button>
                    < Button variant = "outline" onClick = {() => onSocialSignIn?.(''sso'')}>
                      <KeyRound className="h-5 w-5" />
                        <span className="ml-1.5" > SSO < /span>
                          < /Button>
                          < /div>
                          < /div>

{/* Divider */ }
<div className="relative" >
  <div className="absolute inset-0 flex items-center" >
    <span className="w-full border-t" />
      </div>
      < div className = "relative flex justify-center text-xs uppercase" >
        <span className="bg-background px-2 text-muted-foreground" > or < /span>
          < /div>
          < /div>

{/* Email Form */ }
<form onSubmit={ handleFormSubmit } className = "space-y-4" >
  <div className="space-y-2" >
    <Label htmlFor="email" > Email < /Label>
      < div className = "relative" >
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" name = "email" type = "email" placeholder = "jdoe.mobbin@gmail.com" className = "pl-9" required />
            </div>
            < /div>
            < div className = "space-y-2" >
              <div className="flex items-center justify-between" >
                <Label htmlFor="password" > Password < /Label>
                  < a href = "#" className = "text-sm font-medium text-primary hover:underline" > Forgot password ? </a>
                    < /div>
                    < div className = "relative" >
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" name = "password" type = { showPassword? "text": "password" } className = "pl-9 pr-10" required />
                          <Button 
                        type="button"
variant = "ghost"
size = "icon"
className = "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
onClick = {() => setShowPassword(!showPassword)}
                    >
  { showPassword?<EyeOff className = "h-4 w-4" /> : <Eye className="h-4 w-4" />}
</Button>
  < /div>
  < /div>
  < Button type = "submit" className = "w-full" > Sign In < /Button>
    < /form>
    < /div>
    < /CardContent>
    < CardFooter className = "flex-col items-start space-y-4" >
      <Button variant="ghost" className = "w-full text-muted-foreground" onClick = {() => onEmailLink?.()}>
        <Sparkles className="mr-2 h-4 w-4" />
          Or email me a link
            < /Button>
            < p className = "text-xs text-muted-foreground text-center w-full" >
              By logging in, you agree to our{ '' '' }
<a href="#" className = "underline hover:text-primary" >
  Terms of Service
    < /a>{'' ''}
    & { '' ''}
    < a href = "#" className = "underline hover:text-primary" >
      Privacy Policy
        < /a>
        < /p>
        < /CardFooter>
        < /Card>
    )
  }
)
AuthForm.displayName = "AuthForm"

export { AuthForm }
```

![](http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084537Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f5b26909c5140e6991f494050ffe51f281d63e76b900ccf42ccf488ce5acb9db)

', 'iasdfhiehohfhdsbnfdsffdffdffdhuggjbghgjvghhjfd的撒的

> jdfsifhn 



&nbsp;

# dskfbidn



## fodskhfksdn



### fdskhfbsd



# husdkfghikjsd

## ksdhfksdn



&nbsp;

```javascript
import * as React from "react"
import { cn } from "@/lib/utils" // Your utility for merging class names
import { Button, type ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, Mail, Sparkles } from "lucide-react"
import {useTheme} from "next-themes"

// Simple SVG components for brand icons as placeholders
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <img src= "https://svgl.app/library/google.svg" { ...props }/>
)

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <img src= "https://svgl.app/library/microsoft.svg" { ...props }/>
)

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const {theme} = useTheme();
  return <>
  <img src= {`https://svgl.app/library/apple${theme===''dark'' ? ''_dark'': ''''}.svg`} { ...props }/>

  </>
}

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onEmailSubmit?: (data: { email: string; password?: string }) => void
  onSocialSignIn?: (provider: ''google'' | ''microsoft'' | ''apple'' | ''sso'') => void
  onEmailLink?: () => void
}

const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  ({ className, onEmailSubmit, onSocialSignIn, onEmailLink, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      onEmailSubmit?.({ email, password })
    }

    return (
      <Card ref= { ref } className = { cn("w-full max-w-md mx-auto", className) } {...props}>
        <CardHeader className="text-left" >
          <CardTitle className="text-2xl" > Sign in with email < /CardTitle>
          <CardDescription>
            Make a new doc to bring your words, data, and teams together.For free.
          < /CardDescription>
  < /CardHeader>
  < CardContent >
  <div className="space-y-4" >
    {/* Social Sign-in */ }
    < div className = "space-y-2" >
      <Label className="text-xs text-muted-foreground" > Sign in with</Label>
      < div className = "grid grid-cols-4 gap-2" >
        <Button variant="outline" onClick = {() => onSocialSignIn?.(''google'')}>
          <GoogleIcon className="size-4 fill-primary" />
            </Button>
            < Button variant = "outline" onClick = {() => onSocialSignIn?.(''microsoft'')}>
              <MicrosoftIcon className="size-4 fill-primary" />
                </Button>
                < Button variant = "outline" onClick = {() => onSocialSignIn?.(''apple'')}>
                  <AppleIcon className="size-5" />
                    </Button>
                    < Button variant = "outline" onClick = {() => onSocialSignIn?.(''sso'')}>
                      <KeyRound className="h-5 w-5" />
                        <span className="ml-1.5" > SSO < /span>
                          < /Button>
                          < /div>
                          < /div>

{/* Divider */ }
<div className="relative" >
  <div className="absolute inset-0 flex items-center" >
    <span className="w-full border-t" />
      </div>
      < div className = "relative flex justify-center text-xs uppercase" >
        <span className="bg-background px-2 text-muted-foreground" > or < /span>
          < /div>
          < /div>

{/* Email Form */ }
<form onSubmit={ handleFormSubmit } className = "space-y-4" >
  <div className="space-y-2" >
    <Label htmlFor="email" > Email < /Label>
      < div className = "relative" >
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" name = "email" type = "email" placeholder = "jdoe.mobbin@gmail.com" className = "pl-9" required />
            </div>
            < /div>
            < div className = "space-y-2" >
              <div className="flex items-center justify-between" >
                <Label htmlFor="password" > Password < /Label>
                  < a href = "#" className = "text-sm font-medium text-primary hover:underline" > Forgot password ? </a>
                    < /div>
                    < div className = "relative" >
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" name = "password" type = { showPassword? "text": "password" } className = "pl-9 pr-10" required />
                          <Button 
                        type="button"
variant = "ghost"
size = "icon"
className = "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
onClick = {() => setShowPassword(!showPassword)}
                    >
  { showPassword?<EyeOff className = "h-4 w-4" /> : <Eye className="h-4 w-4" />}
</Button>
  < /div>
  < /div>
  < Button type = "submit" className = "w-full" > Sign In < /Button>
    < /form>
    < /div>
    < /CardContent>
    < CardFooter className = "flex-col items-start space-y-4" >
      <Button variant="ghost" className = "w-full text-muted-foreground" onClick = {() => onEmailLink?.()}>
        <Sparkles className="mr-2 h-4 w-4" />
          Or email me a link
            < /Button>
            < p className = "text-xs text-muted-foreground text-center w-full" >
              By logging in, you agree to our{ '' '' }
<a href="#" className = "underline hover:text-primary" >
  Terms of Service
    < /a>{'' ''}
    & { '' ''}
    < a href = "#" className = "underline hover:text-primary" >
      Privacy Policy
        < /a>
        < /p>
        < /CardFooter>
        < /Card>
    )
  }
)
AuthForm.displayName = "AuthForm"

export { AuthForm }
```

![](http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084537Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f5b26909c5140e6991f494050ffe51f281d63e76b900ccf42ccf488ce5acb9db)

', '今天天气还不错', 'http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084537Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f5b26909c5140e6991f494050ffe51f281d63e76b900ccf42ccf488ce5acb9db', '放松', '晴', '安徽合肥', 'PUBLISHED', 't', 0, 1, 0, 6435, 22, 1, '2026-07-08 16:45:44.339063', '2026-07-08 16:45:44.339034', '2026-07-09 13:20:23.389202', NULL, '["http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T084537Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f5b26909c5140e6991f494050ffe51f281d63e76b900ccf42ccf488ce5acb9db"]');
COMMIT;

-- ----------------------------
-- Table structure for blog_note_like
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_note_like";
CREATE TABLE "public"."blog_note_like" (
  "id" int8 NOT NULL DEFAULT nextval('blog_note_like_id_seq'::regclass),
  "note_id" int8 NOT NULL,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default" NOT NULL,
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "user_id" int8,
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "public"."blog_note_like" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_note_like"."id" IS '点赞记录唯一自增ID';
COMMENT ON COLUMN "public"."blog_note_like"."note_id" IS '被点赞手记关联ID';
COMMENT ON COLUMN "public"."blog_note_like"."ip_address" IS '访客真实客户端IP地址（支持IPv4/IPv6）';
COMMENT ON COLUMN "public"."blog_note_like"."user_agent" IS '访客设备浏览器User-Agent指纹';
COMMENT ON COLUMN "public"."blog_note_like"."user_id" IS '绑定的登录用户ID（游客为NULL）';
COMMENT ON COLUMN "public"."blog_note_like"."created_at" IS '点赞创建时间';
COMMENT ON TABLE "public"."blog_note_like" IS '手记点赞记录表';

-- ----------------------------
-- Records of blog_note_like
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_note_like" ("id", "note_id", "ip_address", "user_agent", "user_id", "created_at") VALUES (3, 5, '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', NULL, '2026-07-09 13:20:23.387179');
COMMIT;

-- ----------------------------
-- Table structure for blog_operation_log
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_operation_log";
CREATE TABLE "public"."blog_operation_log" (
  "id" int8 NOT NULL DEFAULT nextval('blog_operation_log_id_seq'::regclass),
  "user_id" int8,
  "action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "target_type" varchar(50) COLLATE "pg_catalog"."default",
  "target_id" int8,
  "detail" jsonb,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_operation_log" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_operation_log"."user_id" IS '操作人ID';
COMMENT ON COLUMN "public"."blog_operation_log"."action" IS '操作类型: CREATE|UPDATE|DELETE|LOGIN|LOGOUT';
COMMENT ON COLUMN "public"."blog_operation_log"."target_type" IS '操作对象: ARTICLE|SCENE|HOTSPOT|USER|COMMENT|PAGE';
COMMENT ON COLUMN "public"."blog_operation_log"."target_id" IS '操作对象ID';
COMMENT ON COLUMN "public"."blog_operation_log"."detail" IS '变更详情JSON';
COMMENT ON COLUMN "public"."blog_operation_log"."ip_address" IS '操作时IP';
COMMENT ON COLUMN "public"."blog_operation_log"."created_at" IS '操作时间';
COMMENT ON TABLE "public"."blog_operation_log" IS '操作日志表 — 关键操作审计追溯';

-- ----------------------------
-- Records of blog_operation_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_page
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_page";
CREATE TABLE "public"."blog_page" (
  "id" int8 NOT NULL DEFAULT nextval('blog_page_id_seq'::regclass),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "content_html" text COLLATE "pg_catalog"."default",
  "summary" varchar(500) COLLATE "pg_catalog"."default",
  "is_show_in_nav" bool DEFAULT false,
  "sort_order" int4 DEFAULT 0,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DRAFT'::character varying,
  "seo_title" varchar(200) COLLATE "pg_catalog"."default",
  "seo_description" varchar(500) COLLATE "pg_catalog"."default",
  "author_id" int8,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_page" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_page"."title" IS '页面标题，如"关于我"';
COMMENT ON COLUMN "public"."blog_page"."slug" IS 'URL标识，如about、links';
COMMENT ON COLUMN "public"."blog_page"."content" IS 'Markdown源文本';
COMMENT ON COLUMN "public"."blog_page"."content_html" IS '渲染后HTML缓存';
COMMENT ON COLUMN "public"."blog_page"."summary" IS '页面描述（SEO用）';
COMMENT ON COLUMN "public"."blog_page"."is_show_in_nav" IS '是否显示在站点导航栏';
COMMENT ON COLUMN "public"."blog_page"."sort_order" IS '导航栏排序权重';
COMMENT ON COLUMN "public"."blog_page"."status" IS '状态: DRAFT|PUBLISHED';
COMMENT ON COLUMN "public"."blog_page"."seo_title" IS '自定义SEO标题';
COMMENT ON COLUMN "public"."blog_page"."seo_description" IS '自定义SEO描述';
COMMENT ON COLUMN "public"."blog_page"."author_id" IS '编辑者ID';
COMMENT ON COLUMN "public"."blog_page"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_page"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_page" IS '独立页面表 — 如关于我、友链、留言板等';

-- ----------------------------
-- Records of blog_page
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_series
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_series";
CREATE TABLE "public"."blog_series" (
  "id" int8 NOT NULL DEFAULT nextval('blog_series_id_seq'::regclass),
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "cover_image_url" varchar(500) COLLATE "pg_catalog"."default",
  "article_count" int4 DEFAULT 0,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DRAFT'::character varying,
  "author_id" int8 NOT NULL,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_series" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_series"."title" IS '系列标题，如"Spring Boot入门实战"';
COMMENT ON COLUMN "public"."blog_series"."slug" IS 'URL标识';
COMMENT ON COLUMN "public"."blog_series"."description" IS '系列简介';
COMMENT ON COLUMN "public"."blog_series"."cover_image_url" IS '系列封面图';
COMMENT ON COLUMN "public"."blog_series"."article_count" IS '冗余：系列内已发布文章数';
COMMENT ON COLUMN "public"."blog_series"."status" IS '状态: DRAFT|PUBLISHED';
COMMENT ON COLUMN "public"."blog_series"."author_id" IS '创建者ID';
COMMENT ON COLUMN "public"."blog_series"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_series"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_series" IS '文章系列/专题表 — 将多篇文章组织为系列';

-- ----------------------------
-- Records of blog_series
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_series_article
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_series_article";
CREATE TABLE "public"."blog_series_article" (
  "series_id" int8 NOT NULL,
  "article_id" int8 NOT NULL,
  "sort_order" int4 NOT NULL DEFAULT 0
)
;
ALTER TABLE "public"."blog_series_article" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_series_article"."series_id" IS '系列ID';
COMMENT ON COLUMN "public"."blog_series_article"."article_id" IS '文章ID';
COMMENT ON COLUMN "public"."blog_series_article"."sort_order" IS '在本系列中的序号（第N篇）';
COMMENT ON TABLE "public"."blog_series_article" IS '系列-文章关联表 — 定义文章在系列中的排序';

-- ----------------------------
-- Records of blog_series_article
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_site_config
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_site_config";
CREATE TABLE "public"."blog_site_config" (
  "id" int8 NOT NULL DEFAULT nextval('blog_site_config_id_seq'::regclass),
  "config_key" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "config_value" text COLLATE "pg_catalog"."default",
  "config_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'string'::character varying,
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_site_config" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_site_config"."config_key" IS '配置键，如site_name、enable_comment';
COMMENT ON COLUMN "public"."blog_site_config"."config_value" IS '配置值（字符串存储，按type解析）';
COMMENT ON COLUMN "public"."blog_site_config"."config_type" IS '值类型: string|number|json|boolean';
COMMENT ON COLUMN "public"."blog_site_config"."description" IS '配置项中文说明';
COMMENT ON COLUMN "public"."blog_site_config"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_site_config"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_site_config" IS '站点配置表 — 键值对存储站点级配置';

-- ----------------------------
-- Records of blog_site_config
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_site_config" ("id", "config_key", "config_value", "config_type", "description", "created_at", "updated_at") VALUES (1, 'background_image_url', '', 'string', '站点全局背景图片URL，为空则不展示背景图', '2026-07-05 00:51:56.776448', '2026-07-05 09:51:05.112647');
COMMIT;

-- ----------------------------
-- Table structure for blog_subscriber
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_subscriber";
CREATE TABLE "public"."blog_subscriber" (
  "id" int8 NOT NULL DEFAULT nextval('blog_subscriber_id_seq'::regclass),
  "email" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ACTIVE'::character varying,
  "verify_token" varchar(64) COLLATE "pg_catalog"."default",
  "is_verified" bool DEFAULT false,
  "subscribed_at" timestamp(6) NOT NULL DEFAULT now(),
  "unsubscribed_at" timestamp(6),
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_subscriber" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_subscriber"."email" IS '订阅邮箱';
COMMENT ON COLUMN "public"."blog_subscriber"."nickname" IS '订阅者昵称（选填）';
COMMENT ON COLUMN "public"."blog_subscriber"."status" IS '状态: ACTIVE|UNSUBSCRIBED';
COMMENT ON COLUMN "public"."blog_subscriber"."verify_token" IS '邮箱验证令牌（UUID）';
COMMENT ON COLUMN "public"."blog_subscriber"."is_verified" IS '邮箱是否已验证';
COMMENT ON COLUMN "public"."blog_subscriber"."subscribed_at" IS '订阅时间';
COMMENT ON COLUMN "public"."blog_subscriber"."unsubscribed_at" IS '退订时间';
COMMENT ON COLUMN "public"."blog_subscriber"."created_at" IS '记录创建时间';
COMMENT ON TABLE "public"."blog_subscriber" IS '邮件订阅表 — 存储订阅博客更新的访客邮箱';

-- ----------------------------
-- Records of blog_subscriber
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_tag
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_tag";
CREATE TABLE "public"."blog_tag" (
  "id" int8 NOT NULL DEFAULT nextval('blog_tag_id_seq'::regclass),
  "name" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "article_count" int4 DEFAULT 0,
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_tag" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_tag"."name" IS '标签名称，如"React"';
COMMENT ON COLUMN "public"."blog_tag"."slug" IS 'URL标识，如react';
COMMENT ON COLUMN "public"."blog_tag"."article_count" IS '关联的已发布文章数';
COMMENT ON COLUMN "public"."blog_tag"."created_at" IS '创建时间';
COMMENT ON TABLE "public"."blog_tag" IS '标签表 — 扁平标签结构';

-- ----------------------------
-- Records of blog_tag
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (1, 'React', 'react', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (2, 'TypeScript', 'typescript', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (3, 'Next.js', 'nextjs', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (5, 'PostgreSQL', 'postgresql', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (6, 'Docker', 'docker', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (4, 'Spring Boot', 'spring-boot', 1, '2026-06-17 02:08:03.34461');
COMMIT;

-- ----------------------------
-- Table structure for blog_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_user";
CREATE TABLE "public"."blog_user" (
  "id" int8 NOT NULL DEFAULT nextval('blog_user_id_seq'::regclass),
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "password_hash" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "avatar_url" varchar(500) COLLATE "pg_catalog"."default",
  "bio" text COLLATE "pg_catalog"."default",
  "social_links" jsonb,
  "role" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'AUTHOR'::character varying,
  "status" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ACTIVE'::character varying,
  "last_login_at" timestamp(6),
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "github_id" varchar(100) COLLATE "pg_catalog"."default",
  "github_username" varchar(100) COLLATE "pg_catalog"."default",
  "two_factor_secret" varchar(100) COLLATE "pg_catalog"."default",
  "two_factor_enabled" bool NOT NULL DEFAULT false
)
;
ALTER TABLE "public"."blog_user" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_user"."username" IS '登录用户名（字母数字下划线）';
COMMENT ON COLUMN "public"."blog_user"."password_hash" IS 'BCrypt加密密码';
COMMENT ON COLUMN "public"."blog_user"."nickname" IS '前端展示昵称（支持中文）';
COMMENT ON COLUMN "public"."blog_user"."email" IS '邮箱地址';
COMMENT ON COLUMN "public"."blog_user"."avatar_url" IS '头像图片URL';
COMMENT ON COLUMN "public"."blog_user"."bio" IS '个人简介/签名';
COMMENT ON COLUMN "public"."blog_user"."social_links" IS '社交链接JSON: {"github":"...", "twitter":"..."}';
COMMENT ON COLUMN "public"."blog_user"."role" IS '角色: ADMIN|AUTHOR';
COMMENT ON COLUMN "public"."blog_user"."status" IS '账号状态: ACTIVE|DISABLED';
COMMENT ON COLUMN "public"."blog_user"."last_login_at" IS '最后登录时间';
COMMENT ON COLUMN "public"."blog_user"."created_at" IS '注册时间';
COMMENT ON COLUMN "public"."blog_user"."updated_at" IS '更新时间';
COMMENT ON COLUMN "public"."blog_user"."github_id" IS '绑定的 GitHub 用户唯一标识 ID';
COMMENT ON COLUMN "public"."blog_user"."github_username" IS '绑定的 GitHub 用户名';
COMMENT ON COLUMN "public"."blog_user"."two_factor_secret" IS '双重验证 TOTP 密钥 (Base32)';
COMMENT ON COLUMN "public"."blog_user"."two_factor_enabled" IS '是否启用双重验证';
COMMENT ON TABLE "public"."blog_user" IS '用户表 — 支持多作者账号管理';

-- ----------------------------
-- Records of blog_user
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (6, '4yshop', '$2a$10$8ANkKmeJ3YZHbIQwmuo5W.AB6YTeFA7H.n/qTePXCsN7S2kvCVfH.', '4yshop', 'wj5395@outlook.com', 'http://47.102.205.85:19000/blog2/avatars/c1a5acea-5a11-4fb3-a931-b4eb93115da6.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260708%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260708T151516Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d4f06f1ea39070fe8ee91a0961428187532c8b2f98232784e24314990fa58cac', NULL, NULL, 'USER', 'DISABLED', '2026-07-09 12:29:27.694738', '2026-07-08 22:45:00.01079', '2026-07-09 13:20:08.248033', NULL, NULL, NULL, 'f');
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (1, 'butvan', '$2a$10$ppwPhoJRQ6O/Vo/q86yAMO0vVpA/I2p.6FF8tMeleQi8NMNr8XU6G', '可梵', '1973578950@qq.com', 'http://47.102.205.85:19000/blog2/87a371bd-7bb1-425c-a161-af27112b5b41.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260705T004357Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7ceba0d11e820c6579428cb9fbfaab18b665b4d6875d692c25ec105ede955d40', 'JAVA/Agent/VibeCoding开发者', '{"rss": "", "email": "1973578950@qq.com", "github": "https://github.com/agent-butvan", "footerIcp": "", "introLine1": "大二学Agent开发中...", "introLine2": "", "footerTitle": "Butvan Blog", "footerSubtitle": "珍惜眼前人", "footerStartDate": "2026-06-15"}', 'ADMIN', 'ACTIVE', '2026-07-06 18:37:25.625599', '2026-06-14 14:56:18.755605', '2026-07-06 18:37:25.630716', 'gh-3048393', 'agent-butvan', 'QSS6MRRZTAMMQWC3', 't');
COMMIT;

-- ----------------------------
-- Table structure for blog_visit_log
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_visit_log";
CREATE TABLE "public"."blog_visit_log" (
  "id" int8 NOT NULL DEFAULT nextval('blog_visit_log_id_seq'::regclass),
  "article_id" int8,
  "ip_address" varchar(45) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "referer" varchar(500) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_visit_log" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_visit_log"."article_id" IS '被访问文章ID';
COMMENT ON COLUMN "public"."blog_visit_log"."ip_address" IS '访客IP';
COMMENT ON COLUMN "public"."blog_visit_log"."user_agent" IS '浏览器UA';
COMMENT ON COLUMN "public"."blog_visit_log"."referer" IS 'HTTP Referer（来源页面）';
COMMENT ON COLUMN "public"."blog_visit_log"."created_at" IS '访问时间';
COMMENT ON TABLE "public"."blog_visit_log" IS '访问日志表 — 文章级访问量统计分析';

-- ----------------------------
-- Records of blog_visit_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for blog_wechat_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_wechat_user";
CREATE TABLE "public"."blog_wechat_user" (
  "id" int8 NOT NULL DEFAULT nextval('blog_wechat_user_id_seq'::regclass),
  "open_id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" int8,
  "status" int4 NOT NULL DEFAULT 1,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
)
;
ALTER TABLE "public"."blog_wechat_user" OWNER TO "butvan";
COMMENT ON COLUMN "public"."blog_wechat_user"."id" IS '自增主键';
COMMENT ON COLUMN "public"."blog_wechat_user"."open_id" IS '微信公众号用户唯一标识（openid）';
COMMENT ON COLUMN "public"."blog_wechat_user"."user_id" IS '关联系统用户ID（未绑定时为NULL）';
COMMENT ON COLUMN "public"."blog_wechat_user"."status" IS '关注状态: 1=已关注, 0=已取消关注';
COMMENT ON COLUMN "public"."blog_wechat_user"."created_at" IS '记录创建时间（首次关注时写入）';
COMMENT ON COLUMN "public"."blog_wechat_user"."updated_at" IS '最后更新时间（关注/取消关注时刷新）';
COMMENT ON TABLE "public"."blog_wechat_user" IS '微信用户关联表 — 公众号用户与系统用户的绑定关系';

-- ----------------------------
-- Records of blog_wechat_user
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_album_id_seq"
OWNED BY "public"."blog_album"."id";
SELECT setval('"public"."blog_album_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_album_photo_id_seq"
OWNED BY "public"."blog_album_photo"."id";
SELECT setval('"public"."blog_album_photo_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_id_seq"
OWNED BY "public"."blog_article"."id";
SELECT setval('"public"."blog_article_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_like_id_seq"
OWNED BY "public"."blog_article_like"."id";
SELECT setval('"public"."blog_article_like_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_version_id_seq"
OWNED BY "public"."blog_article_version"."id";
SELECT setval('"public"."blog_article_version_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_category_id_seq"
OWNED BY "public"."blog_category"."id";
SELECT setval('"public"."blog_category_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_comment_ban_id_seq"
OWNED BY "public"."blog_comment_ban"."id";
SELECT setval('"public"."blog_comment_ban_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_comment_id_seq"
OWNED BY "public"."blog_comment"."id";
SELECT setval('"public"."blog_comment_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_friend_link_id_seq"
OWNED BY "public"."blog_friend_link"."id";
SELECT setval('"public"."blog_friend_link_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_homepage_hotspot_id_seq"
OWNED BY "public"."blog_homepage_hotspot"."id";
SELECT setval('"public"."blog_homepage_hotspot_id_seq"', 30, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_homepage_scene_id_seq"
OWNED BY "public"."blog_homepage_scene"."id";
SELECT setval('"public"."blog_homepage_scene_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_media_id_seq"
OWNED BY "public"."blog_media"."id";
SELECT setval('"public"."blog_media_id_seq"', 59, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_navigation_id_seq"
OWNED BY "public"."blog_navigation"."id";
SELECT setval('"public"."blog_navigation_id_seq"', 43, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_note_id_seq"
OWNED BY "public"."blog_note"."id";
SELECT setval('"public"."blog_note_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_note_like_id_seq"
OWNED BY "public"."blog_note_like"."id";
SELECT setval('"public"."blog_note_like_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_operation_log_id_seq"
OWNED BY "public"."blog_operation_log"."id";
SELECT setval('"public"."blog_operation_log_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_page_id_seq"
OWNED BY "public"."blog_page"."id";
SELECT setval('"public"."blog_page_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_series_id_seq"
OWNED BY "public"."blog_series"."id";
SELECT setval('"public"."blog_series_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_site_config_id_seq"
OWNED BY "public"."blog_site_config"."id";
SELECT setval('"public"."blog_site_config_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_subscriber_id_seq"
OWNED BY "public"."blog_subscriber"."id";
SELECT setval('"public"."blog_subscriber_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_tag_id_seq"
OWNED BY "public"."blog_tag"."id";
SELECT setval('"public"."blog_tag_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_user_id_seq"
OWNED BY "public"."blog_user"."id";
SELECT setval('"public"."blog_user_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_visit_log_id_seq"
OWNED BY "public"."blog_visit_log"."id";
SELECT setval('"public"."blog_visit_log_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_wechat_user_id_seq"
OWNED BY "public"."blog_wechat_user"."id";
SELECT setval('"public"."blog_wechat_user_id_seq"', 1, false);

-- ----------------------------
-- Indexes structure for table blog_album
-- ----------------------------
CREATE INDEX "idx_album_status" ON "public"."blog_album" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "sort_order" "pg_catalog"."int4_ops" DESC NULLS FIRST
);
CREATE UNIQUE INDEX "uk_album_slug" ON "public"."blog_album" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_album
-- ----------------------------
ALTER TABLE "public"."blog_album" ADD CONSTRAINT "blog_album_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_album_photo
-- ----------------------------
CREATE INDEX "idx_album_photo_album" ON "public"."blog_album_photo" USING btree (
  "album_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "sort_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "uk_album_photo" ON "public"."blog_album_photo" USING btree (
  "album_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "media_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_album_photo
-- ----------------------------
ALTER TABLE "public"."blog_album_photo" ADD CONSTRAINT "blog_album_photo_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_article
-- ----------------------------
CREATE INDEX "idx_article_author" ON "public"."blog_article" USING btree (
  "author_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_article_category" ON "public"."blog_article" USING btree (
  "category_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;
CREATE INDEX "idx_article_content_type" ON "public"."blog_article" USING btree (
  "content_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX "idx_article_slug" ON "public"."blog_article" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;
CREATE INDEX "idx_article_status_pub" ON "public"."blog_article" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "published_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
) WHERE deleted_at IS NULL;

-- ----------------------------
-- Primary Key structure for table blog_article
-- ----------------------------
ALTER TABLE "public"."blog_article" ADD CONSTRAINT "blog_article_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_article_like
-- ----------------------------
CREATE INDEX "idx_article_like_ip_ua" ON "public"."blog_article_like" USING btree (
  "article_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "ip_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "user_agent" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_article_like
-- ----------------------------
ALTER TABLE "public"."blog_article_like" ADD CONSTRAINT "blog_article_like_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table blog_article_tag
-- ----------------------------
ALTER TABLE "public"."blog_article_tag" ADD CONSTRAINT "blog_article_tag_pkey" PRIMARY KEY ("article_id", "tag_id");

-- ----------------------------
-- Indexes structure for table blog_article_version
-- ----------------------------
CREATE INDEX "idx_version_article" ON "public"."blog_article_version" USING btree (
  "article_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "version_number" "pg_catalog"."int4_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Uniques structure for table blog_article_version
-- ----------------------------
ALTER TABLE "public"."blog_article_version" ADD CONSTRAINT "blog_article_version_article_id_version_number_key" UNIQUE ("article_id", "version_number");

-- ----------------------------
-- Primary Key structure for table blog_article_version
-- ----------------------------
ALTER TABLE "public"."blog_article_version" ADD CONSTRAINT "blog_article_version_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_category
-- ----------------------------
CREATE UNIQUE INDEX "uk_category_slug" ON "public"."blog_category" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_category
-- ----------------------------
ALTER TABLE "public"."blog_category" ADD CONSTRAINT "blog_category_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_comment
-- ----------------------------
CREATE INDEX "idx_comment_article" ON "public"."blog_comment" USING btree (
  "article_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL AND status::text = 'APPROVED'::text;
CREATE INDEX "idx_comment_parent" ON "public"."blog_comment" USING btree (
  "parent_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_comment_pinned" ON "public"."blog_comment" USING btree (
  "is_pinned" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
) WHERE deleted_at IS NULL AND status::text = 'APPROVED'::text;
CREATE INDEX "idx_comment_status" ON "public"."blog_comment" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;

-- ----------------------------
-- Primary Key structure for table blog_comment
-- ----------------------------
ALTER TABLE "public"."blog_comment" ADD CONSTRAINT "blog_comment_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_comment_ban
-- ----------------------------
CREATE INDEX "idx_comment_ban_email" ON "public"."blog_comment_ban" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE email IS NOT NULL;
CREATE INDEX "idx_comment_ban_ip" ON "public"."blog_comment_ban" USING btree (
  "ip_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE ip_address IS NOT NULL;

-- ----------------------------
-- Primary Key structure for table blog_comment_ban
-- ----------------------------
ALTER TABLE "public"."blog_comment_ban" ADD CONSTRAINT "blog_comment_ban_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_friend_link
-- ----------------------------
CREATE INDEX "idx_friend_link_category" ON "public"."blog_friend_link" USING btree (
  "category" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_friend_link_status" ON "public"."blog_friend_link" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_friend_link
-- ----------------------------
ALTER TABLE "public"."blog_friend_link" ADD CONSTRAINT "blog_friend_link_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_homepage_hotspot
-- ----------------------------
CREATE INDEX "idx_hotspot_scene_sort" ON "public"."blog_homepage_hotspot" USING btree (
  "scene_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "sort_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_homepage_hotspot
-- ----------------------------
ALTER TABLE "public"."blog_homepage_hotspot" ADD CONSTRAINT "blog_homepage_hotspot_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_homepage_scene
-- ----------------------------
CREATE UNIQUE INDEX "uk_scene_active" ON "public"."blog_homepage_scene" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
) WHERE is_active = true;

-- ----------------------------
-- Primary Key structure for table blog_homepage_scene
-- ----------------------------
ALTER TABLE "public"."blog_homepage_scene" ADD CONSTRAINT "blog_homepage_scene_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_media
-- ----------------------------
CREATE INDEX "idx_media_source" ON "public"."blog_media" USING btree (
  "source_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "source_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_media
-- ----------------------------
ALTER TABLE "public"."blog_media" ADD CONSTRAINT "blog_media_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_navigation
-- ----------------------------
CREATE INDEX "idx_nav_position_sort" ON "public"."blog_navigation" USING btree (
  "position" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "parent_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "sort_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_navigation
-- ----------------------------
ALTER TABLE "public"."blog_navigation" ADD CONSTRAINT "blog_navigation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_note
-- ----------------------------
CREATE INDEX "idx_note_author" ON "public"."blog_note" USING btree (
  "author_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_note_mood" ON "public"."blog_note" USING btree (
  "mood" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL AND status::text = 'PUBLISHED'::text;
CREATE INDEX "idx_note_status_pub" ON "public"."blog_note" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "published_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX "uk_note_slug" ON "public"."blog_note" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;

-- ----------------------------
-- Primary Key structure for table blog_note
-- ----------------------------
ALTER TABLE "public"."blog_note" ADD CONSTRAINT "blog_note_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_note_like
-- ----------------------------
CREATE INDEX "idx_note_like_ip_ua" ON "public"."blog_note_like" USING btree (
  "note_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "ip_address" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "user_agent" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_note_like_user" ON "public"."blog_note_like" USING btree (
  "note_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_note_like
-- ----------------------------
ALTER TABLE "public"."blog_note_like" ADD CONSTRAINT "blog_note_like_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_operation_log
-- ----------------------------
CREATE INDEX "idx_op_log_target" ON "public"."blog_operation_log" USING btree (
  "target_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "target_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_op_log_user" ON "public"."blog_operation_log" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table blog_operation_log
-- ----------------------------
ALTER TABLE "public"."blog_operation_log" ADD CONSTRAINT "blog_operation_log_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_page
-- ----------------------------
CREATE UNIQUE INDEX "idx_page_slug" ON "public"."blog_page" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_page_status" ON "public"."blog_page" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_page
-- ----------------------------
ALTER TABLE "public"."blog_page" ADD CONSTRAINT "blog_page_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_series
-- ----------------------------
CREATE UNIQUE INDEX "idx_series_slug" ON "public"."blog_series" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_series
-- ----------------------------
ALTER TABLE "public"."blog_series" ADD CONSTRAINT "blog_series_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table blog_series_article
-- ----------------------------
ALTER TABLE "public"."blog_series_article" ADD CONSTRAINT "blog_series_article_series_id_sort_order_key" UNIQUE ("series_id", "sort_order");

-- ----------------------------
-- Primary Key structure for table blog_series_article
-- ----------------------------
ALTER TABLE "public"."blog_series_article" ADD CONSTRAINT "blog_series_article_pkey" PRIMARY KEY ("series_id", "article_id");

-- ----------------------------
-- Indexes structure for table blog_site_config
-- ----------------------------
CREATE UNIQUE INDEX "uk_config_key" ON "public"."blog_site_config" USING btree (
  "config_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_site_config
-- ----------------------------
ALTER TABLE "public"."blog_site_config" ADD CONSTRAINT "blog_site_config_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_subscriber
-- ----------------------------
CREATE UNIQUE INDEX "idx_subscriber_email" ON "public"."blog_subscriber" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_subscriber_status" ON "public"."blog_subscriber" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_subscriber
-- ----------------------------
ALTER TABLE "public"."blog_subscriber" ADD CONSTRAINT "blog_subscriber_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_tag
-- ----------------------------
CREATE UNIQUE INDEX "uk_tag_slug" ON "public"."blog_tag" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_tag
-- ----------------------------
ALTER TABLE "public"."blog_tag" ADD CONSTRAINT "blog_tag_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_user
-- ----------------------------
CREATE UNIQUE INDEX "uk_user_email" ON "public"."blog_user" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX "uk_user_username" ON "public"."blog_user" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_user
-- ----------------------------
ALTER TABLE "public"."blog_user" ADD CONSTRAINT "blog_user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_visit_log
-- ----------------------------
CREATE INDEX "idx_visit_article" ON "public"."blog_visit_log" USING btree (
  "article_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_visit_time" ON "public"."blog_visit_log" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_visit_log
-- ----------------------------
ALTER TABLE "public"."blog_visit_log" ADD CONSTRAINT "blog_visit_log_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table blog_wechat_user
-- ----------------------------
CREATE INDEX "idx_wechat_user_user_id" ON "public"."blog_wechat_user" USING btree (
  "user_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "uk_wechat_user_open_id" ON "public"."blog_wechat_user" USING btree (
  "open_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table blog_wechat_user
-- ----------------------------
ALTER TABLE "public"."blog_wechat_user" ADD CONSTRAINT "blog_wechat_user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table blog_album
-- ----------------------------
ALTER TABLE "public"."blog_album" ADD CONSTRAINT "blog_album_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "public"."blog_media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_album_photo
-- ----------------------------
ALTER TABLE "public"."blog_album_photo" ADD CONSTRAINT "blog_album_photo_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."blog_album" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_album_photo" ADD CONSTRAINT "blog_album_photo_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."blog_media" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_article
-- ----------------------------
ALTER TABLE "public"."blog_article" ADD CONSTRAINT "blog_article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."blog_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_article" ADD CONSTRAINT "blog_article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."blog_category" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_article_like
-- ----------------------------
ALTER TABLE "public"."blog_article_like" ADD CONSTRAINT "blog_article_like_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_article" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_article_tag
-- ----------------------------
ALTER TABLE "public"."blog_article_tag" ADD CONSTRAINT "blog_article_tag_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_article" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_article_tag" ADD CONSTRAINT "blog_article_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."blog_tag" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_article_version
-- ----------------------------
ALTER TABLE "public"."blog_article_version" ADD CONSTRAINT "blog_article_version_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_article" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_article_version" ADD CONSTRAINT "blog_article_version_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "public"."blog_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_category
-- ----------------------------
ALTER TABLE "public"."blog_category" ADD CONSTRAINT "blog_category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_category" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_comment
-- ----------------------------
ALTER TABLE "public"."blog_comment" ADD CONSTRAINT "blog_comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_article" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_comment" ADD CONSTRAINT "blog_comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_comment" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_comment" ADD CONSTRAINT "blog_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_homepage_hotspot
-- ----------------------------
ALTER TABLE "public"."blog_homepage_hotspot" ADD CONSTRAINT "blog_homepage_hotspot_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "public"."blog_homepage_scene" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_media
-- ----------------------------
ALTER TABLE "public"."blog_media" ADD CONSTRAINT "blog_media_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_navigation
-- ----------------------------
ALTER TABLE "public"."blog_navigation" ADD CONSTRAINT "blog_navigation_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_navigation" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_note
-- ----------------------------
ALTER TABLE "public"."blog_note" ADD CONSTRAINT "blog_note_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."blog_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_operation_log
-- ----------------------------
ALTER TABLE "public"."blog_operation_log" ADD CONSTRAINT "blog_operation_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_page
-- ----------------------------
ALTER TABLE "public"."blog_page" ADD CONSTRAINT "blog_page_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_series
-- ----------------------------
ALTER TABLE "public"."blog_series" ADD CONSTRAINT "blog_series_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."blog_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_series_article
-- ----------------------------
ALTER TABLE "public"."blog_series_article" ADD CONSTRAINT "blog_series_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."blog_article" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_series_article" ADD CONSTRAINT "blog_series_article_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."blog_series" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table blog_wechat_user
-- ----------------------------
ALTER TABLE "public"."blog_wechat_user" ADD CONSTRAINT "blog_wechat_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."blog_user" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
