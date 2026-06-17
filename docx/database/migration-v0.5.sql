-- ============================================================================
-- Butvan Blog 2.0 — 数据库结构变更 (migration-v0.5.sql)
-- 包含文章、分类、标签及其多对多关联表的定义与测试数据初始化
-- ============================================================================

-- 1. 创建分类表
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
COMMENT ON COLUMN blog_category.article_count IS '该分类下已发布文章数';
COMMENT ON COLUMN blog_category.is_visible   IS '是否在前台导航显示';
COMMENT ON COLUMN blog_category.created_at   IS '创建时间';
COMMENT ON COLUMN blog_category.updated_at   IS '更新时间';

CREATE UNIQUE INDEX IF NOT EXISTS uk_category_slug ON blog_category (slug);

-- 2. 创建标签表
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
COMMENT ON COLUMN blog_tag.article_count IS '关联的已发布文章数';
COMMENT ON COLUMN blog_tag.created_at   IS '创建时间';

CREATE UNIQUE INDEX IF NOT EXISTS uk_tag_slug ON blog_tag (slug);

-- 3. 创建文章核心表
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
COMMENT ON COLUMN blog_article.password         IS '访问密码';
COMMENT ON COLUMN blog_article.is_pinned        IS '是否置顶';
COMMENT ON COLUMN blog_article.is_featured      IS '是否精选推荐';
COMMENT ON COLUMN blog_article.is_allow_comment IS '是否开放评论';
COMMENT ON COLUMN blog_article.view_count       IS '累计阅读量';
COMMENT ON COLUMN blog_article.like_count       IS '累计点赞数';
COMMENT ON COLUMN blog_article.comment_count    IS '已通过评论数';
COMMENT ON COLUMN blog_article.word_count       IS '正文字数';
COMMENT ON COLUMN blog_article.reading_time     IS '预估阅读时间';
COMMENT ON COLUMN blog_article.seo_title        IS 'SEO标题';
COMMENT ON COLUMN blog_article.seo_description  IS 'SEO描述';
COMMENT ON COLUMN blog_article.seo_keywords     IS 'SEO关键词';
COMMENT ON COLUMN blog_article.template         IS '自定义渲染模板名';
COMMENT ON COLUMN blog_article.content_type     IS '内容类型: ARTICLE|NOTE|GALLERY|PROJECT';
COMMENT ON COLUMN blog_article.extra            IS '类型专属字段JSON';
COMMENT ON COLUMN blog_article.published_at     IS '正式发布时间';
COMMENT ON COLUMN blog_article.created_at       IS '创建时间';
COMMENT ON COLUMN blog_article.updated_at       IS '最后修改时间';
COMMENT ON COLUMN blog_article.deleted_at       IS '软删除标记（非NULL=已删除）';

CREATE INDEX IF NOT EXISTS idx_article_status_pub     ON blog_article (status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_article_category       ON blog_article (category_id, status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_article_slug    ON blog_article (slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_article_author         ON blog_article (author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_content_type   ON blog_article (content_type, status) WHERE deleted_at IS NULL;

-- 4. 创建文章-标签关联中间表
CREATE TABLE IF NOT EXISTS blog_article_tag (
    article_id  BIGINT  NOT NULL REFERENCES blog_article(id) ON DELETE CASCADE,
    tag_id      BIGINT  NOT NULL REFERENCES blog_tag(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE  blog_article_tag             IS '文章-标签关联表 — 多对多中间表';
COMMENT ON COLUMN blog_article_tag.article_id  IS '文章ID';
COMMENT ON COLUMN blog_article_tag.tag_id      IS '标签ID';

-- ============================================================================
-- 5. 初始化基础测试数据 (使用 ON CONFLICT 避免重复插入)
-- ============================================================================

-- 初始化分类
INSERT INTO blog_category (name, slug, description, sort_order, is_visible)
VALUES 
('前端开发', 'frontend', 'React, Next.js, Tailwind CSS 等前端前沿技术', 1, TRUE),
('后端开发', 'backend', 'Java, Spring Boot, Spring Cloud, PostgreSQL 等后端技术', 2, TRUE),
('随笔感悟', 'life', '生活记录、读书心得与个人感悟', 3, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 初始化标签
INSERT INTO blog_tag (name, slug)
VALUES 
('React', 'react'),
('TypeScript', 'typescript'),
('Next.js', 'nextjs'),
('Spring Boot', 'spring-boot'),
('PostgreSQL', 'postgresql'),
('Docker', 'docker')
ON CONFLICT (slug) DO NOTHING;
