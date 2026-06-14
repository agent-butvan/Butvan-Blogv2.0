-- ----------------------------------------------------
-- Schema Creation for Butvan Blog 2.0
-- Please execute these commands in your PostgreSQL database
-- ----------------------------------------------------

-- Drop tables if they exist
DROP TABLE IF EXISTS blog_homepage_hotspot;
DROP TABLE IF EXISTS blog_homepage_scene;

-- Create Scene Table
CREATE TABLE blog_homepage_scene (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Hotspot Table
CREATE TABLE blog_homepage_hotspot (
    id BIGSERIAL PRIMARY KEY,
    scene_id BIGINT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    geometry JSONB NOT NULL,
    hover_tips VARCHAR(255) DEFAULT '',
    redirect_type VARCHAR(50) NOT NULL,
    redirect_path VARCHAR(255) NOT NULL,
    zoom_scale DECIMAL(3, 2) DEFAULT 3.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotspot_scene FOREIGN KEY (scene_id) REFERENCES blog_homepage_scene(id) ON DELETE CASCADE
);

-- Insert dummy data for v0.1 testing
INSERT INTO blog_homepage_scene (title, image_url, is_active)
VALUES ('Default Cozy Room', '/fWdgJuAOF.jpeg', TRUE);

-- Insert hotspots corresponding to Default Cozy Room (percentages based on standard layout coordinates)
INSERT INTO blog_homepage_hotspot (scene_id, item_name, geometry, hover_tips, redirect_type, redirect_path, zoom_scale, sort_order)
VALUES 
((SELECT id FROM blog_homepage_scene LIMIT 1), 'Computer Screen', '{"type": "rect", "x": 42.5, "y": 35.8, "width": 15.0, "height": 13.5}', '要来看看我写代码吗？', 'internal', '/projects', 3.50, 1),
((SELECT id FROM blog_homepage_scene LIMIT 1), 'Bookshelf', '{"type": "rect", "x": 22.0, "y": 12.0, "width": 12.0, "height": 38.0}', '翻翻我的读书笔记？', 'internal', '/blog', 3.20, 2),
((SELECT id FROM blog_homepage_scene LIMIT 1), 'Coffee Cup', '{"type": "rect", "x": 58.0, "y": 55.0, "width": 4.5, "height": 6.5}', '关于我与这杯咖啡的味道', 'internal', '/about', 4.00, 3);
