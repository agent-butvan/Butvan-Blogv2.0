-- ============================================================================
-- Butvan Blog 2.0 — 数据库结构定义 (DDL)
-- 数据库引擎: PostgreSQL 16+
-- 字符集: UTF-8
-- 创建日期: 2026-06-14
-- ============================================================================

-- 如有需要，先创建数据库（手动执行）：
-- CREATE DATABASE butvan_blog ENCODING 'UTF8';

-- ============================================================================
-- 一、场景模块
-- ============================================================================

-- 1. 首页场景表
CREATE TABLE IF NOT EXISTS blog_homepage_scene (
    id          BIGSERIAL       PRIMARY KEY,
    title       VARCHAR(100)    NOT NULL,
    image_url   VARCHAR(500)    NOT NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_homepage_scene                IS '首页场景表 — 存储房间场景数据';
COMMENT ON COLUMN blog_homepage_scene.title          IS '场景标题，如"我的书房"';
COMMENT ON COLUMN blog_homepage_scene.image_url      IS '房间背景图URL（高分辨率）';
COMMENT ON COLUMN blog_homepage_scene.is_active      IS '是否当前启用（全局唯一为true）';
COMMENT ON COLUMN blog_homepage_scene.created_at     IS '创建时间（自动填充）';
COMMENT ON COLUMN blog_homepage_scene.updated_at     IS '更新时间（自动更新）';

-- 确保全局只有一个激活场景
CREATE UNIQUE INDEX uk_scene_active ON blog_homepage_scene (is_active) WHERE is_active = TRUE;

-- ----------------------------------------------------------------------------

-- 2. 热区/物品表（v0.2 增强版）
CREATE TABLE IF NOT EXISTS blog_homepage_hotspot (
    id                  BIGSERIAL       PRIMARY KEY,
    scene_id            BIGINT          NOT NULL REFERENCES blog_homepage_scene(id) ON DELETE CASCADE,
    item_name           VARCHAR(100)    NOT NULL,
    item_image_url      VARCHAR(500),
    x_percent           DECIMAL(5,2)    NOT NULL,
    y_percent           DECIMAL(5,2)    NOT NULL,
    width_percent       DECIMAL(5,2)    NOT NULL,
    height_percent      DECIMAL(5,2),
    geometry_ext        JSONB,
    hover_tips          VARCHAR(255),
    redirect_type       VARCHAR(50)     NOT NULL,
    redirect_path       VARCHAR(500),
    redirect_target_id  BIGINT,
    zoom_scale          DECIMAL(3,2)    DEFAULT 3.0,
    sort_order          INTEGER         DEFAULT 0,
    is_visible          BOOLEAN         DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_homepage_hotspot                   IS '热区/物品表 — 场景中可交互的物品';
COMMENT ON COLUMN blog_homepage_hotspot.scene_id          IS '所属场景ID';
COMMENT ON COLUMN blog_homepage_hotspot.item_name         IS '物品名称，如"电脑"、"台灯"';
COMMENT ON COLUMN blog_homepage_hotspot.item_image_url    IS 'v0.2: 透明抠图PNG文件地址';
COMMENT ON COLUMN blog_homepage_hotspot.x_percent         IS 'v0.2: 左边界X坐标百分比(0.00~100.00)';
COMMENT ON COLUMN blog_homepage_hotspot.y_percent         IS 'v0.2: 上边界Y坐标百分比(0.00~100.00)';
COMMENT ON COLUMN blog_homepage_hotspot.width_percent     IS 'v0.2: 物品宽度百分比';
COMMENT ON COLUMN blog_homepage_hotspot.height_percent    IS 'v0.2: 物品高度百分比（等比例缩放可省略）';
COMMENT ON COLUMN blog_homepage_hotspot.geometry_ext      IS '扩展几何属性JSON: rotate, opacity, shape, animation';
COMMENT ON COLUMN blog_homepage_hotspot.hover_tips        IS '悬浮提示文案';
COMMENT ON COLUMN blog_homepage_hotspot.redirect_type     IS '跳转类型: INTERNAL|EXTERNAL|ARTICLE|CATEGORY';
COMMENT ON COLUMN blog_homepage_hotspot.redirect_path     IS '跳转URL（EXTERNAL或INTERNAL时用）';
COMMENT ON COLUMN blog_homepage_hotspot.redirect_target_id IS 'v0.2: 跳转目标ID（ARTICLE或CATEGORY时用）';
COMMENT ON COLUMN blog_homepage_hotspot.zoom_scale        IS '镜头缩放比例（1.0=不缩放）';
COMMENT ON COLUMN blog_homepage_hotspot.sort_order        IS '排序号（控制z-index渲染层级）';
COMMENT ON COLUMN blog_homepage_hotspot.is_visible        IS 'v0.2: 是否在前台显示';
COMMENT ON COLUMN blog_homepage_hotspot.created_at        IS '创建时间';

CREATE INDEX idx_hotspot_scene_sort ON blog_homepage_hotspot (scene_id, sort_order);


-- ============================================================================
-- 二、用户模块
-- ============================================================================

-- 3. 用户表
CREATE TABLE IF NOT EXISTS blog_user (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    nickname        VARCHAR(50)     NOT NULL,
    email           VARCHAR(100),
    avatar_url      VARCHAR(500),
    bio             TEXT,
    social_links    JSONB,
    role            VARCHAR(20)     NOT NULL DEFAULT 'AUTHOR',
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_user                IS '用户表 — 支持多作者账号管理';
COMMENT ON COLUMN blog_user.username       IS '登录用户名（字母数字下划线）';
COMMENT ON COLUMN blog_user.password_hash  IS 'BCrypt加密密码';
COMMENT ON COLUMN blog_user.nickname       IS '前端展示昵称（支持中文）';
COMMENT ON COLUMN blog_user.email          IS '邮箱地址';
COMMENT ON COLUMN blog_user.avatar_url     IS '头像图片URL';
COMMENT ON COLUMN blog_user.bio            IS '个人简介/签名';
COMMENT ON COLUMN blog_user.social_links   IS '社交链接JSON: {"github":"...", "twitter":"..."}';
COMMENT ON COLUMN blog_user.role           IS '角色: ADMIN|AUTHOR';
COMMENT ON COLUMN blog_user.status         IS '账号状态: ACTIVE|DISABLED';
COMMENT ON COLUMN blog_user.last_login_at  IS '最后登录时间';
COMMENT ON COLUMN blog_user.created_at     IS '注册时间';
COMMENT ON COLUMN blog_user.updated_at     IS '更新时间';

CREATE UNIQUE INDEX uk_user_username ON blog_user (username);
CREATE UNIQUE INDEX uk_user_email    ON blog_user (email) WHERE email IS NOT NULL;


-- ============================================================================
-- 三、文章模块
-- ============================================================================

-- 4. 分类表
CREATE TABLE IF NOT EXISTS blog_category (
    id            BIGSERIAL       PRIMARY KEY,
    name          VARCHAR(50)     NOT NULL,
    slug          VARCHAR(50)     NOT NULL,
    description   VARCHAR(255),
    parent_id     BIGINT          REFERENCES blog_category(id) ON DELETE SET NULL,
    icon          VARCHAR(100),
    sort_order    INTEGER         DEFAULT 0,
    article_count INTEGER         DEFAULT 0,
    is_visible    BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_category              IS '分类表 — 支持两级树状分类';
COMMENT ON COLUMN blog_category.name         IS '分类名称，如"前端开发"';
COMMENT ON COLUMN blog_category.slug         IS 'URL友好标识，如frontend';
COMMENT ON COLUMN blog_category.description  IS '分类简要描述';
COMMENT ON COLUMN blog_category.parent_id    IS '父分类ID（NULL=顶级分类）';
COMMENT ON COLUMN blog_category.icon         IS '图标（emoji或class名）';
COMMENT ON COLUMN blog_category.sort_order   IS '同级排序权重';
COMMENT ON COLUMN blog_category.article_count IS '冗余：该分类下已发布文章数';
COMMENT ON COLUMN blog_category.is_visible   IS '是否在前台导航显示';
COMMENT ON COLUMN blog_category.created_at   IS '创建时间';
COMMENT ON COLUMN blog_category.updated_at   IS '更新时间';

CREATE UNIQUE INDEX uk_category_slug ON blog_category (slug);

-- ----------------------------------------------------------------------------

-- 5. 标签表
CREATE TABLE IF NOT EXISTS blog_tag (
    id            BIGSERIAL       PRIMARY KEY,
    name          VARCHAR(50)     NOT NULL,
    slug          VARCHAR(50)     NOT NULL,
    article_count INTEGER         DEFAULT 0,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_tag              IS '标签表 — 扁平标签结构';
COMMENT ON COLUMN blog_tag.name         IS '标签名称，如"React"';
COMMENT ON COLUMN blog_tag.slug         IS 'URL标识，如react';
COMMENT ON COLUMN blog_tag.article_count IS '冗余：关联的已发布文章数';
COMMENT ON COLUMN blog_tag.created_at   IS '创建时间';

CREATE UNIQUE INDEX uk_tag_slug ON blog_tag (slug);

-- ----------------------------------------------------------------------------

-- 6. 文章表
CREATE TABLE IF NOT EXISTS blog_article (
    id                BIGSERIAL       PRIMARY KEY,
    title             VARCHAR(200)    NOT NULL,
    slug              VARCHAR(200)    NOT NULL,
    summary           VARCHAR(500),
    content           TEXT            NOT NULL,
    content_html      TEXT,
    cover_image_url   VARCHAR(500),
    category_id       BIGINT          REFERENCES blog_category(id) ON DELETE SET NULL,
    author_id         BIGINT          NOT NULL REFERENCES blog_user(id) ON DELETE CASCADE,
    status            VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    visibility        VARCHAR(20)     NOT NULL DEFAULT 'PUBLIC',
    password          VARCHAR(100),
    is_pinned         BOOLEAN         DEFAULT FALSE,
    is_featured       BOOLEAN         DEFAULT FALSE,
    is_allow_comment  BOOLEAN         DEFAULT TRUE,
    view_count        BIGINT          DEFAULT 0,
    like_count        BIGINT          DEFAULT 0,
    comment_count     BIGINT          DEFAULT 0,
    word_count        INTEGER         DEFAULT 0,
    reading_time      INTEGER         DEFAULT 0,
    seo_title         VARCHAR(200),
    seo_description   VARCHAR(500),
    seo_keywords      VARCHAR(300),
    template          VARCHAR(50),
    content_type      VARCHAR(20)     NOT NULL DEFAULT 'ARTICLE',
    extra             JSONB,
    published_at      TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP
);

COMMENT ON TABLE  blog_article                  IS '文章核心表 — 完整生命周期管理';
COMMENT ON COLUMN blog_article.title            IS '文章标题';
COMMENT ON COLUMN blog_article.slug             IS 'URL唯一标识（拼音/英文）';
COMMENT ON COLUMN blog_article.summary          IS '文章摘要（列表展示用）';
COMMENT ON COLUMN blog_article.content          IS 'Markdown源文本';
COMMENT ON COLUMN blog_article.content_html     IS '服务端渲染后的HTML缓存';
COMMENT ON COLUMN blog_article.cover_image_url  IS '封面/头图URL';
COMMENT ON COLUMN blog_article.category_id      IS '所属分类ID';
COMMENT ON COLUMN blog_article.author_id        IS '作者ID';
COMMENT ON COLUMN blog_article.status           IS '状态: DRAFT|PUBLISHED|PRIVATE|ARCHIVED';
COMMENT ON COLUMN blog_article.visibility       IS '可见性: PUBLIC|PRIVATE|PASSWORD_PROTECTED';
COMMENT ON COLUMN blog_article.password         IS '访问密码（visibility=PASSWORD_PROTECTED时使用）';
COMMENT ON COLUMN blog_article.is_pinned        IS '是否置顶';
COMMENT ON COLUMN blog_article.is_featured      IS '是否精选推荐';
COMMENT ON COLUMN blog_article.is_allow_comment IS '是否开放评论';
COMMENT ON COLUMN blog_article.view_count       IS '冗余：累计阅读量';
COMMENT ON COLUMN blog_article.like_count       IS '冗余：累计点赞数';
COMMENT ON COLUMN blog_article.comment_count    IS '冗余：已通过评论数';
COMMENT ON COLUMN blog_article.word_count       IS '正文字数（后端计算存储）';
COMMENT ON COLUMN blog_article.reading_time     IS '预估阅读时间（分钟，按300字/分钟估算）';
COMMENT ON COLUMN blog_article.seo_title        IS '自定义SEO标题（留空则用title）';
COMMENT ON COLUMN blog_article.seo_description  IS '自定义SEO描述（留空则用summary）';
COMMENT ON COLUMN blog_article.seo_keywords     IS '自定义SEO关键词（逗号分隔）';
COMMENT ON COLUMN blog_article.template         IS '自定义渲染模板名（留空则用默认）';
COMMENT ON COLUMN blog_article.content_type     IS '内容类型: ARTICLE|NOTE|GALLERY|PROJECT';
COMMENT ON COLUMN blog_article.extra            IS '类型专属字段JSON';
COMMENT ON COLUMN blog_article.published_at     IS '正式发布时间';
COMMENT ON COLUMN blog_article.created_at       IS '创建时间';
COMMENT ON COLUMN blog_article.updated_at       IS '最后修改时间';
COMMENT ON COLUMN blog_article.deleted_at       IS '软删除标记（非NULL=已删除）';

CREATE INDEX idx_article_status_pub     ON blog_article (status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_category       ON blog_article (category_id, status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_article_slug    ON blog_article (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_article_author         ON blog_article (author_id, created_at DESC);
CREATE INDEX idx_article_content_type   ON blog_article (content_type, status) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------

-- 7. 文章-标签关联表
CREATE TABLE IF NOT EXISTS blog_article_tag (
    article_id  BIGINT  NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    tag_id      BIGINT  NOT NULL REFERENCES blog_tag(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE  blog_article_tag             IS '文章-标签关联表 — 多对多中间表';
COMMENT ON COLUMN blog_article_tag.article_id  IS '文章ID';
COMMENT ON COLUMN blog_article_tag.tag_id      IS '标签ID';

-- ----------------------------------------------------------------------------

-- 8. 文章版本历史表
CREATE TABLE IF NOT EXISTS blog_article_version (
    id              BIGSERIAL       PRIMARY KEY,
    article_id      BIGINT          NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    version_number  INTEGER         NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    content         TEXT            NOT NULL,
    change_summary  VARCHAR(500),
    word_count      INTEGER         DEFAULT 0,
    editor_id       BIGINT          NOT NULL REFERENCES blog_user(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, version_number)
);

COMMENT ON TABLE  blog_article_version                 IS '文章版本历史表 — 记录每次编辑快照';
COMMENT ON COLUMN blog_article_version.article_id      IS '所属文章ID';
COMMENT ON COLUMN blog_article_version.version_number  IS '版本号（从1递增）';
COMMENT ON COLUMN blog_article_version.title           IS '该版本的标题';
COMMENT ON COLUMN blog_article_version.content         IS '该版本的Markdown正文';
COMMENT ON COLUMN blog_article_version.change_summary  IS '变更说明';
COMMENT ON COLUMN blog_article_version.word_count      IS '该版本字数';
COMMENT ON COLUMN blog_article_version.editor_id       IS '编辑者ID';
COMMENT ON COLUMN blog_article_version.created_at      IS '版本创建时间';

CREATE INDEX idx_version_article ON blog_article_version (article_id, version_number DESC);

-- ----------------------------------------------------------------------------

-- 9. 文章系列/专题表
CREATE TABLE IF NOT EXISTS blog_series (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    slug            VARCHAR(200)    NOT NULL,
    description     TEXT,
    cover_image_url VARCHAR(500),
    article_count   INTEGER         DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    author_id       BIGINT          NOT NULL REFERENCES blog_user(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_series                  IS '文章系列/专题表 — 将多篇文章组织为系列';
COMMENT ON COLUMN blog_series.title            IS '系列标题，如"Spring Boot入门实战"';
COMMENT ON COLUMN blog_series.slug             IS 'URL标识';
COMMENT ON COLUMN blog_series.description       IS '系列简介';
COMMENT ON COLUMN blog_series.cover_image_url  IS '系列封面图';
COMMENT ON COLUMN blog_series.article_count    IS '冗余：系列内已发布文章数';
COMMENT ON COLUMN blog_series.status           IS '状态: DRAFT|PUBLISHED';
COMMENT ON COLUMN blog_series.author_id        IS '创建者ID';
COMMENT ON COLUMN blog_series.created_at       IS '创建时间';
COMMENT ON COLUMN blog_series.updated_at       IS '更新时间';

CREATE UNIQUE INDEX idx_series_slug ON blog_series (slug);

-- ----------------------------------------------------------------------------

-- 10. 系列-文章关联表
CREATE TABLE IF NOT EXISTS blog_series_article (
    series_id   BIGINT  NOT NULL REFERENCES blog_series(id) ON DELETE CASCADE,
    article_id  BIGINT  NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (series_id, article_id),
    UNIQUE (series_id, sort_order)
);

COMMENT ON TABLE  blog_series_article             IS '系列-文章关联表 — 定义文章在系列中的排序';
COMMENT ON COLUMN blog_series_article.series_id   IS '系列ID';
COMMENT ON COLUMN blog_series_article.article_id  IS '文章ID';
COMMENT ON COLUMN blog_series_article.sort_order  IS '在本系列中的序号（第N篇）';


-- ============================================================================
-- 四、评论模块
-- ============================================================================

-- 11. 评论表
CREATE TABLE IF NOT EXISTS blog_comment (
    id                BIGSERIAL       PRIMARY KEY,
    article_id        BIGINT          NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    parent_id         BIGINT          REFERENCES blog_comment(id) ON DELETE CASCADE,
    user_id           BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    visitor_name      VARCHAR(50),
    visitor_email     VARCHAR(100),
    visitor_website   VARCHAR(255),
    content           TEXT            NOT NULL,
    status            VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    ip_address        VARCHAR(45),
    user_agent        VARCHAR(500),
    like_count        INTEGER         DEFAULT 0,
    is_author_replied BOOLEAN         DEFAULT FALSE,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP
);

COMMENT ON TABLE  blog_comment                   IS '评论表 — 支持登录/访客评论和嵌套回复';
COMMENT ON COLUMN blog_comment.article_id        IS '评论所属文章ID';
COMMENT ON COLUMN blog_comment.parent_id         IS '父评论ID（NULL=顶级评论）';
COMMENT ON COLUMN blog_comment.user_id           IS '评论者ID（登录用户时填写）';
COMMENT ON COLUMN blog_comment.visitor_name      IS '访客昵称（未登录时填写）';
COMMENT ON COLUMN blog_comment.visitor_email     IS '访客邮箱（用于回复通知）';
COMMENT ON COLUMN blog_comment.visitor_website   IS '访客个人网站URL';
COMMENT ON COLUMN blog_comment.content           IS '评论正文内容';
COMMENT ON COLUMN blog_comment.status            IS '状态: APPROVED|PENDING|SPAM|TRASH';
COMMENT ON COLUMN blog_comment.ip_address        IS '评论者IP（IPv4/IPv6）';
COMMENT ON COLUMN blog_comment.user_agent        IS '浏览器User-Agent';
COMMENT ON COLUMN blog_comment.like_count        IS '被点赞数';
COMMENT ON COLUMN blog_comment.is_author_replied IS '文章作者是否已回复此评论';
COMMENT ON COLUMN blog_comment.created_at        IS '评论时间';
COMMENT ON COLUMN blog_comment.updated_at        IS '修改时间';
COMMENT ON COLUMN blog_comment.deleted_at        IS '软删除标记';

CREATE INDEX idx_comment_article ON blog_comment (article_id, created_at) WHERE deleted_at IS NULL AND status = 'APPROVED';
CREATE INDEX idx_comment_parent   ON blog_comment (parent_id);
CREATE INDEX idx_comment_status   ON blog_comment (status) WHERE deleted_at IS NULL;


-- ============================================================================
-- 五、媒体模块
-- ============================================================================

-- 12. 媒体资源表
CREATE TABLE IF NOT EXISTS blog_media (
    id            BIGSERIAL       PRIMARY KEY,
    file_name     VARCHAR(255)    NOT NULL,
    file_path     VARCHAR(500)    NOT NULL,
    file_url      VARCHAR(500)    NOT NULL,
    file_type     VARCHAR(50)     NOT NULL,
    mime_type     VARCHAR(100),
    file_size     BIGINT,
    width         INTEGER,
    height        INTEGER,
    alt_text      VARCHAR(255),
    bucket_name   VARCHAR(50)     DEFAULT 'local',
    uploader_id   BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_media              IS '媒体资源表 — 统一管理上传的静态资源';
COMMENT ON COLUMN blog_media.file_name    IS '原始文件名（含扩展名）';
COMMENT ON COLUMN blog_media.file_path    IS '存储相对路径';
COMMENT ON COLUMN blog_media.file_url     IS '完整访问URL';
COMMENT ON COLUMN blog_media.file_type    IS '文件大类: IMAGE|VIDEO|DOCUMENT|OTHER';
COMMENT ON COLUMN blog_media.mime_type    IS 'MIME类型，如image/png';
COMMENT ON COLUMN blog_media.file_size    IS '文件大小（字节）';
COMMENT ON COLUMN blog_media.width        IS '图片/视频宽度（px）';
COMMENT ON COLUMN blog_media.height       IS '图片/视频高度（px）';
COMMENT ON COLUMN blog_media.alt_text     IS '图片替代文字（无障碍）';
COMMENT ON COLUMN blog_media.bucket_name  IS '存储桶标识: local|aliyun-oss等';
COMMENT ON COLUMN blog_media.uploader_id  IS '上传者ID';
COMMENT ON COLUMN blog_media.created_at   IS '上传时间';


-- ============================================================================
-- 六、独立页面模块
-- ============================================================================

-- 13. 独立页面表
CREATE TABLE IF NOT EXISTS blog_page (
    id                BIGSERIAL       PRIMARY KEY,
    title             VARCHAR(200)    NOT NULL,
    slug              VARCHAR(200)    NOT NULL,
    content           TEXT            NOT NULL,
    content_html      TEXT,
    summary           VARCHAR(500),
    is_show_in_nav    BOOLEAN         DEFAULT FALSE,
    sort_order        INTEGER         DEFAULT 0,
    status            VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    seo_title         VARCHAR(200),
    seo_description   VARCHAR(500),
    author_id         BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_page                  IS '独立页面表 — 如关于我、友链、留言板等';
COMMENT ON COLUMN blog_page.title            IS '页面标题，如"关于我"';
COMMENT ON COLUMN blog_page.slug             IS 'URL标识，如about、links';
COMMENT ON COLUMN blog_page.content          IS 'Markdown源文本';
COMMENT ON COLUMN blog_page.content_html     IS '渲染后HTML缓存';
COMMENT ON COLUMN blog_page.summary          IS '页面描述（SEO用）';
COMMENT ON COLUMN blog_page.is_show_in_nav   IS '是否显示在站点导航栏';
COMMENT ON COLUMN blog_page.sort_order       IS '导航栏排序权重';
COMMENT ON COLUMN blog_page.status           IS '状态: DRAFT|PUBLISHED';
COMMENT ON COLUMN blog_page.seo_title        IS '自定义SEO标题';
COMMENT ON COLUMN blog_page.seo_description  IS '自定义SEO描述';
COMMENT ON COLUMN blog_page.author_id        IS '编辑者ID';
COMMENT ON COLUMN blog_page.created_at       IS '创建时间';
COMMENT ON COLUMN blog_page.updated_at       IS '更新时间';

CREATE UNIQUE INDEX idx_page_slug ON blog_page (slug);
CREATE INDEX idx_page_status    ON blog_page (status);


-- ============================================================================
-- 七、导航菜单模块
-- ============================================================================

-- 14. 导航菜单表
CREATE TABLE IF NOT EXISTS blog_navigation (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(50)     NOT NULL,
    parent_id       BIGINT          REFERENCES blog_navigation(id) ON DELETE CASCADE,
    link_type       VARCHAR(20)     NOT NULL DEFAULT 'PAGE',
    link_target_id  BIGINT,
    link_url        VARCHAR(500),
    icon            VARCHAR(100),
    position        VARCHAR(20)     NOT NULL DEFAULT 'HEADER',
    sort_order      INTEGER         DEFAULT 0,
    is_visible      BOOLEAN         DEFAULT TRUE,
    is_open_new_tab BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_navigation                  IS '导航菜单表 — 多级树形菜单管理';
COMMENT ON COLUMN blog_navigation.title            IS '菜单显示文字';
COMMENT ON COLUMN blog_navigation.parent_id        IS '父菜单ID（NULL=一级菜单）';
COMMENT ON COLUMN blog_navigation.link_type        IS '链接类型: PAGE|CATEGORY|ARTICLE|EXTERNAL|NONE';
COMMENT ON COLUMN blog_navigation.link_target_id   IS '关联目标ID';
COMMENT ON COLUMN blog_navigation.link_url         IS '自定义URL（link_type=EXTERNAL时用）';
COMMENT ON COLUMN blog_navigation.icon             IS '菜单图标（emoji或class名）';
COMMENT ON COLUMN blog_navigation.position         IS '菜单位置: HEADER|FOOTER|SIDEBAR';
COMMENT ON COLUMN blog_navigation.sort_order       IS '同级排序权重';
COMMENT ON COLUMN blog_navigation.is_visible       IS '是否显示';
COMMENT ON COLUMN blog_navigation.is_open_new_tab  IS '是否新窗口打开';
COMMENT ON COLUMN blog_navigation.created_at       IS '创建时间';
COMMENT ON COLUMN blog_navigation.updated_at       IS '更新时间';

CREATE INDEX idx_nav_position_sort ON blog_navigation (position, parent_id, sort_order);


-- ============================================================================
-- 八、系统配置模块
-- ============================================================================

-- 15. 站点配置表
CREATE TABLE IF NOT EXISTS blog_site_config (
    id            BIGSERIAL       PRIMARY KEY,
    config_key    VARCHAR(100)    NOT NULL,
    config_value  TEXT,
    config_type   VARCHAR(20)     DEFAULT 'string',
    description   VARCHAR(255),
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_site_config               IS '站点配置表 — 键值对存储站点级配置';
COMMENT ON COLUMN blog_site_config.config_key    IS '配置键，如site_name、enable_comment';
COMMENT ON COLUMN blog_site_config.config_value  IS '配置值（字符串存储，按type解析）';
COMMENT ON COLUMN blog_site_config.config_type   IS '值类型: string|number|json|boolean';
COMMENT ON COLUMN blog_site_config.description   IS '配置项中文说明';
COMMENT ON COLUMN blog_site_config.created_at    IS '创建时间';
COMMENT ON COLUMN blog_site_config.updated_at    IS '更新时间';

CREATE UNIQUE INDEX uk_config_key ON blog_site_config (config_key);

-- ----------------------------------------------------------------------------

-- 16. 友链表
CREATE TABLE IF NOT EXISTS blog_friend_link (
    id            BIGSERIAL       PRIMARY KEY,
    site_name     VARCHAR(100)    NOT NULL,
    site_url      VARCHAR(500)    NOT NULL,
    site_logo     VARCHAR(500),
    description   VARCHAR(255),
    sort_order    INTEGER         DEFAULT 0,
    is_visible    BOOLEAN         DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_friend_link              IS '友链表 — 管理友情链接列表';
COMMENT ON COLUMN blog_friend_link.site_name    IS '对方站点名称';
COMMENT ON COLUMN blog_friend_link.site_url     IS '对方站点URL';
COMMENT ON COLUMN blog_friend_link.site_logo    IS '对方Logo图片URL';
COMMENT ON COLUMN blog_friend_link.description  IS '简短介绍语';
COMMENT ON COLUMN blog_friend_link.sort_order   IS '排序权重';
COMMENT ON COLUMN blog_friend_link.is_visible   IS '是否在前台显示';
COMMENT ON COLUMN blog_friend_link.created_at   IS '添加时间';


-- ============================================================================
-- 九、邮件订阅模块
-- ============================================================================

-- 17. 邮件订阅表
CREATE TABLE IF NOT EXISTS blog_subscriber (
    id                BIGSERIAL       PRIMARY KEY,
    email             VARCHAR(100)    NOT NULL,
    nickname          VARCHAR(50),
    status            VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    verify_token      VARCHAR(64),
    is_verified       BOOLEAN         DEFAULT FALSE,
    subscribed_at     TIMESTAMP       NOT NULL DEFAULT NOW(),
    unsubscribed_at   TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_subscriber                 IS '邮件订阅表 — 存储订阅博客更新的访客邮箱';
COMMENT ON COLUMN blog_subscriber.email           IS '订阅邮箱';
COMMENT ON COLUMN blog_subscriber.nickname        IS '订阅者昵称（选填）';
COMMENT ON COLUMN blog_subscriber.status          IS '状态: ACTIVE|UNSUBSCRIBED';
COMMENT ON COLUMN blog_subscriber.verify_token    IS '邮箱验证令牌（UUID）';
COMMENT ON COLUMN blog_subscriber.is_verified     IS '邮箱是否已验证';
COMMENT ON COLUMN blog_subscriber.subscribed_at   IS '订阅时间';
COMMENT ON COLUMN blog_subscriber.unsubscribed_at IS '退订时间';
COMMENT ON COLUMN blog_subscriber.created_at      IS '记录创建时间';

CREATE UNIQUE INDEX idx_subscriber_email  ON blog_subscriber (email);
CREATE INDEX idx_subscriber_status       ON blog_subscriber (status);


-- ============================================================================
-- 十、日志模块
-- ============================================================================

-- 18. 操作日志表
CREATE TABLE IF NOT EXISTS blog_operation_log (
    id            BIGSERIAL       PRIMARY KEY,
    user_id       BIGINT          REFERENCES blog_user(id) ON DELETE SET NULL,
    action        VARCHAR(50)     NOT NULL,
    target_type   VARCHAR(50),
    target_id     BIGINT,
    detail        JSONB,
    ip_address    VARCHAR(45),
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_operation_log              IS '操作日志表 — 关键操作审计追溯';
COMMENT ON COLUMN blog_operation_log.user_id      IS '操作人ID';
COMMENT ON COLUMN blog_operation_log.action       IS '操作类型: CREATE|UPDATE|DELETE|LOGIN|LOGOUT';
COMMENT ON COLUMN blog_operation_log.target_type  IS '操作对象: ARTICLE|SCENE|HOTSPOT|USER|COMMENT|PAGE';
COMMENT ON COLUMN blog_operation_log.target_id    IS '操作对象ID';
COMMENT ON COLUMN blog_operation_log.detail       IS '变更详情JSON';
COMMENT ON COLUMN blog_operation_log.ip_address   IS '操作时IP';
COMMENT ON COLUMN blog_operation_log.created_at   IS '操作时间';

CREATE INDEX idx_op_log_user   ON blog_operation_log (user_id, created_at DESC);
CREATE INDEX idx_op_log_target ON blog_operation_log (target_type, target_id);

-- ----------------------------------------------------------------------------

-- 19. 访问日志表
CREATE TABLE IF NOT EXISTS blog_visit_log (
    id            BIGSERIAL       PRIMARY KEY,
    article_id    BIGINT,
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    referer       VARCHAR(500),
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  blog_visit_log              IS '访问日志表 — 文章级访问量统计分析';
COMMENT ON COLUMN blog_visit_log.article_id   IS '被访问文章ID';
COMMENT ON COLUMN blog_visit_log.ip_address   IS '访客IP';
COMMENT ON COLUMN blog_visit_log.user_agent   IS '浏览器UA';
COMMENT ON COLUMN blog_visit_log.referer      IS 'HTTP Referer（来源页面）';
COMMENT ON COLUMN blog_visit_log.created_at   IS '访问时间';

CREATE INDEX idx_visit_article ON blog_visit_log (article_id, created_at);
CREATE INDEX idx_visit_time    ON blog_visit_log (created_at);


-- ============================================================================
-- DDL 创建完毕
-- 共计: 10 个模块 / 19 张表
-- ============================================================================
