## 数据模型

> 本文档定义 Butvan Blog 2.0 的完整数据库模型设计。所有表均遵循大厂开发规范，使用 PostgreSQL 作为数据库引擎。

---

### 设计原则

| 原则 | 说明 |
|------|------|
| **命名规范** | 表名 `blog_` 前缀 + 下划线小写；字段全小写下划线；Java 实体使用驼峰映射 |
| **主键策略** | 统一 `BIGSERIAL`（PostgreSQL 自增），Java 侧 `GenerationType.IDENTITY` |
| **时间戳** | 所有业务表含 `created_at`（自动填充）和 `updated_at`（自动更新） |
| **软删除** | 核心内容表（文章、评论）使用 `deleted_at` 字段软删除，非直接物理删除 |
| **冗余计数** | 分类/标签的 `article_count`、文章的 `comment_count` 适度冗余，以空间换读性能 |
| **JSONB 扩展** | 坐标、配置等灵活字段使用 PostgreSQL JSONB 类型，兼顾查询与灵活性 |

---

## 一、场景模块

### 1. `blog_homepage_scene` — 首页场景表

存储"房间"场景数据，如"我的书房"。系统同时只能有一个激活场景。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `title` | VARCHAR(100) | NOT NULL | 场景标题，如"我的书房" |
| `image_url` | VARCHAR(500) | NOT NULL | 房间背景图 URL（高分辨率） |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT false | 是否当前启用（全局唯一为 true） |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间（自动填充） |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间（自动更新） |

```sql
-- 确保全局只有一个激活场景（部分唯一索引）
CREATE UNIQUE INDEX uk_scene_active ON blog_homepage_scene (is_active) WHERE is_active = true;
```

---

### 2. `blog_homepage_hotspot` — 热区/物品表（v0.2 增强版）

场景中的可交互物品。v0.2 核心增强：分离坐标独立字段、增加抠图 PNG 支持、保留 JSONB 扩展。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `scene_id` | BIGINT | FK→scene, NOT NULL | 所属场景 |
| `item_name` | VARCHAR(100) | NOT NULL | 物品名称，如"电脑"、"台灯"、"书本" |
| `item_image_url` | VARCHAR(500) | — | 🆕 v0.2: 透明抠图 PNG 文件地址 |
| `x_percent` | DECIMAL(5,2) | NOT NULL | 🆕 v0.2: 左边界 X 坐标百分比（0.00~100.00） |
| `y_percent` | DECIMAL(5,2) | NOT NULL | 🆕 v0.2: 上边界 Y 坐标百分比（0.00~100.00） |
| `width_percent` | DECIMAL(5,2) | NOT NULL | 🆕 v0.2: 物品宽度百分比 |
| `height_percent` | DECIMAL(5,2) | — | 🆕 v0.2: 物品高度百分比（等比例缩放可省略） |
| `geometry_ext` | JSONB | — | 🔄 扩展几何属性：`{"rotate": 0, "opacity": 1.0, "shape": "rect", "animation": "float"}` |
| `hover_tips` | VARCHAR(255) | — | 悬浮提示文案，如"要来看看我写代码吗？💻" |
| `redirect_type` | VARCHAR(50) | NOT NULL | 跳转类型: `INTERNAL`（站内路径）\| `EXTERNAL`（外链）\| `ARTICLE`（文章）\| `CATEGORY`（分类） |
| `redirect_path` | VARCHAR(500) | — | 跳转 URL（`EXTERNAL` 或 `INTERNAL` 时用） |
| `redirect_target_id` | BIGINT | — | 🆕 跳转目标 ID（`ARTICLE` 或 `CATEGORY` 时用） |
| `zoom_scale` | DECIMAL(3,2) | DEFAULT 3.0 | 点击后镜头缩放比例（1.0 = 不缩放） |
| `sort_order` | INTEGER | DEFAULT 0 | 排序号（控制 z-index 渲染层级） |
| `is_visible` | BOOLEAN | DEFAULT true | 🆕 是否在前台显示（临时隐藏用） |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |

**索引**：
```sql
CREATE INDEX idx_hotspot_scene_sort ON blog_homepage_hotspot (scene_id, sort_order);
```

**geometry_ext JSONB 示例**：
```json
{
  "rotate": 0,
  "opacity": 1.0,
  "shape": "rect",
  "animation": "float",
  "polygon_points": null
}
```

---

## 二、用户模块

### 3. `blog_user` — 用户表

支持多作者账号管理。当前个人博客仅一个管理员，但预留扩展能力。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 登录用户名（字母数字下划线） |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt 加密密码 |
| `nickname` | VARCHAR(50) | NOT NULL | 前端展示昵称（支持中文） |
| `email` | VARCHAR(100) | UNIQUE | 邮箱地址 |
| `avatar_url` | VARCHAR(500) | — | 头像图片 URL |
| `bio` | TEXT | — | 个人简介/签名 |
| `social_links` | JSONB | — | 🔧 扩展：社交链接，如 `{"github":"https://...", "twitter":"https://...", "zhihu":"https://..."}` |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'AUTHOR' | 角色枚举: `ADMIN`（管理员）\| `AUTHOR`（作者） |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | 账号状态: `ACTIVE`（正常）\| `DISABLED`（停用） |
| `last_login_at` | TIMESTAMP | — | 最后登录时间 |
| `created_at` | TIMESTAMP | NOT NULL | 注册时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

---

## 三、文章模块（大厂级标准）

### 4. `blog_category` — 分类表

支持两级树状分类结构，通过 `parent_id` 自关联。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `name` | VARCHAR(50) | NOT NULL | 分类名称，如"前端开发" |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | URL 友好标识，如 `frontend` |
| `description` | VARCHAR(255) | — | 分类简要描述 |
| `parent_id` | BIGINT | — | 父分类 ID（NULL = 顶级分类） |
| `icon` | VARCHAR(100) | — | 图标（emoji 字符串或图标 class 名） |
| `sort_order` | INTEGER | DEFAULT 0 | 同级排序权重 |
| `article_count` | INTEGER | DEFAULT 0 | 🔄 冗余：该分类下已发布文章数 |
| `is_visible` | BOOLEAN | DEFAULT true | 是否在前台导航显示 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

---

### 5. `blog_tag` — 标签表

扁平标签结构，与文章为多对多关系。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | 标签名称，如"React" |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | URL 标识，如 `react` |
| `article_count` | INTEGER | DEFAULT 0 | 🔄 冗余：关联的已发布文章数 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |

---

### 6. `blog_article` — 文章表

文章核心表，涵盖内容、状态、SEO、统计、软删除等完整生命周期管理。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `title` | VARCHAR(200) | NOT NULL | 文章标题 |
| `slug` | VARCHAR(200) | UNIQUE, NOT NULL | URL 唯一标识（拼音/英文） |
| `summary` | VARCHAR(500) | — | 文章摘要（列表展示用） |
| `content` | TEXT | NOT NULL | Markdown 源文本 |
| `content_html` | TEXT | — | 服务端渲染后的 HTML（缓存，避免每次 render） |
| `cover_image_url` | VARCHAR(500) | — | 封面/头图 URL |
| `category_id` | BIGINT | FK→category | 所属分类 |
| `author_id` | BIGINT | FK→user, NOT NULL | 作者 ID |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | `DRAFT`（草稿）\| `PUBLISHED`（已发布）\| `PRIVATE`（私密）\| `ARCHIVED`（归档） |
| `visibility` | VARCHAR(20) | NOT NULL, DEFAULT 'PUBLIC' | `PUBLIC`（公开）\| `PRIVATE`（仅自己）\| `PASSWORD_PROTECTED`（密码访问） |
| `password` | VARCHAR(100) | — | 访问密码（`visibility=PASSWORD_PROTECTED` 时使用） |
| `is_pinned` | BOOLEAN | DEFAULT false | 是否置顶（置顶文章优先展示） |
| `is_featured` | BOOLEAN | DEFAULT false | 是否精选/推荐（首页展示） |
| `is_allow_comment` | BOOLEAN | DEFAULT true | 是否开放评论 |
| `view_count` | BIGINT | DEFAULT 0 | 🔄 冗余：累计阅读量 |
| `like_count` | BIGINT | DEFAULT 0 | 🔄 冗余：累计点赞数 |
| `comment_count` | BIGINT | DEFAULT 0 | 🔄 冗余：已通过评论数 |
| `word_count` | INTEGER | DEFAULT 0 | 正文字数（后端计算存储） |
| `reading_time` | INTEGER | DEFAULT 0 | 预估阅读时间（分钟，按 300 字/分钟估算） |
| `seo_title` | VARCHAR(200) | — | 自定义 SEO 标题（留空则用 article.title） |
| `seo_description` | VARCHAR(500) | — | 自定义 SEO 描述（留空则用 article.summary） |
| `seo_keywords` | VARCHAR(300) | — | 自定义 SEO 关键词（逗号分隔） |
| `template` | VARCHAR(50) | — | 自定义渲染模板名（留空则用默认模板） |
| `published_at` | TIMESTAMP | — | 正式发布时间（首次从草稿变更为已发布时记录） |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 最后修改时间 |
| `deleted_at` | TIMESTAMP | — | 🗑 软删除标记（非 NULL = 已删除） |
| `content_type` | VARCHAR(20) | NOT NULL, DEFAULT 'ARTICLE' | 🔧 扩展：内容类型 `ARTICLE`（长文）\| `NOTE`（随笔/微言）\| `GALLERY`（照片墙）\| `PROJECT`（项目作品） |
| `extra` | JSONB | — | 🔧 扩展：类型专属字段，如 GALLERY 存 `{"images":[...]}`, PROJECT 存 `{"repo_url":"...","demo_url":"..."}` |
```sql
CREATE INDEX idx_article_status_pub   ON blog_article (status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_category     ON blog_article (category_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_slug         ON blog_article (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_author       ON blog_article (author_id, created_at DESC);
```

---

### 7. `blog_article_tag` — 文章-标签关联表

多对多中间表，联合主键去重。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `article_id` | BIGINT | FK→article, NOT NULL | 文章 ID |
| `tag_id` | BIGINT | FK→tag, NOT NULL | 标签 ID |

- **主键**: `PRIMARY KEY (article_id, tag_id)`

---

### 8. `blog_article_version` — 文章版本历史表

记录文章每次编辑的快照，支持版本回溯和对比。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `article_id` | BIGINT | FK→article, NOT NULL | 所属文章 |
| `version_number` | INTEGER | NOT NULL | 版本号（从 1 递增） |
| `title` | VARCHAR(200) | NOT NULL | 该版本的标题 |
| `content` | TEXT | NOT NULL | 该版本的 Markdown 正文 |
| `change_summary` | VARCHAR(500) | — | 变更说明（如"修复了第三段错别字"） |
| `word_count` | INTEGER | DEFAULT 0 | 该版本字数 |
| `editor_id` | BIGINT | FK→user, NOT NULL | 编辑者 ID |
| `created_at` | TIMESTAMP | NOT NULL | 版本创建时间 |

**索引**：
```sql
CREATE INDEX idx_version_article ON blog_article_version (article_id, version_number DESC);
```

- **联合唯一约束**: `UNIQUE (article_id, version_number)`

---

### 9. `blog_series` — 文章系列/专题表

将多篇文章组织为系列（如「Spring Boot 入门教程」第1-5篇），支持上下篇导航。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `title` | VARCHAR(200) | NOT NULL | 系列标题，如"Spring Boot 入门实战" |
| `slug` | VARCHAR(200) | UNIQUE, NOT NULL | URL 标识 |
| `description` | TEXT | — | 系列简介 |
| `cover_image_url` | VARCHAR(500) | — | 系列封面图 |
| `article_count` | INTEGER | DEFAULT 0 | 🔄 冗余：系列内已发布文章数 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | `DRAFT`（草稿）\| `PUBLISHED`（已发布） |
| `author_id` | BIGINT | FK→user, NOT NULL | 创建者 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

---

### 10. `blog_series_article` — 系列-文章关联表

定义文章在系列中的排序位置。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `series_id` | BIGINT | FK→series, NOT NULL | 系列 ID |
| `article_id` | BIGINT | FK→article, NOT NULL | 文章 ID |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | 在本系列中的序号（第 N 篇） |

- **主键**: `PRIMARY KEY (series_id, article_id)`
- **唯一约束**: `UNIQUE (series_id, sort_order)` — 同一系列内序号不重复

---

## 四、评论模块

### 11. `blog_comment` — 评论表

支持登录用户评论和访客评论，嵌套回复通过 `parent_id` 实现一级回复结构。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `article_id` | BIGINT | FK→article, NOT NULL | 评论所属文章 |
| `parent_id` | BIGINT | — | 父评论 ID（NULL = 顶级评论，非 NULL = 回复） |
| `user_id` | BIGINT | FK→user | 评论者 ID（登录用户评论时填写） |
| `visitor_name` | VARCHAR(50) | — | 访客昵称（未登录访客评论时填写） |
| `visitor_email` | VARCHAR(100) | — | 访客邮箱（用于回复通知） |
| `visitor_website` | VARCHAR(255) | — | 访客个人网站 URL |
| `content` | TEXT | NOT NULL | 评论正文内容 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | `APPROVED`（已通过）\| `PENDING`（待审核）\| `SPAM`（垃圾）\| `TRASH`（回收站） |
| `ip_address` | VARCHAR(45) | — | 评论者 IP（IPv4/IPv6） |
| `user_agent` | VARCHAR(500) | — | 浏览器 User-Agent |
| `like_count` | INTEGER | DEFAULT 0 | 被点赞数 |
| `is_author_replied` | BOOLEAN | DEFAULT false | 文章作者是否已回复此评论 |
| `created_at` | TIMESTAMP | NOT NULL | 评论时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 修改时间 |
| `deleted_at` | TIMESTAMP | — | 🗑 软删除标记 |

**索引**：
```sql
CREATE INDEX idx_comment_article ON blog_comment (article_id, created_at) WHERE deleted_at IS NULL AND status = 'APPROVED';
CREATE INDEX idx_comment_parent   ON blog_comment (parent_id);
CREATE INDEX idx_comment_status   ON blog_comment (status) WHERE deleted_at IS NULL;
```

---

## 五、媒体模块

### 12. `blog_media` — 媒体资源表

统一管理所有上传的静态资源（图片、视频、文件等），支持本地存储和云存储（OSS）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `file_name` | VARCHAR(255) | NOT NULL | 原始文件名（含扩展名） |
| `file_path` | VARCHAR(500) | NOT NULL | 存储相对路径（如 `/uploads/2026/06/abc.png`） |
| `file_url` | VARCHAR(500) | NOT NULL | 完整访问 URL |
| `file_type` | VARCHAR(50) | NOT NULL | 文件大类: `IMAGE` \| `VIDEO` \| `DOCUMENT` \| `OTHER` |
| `mime_type` | VARCHAR(100) | — | MIME 类型（如 `image/png`） |
| `file_size` | BIGINT | — | 文件大小（字节） |
| `width` | INTEGER | — | 图片/视频宽度（px） |
| `height` | INTEGER | — | 图片/视频高度（px） |
| `alt_text` | VARCHAR(255) | — | 图片替代文字（无障碍） |
| `bucket_name` | VARCHAR(50) | DEFAULT 'local' | 存储桶标识（`local` / `aliyun-oss` 等） |
| `uploader_id` | BIGINT | FK→user | 上传者 ID |
| `created_at` | TIMESTAMP | NOT NULL | 上传时间 |

---

## 六、独立页面模块

### 13. `blog_page` — 独立页面表

存储与文章列表无关的独立页面（如「关于我」「友链」「留言板」等）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `title` | VARCHAR(200) | NOT NULL | 页面标题，如"关于我" |
| `slug` | VARCHAR(200) | UNIQUE, NOT NULL | URL 标识，如 `about`、`links` |
| `content` | TEXT | NOT NULL | Markdown 源文本 |
| `content_html` | TEXT | — | 渲染后 HTML 缓存 |
| `summary` | VARCHAR(500) | — | 页面描述（SEO 用） |
| `is_show_in_nav` | BOOLEAN | DEFAULT false | 是否显示在站点导航栏 |
| `sort_order` | INTEGER | DEFAULT 0 | 导航栏排序权重 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | `DRAFT`（草稿）\| `PUBLISHED`（已发布） |
| `seo_title` | VARCHAR(200) | — | 自定义 SEO 标题 |
| `seo_description` | VARCHAR(500) | — | 自定义 SEO 描述 |
| `author_id` | BIGINT | FK→user | 编辑者 ID |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

**索引**：
```sql
CREATE UNIQUE INDEX idx_page_slug ON blog_page (slug);
CREATE INDEX idx_page_status ON blog_page (status);
```

---

---

## 七、导航菜单模块

### 14. `blog_navigation` — 导航菜单表

管理站点导航菜单，支持多级树形结构、自定义外链、分位置展示（顶部导航/底部导航/侧边栏）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `title` | VARCHAR(50) | NOT NULL | 菜单显示文字，如"文章"、"关于我" |
| `parent_id` | BIGINT | — | 父菜单 ID（NULL = 一级菜单，非 NULL = 子菜单） |
| `link_type` | VARCHAR(20) | NOT NULL, DEFAULT 'PAGE' | 链接类型: `PAGE`（独立页）\| `CATEGORY`（分类）\| `ARTICLE`（文章）\| `EXTERNAL`（外链）\| `NONE`（纯父级菜单） |
| `link_target_id` | BIGINT | — | 关联目标 ID（根据 link_type 指向 page/category/article 的 ID） |
| `link_url` | VARCHAR(500) | — | 自定义 URL（link_type=EXTERNAL 时填写） |
| `icon` | VARCHAR(100) | — | 菜单图标（emoji 或 class 名） |
| `position` | VARCHAR(20) | NOT NULL, DEFAULT 'HEADER' | 菜单位置: `HEADER`（顶部导航）\| `FOOTER`（底部导航）\| `SIDEBAR`（侧边栏） |
| `sort_order` | INTEGER | DEFAULT 0 | 同级排序权重 |
| `is_visible` | BOOLEAN | DEFAULT true | 是否显示 |
| `is_open_new_tab` | BOOLEAN | DEFAULT false | 是否新窗口打开 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

**索引**：
```sql
CREATE INDEX idx_nav_position_sort ON blog_navigation (position, parent_id, sort_order);
```

**菜单示例**：
```
🏠 首页      → link_type=NONE (纯展示, 前端硬编码跳转 /)
📝 文章      → link_type=NONE (纯父级, 展开子菜单)
  ├─ 前端开发 → link_type=CATEGORY, target_id=1
  └─ 后端开发 → link_type=CATEGORY, target_id=2
📄 关于我    → link_type=PAGE, target_id=1
🔗 GitHub   → link_type=EXTERNAL, link_url=https://github.com/xxx
```

---

## 八、系统配置模块

### 15. `blog_site_config` — 站点配置表

键值对方式存储站点级配置（站点名、SEO、开关等），支持多种数据类型。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `config_key` | VARCHAR(100) | UNIQUE, NOT NULL | 配置键（如 `site_name`、`enable_comment`） |
| `config_value` | TEXT | — | 配置值（字符串存储，按 type 解析） |
| `config_type` | VARCHAR(20) | DEFAULT 'string' | 值类型: `string` \| `number` \| `json` \| `boolean` |
| `description` | VARCHAR(255) | — | 配置项中文说明 |
| `created_at` | TIMESTAMP | NOT NULL | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | 更新时间 |

**预置配置项示例**：
| config_key | config_value | config_type | 说明 |
|------------|-------------|-------------|------|
| `site_name` | `可梵的博客` | string | 站点名称 |
| `site_subtitle` | `一间安静的线上书房` | string | 站点副标题/签名 |
| `site_description` | `...` | string | 站点 SEO 描述 |
| `enable_comment` | `true` | boolean | 全局评论开关 |
| `comment_approve_required` | `true` | boolean | 评论是否需要审核 |
| `page_size` | `10` | number | 文章列表每页条数 |

---

### 16. `blog_friend_link` — 友链表

管理友情链接列表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `site_name` | VARCHAR(100) | NOT NULL | 对方站点名称 |
| `site_url` | VARCHAR(500) | NOT NULL | 对方站点 URL |
| `site_logo` | VARCHAR(500) | — | 对方 Logo 图片 URL |
| `description` | VARCHAR(255) | — | 简短介绍语 |
| `sort_order` | INTEGER | DEFAULT 0 | 排序权重 |
| `is_visible` | BOOLEAN | DEFAULT true | 是否在前台显示 |
| `created_at` | TIMESTAMP | NOT NULL | 添加时间 |

---

## 九、邮件订阅模块

### 17. `blog_subscriber` — 邮件订阅表

存储订阅博客更新通知的访客邮箱。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | 订阅邮箱 |
| `nickname` | VARCHAR(50) | — | 订阅者昵称（选填） |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | `ACTIVE`（活跃）\| `UNSUBSCRIBED`（已退订） |
| `verify_token` | VARCHAR(64) | — | 邮箱验证令牌（UUID） |
| `is_verified` | BOOLEAN | DEFAULT false | 邮箱是否已验证 |
| `subscribed_at` | TIMESTAMP | NOT NULL | 订阅时间 |
| `unsubscribed_at` | TIMESTAMP | — | 退订时间 |
| `created_at` | TIMESTAMP | NOT NULL | 记录创建时间 |

**索引**：
```sql
CREATE UNIQUE INDEX idx_subscriber_email ON blog_subscriber (email);
CREATE INDEX idx_subscriber_status ON blog_subscriber (status);
```

---

## 十、日志模块

### 18. `blog_operation_log` — 操作日志表

记录管理后台的关键操作，用于审计和安全追溯。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `user_id` | BIGINT | — | 操作人 ID |
| `action` | VARCHAR(50) | NOT NULL | 操作类型: `CREATE` \| `UPDATE` \| `DELETE` \| `LOGIN` \| `LOGOUT` |
| `target_type` | VARCHAR(50) | — | 操作对象: `ARTICLE` \| `SCENE` \| `HOTSPOT` \| `USER` \| `COMMENT` \| `PAGE` |
| `target_id` | BIGINT | — | 操作对象 ID |
| `detail` | JSONB | — | 变更详情（如 `{"before": {...}, "after": {...}}`） |
| `ip_address` | VARCHAR(45) | — | 操作时 IP |
| `created_at` | TIMESTAMP | NOT NULL | 操作时间 |

**索引**：
```sql
CREATE INDEX idx_op_log_user   ON blog_operation_log (user_id, created_at DESC);
CREATE INDEX idx_op_log_target ON blog_operation_log (target_type, target_id);
```

---

### 19. `blog_visit_log` — 访问日志表

记录文章级别的访问量（用于统计分析，非实时计数）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | BIGSERIAL | PK | 主键 |
| `article_id` | BIGINT | — | 被访问文章 ID |
| `ip_address` | VARCHAR(45) | — | 访客 IP |
| `user_agent` | VARCHAR(500) | — | 浏览器 UA |
| `referer` | VARCHAR(500) | — | HTTP Referer（来源页面） |
| `created_at` | TIMESTAMP | NOT NULL | 访问时间 |

**索引**：
```sql
CREATE INDEX idx_visit_article ON blog_visit_log (article_id, created_at);
CREATE INDEX idx_visit_time    ON blog_visit_log (created_at);
```

---

## 模块总览

| 序号 | 模块 | 表数 | 表名列表 |
|------|------|------|----------|
| 1 | 场景 | 2 | `blog_homepage_scene`, `blog_homepage_hotspot` |
| 2 | 用户 | 1 | `blog_user` |
| 3 | 文章 | 7 | `blog_category`, `blog_tag`, `blog_article`, `blog_article_tag`, `blog_article_version`, `blog_series`, `blog_series_article` |
| 4 | 评论 | 1 | `blog_comment` |
| 5 | 媒体 | 1 | `blog_media` |
| 6 | 独立页 | 1 | `blog_page` |
| 7 | 导航 | 1 | `blog_navigation` |
| 8 | 系统 | 2 | `blog_site_config`, `blog_friend_link` |
| 9 | 订阅 | 1 | `blog_subscriber` |
| 10 | 日志 | 2 | `blog_operation_log`, `blog_visit_log` |
| **合计** | **10 模块** | **19 张表** | |

---

## 实体关系图（ER）

```
                         ┌──────────────────────┐
                         │    blog_user          │
                         │  (用户)               │
                         └──┬──────┬──────┬──────┘
                            │1     │1     │1
                            │      │      │
                ┌───────────┘      │      ├──────────────┐
                │N                 │N     │N              │N
         ┌──────▼──────┐   ┌──────▼──────┐┌─────────────▼──────┐
         │ blog_article │   │ blog_media  ││blog_operation_log  │
         │  (文章)      │   │  (媒体)     ││  (操作日志)        │
         └──┬──┬──┬──┬──┘   └─────────────┘└────────────────────┘
            │N │N │1 │1
            │  │  │  │
            │  │  │  ├──────────────┐
            │  │  │  │              │
            │  │  │  │       ┌──────▼──────┐
            │  │  │  │       │blog_category│
            │  │  │  │       │  (分类)     │
            │  │  │  │       └─────────────┘
            │  │  │  │
            │  │  │  └──────────────┐
            │  │  │                 │
            │  │  │          ┌──────▼──────────┐
            │  │  │          │ blog_article     │
            │  │  │          │    _version      │
            │  │  │          │  (文章版本历史)  │
            │  │  │          └──────────────────┘
            │  │  │
            │  │  └───────┐
            │  │          │
            │  │  ┌───────▼──────┐    ┌─────────────┐
            │  │  │blog_article  │    │  blog_tag   │
            │  │  │    _tag      │◄───│  (标签)     │
            │  │  │  (关联表)    │    └─────────────┘
            │  │  └──────────────┘
            │  │
            │  ├──────────┐
            │N │          │
        ┌───▼────┐ ┌─────▼───────┐    ┌──────────────┐
        │blog    │ │blog_visit   │    │blog_series   │
        │_comment│ │    _log     │    │  (系列/专题) │
        │ (评论) │ │ (访问日志)  │    └──┬───────────┘
        └────────┘ └─────────────┘       │1
                                         │
                                  ┌──────▼──────────┐
                                  │ blog_series      │
                                  │    _article      │
                                  │  (系列文章关联)   │
                                  └──────────────────┘

   ┌──────────────┐        ┌──────────────────┐
   │blog_homepage │        │blog_homepage     │
   │   _scene     │1─────N│   _hotspot       │
   │  (场景)      │        │  (热区/物品)     │
   └──────────────┘        └──────────────────┘

   ┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
   │  blog_page   │        │ blog_navigation  │        │blog_friend_link  │
   │  (独立页)    │        │  (导航菜单)      │        │  (友链)          │
   └──────────────┘        └──────────────────┘        └──────────────────┘

   ┌──────────────────┐        ┌──────────────────┐
   │ blog_site_config │        │ blog_subscriber  │
   │  (站点配置)       │        │  (邮件订阅)      │
   └──────────────────┘        └──────────────────┘
```

---

---

## 索引设计汇总

除各表下方已标注的索引外，全局关键索引：

| 表 | 索引名 | 字段 | 类型 |
|----|--------|------|------|
| `blog_homepage_scene` | `uk_scene_active` | `(is_active) WHERE is_active = true` | 部分唯一索引 |
| `blog_homepage_hotspot` | `idx_hotspot_scene_sort` | `(scene_id, sort_order)` | 普通索引 |
| `blog_article` | `idx_article_status_pub` | `(status, published_at DESC) WHERE deleted_at IS NULL` | 部分索引 |
| `blog_article` | `idx_article_category` | `(category_id, status) WHERE deleted_at IS NULL` | 部分索引 |
| `blog_article` | `idx_article_slug` | `(slug) WHERE deleted_at IS NULL` | 部分唯一索引 |
| `blog_article` | `idx_article_author` | `(author_id, created_at DESC)` | 普通索引 |
| `blog_article` | `idx_article_content_type` | `(content_type, status) WHERE deleted_at IS NULL` | 🆕 部分索引 |
| `blog_article_version` | `idx_version_article` | `(article_id, version_number DESC)` | 🆕 普通索引 |
| `blog_series` | `idx_series_slug` | `(slug)` | 🆕 唯一索引 |
| `blog_series_article` | `idx_series_article_order` | `(series_id, sort_order)` | 🆕 唯一索引 |
| `blog_comment` | `idx_comment_article` | `(article_id, created_at) WHERE status = 'APPROVED'` | 部分索引 |
| `blog_comment` | `idx_comment_parent` | `(parent_id)` | 普通索引 |
| `blog_page` | `idx_page_slug` | `(slug)` | 唯一索引 |
| `blog_navigation` | `idx_nav_position_sort` | `(position, parent_id, sort_order)` | 🆕 普通索引 |
| `blog_subscriber` | `idx_subscriber_email` | `(email)` | 🆕 唯一索引 |
| `blog_visit_log` | `idx_visit_article` | `(article_id, created_at)` | 普通索引 |
| `blog_operation_log` | `idx_op_log_target` | `(target_type, target_id)` | 普通索引 |

---

## 后续实施步骤

1. **schema.sql** — 将 19 张表的 DDL 写入 `backend/schema.sql`
2. **Java Entity** — 在 `blog-pojo` 模块创建对应的 JPA 实体类
3. **Repository** — 在 `blog-service` 模块创建对应 JPA Repository 接口
4. **VO/DTO** — 按需创建视图对象和数据传输对象
5. **数据初始化** — 在 `schema.sql` 中添加演示数据 INSERT 语句

---

*最后更新：2026-06-14*
