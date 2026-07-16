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

 Date: 16/07/2026 14:16:21
*/


-- ----------------------------
-- Sequence structure for api_log_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."api_log_id_seq";
CREATE SEQUENCE "public"."api_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."api_log_id_seq" OWNER TO "butvan";

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
-- Sequence structure for blog_daily_stats_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."blog_daily_stats_id_seq";
CREATE SEQUENCE "public"."blog_daily_stats_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "public"."blog_daily_stats_id_seq" OWNER TO "butvan";

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
-- Table structure for api_log
-- ----------------------------
DROP TABLE IF EXISTS "public"."api_log";
CREATE TABLE "public"."api_log" (
  "id" int8 NOT NULL DEFAULT nextval('api_log_id_seq'::regclass),
  "api_name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "method" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  "uri" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "ip" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "cost_time" int4 NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "public"."api_log" OWNER TO "butvan";

-- ----------------------------
-- Records of api_log
-- ----------------------------
BEGIN;
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (2, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 6, '2026-07-16 10:17:09.371885');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (4, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 4, '2026-07-16 10:17:09.387276');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (5, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '127.0.0.1', 77, '2026-07-16 10:17:20.337891');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (6, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 4, '2026-07-16 10:17:23.315089');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (7, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 5, '2026-07-16 10:17:23.330559');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (1, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 13, '2026-07-16 10:17:09.37187');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (3, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 3, '2026-07-16 10:17:09.387279');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (8, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 10, '2026-07-16 10:19:10.122251');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (9, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 10, '2026-07-16 10:19:10.122216');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (10, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 9, '2026-07-16 10:19:10.123268');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (12, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 9, '2026-07-16 10:19:10.123307');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (11, 'SiteConfigController.getPublicConfig', 'GET', '/api/site-config/public/background_image_url', '127.0.0.1', 10, '2026-07-16 10:19:10.123288');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (13, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 5, '2026-07-16 10:19:11.708875');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (14, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 8, '2026-07-16 10:19:11.715078');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (15, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 5, '2026-07-16 10:19:11.72798');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (16, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 7, '2026-07-16 10:19:11.729894');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (17, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '127.0.0.1', 40, '2026-07-16 10:19:15.770372');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (18, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:21:04.223963');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (19, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 15, '2026-07-16 10:21:04.226434');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (20, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:21:04.238598');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (21, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:21:04.239454');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (22, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:21:10.017523');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (23, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:21:10.040273');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (24, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 13, '2026-07-16 10:21:10.04422');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (25, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:21:10.053484');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (26, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:21:10.128698');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (27, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:21:10.129878');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (28, 'NavigationController.getNavigations', 'GET', '/api/navigations', '108.181.0.173', 1, '2026-07-16 10:21:10.137935');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (29, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 10:21:10.139767');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (30, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:21:14.85336');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (31, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:21:15.933465');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (32, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:21:17.683237');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (33, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 4, '2026-07-16 10:21:55.578673');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (34, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 4, '2026-07-16 10:21:55.578654');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (35, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 9, '2026-07-16 10:21:55.583798');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (36, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 9, '2026-07-16 10:21:55.588347');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (37, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 2, '2026-07-16 10:21:55.589003');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (38, 'NoteController.pagePublicNotes', 'GET', '/api/notes', '127.0.0.1', 15, '2026-07-16 10:21:55.589594');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (39, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 9, '2026-07-16 10:21:55.593318');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (40, 'NoteController.pagePublicNotes', 'GET', '/api/notes', '127.0.0.1', 4, '2026-07-16 10:21:55.595859');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (41, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 8, '2026-07-16 10:21:57.780242');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (43, 'CategoryController.listSimpleCategories', 'GET', '/api/categories/simple', '127.0.0.1', 11, '2026-07-16 10:21:57.784401');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (42, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 7, '2026-07-16 10:21:57.783109');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (44, 'CategoryController.listSimpleCategories', 'GET', '/api/categories/simple', '127.0.0.1', 10, '2026-07-16 10:21:57.792179');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (45, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 6, '2026-07-16 10:21:57.79442');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (46, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 24, '2026-07-16 10:21:57.797222');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (47, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 13, '2026-07-16 10:21:57.79766');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (48, 'TagController.listSimpleTags', 'GET', '/api/tags/simple', '127.0.0.1', 14, '2026-07-16 10:21:57.799776');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (49, 'TagController.listSimpleTags', 'GET', '/api/tags/simple', '127.0.0.1', 8, '2026-07-16 10:21:57.799905');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (50, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 2, '2026-07-16 10:21:57.801043');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (51, 'ArticleController.pageArticles', 'GET', '/api/articles', '127.0.0.1', 49, '2026-07-16 10:21:57.821447');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (52, 'ArticleController.pageArticles', 'GET', '/api/articles', '127.0.0.1', 50, '2026-07-16 10:21:57.821457');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (53, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 5, '2026-07-16 10:21:58.759802');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (54, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 5, '2026-07-16 10:21:58.75989');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (55, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 5, '2026-07-16 10:21:58.760587');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (56, 'ProfileController.getPublicProfile', 'GET', '/api/profile/public/butvan', '127.0.0.1', 4, '2026-07-16 10:21:58.76377');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (57, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 3, '2026-07-16 10:21:58.764138');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (58, 'NavigationController.getNavigations', 'GET', '/api/navigations', '127.0.0.1', 5, '2026-07-16 10:21:58.76575');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (59, 'ArticleController.getArticleDetail', 'GET', '/api/articles/sar', '127.0.0.1', 14, '2026-07-16 10:21:58.78097');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (60, 'ArticleController.getArticleDetail', 'GET', '/api/articles/sar', '127.0.0.1', 23, '2026-07-16 10:21:58.784245');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (61, 'CommentController.getCommentsByArticleId', 'GET', '/api/articles/4/comments', '127.0.0.1', 14, '2026-07-16 10:21:58.812527');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (62, 'CommentController.getCommentsByArticleId', 'GET', '/api/articles/4/comments', '127.0.0.1', 9, '2026-07-16 10:21:58.819597');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (63, 'CommentController.createComment', 'POST', '/api/articles/4/comments', '127.0.0.1', 50, '2026-07-16 10:22:03.10881');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (64, 'CommentController.getCommentsByArticleId', 'GET', '/api/articles/4/comments', '127.0.0.1', 8, '2026-07-16 10:22:03.11988');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (65, 'CommentController.listAdminComments', 'GET', '/api/admin/comments', '108.181.0.173', 14, '2026-07-16 10:22:08.803351');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (66, 'CommentController.listAdminComments', 'GET', '/api/admin/comments', '108.181.0.173', 8, '2026-07-16 10:22:08.820285');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (67, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 10:22:12.107681');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (68, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:22:12.125289');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (69, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 84, '2026-07-16 10:22:54.207075');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (70, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 13, '2026-07-16 10:23:58.592522');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (71, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:23:58.606354');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (72, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 12, '2026-07-16 10:24:01.254255');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (73, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:24:01.270237');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (74, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:24:01.278598');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (75, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:24:01.282065');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (76, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 26, '2026-07-16 10:24:24.571904');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (77, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 8, '2026-07-16 10:24:24.587719');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (78, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '127.0.0.1', 35, '2026-07-16 10:24:47.224466');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (79, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:24:49.266371');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (80, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 16, '2026-07-16 10:24:49.290739');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (81, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '127.0.0.1', 6, '2026-07-16 10:24:59.700688');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (86, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '127.0.0.1', 12, '2026-07-16 10:24:59.802253');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (88, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '127.0.0.1', 31, '2026-07-16 10:25:01.239954');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (89, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:25:03.422182');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (92, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 10:25:03.44326');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (94, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 9, '2026-07-16 10:27:54.044915');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (96, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:27:54.053152');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (98, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 5, '2026-07-16 10:27:56.522396');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (110, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 6, '2026-07-16 10:28:24.777225');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (111, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:28:24.781981');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (118, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:28:54.429217');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (82, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '127.0.0.1', 8, '2026-07-16 10:24:59.701858');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (83, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '127.0.0.1', 8, '2026-07-16 10:24:59.703027');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (84, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '127.0.0.1', 14, '2026-07-16 10:24:59.706513');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (85, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/sar', '127.0.0.1', 40, '2026-07-16 10:24:59.74973');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (87, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '127.0.0.1', 12, '2026-07-16 10:24:59.802269');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (90, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:25:03.424165');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (91, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:25:03.44111');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (93, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:27:54.043358');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (95, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 10:27:54.052603');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (97, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:27:56.520899');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (100, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 12, '2026-07-16 10:27:56.523368');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (103, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 15, '2026-07-16 10:27:56.583647');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (104, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '108.181.0.173', 15, '2026-07-16 10:28:10.741');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (108, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:28:24.764288');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (114, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 16, '2026-07-16 10:28:35.332414');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (122, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 5, '2026-07-16 10:28:56.578137');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (99, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 8, '2026-07-16 10:27:56.522979');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (101, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/sar', '108.181.0.173', 11, '2026-07-16 10:27:56.536354');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (102, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 15, '2026-07-16 10:27:56.582131');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (105, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '108.181.0.173', 21, '2026-07-16 10:28:18.657671');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (106, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '108.181.0.173', 14, '2026-07-16 10:28:19.967574');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (107, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/4/like', '108.181.0.173', 18, '2026-07-16 10:28:21.524704');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (109, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:28:24.76603');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (112, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:28:29.703988');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (113, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:28:29.719532');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (115, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 7, '2026-07-16 10:28:35.35008');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (116, '【公开前台】提交发表新评论 (支持独立评论及嵌套回复)', 'POST', '/api/articles/4/comments', '108.181.0.173', 24, '2026-07-16 10:28:50.216893');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (117, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 7, '2026-07-16 10:28:50.230883');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (119, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 11, '2026-07-16 10:28:54.434328');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (120, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:28:54.440398');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (121, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 6, '2026-07-16 10:28:54.448471');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (123, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 7, '2026-07-16 10:28:56.595646');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (124, '【管理端】批量删除点赞流水记录 (物理删除)', 'DELETE', '/api/admin/likes', '108.181.0.173', 20, '2026-07-16 10:30:29.729568');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (125, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 3, '2026-07-16 10:30:29.746394');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (127, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 5, '2026-07-16 10:30:31.967031');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (129, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 4, '2026-07-16 10:30:31.967032');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (126, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:30:31.967056');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (128, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:30:31.967101');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (130, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/sar', '108.181.0.173', 7, '2026-07-16 10:30:31.985803');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (131, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 6, '2026-07-16 10:30:32.007026');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (132, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 7, '2026-07-16 10:30:32.017706');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (133, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 3, '2026-07-16 10:30:47.363627');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (136, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:30:47.363615');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (134, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 3, '2026-07-16 10:30:47.363623');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (135, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:30:47.363591');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (137, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/sar', '108.181.0.173', 9, '2026-07-16 10:30:47.377347');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (138, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 5, '2026-07-16 10:30:47.410874');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (139, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/4/comments', '108.181.0.173', 5, '2026-07-16 10:30:47.41088');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (140, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:30:54.849267');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (141, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:30:54.849253');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (142, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 4, '2026-07-16 10:30:54.851182');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (143, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '127.0.0.1', 7, '2026-07-16 10:30:54.854845');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (144, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:30:54.855483');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (145, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '127.0.0.1', 4, '2026-07-16 10:30:54.856797');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (146, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 3, '2026-07-16 10:30:54.857514');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (147, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 9, '2026-07-16 10:30:54.859956');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (148, '【公开/管理端】获取全部标签的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/tags/simple', '127.0.0.1', 4, '2026-07-16 10:30:54.862505');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (149, '【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)', 'GET', '/api/articles', '127.0.0.1', 18, '2026-07-16 10:30:54.86951');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (150, '【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)', 'GET', '/api/articles', '127.0.0.1', 28, '2026-07-16 10:30:54.873552');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (151, '【公开/管理端】获取全部标签的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/tags/simple', '127.0.0.1', 2, '2026-07-16 10:30:54.873839');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (152, '【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)', 'GET', '/api/articles', '108.181.0.173', 9, '2026-07-16 10:30:58.619006');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (153, '【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)', 'GET', '/api/articles', '108.181.0.173', 11, '2026-07-16 10:30:58.640318');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (154, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '108.181.0.173', 4, '2026-07-16 10:30:59.79473');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (155, '【公开/管理端】获取全部标签的完整实体列表', 'GET', '/api/tags', '108.181.0.173', 6, '2026-07-16 10:30:59.796551');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (170, '【公开/管理端】获取全部标签的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/tags/simple', '127.0.0.1', 7, '2026-07-16 10:31:19.9161');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (171, '【公开/管理端】分页检索文章列表 (支持根据 keyword、status、categoryId、tagId 筛选)', 'GET', '/api/articles', '127.0.0.1', 24, '2026-07-16 10:31:19.922242');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (156, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '108.181.0.173', 4, '2026-07-16 10:30:59.809827');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (162, '【公开/管理端】获取全部标签的完整实体列表', 'GET', '/api/tags', '108.181.0.173', 3, '2026-07-16 10:31:18.145044');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (163, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '108.181.0.173', 4, '2026-07-16 10:31:18.155541');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (172, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:31:22.09905');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (197, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 4, '2026-07-16 10:31:35.846801');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (207, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 4, '2026-07-16 10:31:37.640892');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (215, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 6, '2026-07-16 10:31:38.903823');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (157, '【公开/管理端】获取全部标签的完整实体列表', 'GET', '/api/tags', '108.181.0.173', 5, '2026-07-16 10:30:59.811274');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (158, '【管理端】新增保存一篇文章', 'POST', '/api/articles', '108.181.0.173', 47, '2026-07-16 10:31:17.222722');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (159, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/5', '108.181.0.173', 6, '2026-07-16 10:31:18.116567');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (160, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/5', '108.181.0.173', 8, '2026-07-16 10:31:18.132157');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (161, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '108.181.0.173', 2, '2026-07-16 10:31:18.1445');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (164, '【公开/管理端】获取全部标签的完整实体列表', 'GET', '/api/tags', '108.181.0.173', 4, '2026-07-16 10:31:18.156443');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (168, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:31:19.911639');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (177, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 3, '2026-07-16 10:31:22.103524');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (178, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 7, '2026-07-16 10:31:22.107646');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (179, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 5, '2026-07-16 10:31:22.123305');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (180, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 4, '2026-07-16 10:31:22.14519');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (185, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:29.588283');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (193, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:31:31.113652');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (194, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:31.136046');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (195, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:31:31.142135');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (196, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/5/like', '108.181.0.173', 14, '2026-07-16 10:31:34.897556');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (200, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:31:35.848169');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (206, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 3, '2026-07-16 10:31:37.640869');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (214, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 4, '2026-07-16 10:31:38.903316');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (165, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 7, '2026-07-16 10:31:19.910269');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (169, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 10, '2026-07-16 10:31:19.910938');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (173, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 5, '2026-07-16 10:31:22.099069');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (166, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:31:19.911303');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (176, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 2, '2026-07-16 10:31:22.10235');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (181, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 5, '2026-07-16 10:31:22.146655');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (182, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:31:25.779996');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (183, '【管理端】分页检索点赞记录列表 (支持 IP 或文章标题模糊搜索)', 'GET', '/api/admin/likes', '108.181.0.173', 6, '2026-07-16 10:31:25.794454');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (184, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/5/like', '108.181.0.173', 18, '2026-07-16 10:31:28.555753');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (187, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:29.588284');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (199, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 5, '2026-07-16 10:31:35.848161');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (205, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:37.640828');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (209, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 7, '2026-07-16 10:31:37.657544');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (210, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 4, '2026-07-16 10:31:37.671305');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (211, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 6, '2026-07-16 10:31:37.687329');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (212, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/5/like', '108.181.0.173', 10, '2026-07-16 10:31:38.40814');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (213, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:31:38.902074');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (175, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 2, '2026-07-16 10:31:22.101315');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (226, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:43:18.534352');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (227, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 2, '2026-07-16 10:43:18.542422');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (228, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 24, '2026-07-16 10:43:18.553963');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (259, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 9, '2026-07-16 10:49:55.374691');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (258, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 20, '2026-07-16 10:49:55.374693');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (260, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:49:55.394358');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (263, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 6, '2026-07-16 10:50:21.64824');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (264, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:50:21.652156');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (265, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:50:21.660961');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (266, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:50:21.663286');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (267, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 26, '2026-07-16 10:50:21.6685');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (268, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:50:26.746893');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (269, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 10:50:26.749164');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (270, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:50:26.758333');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (271, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:50:26.759588');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (274, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 7, '2026-07-16 10:50:51.543332');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (275, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 8, '2026-07-16 10:50:51.543334');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (278, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 9, '2026-07-16 10:50:51.609143');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (280, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 9, '2026-07-16 10:50:58.154067');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (282, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:50:58.155239');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (283, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:50:58.159456');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (286, '【公开端】分页获取已发布的手记列表（按时间倒序）', 'GET', '/api/notes', '108.181.0.173', 10, '2026-07-16 10:50:58.160123');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (284, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 2, '2026-07-16 10:50:58.159554');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (292, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:51:23.046734');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (293, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:51:56.768995');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (300, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 6, '2026-07-16 10:56:10.158849');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (302, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:56:10.177409');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (309, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:56:11.961443');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (315, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:58:31.840079');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (317, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:58:31.857315');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (318, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 10:58:31.862541');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (319, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 39, '2026-07-16 10:58:31.871104');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (323, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:02.735643');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (332, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 7, '2026-07-16 11:01:10.575642');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (334, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 13, '2026-07-16 11:01:10.5809');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (335, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:19.695169');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (336, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:19.710531');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (337, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 11, '2026-07-16 11:01:26.525791');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (338, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:26.638304');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (339, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 11:01:26.664724');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (340, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 11:01:26.824246');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (342, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 11:01:28.139505');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (343, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 11, '2026-07-16 11:01:28.643323');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (344, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 11:01:28.714835');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (345, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 11:01:28.802227');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (346, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 11:01:28.889192');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (348, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:30.949506');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (349, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:31.293612');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (350, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:31.644114');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (351, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 11:01:32.134588');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (352, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 11:01:32.671422');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (354, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 11:01:33.220423');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (355, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 11:01:33.411443');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (356, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:33.523677');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (357, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:33.925919');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (358, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:34.11504');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (360, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:51.335967');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (167, '【公开/管理端】获取全部可见分类的极简下拉信息列表 (仅含 id, name, slug)', 'GET', '/api/categories/simple', '127.0.0.1', 6, '2026-07-16 10:31:19.911555');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (174, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:31:22.100143');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (188, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 2, '2026-07-16 10:31:29.588286');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (189, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 10, '2026-07-16 10:31:29.606469');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (190, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 4, '2026-07-16 10:31:29.620902');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (191, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 3, '2026-07-16 10:31:29.628996');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (192, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:31.109162');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (198, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 10:31:35.848167');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (201, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 5, '2026-07-16 10:31:35.855699');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (202, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 3, '2026-07-16 10:31:35.868569');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (203, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 3, '2026-07-16 10:31:35.877417');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (204, '【公开端】对文章进行点赞 (支持游客，防刷赞，记录登录用户)', 'POST', '/api/articles/5/like', '108.181.0.173', 14, '2026-07-16 10:31:37.043753');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (208, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 10:31:37.640899');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (216, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:31:38.905193');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (217, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 8, '2026-07-16 10:31:38.923786');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (218, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 3, '2026-07-16 10:31:38.938333');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (219, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 3, '2026-07-16 10:31:38.94671');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (220, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:31:41.13175');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (221, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:31:41.146473');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (186, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 4, '2026-07-16 10:31:29.588268');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (229, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 9, '2026-07-16 10:45:18.737281');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (230, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 17, '2026-07-16 10:45:18.743604');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (231, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:45:26.740732');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (232, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:45:34.742894');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (236, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:46:07.355776');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (238, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:46:23.354208');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (239, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:46:31.361065');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (240, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:46:38.732275');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (241, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:46:47.355605');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (245, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 2, '2026-07-16 10:47:19.348493');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (248, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 10:47:50.082054');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (249, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:47:50.730183');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (250, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:47:58.72362');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (251, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:48:07.360079');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (255, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:48:39.349428');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (256, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:48:46.466121');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (257, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 16, '2026-07-16 10:48:46.476846');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (261, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:49:55.39626');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (262, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 70, '2026-07-16 10:49:55.414854');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (273, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:50:51.540675');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (276, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 9, '2026-07-16 10:50:51.544849');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (277, '【公开/管理端】获取文章完整详情信息', 'GET', '/api/articles/like', '108.181.0.173', 21, '2026-07-16 10:50:51.570541');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (279, '【公开前台】获取指定文章下的所有审核通过的嵌套树形评论列表', 'GET', '/api/articles/5/comments', '108.181.0.173', 9, '2026-07-16 10:50:51.609515');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (281, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 8, '2026-07-16 10:50:58.154139');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (298, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:54:20.582701');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (299, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 17, '2026-07-16 10:54:20.590488');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (303, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:56:10.181862');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (304, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 64, '2026-07-16 10:56:10.202172');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (305, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 10:56:11.937447');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (306, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 15, '2026-07-16 10:56:11.944475');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (314, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 29, '2026-07-16 10:58:01.401222');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (320, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 8, '2026-07-16 11:01:02.714347');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (322, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 11:01:02.733884');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (326, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 10, '2026-07-16 11:01:04.634998');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (327, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 11:01:04.643621');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (329, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:04.648455');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (330, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 6, '2026-07-16 11:01:10.574617');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (341, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 11, '2026-07-16 11:01:26.955007');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (347, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 11:01:29.978809');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (353, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:32.883547');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (359, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:50.821679');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (361, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:01:51.825713');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (362, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:52.050807');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (363, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 11:01:52.236352');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (364, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:52.39827');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (365, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 11:01:52.557432');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (366, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 11:01:52.719425');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (370, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 11:06:47.890188');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (371, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 9, '2026-07-16 11:06:47.891647');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (372, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 11:06:47.903122');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (373, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 11:06:47.909227');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (374, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 60, '2026-07-16 11:06:47.941053');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (375, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 9, '2026-07-16 11:06:52.732426');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (377, '【公开端】分页获取已发布的手记列表（按时间倒序）', 'GET', '/api/notes', '108.181.0.173', 10, '2026-07-16 11:06:52.732889');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (378, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 11:06:52.732434');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (379, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 7, '2026-07-16 11:06:52.732406');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (381, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 28, '2026-07-16 13:51:50.730164');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (383, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 28, '2026-07-16 13:51:50.73021');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (385, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 3, '2026-07-16 13:52:04.285511');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (222, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 66, '2026-07-16 10:41:20.538374');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (223, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 13, '2026-07-16 10:41:26.696444');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (224, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 7, '2026-07-16 10:41:26.708909');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (225, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 31, '2026-07-16 10:41:42.940829');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (233, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:45:43.367778');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (234, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 10:45:51.362218');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (235, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:45:59.357746');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (237, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:46:15.360345');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (242, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:46:55.358782');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (243, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:47:03.355132');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (244, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:47:11.354223');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (246, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 10:47:27.359859');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (247, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:47:35.357547');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (252, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 10:48:15.345478');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (253, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:48:23.360113');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (254, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:48:31.359165');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (272, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 22, '2026-07-16 10:50:26.760445');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (285, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 4, '2026-07-16 10:50:58.159476');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (287, '【公开端】分页获取已发布的手记列表（按时间倒序）', 'GET', '/api/notes', '108.181.0.173', 3, '2026-07-16 10:50:58.165131');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (288, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 12, '2026-07-16 10:51:19.741581');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (289, '【受保护后台】分页检索评论列表 (全部/待审核/已通过/垃圾评论/回收站)', 'GET', '/api/admin/comments', '108.181.0.173', 7, '2026-07-16 10:51:19.755666');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (290, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:51:23.028318');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (291, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 27, '2026-07-16 10:51:23.045829');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (294, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:51:56.774108');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (295, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 2, '2026-07-16 10:51:56.78054');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (296, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 4, '2026-07-16 10:51:56.784022');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (297, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 24, '2026-07-16 10:51:56.787085');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (301, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 16, '2026-07-16 10:56:10.158839');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (307, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 31, '2026-07-16 10:56:11.958511');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (308, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 5, '2026-07-16 10:56:11.959537');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (310, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:57:19.984785');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (311, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:57:20.001599');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (312, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 8, '2026-07-16 10:58:01.382306');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (313, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 10:58:01.39854');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (316, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 9, '2026-07-16 10:58:31.855209');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (321, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 15, '2026-07-16 11:01:02.714344');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (324, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 58, '2026-07-16 11:01:02.749009');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (325, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 6, '2026-07-16 11:01:04.629284');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (328, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 24, '2026-07-16 11:01:04.645666');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (331, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 11:01:10.574499');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (333, '【公开端】分页获取已发布的手记列表（按时间倒序）', 'GET', '/api/notes', '108.181.0.173', 12, '2026-07-16 11:01:10.579238');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (367, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 5, '2026-07-16 11:02:01.137578');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (368, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 3, '2026-07-16 11:02:01.145432');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (369, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 14, '2026-07-16 11:02:01.146293');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (376, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 7, '2026-07-16 11:06:52.732444');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (382, '【公开端】分页获取已发布的手记列表（按时间倒序）', 'GET', '/api/notes', '108.181.0.173', 30, '2026-07-16 13:51:50.730128');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (380, '【公开】客户端查询指定站点配置项', 'GET', '/api/site-config/public/background_image_url', '108.181.0.173', 28, '2026-07-16 13:51:50.730209');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (384, '【公开】根据用户名获取个人公开资料', 'GET', '/api/profile/public/butvan', '108.181.0.173', 39, '2026-07-16 13:51:50.733982');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (386, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 7, '2026-07-16 13:52:04.290458');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (387, '【前台】根据导航位置获取树级展现的导航菜单列表（仅可见菜单）', 'GET', '/api/navigations', '108.181.0.173', 4, '2026-07-16 13:52:04.299499');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (388, '分页获取API日志列表', 'GET', '/api/admin/api-logs', '108.181.0.173', 6, '2026-07-16 13:52:04.304993');
INSERT INTO "public"."api_log" ("id", "api_name", "method", "uri", "ip", "cost_time", "created_at") VALUES (389, '获取工作台统计数据', 'GET', '/api/admin/dashboard', '108.181.0.173', 38, '2026-07-16 13:52:04.31169');
COMMIT;

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
INSERT INTO "public"."blog_album_photo" ("id", "album_id", "media_id", "caption", "sort_order", "created_at") VALUES (4, 1, 62, NULL, 0, '2026-07-15 11:27:50.224541');
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
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "seo_title", "seo_description", "seo_keywords", "template", "content_type", "extra", "published_at", "created_at", "updated_at", "deleted_at") VALUES (4, 'test', 'sar', '暴风雨...', '起初人们只以为这是一场普通的暴风雨...



![](http://47.102.205.85:19000/blog2/36d53f15-1ed6-45d8-ab54-afeda1aa95af.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260713%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260713T010601Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=62d1d1ff8ceb9f40056585b65a7fb96f750dbe7fd6f70575576e2f09e423147b)

', '起初人们只以为这是一场普通的暴风雨...



![](http://47.102.205.85:19000/blog2/36d53f15-1ed6-45d8-ab54-afeda1aa95af.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260713%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260713T010601Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=62d1d1ff8ceb9f40056585b65a7fb96f750dbe7fd6f70575576e2f09e423147b)

', 'http://47.102.205.85:19000/blog2/36d53f15-1ed6-45d8-ab54-afeda1aa95af.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260713%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260713T010601Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=62d1d1ff8ceb9f40056585b65a7fb96f750dbe7fd6f70575576e2f09e423147b', 3, 1, 'PUBLISHED', 'PUBLIC', NULL, 't', 't', 't', 0, 1, 5, 358, 2, NULL, NULL, NULL, NULL, 'ARTICLE', NULL, '2026-07-13 09:06:36.724913', '2026-07-13 09:06:36.72489', '2026-07-16 10:28:50.21157', NULL);
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "seo_title", "seo_description", "seo_keywords", "template", "content_type", "extra", "published_at", "created_at", "updated_at", "deleted_at") VALUES (5, 'test like', 'like', NULL, 'kkk



&nbsp;', 'kkk



&nbsp;', NULL, NULL, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 'f', 't', 0, 0, 0, 13, 1, NULL, NULL, NULL, NULL, 'ARTICLE', NULL, '2026-07-16 10:31:17.180222', '2026-07-16 10:31:17.180202', '2026-07-16 10:31:38.402729', NULL);
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
INSERT INTO "public"."blog_article_tag" ("article_id", "tag_id") VALUES (4, 2);
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
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (1, '前端开发', 'frontend', 'React, Next.js, Tailwind CSS 等前端前沿技术', NULL, NULL, 1, 0, 't', '2026-06-17 02:08:03.3425', '2026-06-18 16:04:41.625118');
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (3, '随笔感悟', 'life', '生活记录、读书心得与个人感悟', NULL, NULL, 3, 1, 't', '2026-06-17 02:08:03.3425', '2026-07-07 21:45:05.394698');
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES (2, '后端开发', 'backend', 'Java, Spring Boot, Spring Cloud, PostgreSQL 等后端技术', NULL, NULL, 2, 0, 't', '2026-06-17 02:08:03.3425', '2026-07-13 09:06:36.766091');
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
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (10, 4, 9, 1, '可梵', '1973578950@qq.com', NULL, '谢谢', 'APPROVED', '127.0.0.1', 'System Admin Panel', 0, 'f', '2026-07-15 15:03:01.224958', '2026-07-15 15:03:01.224977', NULL, 'f', 't');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (9, 4, NULL, 2076230692352372736, 'wj08265395@outlook.com', 'wj08265395@outlook.com', NULL, '哈哈哈哈', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, 't', '2026-07-15 15:00:57.874753', '2026-07-15 15:03:01.232377', NULL, 'f', 'f');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (11, 4, NULL, 2076230692352372736, 'wj08265395@outlook.com', 'wj08265395@outlook.com', NULL, '哈哈哈', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, 'f', '2026-07-16 10:22:03.082475', '2026-07-16 10:22:03.082504', NULL, 'f', 'f');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (12, 4, NULL, 2076230692352372736, 'wj08265395@outlook.com', 'wj08265395@outlook.com', NULL, '放到收发室地方', 'APPROVED', '108.181.0.173', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, 'f', '2026-07-16 10:28:50.204761', '2026-07-16 10:28:50.204769', NULL, 'f', 'f');
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at", "deleted_at", "is_pinned", "is_author") VALUES (8, 4, NULL, 2076230692352372736, 'wj08265395@outlook.com', 'wj08265395@outlook.com', NULL, '### test
> ndjasbdsad', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, 'f', '2026-07-15 14:54:26.243146', '2026-07-15 14:54:26.243162', NULL, 'f', 'f');
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
-- Table structure for blog_daily_stats
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_daily_stats";
CREATE TABLE "public"."blog_daily_stats" (
  "id" int8 NOT NULL DEFAULT nextval('blog_daily_stats_id_seq'::regclass),
  "stat_date" date NOT NULL,
  "pv_count" int8 DEFAULT 0,
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "public"."blog_daily_stats" OWNER TO "butvan";

-- ----------------------------
-- Records of blog_daily_stats
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_daily_stats" ("id", "stat_date", "pv_count", "created_at", "updated_at") VALUES (1, '2026-07-15', 6, '2026-07-15 16:19:33.493842', '2026-07-15 17:26:55.768099');
INSERT INTO "public"."blog_daily_stats" ("id", "stat_date", "pv_count", "created_at", "updated_at") VALUES (7, '2026-07-16', 22, '2026-07-16 10:21:57.80371', '2026-07-16 10:50:51.554095');
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
  "source_detail" varchar(255) COLLATE "pg_catalog"."default",
  "file_hash" varchar(64) COLLATE "pg_catalog"."default",
  "ip_address" varchar(50) COLLATE "pg_catalog"."default",
  "user_agent" varchar(500) COLLATE "pg_catalog"."default",
  "status" int4 DEFAULT 1
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
COMMENT ON COLUMN "public"."blog_media"."file_hash" IS '文件SHA-256哈希值，用于秒传和文件去重';
COMMENT ON COLUMN "public"."blog_media"."ip_address" IS '上传者的客户端IP';
COMMENT ON COLUMN "public"."blog_media"."user_agent" IS '上传者的客户端User-Agent';
COMMENT ON COLUMN "public"."blog_media"."status" IS '文件状态：0-临时(草稿未保存)，1-正常(已关联关联实体)';
COMMENT ON TABLE "public"."blog_media" IS '媒体资源表 — 统一管理上传的静态资源';

-- ----------------------------
-- Records of blog_media
-- ----------------------------
BEGIN;
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (1, 'fWdgJuAOF.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', '/uploads/e108e489-ece3-41a6-a265-401563c520e2.jpeg', 'IMAGE', 'image/jpeg', 1023770, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:13.578147', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (2, 'crop-1781440432479.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', '/uploads/c952ac36-74c6-4e8e-ac6a-e7dcf0d195ae.png', 'IMAGE', 'image/png', 46768, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:33:52.4931', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (3, 'crop-1781441144723.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', '/uploads/1eec0750-4fcc-43e7-832a-7925a19b4463.png', 'IMAGE', 'image/png', 196002, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:44.741133', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (4, 'crop-1781441152613.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', '/uploads/49237286-62a4-4037-a2bb-cdde6ec49887.png', 'IMAGE', 'image/png', 223736, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:52.627417', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (5, 'crop-1781441158032.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', '/uploads/ab692d1a-dda2-441a-8f59-9933bbcfdecb.png', 'IMAGE', 'image/png', 228626, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:45:58.046616', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (6, 'crop-1781441413702.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', '/uploads/c59a1824-5c88-47e5-aba6-16420b4e592e.png', 'IMAGE', 'image/png', 290588, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:13.731449', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (7, 'crop-1781441449421.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', '/uploads/dea2bbeb-d56f-4fb5-9886-78b90fc4bfc1.png', 'IMAGE', 'image/png', 208139, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:50:49.43597', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (8, 'crop-1781441664900.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', '/uploads/e80be3e4-ba8c-4fd4-96d3-3889429207cd.png', 'IMAGE', 'image/png', 196322, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:54:24.94014', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (9, 'crop-1781441841386.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', '/uploads/26aad09c-7732-4481-8d53-0c8e92187db1.png', 'IMAGE', 'image/png', 221932, NULL, NULL, NULL, 'local', NULL, '2026-06-14 20:57:21.42216', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (10, 'crop-1781442973142.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', '/uploads/048fe1b4-fb94-4837-9296-a4260fc3d07a.png', 'IMAGE', 'image/png', 207769, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:16:13.180014', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (11, 'crop-1781444106016.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', '/uploads/24706e74-edba-4ca8-959d-f827dbf69387.png', 'IMAGE', 'image/png', 50964, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:06.055588', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (12, 'crop-1781444118983.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', '/uploads/adf527c2-a5b8-4e04-9ba4-7d28f4c613c0.png', 'IMAGE', 'image/png', 98563, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:18.998345', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (13, 'crop-1781444139339.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', '/uploads/b06548fe-447f-4c24-b60d-fd96596440a3.png', 'IMAGE', 'image/png', 74407, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:35:39.354885', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (14, 'crop-1781444212668.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', '/uploads/2540284d-263e-47d9-9b68-ab45be519367.png', 'IMAGE', 'image/png', 424584, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:36:52.68792', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (15, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', '/uploads/8d643484-8c41-4073-837f-4bf15b02eb0e.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:37:44.760827', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (16, 'crop-1781444308361.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', '/uploads/c9336619-587c-4e80-9a48-fa9c5af9d9c9.png', 'IMAGE', 'image/png', 27677, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:28.371855', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (17, 'crop-1781444339391.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', '/uploads/52f589bb-e706-49c9-ac9a-b779c3d1be89.png', 'IMAGE', 'image/png', 82954, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:38:59.4049', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (18, 'crop-1781444563530.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', '/uploads/30cb9ff9-4842-444b-ae40-7a4215680219.png', 'IMAGE', 'image/png', 75860, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:42:43.542653', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (19, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', '/uploads/e73040da-89ad-4b34-92d6-c68db0e99076.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:22.391892', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (20, '空调-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', '/uploads/e8abf0d9-8d1c-459c-af7d-4c0b15fa64a8.jpeg', 'IMAGE', 'image/jpeg', 206074, NULL, NULL, NULL, 'local', NULL, '2026-06-14 21:44:36.47345', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (21, 'crop-1781445918890.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', '/uploads/817a8572-3b23-4ef9-9935-6ad27acd0ad6.png', 'IMAGE', 'image/png', 83094, NULL, NULL, NULL, 'local', NULL, '2026-06-14 22:05:18.928014', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (22, 'crop-1781481053968.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', '/uploads/2d8c3e0e-3e3e-4593-85bc-b8edc8f035db.png', 'IMAGE', 'image/png', 58620, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:50:54.009721', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (23, 'crop-1781481411972.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', '/uploads/f7dea9eb-cea0-41e9-973f-acb18a75d4b4.png', 'IMAGE', 'image/png', 25289, NULL, NULL, NULL, 'local', NULL, '2026-06-15 07:56:51.988539', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (24, 'crop-1781482539995.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', '/uploads/39354734-53f2-4f41-b01d-bfb2f48b5745.png', 'IMAGE', 'image/png', 74669, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:40.028816', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (25, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', '/uploads/49ef76b2-e533-471d-a786-45eec999b9df.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:15:46.563153', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (26, 'crop-1781482602982.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', '/uploads/34b96d16-57ed-433a-ac7a-725c413559f3.png', 'IMAGE', 'image/png', 64576, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:42.996483', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (27, '电脑-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', '/uploads/3b367503-e5c3-4d91-a283-bdf9635a196a.jpeg', 'IMAGE', 'image/jpeg', 359250, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:16:48.034915', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (28, 'crop-1781484024860.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', '/uploads/692a6d4b-bde5-4f60-91cf-1fe57c62cafa.png', 'IMAGE', 'image/png', 220818, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:24.880864', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (29, 'crop-1781484046981.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', '/uploads/47a6bd28-9b02-4988-bd84-c4d67b15a00b.png', 'IMAGE', 'image/png', 129071, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:46.99655', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (30, '椅子-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', '/uploads/b8ea54a8-267f-496d-a31b-bce7758b1b6c.jpeg', 'IMAGE', 'image/jpeg', 296840, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:40:53.765589', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (31, 'crop-1781484646428.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', '/uploads/ae6d0a37-4d24-4230-acb7-cb33c170fa73.png', 'IMAGE', 'image/png', 44499, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:46.445246', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (32, '桌子上的书籍-扣图.jpeg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', '/uploads/59348e31-17e7-4f09-b219-b8c21747ded0.jpeg', 'IMAGE', 'image/jpeg', 413948, NULL, NULL, NULL, 'local', NULL, '2026-06-15 08:50:52.062866', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (33, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', '/uploads/f5e6e90f-a1f4-4df5-acd1-04e09ea837fd.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:16:57.389299', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (34, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', '/uploads/7a22c7a9-1624-47f5-a4cd-641424c048b2.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 09:23:50.30581', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (35, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', '/uploads/3eeb7e33-ff85-466e-9655-00e939769f7c.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-15 10:12:03.049569', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (36, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', '/uploads/aa73cead-f1c1-484b-b071-29bfed1531a0.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:28:44.980526', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (37, 'IMG_8747.jpg', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', '/uploads/ae20acd5-08b8-42d6-a327-44d222c114a2.jpg', 'IMAGE', 'image/jpeg', 264532, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:30:11.314881', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (38, 'fWlTaMZsT.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', '/uploads/e84bf9a0-f48e-4173-9586-d14330d70b19.png', 'IMAGE', 'image/png', 1644415, NULL, NULL, NULL, 'local', NULL, '2026-06-15 16:53:40.335232', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (39, 'crop-1781514395901.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', '/uploads/c8db1975-4c83-4186-89e2-8fd794b2c790.png', 'IMAGE', 'image/png', 673475, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:06:35.923915', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (40, 'crop-1781514766967.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', '/uploads/f5fd684b-debe-444e-ad89-c4561ba3a30d.png', 'IMAGE', 'image/png', 910697, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:12:46.992397', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (41, 'crop-1781515398951.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', '/uploads/efc82699-08e3-402f-9d18-155ddf4327dd.png', 'IMAGE', 'image/png', 515992, NULL, NULL, NULL, 'local', NULL, '2026-06-15 17:23:18.975993', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (42, '场景.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png', '/uploads/59b28aac-6543-4034-a926-5fdc855723f3.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'local', NULL, '2026-06-20 16:21:28.519611', 'MANUAL', NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (43, '大树仰拍-4K.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png', '/uploads/a339fa8e-219d-4182-b812-89c4bd34fb55.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'local', NULL, '2026-06-20 17:25:53.640912', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (44, 'crop-1782725784671.png', '/Users/butvan/Butvan_Projets/my_code/Butvan Blog2.0/backend/uploads/52b9560b-bdc9-4633-a421-2a5af0c9be65.png', '/uploads/52b9560b-bdc9-4633-a421-2a5af0c9be65.png', 'IMAGE', 'image/png', 935218, NULL, NULL, NULL, 'local', NULL, '2026-06-29 17:36:24.719641', 'SCENE', 8, '房间场景 - xiaohongshu - 框选自动裁剪物品', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (45, 'butvan_.png', '87a371bd-7bb1-425c-a161-af27112b5b41.png', 'http://47.102.205.85:19000/blog2/87a371bd-7bb1-425c-a161-af27112b5b41.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-05 08:43:57.332995', 'USER_AVATAR', NULL, '用户头像', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (53, '64988.JPG', '21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg', 'http://47.102.205.85:19000/blog2/21c1b53d-4325-4d1c-979e-2246ee43abf7.jpg', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:09:22.827473', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (54, 'butvan_bak.png', 'dd4ebffb-addf-4684-8479-ecf8aa66eca5.png', 'http://47.102.205.85:19000/blog2/dd4ebffb-addf-4684-8479-ecf8aa66eca5.png', 'IMAGE', 'image/png', 1853926, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:09:36.821196', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (56, 'butvan_.png', 'f38e5a12-c9f2-4417-bcff-c80cd6f94941.png', 'http://47.102.205.85:19000/blog2/f38e5a12-c9f2-4417-bcff-c80cd6f94941.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:18:28.46905', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (46, '大树仰拍-4K.png', 'f07a827c-9341-4681-b5db-18cb536c85f0.png', 'http://47.102.205.85:19000/blog2/f07a827c-9341-4681-b5db-18cb536c85f0.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'minio', NULL, '2026-07-05 09:07:45.796439', 'SYSTEM_CONFIG', NULL, '站点全局背景图片', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (47, '场景.png', '372e0077-a1fe-4579-ac5f-4e655f453d1e.png', 'http://47.102.205.85:19000/blog2/372e0077-a1fe-4579-ac5f-4e655f453d1e.png', 'IMAGE', 'image/png', 2112126, NULL, NULL, NULL, 'minio', NULL, '2026-07-06 20:52:59.301957', 'ALBUM', 1, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (48, 'butvan_.png', '498bf7a8-c3ff-4e4c-bd95-5c3795eb527f.png', 'http://47.102.205.85:19000/blog2/498bf7a8-c3ff-4e4c-bd95-5c3795eb527f.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-07 14:51:13.713778', 'ALBUM', 1, NULL, NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (49, 'butvan_person.jpeg', 'bea69d1b-f0b8-48b6-a8b1-ad2e34c4f852.jpeg', 'http://47.102.205.85:19000/blog2/bea69d1b-f0b8-48b6-a8b1-ad2e34c4f852.jpeg', 'IMAGE', 'image/jpeg', 205786, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 10:44:38.786071', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (50, '64988.JPG', '3430805c-350c-47a9-8069-652e037e7853.jpg', 'http://47.102.205.85:19000/blog2/3430805c-350c-47a9-8069-652e037e7853.jpg', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 10:44:59.233372', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (51, 'butvan_.png', '5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png', 'http://47.102.205.85:19000/blog2/5a379f1c-4e4d-4ab6-b6f2-86a03f41686d.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:02:27.552205', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (52, '物品信息.png', 'ff4c5588-580c-4ad9-abfd-48d59cd395c0.png', 'http://47.102.205.85:19000/blog2/ff4c5588-580c-4ad9-abfd-48d59cd395c0.png', 'IMAGE', 'image/png', 1714750, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:02:41.814491', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (55, '64988.JPG', '35589100-d66e-48c1-8881-de16ce92ca63.jpg', 'http://47.102.205.85:19000/blog2/35589100-d66e-48c1-8881-de16ce92ca63.jpg', 'IMAGE', 'image/jpeg', 1809412, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 11:18:19.506978', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (57, 'butvan_.png', 'e87d9a6f-55db-4859-a350-e3444c5dc805.png', 'http://47.102.205.85:19000/blog2/e87d9a6f-55db-4859-a350-e3444c5dc805.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:40:50.530776', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (58, 'butvan.png', '751bb102-fa2a-4289-9cd1-cf139aedadc3.png', 'http://47.102.205.85:19000/blog2/751bb102-fa2a-4289-9cd1-cf139aedadc3.png', 'IMAGE', 'image/png', 1801501, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:40:59.809453', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (59, '大树仰拍-4K.png', '580c4014-b1da-485f-bd7a-1fa12a3f52f2.png', 'http://47.102.205.85:19000/blog2/580c4014-b1da-485f-bd7a-1fa12a3f52f2.png', 'IMAGE', 'image/png', 26210947, NULL, NULL, NULL, 'minio', NULL, '2026-07-08 16:45:37.877547', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (60, '五等分新娘_三玖(2d动漫风格）.png', '36d53f15-1ed6-45d8-ab54-afeda1aa95af.png', 'http://47.102.205.85:19000/blog2/36d53f15-1ed6-45d8-ab54-afeda1aa95af.png', 'IMAGE', 'image/png', 2366605, NULL, NULL, NULL, 'minio', NULL, '2026-07-13 09:06:01.226241', 'ARTICLE', NULL, '文章正文插图', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (61, 'butvan_.png', '01681833-d393-4e53-867e-1d96fb2b736d.png', 'http://47.102.205.85:19000/blog2/01681833-d393-4e53-867e-1d96fb2b736d.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-15 11:00:46.13132', 'USER_AVATAR', NULL, '用户头像', NULL, NULL, NULL, 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (62, 'butvan_.png', 'ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'http://47.102.205.85:19000/blog2/ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-15 11:27:50.204616', 'ALBUM', 1, NULL, 'a499cafcea8e68581685727c3a25f94ef400eec873509e4c73d836e6c6701b0f', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (63, 'butvan_.png', 'ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'http://47.102.205.85:19000/blog2/ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-15 11:33:50.71455', 'USER_AVATAR', NULL, '用户头像', 'a499cafcea8e68581685727c3a25f94ef400eec873509e4c73d836e6c6701b0f', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 1);
INSERT INTO "public"."blog_media" ("id", "file_name", "file_path", "file_url", "file_type", "mime_type", "file_size", "width", "height", "alt_text", "bucket_name", "uploader_id", "created_at", "source_type", "source_id", "source_detail", "file_hash", "ip_address", "user_agent", "status") VALUES (64, 'butvan_.png', 'ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'http://47.102.205.85:19000/blog2/ALBUM/20260715/dd40c2ae-0f30-4208-bdc1-029658ac7285.png', 'IMAGE', 'image/png', 1766024, NULL, NULL, NULL, 'minio', NULL, '2026-07-15 11:37:40.501825', 'USER_AVATAR', NULL, '用户头像', 'a499cafcea8e68581685727c3a25f94ef400eec873509e4c73d836e6c6701b0f', '0:0:0:0:0:0:0:1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 1);
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
INSERT INTO "public"."blog_navigation" ("id", "title", "parent_id", "link_type", "link_target_id", "link_url", "icon", "position", "sort_order", "is_visible", "is_open_new_tab", "created_at", "updated_at") VALUES (44, 'API日志', NULL, 'PAGE', NULL, '/api-logs', 'Activity', 'ADMIN_SIDEBAR', 99, 't', 'f', '2026-07-16 02:07:14.180509', '2026-07-16 02:07:14.180509');
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
INSERT INTO "public"."blog_site_config" ("id", "config_key", "config_value", "config_type", "description", "created_at", "updated_at") VALUES (2, 'email_verify_subject', '【可梵的个人博客】登录验证码', 'string', '邮箱验证码登录邮件主题', '2026-07-14 08:51:48.21212', '2026-07-14 08:51:48.21212');
INSERT INTO "public"."blog_site_config" ("id", "config_key", "config_value", "config_type", "description", "created_at", "updated_at") VALUES (3, 'email_verify_template', '您的验证码是：${code}，该验证码 5 分钟内有效。如非本人操作，请忽略此邮件。', 'string', '邮箱验证码登录邮件内容模版（支持 ${code} 变量）', '2026-07-14 08:51:48.21212', '2026-07-14 08:51:48.21212');
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
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (3, 'Next.js', 'nextjs', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (5, 'PostgreSQL', 'postgresql', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (6, 'Docker', 'docker', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (2, 'TypeScript', 'typescript', 1, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (4, 'Spring Boot', 'spring-boot', 0, '2026-06-17 02:08:03.34461');
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES (1, 'React', 'react', 0, '2026-06-17 02:08:03.34461');
COMMIT;

-- ----------------------------
-- Table structure for blog_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."blog_user";
CREATE TABLE "public"."blog_user" (
  "id" int8 NOT NULL,
  "username" varchar(50) COLLATE "pg_catalog"."default",
  "password_hash" varchar(255) COLLATE "pg_catalog"."default",
  "nickname" varchar(50) COLLATE "pg_catalog"."default",
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
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (2076474593878626304, NULL, NULL, NULL, '2020646061@qq.com', NULL, NULL, NULL, 'USER', 'ACTIVE', '2026-07-13 09:11:36.869992', '2026-07-13 09:11:36.870759', '2026-07-13 09:11:36.870765', NULL, NULL, NULL, 'f');
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (2076483089068085248, NULL, NULL, NULL, 'yunyvstudio@qq.com', NULL, NULL, NULL, 'USER', 'ACTIVE', '2026-07-13 09:45:22.280936', '2026-07-13 09:45:22.281132', '2026-07-13 09:45:22.281133', NULL, NULL, NULL, 'f');
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (2076954799093481472, NULL, NULL, NULL, 'wj5395@outlook.com', NULL, NULL, NULL, 'USER', 'ACTIVE', '2026-07-14 17:07:40.385195', '2026-07-14 16:59:46.717088', '2026-07-14 17:07:40.409478', NULL, NULL, NULL, 'f');
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (1, 'butvan', '$2a$10$ppwPhoJRQ6O/Vo/q86yAMO0vVpA/I2p.6FF8tMeleQi8NMNr8XU6G', '可梵', '1973578950@qq.com', 'http://47.102.205.85:19000/blog2/87a371bd-7bb1-425c-a161-af27112b5b41.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio%2F20260705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260705T004357Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7ceba0d11e820c6579428cb9fbfaab18b665b4d6875d692c25ec105ede955d40', 'JAVA/Agent/VibeCoding开发者', '{"rss": "", "email": "1973578950@qq.com", "github": "https://github.com/agent-butvan", "footerIcp": "", "introLine1": "大二学Agent开发中...", "introLine2": "", "footerTitle": "Butvan Blog", "footerSubtitle": "珍惜眼前人", "footerStartDate": "2026-06-15"}', 'ADMIN', 'ACTIVE', '2026-07-13 08:54:17.462811', '2026-06-14 14:56:18.755605', '2026-07-13 08:54:17.463888', 'gh-3048393', 'agent-butvan', 'QSS6MRRZTAMMQWC3', 't');
INSERT INTO "public"."blog_user" ("id", "username", "password_hash", "nickname", "email", "avatar_url", "bio", "social_links", "role", "status", "last_login_at", "created_at", "updated_at", "github_id", "github_username", "two_factor_secret", "two_factor_enabled") VALUES (2076230692352372736, NULL, NULL, NULL, 'wj08265395@outlook.com', 'http://47.102.205.85:19000/blog2/USER_AVATAR/20260715/avatars/81aba949-c1a9-49b0-b9e3-175c617fd257.png', NULL, NULL, 'USER', 'ACTIVE', '2026-07-14 17:11:31.346928', '2026-07-12 17:02:26.214533', '2026-07-15 11:45:01.296483', NULL, NULL, NULL, 'f');
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
INSERT INTO "public"."blog_wechat_user" ("id", "open_id", "user_id", "status", "created_at", "updated_at") VALUES (9, 'ogcWtvrXOtRDZ0Qu8pDpifGkntbs', 2076230692352372736, 1, '2026-07-13 08:29:32.598981', '2026-07-13 08:32:24.696762');
INSERT INTO "public"."blog_wechat_user" ("id", "open_id", "user_id", "status", "created_at", "updated_at") VALUES (10, 'ogcWtvlCHqTLIIFGCr-qOIfPBy9k', 2076474593878626304, 1, '2026-07-13 09:11:36.852291', '2026-07-13 09:11:36.881985');
INSERT INTO "public"."blog_wechat_user" ("id", "open_id", "user_id", "status", "created_at", "updated_at") VALUES (11, 'ogcWtvlaV67l4C0cSGlqOtiTJfss', 2076483089068085248, 1, '2026-07-13 09:45:22.267403', '2026-07-13 09:45:22.283619');
COMMIT;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."api_log_id_seq"
OWNED BY "public"."api_log"."id";
SELECT setval('"public"."api_log_id_seq"', 389, true);

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
SELECT setval('"public"."blog_album_photo_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_id_seq"
OWNED BY "public"."blog_article"."id";
SELECT setval('"public"."blog_article_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_article_like_id_seq"
OWNED BY "public"."blog_article_like"."id";
SELECT setval('"public"."blog_article_like_id_seq"', 12, true);

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
SELECT setval('"public"."blog_comment_ban_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_comment_id_seq"
OWNED BY "public"."blog_comment"."id";
SELECT setval('"public"."blog_comment_id_seq"', 12, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_daily_stats_id_seq"
OWNED BY "public"."blog_daily_stats"."id";
SELECT setval('"public"."blog_daily_stats_id_seq"', 28, true);

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
SELECT setval('"public"."blog_media_id_seq"', 64, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."blog_navigation_id_seq"
OWNED BY "public"."blog_navigation"."id";
SELECT setval('"public"."blog_navigation_id_seq"', 44, true);

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
SELECT setval('"public"."blog_site_config_id_seq"', 3, true);

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
SELECT setval('"public"."blog_wechat_user_id_seq"', 11, true);

-- ----------------------------
-- Indexes structure for table api_log
-- ----------------------------
CREATE INDEX "idx_api_log_created_at" ON "public"."api_log" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table api_log
-- ----------------------------
ALTER TABLE "public"."api_log" ADD CONSTRAINT "api_log_pkey" PRIMARY KEY ("id");

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
-- Indexes structure for table blog_daily_stats
-- ----------------------------
CREATE INDEX "idx_daily_stats_date" ON "public"."blog_daily_stats" USING btree (
  "stat_date" "pg_catalog"."date_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table blog_daily_stats
-- ----------------------------
ALTER TABLE "public"."blog_daily_stats" ADD CONSTRAINT "blog_daily_stats_stat_date_key" UNIQUE ("stat_date");

-- ----------------------------
-- Primary Key structure for table blog_daily_stats
-- ----------------------------
ALTER TABLE "public"."blog_daily_stats" ADD CONSTRAINT "blog_daily_stats_pkey" PRIMARY KEY ("id");

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
CREATE INDEX "idx_media_hash" ON "public"."blog_media" USING btree (
  "file_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
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
