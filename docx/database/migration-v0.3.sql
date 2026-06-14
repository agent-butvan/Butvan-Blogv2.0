-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.3
-- Please execute these commands in your PostgreSQL database
-- ----------------------------------------------------

-- 1. Add height_percent column to blog_homepage_hotspot table if it does not exist
ALTER TABLE blog_homepage_hotspot ADD COLUMN IF NOT EXISTS height_percent DECIMAL(5, 2) DEFAULT NULL;

COMMENT ON COLUMN blog_homepage_hotspot.height_percent IS 'v0.3: 物品高度百分比';
