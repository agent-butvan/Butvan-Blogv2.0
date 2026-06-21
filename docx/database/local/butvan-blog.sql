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

 Date: 16/06/2026 15:08:05
*/


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
COMMENT ON COLUMN "public"."blog_article"."password" IS '访问密码（visibility=PASSWORD_PROTECTED时使用）';
COMMENT ON COLUMN "public"."blog_article"."is_pinned" IS '是否置顶';
COMMENT ON COLUMN "public"."blog_article"."is_featured" IS '是否精选推荐';
COMMENT ON COLUMN "public"."blog_article"."is_allow_comment" IS '是否开放评论';
COMMENT ON COLUMN "public"."blog_article"."view_count" IS '冗余：累计阅读量';
COMMENT ON COLUMN "public"."blog_article"."like_count" IS '冗余：累计点赞数';
COMMENT ON COLUMN "public"."blog_article"."comment_count" IS '冗余：已通过评论数';
COMMENT ON COLUMN "public"."blog_article"."word_count" IS '正文字数（后端计算存储）';
COMMENT ON COLUMN "public"."blog_article"."reading_time" IS '预估阅读时间（分钟，按300字/分钟估算）';
COMMENT ON COLUMN "public"."blog_article"."seo_title" IS '自定义SEO标题（留空则用title）';
COMMENT ON COLUMN "public"."blog_article"."seo_description" IS '自定义SEO描述（留空则用summary）';
COMMENT ON COLUMN "public"."blog_article"."seo_keywords" IS '自定义SEO关键词（逗号分隔）';
COMMENT ON COLUMN "public"."blog_article"."template" IS '自定义渲染模板名（留空则用默认）';
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
COMMENT ON COLUMN "public"."blog_category"."article_count" IS '冗余：该分类下已发布文章数';
COMMENT ON COLUMN "public"."blog_category"."is_visible" IS '是否在前台导航显示';
COMMENT ON COLUMN "public"."blog_category"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."blog_category"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."blog_category" IS '分类表 — 支持两级树状分类';

-- ----------------------------
-- Records of blog_category
-- ----------------------------
BEGIN;
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
  "deleted_at" timestamp(6)
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
COMMENT ON TABLE "public"."blog_comment" IS '评论表 — 支持登录/访客评论和嵌套回复';

-- ----------------------------
-- Records of blog_comment
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
  "created_at" timestamp(6) NOT NULL DEFAULT now()
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
COMMENT ON TABLE "public"."blog_friend_link" IS '友链表 — 管理友情链接列表';

-- ----------------------------
-- Records of blog_friend_link
-- ----------------------------
BEGIN;
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
  "created_at" timestamp(6) NOT NULL DEFAULT now()
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
COMMENT ON TABLE "public"."blog_media" IS '媒体资源表 — 统一管理上传的静态资源';

-- ----------------------------
-- Records of blog_media
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (1, 'fWdgJuAOF.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', '/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', 'IMAGE', 'image/jpeg', 1023770, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:13.578147');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (2, 'crop-1781440432479.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', '/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', 'IMAGE', 'image/png', 46768, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:52.4931');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (3, 'crop-1781441144723.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', '/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', 'IMAGE', 'image/png', 196002, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:44.741133');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (4, 'crop-1781441152613.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', '/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', 'IMAGE', 'image/png', 223736, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:52.627417');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (5, 'crop-1781441158032.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', '/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', 'IMAGE', 'image/png', 228626, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:58.046616');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (6, 'crop-1781441413702.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', '/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', 'IMAGE', 'image/png', 290588, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:13.731449');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (7, 'crop-1781441449421.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', '/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', 'IMAGE', 'image/png', 208139, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:49.43597');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (8, 'crop-1781441664900.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', '/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', 'IMAGE', 'image/png', 196322, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:54:24.94014');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (9, 'crop-1781441841386.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', '/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', 'IMAGE', 'image/png', 221932, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:57:21.42216');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (10, 'crop-1781442973142.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', '/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', 'IMAGE', 'image/png', 207769, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:16:13.180014');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (11, 'crop-1781444106016.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', '/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', 'IMAGE', 'image/png', 50964, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:06.055588');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (12, 'crop-1781444118983.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', '/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', 'IMAGE', 'image/png', 98563, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:18.998345');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (13, 'crop-1781444139339.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', '/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', 'IMAGE', 'image/png', 74407, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:39.354885');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (14, 'crop-1781444212668.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', '/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', 'IMAGE', 'image/png', 424584, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:36:52.68792');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (15, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', '/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:37:44.760827');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (16, 'crop-1781444308361.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', '/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', 'IMAGE', 'image/png', 27677, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:28.371855');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (17, 'crop-1781444339391.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', '/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', 'IMAGE', 'image/png', 82954, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:59.4049');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (18, 'crop-1781444563530.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', '/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', 'IMAGE', 'image/png', 75860, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:42:43.542653');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (19, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', '/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:22.391892');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (20, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', '/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:36.47345');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (21, 'crop-1781445918890.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', '/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', 'IMAGE', 'image/png', 83094, NULL, NULL, NULL, 'local', NULL, '2026-06-14 22:05:18.928014');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (22, 'crop-1781481053968.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', '/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', 'IMAGE', 'image/png', 58620, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:50:54.009721');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (23, 'crop-1781481411972.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', '/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', 'IMAGE', 'image/png', 25289, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:56:51.988539');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (24, 'crop-1781482539995.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', '/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', 'IMAGE', 'image/png', 74669, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:40.028816');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (25, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', '/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:46.563153');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (26, 'crop-1781482602982.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', '/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', 'IMAGE', 'image/png', 64576, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:42.996483');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (27, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', '/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:48.034915');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (28, 'crop-1781484024860.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', '/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', 'IMAGE', 'image/png', 220818, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:24.880864');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (29, 'crop-1781484046981.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', '/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', 'IMAGE', 'image/png', 129071, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:46.99655');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (30, '椅子-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', '/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', 'IMAGE', 'image/jpeg', 296840, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:53.765589');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (31, 'crop-1781484646428.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', '/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', 'IMAGE', 'image/png', 44499, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:46.445246');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (32, '桌子上的书籍-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', '/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', 'IMAGE', 'image/jpeg', 413948, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:52.062866');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (33, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', '/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:16:57.389299');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (34, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', '/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:23:50.30581');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (35, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', '/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 10:12:03.049569');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (36, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', '/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:28:44.980526');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (37, 'IMG_8747.jpg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', '/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', 'IMAGE', 'image/jpeg', 264532, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:30:11.314881');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (38, 'fWlTaMZsT.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', '/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', 'IMAGE', 'image/png', 1644415, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:53:40.335232');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (39, 'crop-1781514395901.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', '/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', 'IMAGE', 'image/png', 673475, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:06:35.923915');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (40, 'crop-1781514766967.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', '/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', 'IMAGE', 'image/png', 910697, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:12:46.992397');
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at") VALUES (41, 'crop-1781515398951.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', '/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', 'IMAGE', 'image/png', 515992, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:23:18.975993');
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
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (13, '工作台', NULL, 'PAGE', NULL, '/', 'LayoutDashboard', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (14, '内容管理', NULL, 'NONE', NULL, NULL, 'FileText', 'ADMIN_SIDEBAR', 2, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (15, '文章列表', 14, 'PAGE', NULL, '/articles', 'BookOpen', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (16, '分类管理', 14, 'PAGE', NULL, '/categories', 'FolderOpen', 'ADMIN_SIDEBAR', 2, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (17, '标签管理', 14, 'PAGE', NULL, '/tags', 'Tag', 'ADMIN_SIDEBAR', 3, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (18, '场景空间', NULL, 'NONE', NULL, NULL, 'Sparkles', 'ADMIN_SIDEBAR', 3, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (19, '房间场景', 18, 'PAGE', NULL, '/scenes', 'Wallpaper', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (20, '个人中心', NULL, 'NONE', NULL, NULL, 'User', 'ADMIN_SIDEBAR', 4, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (21, '个人资料', 20, 'PAGE', NULL, '/settings', 'UserCheck', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (22, '系统管理', NULL, 'NONE', NULL, NULL, 'Settings', 'ADMIN_SIDEBAR', 5, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (23, '导航配置', 22, 'PAGE', NULL, '/navigation', 'Compass', 'ADMIN_SIDEBAR', 1, 't', 'f', '2026-06-15 02:00:42.534223', '2026-06-15 02:00:42.534223');
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
COMMENT ON COLUMN "public"."blog_tag"."article_count" IS '冗余：关联的已发布文章数';
COMMENT ON COLUMN "public"."blog_tag"."created_at" IS '创建时间';
COMMENT ON TABLE "public"."blog_tag" IS '标签表 — 扁平标签结构';

-- ----------------------------
-- Records of blog_tag
-- ----------------------------
BEGIN;
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
  "updated_at" timestamp(6) NOT NULL DEFAULT now()
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
COMMENT ON TABLE "public"."blog_user" IS '用户表 — 支持多作者账号管理';

-- ----------------------------
-- Records of blog_user
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at") VALUES (1, 'butvan', '$2a$10$ppwPhoJRQ6O/Vo/q86yAMO0vVpA/I2p.6FF8tMeleQi8NMNr8XU6G', '可梵', '1973578950@qq.com', '/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', 'JAVA/Agent/VibeCoding开发者', '{"rss": "", "email": "1973578950@qq.com", "github": "https://github.com/18755120710", "footerIcp": "", "introLine1": "大二学Agent开发中...", "introLine2": "", "footerTitle": "Butvan Blog", "footerSubtitle": "珍惜眼前人", "footerStartDate": "2026-06-15"}', 'ADMIN', 'ACTIVE', NULL, '2026-06-14 14:56:18.755605', '2026-06-15 15:20:25.622789');
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
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_id_seq"
OWNED BY "public"."blog_article"."id";
SELECT setval('"public"."blog_article_id_seq"', 1, false);

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
SELECT setval('"public"."blog_category_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_comment_id_seq"
OWNED BY "public"."blog_comment"."id";
SELECT setval('"public"."blog_comment_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_friend_link_id_seq"
OWNED BY "public"."blog_friend_link"."id";
SELECT setval('"public"."blog_friend_link_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_homepage_hotspot_id_seq"
OWNED BY "public"."blog_homepage_hotspot"."id";
SELECT setval('"public"."blog_homepage_hotspot_id_seq"', 29, true);

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
SELECT setval('"public"."blog_media_id_seq"', 41, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_navigation_id_seq"
OWNED BY "public"."blog_navigation"."id";
SELECT setval('"public"."blog_navigation_id_seq"', 26, true);

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
SELECT setval('"public"."blog_site_config_id_seq"', 1, false);

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
SELECT setval('"public"."blog_tag_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_user_id_seq"
OWNED BY "public"."blog_user"."id";
SELECT setval('"public"."blog_user_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_visit_log_id_seq"
OWNED BY "public"."blog_visit_log"."id";
SELECT setval('"public"."blog_visit_log_id_seq"', 1, false);

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
CREATE INDEX "idx_comment_status" ON "public"."blog_comment" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NULL;

-- ----------------------------
-- Primary Key structure for table blog_comment
-- ----------------------------
ALTER TABLE "public"."blog_comment" ADD CONSTRAINT "blog_comment_pkey" PRIMARY KEY ("id");

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
-- Foreign Keys structure for table blog_article
-- ----------------------------
ALTER TABLE "public"."blog_article" ADD CONSTRAINT "blog_article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."blog_user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."blog_article" ADD CONSTRAINT "blog_article_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."blog_category" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

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
