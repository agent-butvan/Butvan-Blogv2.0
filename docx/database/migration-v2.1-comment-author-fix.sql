-- ============================================================================
-- migration-v2.1-comment-author-fix.sql
-- 描述: 修复普通用户发表评论被错误标记为站长发表的问题，洗白历史评论数据
-- 创建时间: 2026-07-15
-- ============================================================================

-- 洗数操作：将已被错误标记为 is_author = true，但实际并非管理员（博主）的评论修正为 false
UPDATE blog_comment 
SET is_author = false 
WHERE is_author = true 
  AND user_id IS NOT NULL 
  AND user_id IN (
      SELECT id 
      FROM blog_user 
      WHERE role != 'ADMIN'
  );
