-- ============================================================================
-- 开发环境测试种子数据 (dev-seeds.sql)
--
-- 仅在本地开发/测试环境下自动载入，提供初始演示文章、分类、标签、评论与配置。
-- 运行此脚本将清空除用户表之外的业务表并重新初始化。
-- ============================================================================

-- 1. 清空除用户表之外的业务数据（级联清空）
TRUNCATE TABLE "public"."blog_comment" CASCADE;
TRUNCATE TABLE "public"."blog_article_tag" CASCADE;
TRUNCATE TABLE "public"."blog_article" CASCADE;
TRUNCATE TABLE "public"."blog_category" CASCADE;
TRUNCATE TABLE "public"."blog_tag" CASCADE;
TRUNCATE TABLE "public"."blog_homepage_hotspot" CASCADE;
TRUNCATE TABLE "public"."blog_homepage_scene" CASCADE;
TRUNCATE TABLE "public"."blog_friend_link" CASCADE;
TRUNCATE TABLE "public"."blog_series_article" CASCADE;
TRUNCATE TABLE "public"."blog_series" CASCADE;

-- 2. 插入博客分类数据 (blog_category)
INSERT INTO "public"."blog_category" ("id", "name", "slug", "description", "parent_id", "icon", "sort_order", "article_count", "is_visible", "created_at", "updated_at") VALUES
(1, '技术分享', 'tech', '探讨后端开发、微服务、AI智能体及前端现代框架等技术沉淀', NULL, '💻', 1, 3, 't', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '生活随笔', 'life', '代码之外的烟火气，记录骑行、美食、旅行以及感悟', NULL, '🏕️', 2, 1, 't', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '读书笔记', 'reading', '重温经典之作，提炼核心思想，沉淀自我心智模型', NULL, '📚', 3, 1, 't', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 插入标签数据 (blog_tag)
INSERT INTO "public"."blog_tag" ("id", "name", "slug", "article_count", "created_at") VALUES
(1, 'Java', 'java', 2, CURRENT_TIMESTAMP),
(2, 'Spring Boot', 'springboot', 1, CURRENT_TIMESTAMP),
(3, 'Next.js', 'nextjs', 1, CURRENT_TIMESTAMP),
(4, 'AI Agent', 'ai-agent', 1, CURRENT_TIMESTAMP),
(5, '读书感悟', 'books', 1, CURRENT_TIMESTAMP);

-- 4. 插入文章数据 (blog_article)
-- 说明: 默认使用 schema.sql 中预置的 admin 用户 (id = 1) 作为作者
INSERT INTO "public"."blog_article" ("id", "title", "slug", "summary", "content", "content_html", "cover_image_url", "category_id", "author_id", "status", "visibility", "password", "is_pinned", "is_featured", "is_allow_comment", "view_count", "like_count", "comment_count", "word_count", "reading_time", "created_at", "updated_at", "published_at") VALUES
(1, '基于 Spring Boot 3 与 React/Next.js 的现代博客系统设计', 'springboot3-nextjs-blog-design', '本文介绍了可梵个人博客系统 2.0 的整体技术架构与核心功能模块设计方案，重点阐述了前后台分离、容器化部署及优雅的数据库演进思路。', '# 基于 Spring Boot 3 与 React/Next.js 的现代博客系统设计

在今天，个人博客早已不仅仅是记录文字的工具，更是一个展现开发者技术审美、全栈架构能力和工程素养的微型实践场。本文将深入剖析 **Butvan Blog 2.0（可梵博客）** 的技术演进、系统架构与大厂级开发规范规范落地。

## 一、技术选型：全栈架构的优雅结合

在 Butvan Blog 2.0 的技术选型上，我们追求既有后端高并发、高可用防线的坚守，又有前端高用户体验、极致渲染速度的追求。

1. **后端核心**：**Spring Boot 3.x + JDK 17**。JDK 17 的全新特性（如 Record 类、instanceof 模式匹配）极大地精简了实体和DTO代码。
2. **持久层**：**Spring Data JPA + PostgreSQL 16**。支持天然的 JSONB 动态扩展和高性能的地理空间、全文检索支持。
3. **数据库版本管理**：**Flyway**。严格遵守数据库迁移管理，所有 SQL 的变更均可以通过代码审计进行版本追溯。
4. **前端展现**：**React 18 + Next.js 14 + HeroUI**。利用 Next.js 的 SSR/ISR 机制，实现博客极速秒开与完美的 SEO 体验。
5. **基础设施**：**Docker + Docker Compose** 一键本地集成与联调，实现容器化交付。

## 二、大厂级数据库演进规范（Flyway）

在许多初创项目或个人项目中，开发者经常通过手动修改数据库表、运行 `ddl-auto: update` 的方式更新结构。然而在大厂的正规军作战中，这种野蛮生长极易导致多开发环境冲突、生产环境数据受损。

在本项目中，我们推行以下 Flyway 规范：
- 表结构变更的唯一源是 `src/main/resources/db/migration` 下的文件。
- 脚本文件强制采用 `VYYYYMMDDHHMM__描述.sql` 格式命名，彻底防止版本冲突。
- 本地和线上关闭 Hibernate 的自动建表，统一设置为 `validate`。

通过这套规范，我们能确保每次部署都顺畅无比，即使在多人协作或生产环境热升级时，数据库一致性也能得到铁律般的保证。', '<p>本文介绍了可梵个人博客系统 2.0 的整体技术架构与核心功能模块设计方案...</p>', 'http://47.102.205.85:19000/blog2/default-covers/tech-architecture.png', 1, 1, 'PUBLISHED', 'PUBLIC', NULL, 't', 't', 't', 124, 12, 2, 1250, 4, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),

(2, 'AI Agent 时代的软件开发新范式：从 Copilot 到自主智能体', 'ai-agent-software-development-paradigm', '探讨人工智能代理（AI Agent）如何改变我们编写代码的方式，从简单的代码补全到自主完成复杂的端到端研发任务，以及开发者如何在此浪潮中定位自己。', '# AI Agent 时代的软件开发新范体

随着大语言模型（LLM）的飞速发展，软件工程正在经历自高级编程语言诞生以来最深刻的一场变革。我们正处于从“AI 辅助编码”（如 GitHub Copilot）向“AI 自主研发”（如自主智能体 Agent）过渡的十字路口。

## 1. 软件开发工具 of 演进路线

在大厂和前沿研发团队中，软件开发工具的演进通常被划分为三个阶段：

* **阶段一：静态规则与补全（1.0 时代）**：以 IDE 的智能提示、ESLint、静态分析为主。这一阶段工具完全基于人为设定的语法树和正则表达式。
* **阶段二：生成式辅助（2.0 时代）**：以 Copilot、Cursor 等为代表。AI 扮演的是“副驾驶”角色，能够根据上下文补全一行代码，或根据注释生成一段函数。主导权、上下文组装以及最终调试依然由开发者掌握。
* **阶段三：自主智能体（3.0 时代）**：AI Agent 能够自主设计方案，阅读已有代码，修改多处非连续文件，并运行测试验证，最后输出完整的 Git Commit 和任务 Walkthrough。这就是我们正在经历的变革。

## 2. 开发者在智能体时代的定位

当 AI Agent 可以自主承担 80% 的常规编码、测试和运维任务时，人类开发者的价值将进一步向“上游”移动：

1. **业务意图的精确表达**：将模糊的业务需求，解构为无歧义的软件逻辑与边界。
2. **架构边界与架构防线的设计**：防止系统的复杂度和技术债务失控。
3. **安全合规的兜底人**：审核智能体生成的变更，防范潜在的越权漏洞。

未来的开发模式，将更像是“双人成行”：人类负责架构把关和意图指引，Agent 负责高质量的工程细节搬砖。', '<p>探讨人工智能代理如何改变我们编写代码的方式...</p>', 'http://47.102.205.85:19000/blog2/default-covers/ai-agent.png', 1, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 't', 't', 356, 45, 1, 1400, 5, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),

(3, '《黑客与画家》读书笔记：为什么黑客能改变世界', 'hackers-and-painters-reading-notes', '重读保罗·格雷厄姆的经典之作《黑客与画家》，探讨黑客的本质、财富的创造以及编程语言的设计哲学，为处于迷茫期的工程师寻找灯塔。', '# 《黑客与画家》读书笔记：为什么黑客能改变世界

很多初学者甚至行内人士，容易将“黑客（Hacker）”与“黑客攻击者（Cracker）”混淆。在保罗·格雷厄姆的笔下，**黑客是创作者，就像画家、作家和建筑师一样**。他们不是为了破坏而存在，而是为了通过编写优秀的软件来创造美与价值。

## 🎨 编程与画画的惊人相似性

格雷厄姆指出，黑客和画家最本质的共同点在于：**他们都在创造。**

* **画家的工作方式**：先画出草稿，然后不断地修饰、迭代。画家在画布上添加细节，甚至覆盖旧有的笔触。
* **黑客的编码方式**：优秀的软件不是像写八股文一样一次写成的，而是在运行中迭代、重构出来的。我们通过写出原型，观察其运行表现，发现设计缺陷，然后不断地调整局部结构。

在大厂的日常工程实践中，我们提倡的“快速迭代、敏捷交付、持续重构”，实际上正是这种黑客创作哲学的工程化落地。

## 💰 创造财富的公式

在“如何创造财富”这一章中，作者给出了一个简明的公式：

$$\text{财富} = \text{创造的价值}$$

黑客改变世界的最直接方式，就是通过构建极高效率的软件，消除信息流动中的阻碍，帮助成千上万人提高生产力。这种效率的提升，就是实实在在被创造出来的财富。作为一个软件工程师，要实现财富自由，最稳健的道路往往是发现用户的痛点，并以极其优雅的技术手段将其解决。', '<p>重读保罗·格雷厄姆的经典之作《黑客与画家》...</p>', 'http://47.102.205.85:19000/blog2/default-covers/hackers-painters.png', 3, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 'f', 't', 88, 15, 0, 1800, 6, CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),

(4, '开发者的周末闲暇：代码之外的生活火花', 'developer-weekend-life-sparks', '在繁重的工作之余，如何通过骑行、阅读与烹饪找到内心的平静与创造力，实现工作与生活的精妙平衡。', '# 开发者的周末闲暇：代码之外的生活火花

我们常说“一生只够爱一个人，但一天可以写千行 Bug”。代码是逻辑的体现，而生活是感性的绽放。

作为一名常年与编译器斗智斗勇的开发者，周末是我断开与 Redis、PostgreSQL 连接的时间，用来连接大自然和生活本身。

## 🚴 户外骑行：用轮轨丈量城市的清晨

每周六清晨，我都会推着单车出门。在骑行中，耳边只有风声和链条转动的声音，那一刻你可以不用去想接口超时、并发死锁。骑行是一种物理上的排毒，它让你呼吸新鲜空气，将视野从 27 英寸的 4K 显示器拉向远方的地平线。

## 🍳 烹饪：另一种逻辑与美学的重构

许多人不理解，为什么写完代码的开发人员还会喜欢下厨？
实际上，烹饪和写程序有着奇妙的同构性：
* **准备食材** 就像是定义 DTO 和基础依赖。
* **掌控火候与时机** 就像是调节高并发事件的队列与时序。
* **摆盘摆盘** 则是前端界面的精致度排版。

当你亲手把凌乱的原材料，在逻辑分明的步骤下调配成一盘色香味俱全的美味，那种即时反馈的成就感，丝丝毫不及跑通了一段复杂的单元测试。

写代码为了生计，生活为了灵魂。愿每位开发者都能在逻辑的代码世界外，找到自己生活的火花。', '<p>在繁重的工作之余，如何通过骑行找到生活的平衡...</p>', 'http://47.102.205.85:19000/blog2/default-covers/cooking-life.png', 2, 1, 'PUBLISHED', 'PUBLIC', NULL, 'f', 'f', 't', 105, 34, 1, 950, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(5, '【草稿】关于博客 3.0 的前瞻性技术设想', 'blog3-tech-speculations-draft', '这是一篇草稿，记录对未来 3.0 版本中可能引入的 GraphDB 知识图谱与智能问答功能的技术设想，探讨图数据库在内容关联中的潜在应用。', '# 关于博客 3.0 的前瞻性技术设想

这是一篇草稿。

在 3.0 的规划中，我设想引入 **图数据库 (Graph Database)** 来重构博客的内容推荐和知识挖掘系统：
1. **知识图谱检索**：将传统的标签（Tag）升华为实体概念（Entity），在文章之间建立深度的网状关系链。
2. **AI 智能体关联**：利用 Agent 自动扫描正文，提取实体名词，并自动连接到相关的技术参考页面。

一切还处于设想中...', '<p>这是一篇关于博客3.0图数据库设想的草稿...</p>', NULL, 1, 1, 'DRAFT', 'PUBLIC', NULL, 'f', 'f', 't', 12, 1, 0, 300, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- 5. 插入文章-标签关联数据 (blog_article_tag)
INSERT INTO "public"."blog_article_tag" ("article_id", "tag_id") VALUES
(1, 1), -- 文章1 关联 Java
(1, 2), -- 文章1 关联 Spring Boot
(1, 3), -- 文章1 关联 Next.js
(2, 4), -- 文章2 关联 AI Agent
(3, 5), -- 文章3 关联 读书感悟
(4, 5); -- 文章4 关联 读书感悟

-- 6. 插入模拟评论数据 (blog_comment)
INSERT INTO "public"."blog_comment" ("id", "article_id", "parent_id", "user_id", "visitor_name", "visitor_email", "visitor_website", "content", "status", "ip_address", "user_agent", "like_count", "is_author_replied", "created_at", "updated_at") VALUES
(1, 1, NULL, NULL, '码农小明', 'xiaoming@example.com', 'https://github.com/xiaoming', '大赞这套 Flyway 命名规范！之前和同事协同开发，表结构经常冲突，每次合并都像做手术一样痛苦。有这套时间戳命名感觉清爽多了！', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5, 't', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, 1, 1, NULL, '1973578950@qq.com', NULL, '谢谢支持！时间戳命名确实能极大减少并行开发的冲突，大厂的流水线发布通常也是强制要求类似的机制来保证 Flyway 顺序的。', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 2, 'f', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(3, 2, NULL, NULL, 'AI探索者', 'ai-explorer@example.com', NULL, '非常赞同作者对智能体时代的软件工程划分。以前觉得 Copilot 就是天花板，最近看了自主智能体解决复杂 Bug 的演示，才明白代码自动改写和自主测试才是真正颠覆性的。', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 8, 'f', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP - INTERVAL '1 days'),
(4, 4, NULL, NULL, '美食博主程序员', 'cook-code@example.com', NULL, '哈哈，烹饪那段比喻太绝了！准备食材确实是写 DTO，调料是依赖。我每次写不出 Bug 就会去厨房炒两个菜，感觉脑子瞬间活过来了。', 'APPROVED', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)', 14, 'f', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. 插入首页默认场景 (blog_homepage_scene)
INSERT INTO "public"."blog_homepage_scene" ("id", "title", "image_url", "is_active", "created_at", "updated_at") VALUES
(1, '我的线上书房', 'http://47.102.205.85:19000/blog2/homepage-scenes/my-study-room-bg.jpg', 't', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. 插入场景交互热区数据 (blog_homepage_hotspot)
INSERT INTO "public"."blog_homepage_hotspot" ("id", "scene_id", "item_name", "item_image_url", "x_percent", "y_percent", "width_percent", "height_percent", "geometry_ext", "hover_tips", "redirect_type", "redirect_path", "redirect_target_id", "zoom_scale", "sort_order", "is_visible", "created_at") VALUES
(1, 1, '电脑屏', 'http://47.102.205.85:19000/blog2/homepage-scenes/pc-screen.png', 45.20, 32.50, 18.00, 12.50, '{"shape": "rect", "rotate": 0, "animation": "glow"}', '来看看可梵的技术分享文章吧 💻', 'CATEGORY', NULL, 1, 2.50, 1, 't', CURRENT_TIMESTAMP),
(2, 1, '书架上的书', 'http://47.102.205.85:19000/blog2/homepage-scenes/bookshelf-books.png', 12.80, 15.00, 8.50, 20.00, '{"shape": "rect", "rotate": 0, "animation": "float"}', '重温经典的读书笔记 📚', 'CATEGORY', NULL, 3, 3.00, 2, 't', CURRENT_TIMESTAMP),
(3, 1, '吉他', 'http://47.102.205.85:19000/blog2/homepage-scenes/guitar.png', 82.00, 48.00, 10.00, 35.00, '{"shape": "polygon", "rotate": 12, "animation": "shake"}', '听一首舒缓的民谣，看看我的周末随笔 🏕️', 'CATEGORY', NULL, 2, 2.80, 3, 't', CURRENT_TIMESTAMP);

-- 9. 插入模拟友情链接 (blog_friend_link)
INSERT INTO "public"."blog_friend_link" ("id", "site_name", "site_url", "site_logo", "description", "sort_order", "is_visible", "created_at") VALUES
(1, 'GitHub', 'https://github.com/agent-butvan', 'https://github.githubassets.com/favicons/favicon.svg', '可梵的开源大本营', 1, 't', CURRENT_TIMESTAMP),
(2, 'Google AI Studio', 'https://aistudio.google.com/', 'https://www.gstatic.com/lamda/images/favicon_v2_16x16.png', '强大的 AI Agent 赋能中心', 2, 't', CURRENT_TIMESTAMP),
(3, 'Spring Boot 官网', 'https://spring.io/projects/spring-boot', 'https://spring.io/images/favicon-9d25029058b8434771746af76722d512.ico', '现代 Java 微服务开发的起点', 3, 't', CURRENT_TIMESTAMP);

-- ============================================================================
-- 10. 刷新 PostgreSQL 主键自增序列值 (防止后续新增数据因主键冲突报错)
-- ============================================================================
SELECT setval('"public"."blog_category_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_category"), 1), true);
SELECT setval('"public"."blog_tag_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_tag"), 1), true);
SELECT setval('"public"."blog_article_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_article"), 1), true);
SELECT setval('"public"."blog_comment_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_comment"), 1), true);
SELECT setval('"public"."blog_homepage_scene_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_homepage_scene"), 1), true);
SELECT setval('"public"."blog_homepage_hotspot_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_homepage_hotspot"), 1), true);
SELECT setval('"public"."blog_friend_link_id_seq"', COALESCE((SELECT MAX(id) FROM "public"."blog_friend_link"), 1), true);
