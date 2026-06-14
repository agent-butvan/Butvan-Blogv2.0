-- ----------------------------------------------------
-- Database Migration Script for Butvan Blog 2.0 v0.2
-- Please execute these commands in your PostgreSQL database
-- ----------------------------------------------------

-- 1. Extend blog_homepage_hotspot table with PNG overlay and position percentage fields (Idempotent)
ALTER TABLE blog_homepage_hotspot ADD COLUMN IF NOT EXISTS item_image_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE blog_homepage_hotspot ADD COLUMN IF NOT EXISTS width_percent DECIMAL(5, 2) DEFAULT NULL;
ALTER TABLE blog_homepage_hotspot ADD COLUMN IF NOT EXISTS x_percent DECIMAL(5, 2) DEFAULT NULL;
ALTER TABLE blog_homepage_hotspot ADD COLUMN IF NOT EXISTS y_percent DECIMAL(5, 2) DEFAULT NULL;

-- 2. Make geometry field nullable since sprite layout handles positioning (Safe PL/pgSQL block)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='blog_homepage_hotspot' AND column_name='geometry'
    ) THEN
        ALTER TABLE blog_homepage_hotspot ALTER COLUMN geometry DROP NOT NULL;
    END IF;
END $$;

-- 3. Clean up existing test records to prevent duplicate scene insertion crashes
DELETE FROM blog_homepage_scene WHERE title = 'Cozy Room v0.2';

-- 4. Insert new room scene for testing v0.2 PNG Sprite Overlay
INSERT INTO blog_homepage_scene (title, image_url, is_active)
VALUES ('Cozy Room v0.2', '/uploads/fWdgJuAOF.jpeg', TRUE);

-- 5. Deactivate other scenes to ensure Cozy Room v0.2 is the single active scene
UPDATE blog_homepage_scene SET is_active = FALSE WHERE title != 'Cozy Room v0.2';

-- 6. Insert v0.2 test hotspots with mock transparency images
INSERT INTO blog_homepage_hotspot (scene_id, item_name, item_image_url, x_percent, y_percent, width_percent, hover_tips, redirect_type, redirect_path, zoom_scale, sort_order)
VALUES 
((SELECT id FROM blog_homepage_scene WHERE title = 'Cozy Room v0.2' LIMIT 1), 'iMac 工作台', '/uploads/sprites/imac-sprite.png', 21.30, 57.50, 9.40, '要来看看我写的开源项目和代码吗？', 'INTERNAL', '/projects', 3.80, 1),
((SELECT id FROM blog_homepage_scene WHERE title = 'Cozy Room v0.2' LIMIT 1), '墙壁相框', '/uploads/sprites/frame-sprite.png', 93.80, 40.50, 4.40, '了解关于我的故事、技术栈和联系方式', 'INTERNAL', '/about', 3.50, 2);
