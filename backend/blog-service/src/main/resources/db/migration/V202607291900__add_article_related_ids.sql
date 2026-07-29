-- 文章表添加关联推荐文章 ID 列表字段 (格式: "id1,id2")
ALTER TABLE blog_article ADD COLUMN IF NOT EXISTS related_article_ids VARCHAR(200);
