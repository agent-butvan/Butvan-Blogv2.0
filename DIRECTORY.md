## 项目目录详细说明

> Butvan Blog 2.0 — 个人博客系统  
> 前端：Next.js 16 + HeroUI v3 + Tailwind v4 | 后端：Spring Boot 3.2 + JPA + PostgreSQL  
> 全部遵循大厂开发规范，分层清晰、职责单一。

```
Butvan Blog2.0/                                    # 📦 项目根目录
│
├── AGENTS.md                                      # AI 开发助手指引（技术栈、规范、工作流）
├── DIRECTORY.md                                   # 项目目录结构说明（本文件）
├── PRODUCT.md                                     # 产品迭代需求文档（v0.1 / v0.2）
├── DATA_MODEL.md                                  # 数据库模型完整设计（10模块19张表）
├── fWdgJuAOF.jpeg                                 # 默认「Cozy Room」场景高清背景图
│
├── .claude/                                       # 🤖 Claude Code 配置
│   └── skills/
│       └── ui-ux-pro-max/                         #   UI/UX Pro Max 设计技能包
│           ├── SKILL.md                           #     技能说明文档
│           ├── scripts/                           #     设计引擎脚本（核心、搜索、设计系统生成）
│           └── data/                              #     设计知识库（颜色、排版、图标、UX规范、各栈模板）
│
├── design-system/                                 # 🎨 统一 UI/UX 设计系统
│   └── butvan-blog/
│       └── MASTER.md                              #   静谧深海（Quiet Deep Sea）色彩规范、排版规则、动效定义
│
├── docx/                                          # 📝 项目文档与资料
│   ├── COLORS.md                                  #   配色参考方案（9 种冷暖主题色）
│   ├── THINKING.md                                #   产品最初构想与「沉浸式房间」跳转逻辑
│   └── database/
│       ├── schema.sql                             #   完整 DDL 建表脚本（19 张表，含索引与注释，无测试数据）
│       ├── migration-v0.3.sql                     #   数据库迁移脚本 (v0.3 版本，补齐热区高度百分比字段)
│       ├── migration-v0.4.sql                     #   数据库迁移脚本 (v0.4 版本)
│       ├── migration-v0.5.sql                     #   数据库迁移脚本 (v0.5 版本，文章、分类与标签建表及初始化数据)
│       └── migration-v0.6.sql                     #   数据库迁移脚本 (v0.6 版本，安全插入后台评论管理侧边栏菜单)
│
├── fronted/                                       # 🖥️【前端】Next.js 16 + TypeScript + HeroUI v3 + Tailwind v4
│   │
│   ├── blog-client/                               #   用户展示端（前台博客）
│   │   ├── public/                                #     静态资源
│   │   │   ├── images/                            #       图片资源
│   │   │   └── fonts/                             #       自定义字体文件
│   │   ├── src/
│   │   │   ├── app/                               #     Next.js App Router 路由层
│   │   │   │   ├── page.tsx                       #         🏠 首页 — 房间场景：PNG图层切片物理悬浮交互、镜头缩放聚焦
│   │   │   │   ├── article/                       #       📝 文章模块
│   │   │   │   │   ├── page.tsx                   #         文章列表页（分页、多维筛选、Mock降级）
│   │   │   │   │   └── [slug]/                    #         文章详情页
│   │   │   │   │       └── page.tsx               #           正文渲染、评论、系列导航
│   │   │   │   ├── categories/                    #       📂 分类模块
│   │   │   │   │   └── [slug]/                    #         分类文章列表
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── tags/                          #       🏷️ 标签模块
│   │   │   │   │   └── [slug]/                    #         标签文章列表
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── series/                        #       📚 系列/专题模块
│   │   │   │   │   └── [slug]/                    #         系列详情（含目录导航）
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── [slug]/                        #       📄 独立页面（关于我、友链等）
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx                     #         根布局：字体加载、全局 Metadata
│   │   │   │   ├── globals.css                    #         全局样式：静谧深海色彩变量、发光阴影
│   │   │   │   ├── providers.tsx                  #         HeroUI v3 无 Provider 兼容包装器
│   │   │   │   └── not-found.tsx                  #         自定义 404 页面
│   │   │   ├── components/                        #     🧩 组件层（按业务领域分组）
│   │   │   │   ├── common/                        #       通用原子组件（Button、Card、Modal、Empty 等）
│   │   │   │   │   ├── HtmlRenderer.tsx           #         通用 HTML 解析与组件拦截器
│   │   │   │   │   └── MarkdownCodeBlock.tsx      #         通用定制化 macOS 风格代码块组件
│   │   │   │   ├── layout/                        #       布局组件
│   │   │   │   │   ├── Header.tsx                 #         全局顶栏（Logo、导航、搜索）
│   │   │   │   │   ├── Footer.tsx                 #         全局底栏（备案号、社交链接）
│   │   │   │   │   └── Navigation.tsx             #         导航菜单渲染（从 API 获取菜单树）
│   │   │   │   ├── home/                          #       首页专属组件
│   │   │   │   │   ├── RoomScene.tsx              #         房间场景容器（图层叠加、百分比定位）
│   │   │   │   │   ├── HotspotItem.tsx            #         可交互物品（PNG悬浮+发光+Tooltip）
│   │   │   │   │   └── ZoomTransition.tsx         #         镜头拉近过渡动画组件
│   │   │   │   ├── article/                       #       文章组件
│   │   │   │   │   ├── ArticleCard.tsx            #         文章卡片（列表用）
│   │   │   │   │   ├── ArticleList.tsx            #         文章列表（分页/无限滚动）
│   │   │   │   │   └── ArticleContent.tsx         #         文章正文渲染器（Markdown → HTML）
│   │   │   │   ├── comment/                       #       评论组件
│   │   │   │   │   ├── CommentSection.tsx         #         评论区容器（嵌套回复结构）
│   │   │   │   │   └── CommentForm.tsx            #         评论表单（Markdown 快捷输入）
│   │   │   │   └── series/                        #       系列组件
│   │   │   │       └── SeriesNavigation.tsx       #         系列目录导航（上一篇/下一篇）
│   │   │   ├── hooks/                             #     🪝 自定义 Hooks
│   │   │   │   ├── useArticles.ts                 #       文章数据请求与缓存
│   │   │   │   ├── useHotspots.ts                 #       热区数据请求与鼠标交互
│   │   │   │   └── useScrollPosition.ts           #       滚动位置监听
│   │   │   ├── lib/                               #     🔧 工具库
│   │   │   │   ├── api.ts                         #       Axios/fetch 封装（baseURL、拦截器、错误处理）
│   │   │   │   ├── constants.ts                   #       前端常量（站点名、分页大小等）
│   │   │   │   └── image-url.ts                   #       图片 URL 解析工具函数（支持相对路径与绝对路径）
│   │   │   ├── types/                             #     📐 TypeScript 类型定义
│   │   │   │   ├── scene.ts                       #       场景/热区类型
│   │   │   │   ├── article.ts                     #       文章/分类/标签类型
│   │   │   │   └── common.ts                      #       通用类型（分页、API 响应等）
│   │   │   └── styles/                            #     🎨 额外样式（Tailwind 无法覆盖的复杂样式）
│   │   ├── next.config.ts                         #     Next.js 配置（图片域名、重定向等）
│   │   ├── postcss.config.mjs                     #     PostCSS 配置
│   │   ├── tsconfig.json                          #     TypeScript 配置
│   │   ├── eslint.config.mjs                      #     ESLint 规则
│   │   ├── package.json                           #     依赖声明（next, heroui, tailwind 等）
│   │   └── .gitignore                             #     Git 忽略规则
│   │
│   └── blog-admin/                                #   管理后台端（内容管理）
│       ├── public/                                #     静态资源
│       ├── src/
│       │   ├── app/                               #     Next.js App Router 路由层
│       │   │   ├── (auth)/                        #       🔐 认证模块（无布局壳）
│       │   │   │   └── login/                     #         登录页
│       │   │   │       └── page.tsx               #           账号密码登录表单
│       │   │   ├── (dashboard)/                   #       📊 管理后台（带侧边栏布局壳）
│       │   │   │   ├── layout.tsx                 #         后台布局：侧边栏 + 顶栏 + 内容区
│       │   │   │   ├── page.tsx                   #         仪表盘首页（一体化隔线控制台、SVG趋势图、系统负载、快捷模块）
│       │   │   │   ├── articles/                  #         文章管理
│       │   │   │   │   ├── page.tsx               #           文章列表（筛选、搜索、批量操作）
│       │   │   │   │   ├── new/                   #           新建文章
│       │   │   │   │   │   └── page.tsx           #             Markdown 编辑器 + SEO 设置
│       │   │   │   │   └── [id]/                  #           编辑文章
│       │   │   │   │       └── page.tsx           #             版本历史查看、回滚
│       │   │   │   ├── scenes/                    #         场景管理（首页房间）
│       │   │   │   │   ├── page.tsx               #           场景列表
│       │   │   │   │   └── [id]/                  #           场景热区编辑器
│       │   │   │   │       └── page.tsx           #             可视化拖拽放置 PNG、框选、属性编辑
│       │   │   │   ├── categories/                #         分类管理
│       │   │   │   │   └── page.tsx               #           分类CRUD（树形拖拽排序）
│       │   │   │   ├── tags/                      #         标签管理
│       │   │   │   │   └── page.tsx               #           标签CRUD
│       │   │   │   ├── comments/                  #         评论管理
│       │   │   │   │   └── page.tsx               #           评论审核（通过/垃圾/删除）
│       │   │   │   ├── media/                     #         媒体库
│       │   │   │   │   └── page.tsx               #           文件上传/预览/删除（支持图片裁剪）
│       │   │   │   ├── pages/                     #         独立页面管理
│       │   │   │   │   └── page.tsx               #           关于我/友链等页面编辑
│       │   │   │   ├── navigation/                #         导航菜单管理
│       │   │   │   │   └── page.tsx               #           多级菜单树（拖拽排序、链接配置）
│       │   │   │   ├── series/                    #         系列/专题管理
│       │   │   │   │   └── page.tsx               #           系列CRUD + 文章拖入排序
│       │   │   │   ├── subscribers/               #         订阅者管理
│       │   │   │   │   └── page.tsx               #           订阅列表、邮件群发入口
│       │   │   │   └── settings/                  #         系统设置
│       │   │   │       └── page.tsx               #           站点配置、友链管理、操作日志查看
│       │   │   ├── layout.tsx                     #         全局根布局
│       │   │   ├── globals.css                    #         全局样式与自定义配色
│       │   │   └── providers.tsx                  #         HeroUI v3 兼容包装器
│       │   ├── components/                        #     🧩 组件层
│       │   │   ├── common/                        #       通用原子组件（Table、Form、Modal、Portal、Upload 等）
│       │   │   ├── layout/                        #       后台布局组件
│       │   │   │   ├── AdminLayout.tsx            #         后台整体布局壳（侧边栏+页签栏+内容区）
│       │   │   │   ├── Sidebar.tsx                #         可折叠侧边栏菜单
│       │   │   │   ├── TopBar.tsx                 #         顶栏（面包屑、全屏、深色切换、用户登出）
│       │   │   │   ├── TabManager.tsx             #         多标签页签管理器（持久化缓存、页签关闭/切换）
│       │   │   │   ├── MobileHeader.tsx           #         移动端专属顶栏（Logo、滑动菜单触发、页面标题）
│       │   │   │   └── MobileRightPanel.tsx       #         移动端右侧操作抽屉面板（用户卡片、主题、全屏、登出）
│       │   │   ├── editor/                        #       编辑器组件
│       │   │   │   ├── MarkdownEditor.tsx         #         Markdown 富文本编辑器
│       │   │   │   ├── InitializedMDXEditor.tsx   #         所见即所得 (WYSIWYG) 客户端编辑器组件
│       │   │   │   ├── SceneToolbar.tsx           #         场景编辑器顶部工具栏
│       │   │   │   ├── SceneCanvas.tsx            #         场景编辑器可视化画布
│       │   │   │   └── HotspotPropertiesPanel.tsx #         场景热区物品属性编辑面板
│       │   │   └── forms/                         #       表单组件（文章表单、场景表单等复合表单）
│       │   ├── hooks/                             #     🪝 自定义 Hooks
│       │   │   ├── useAuth.ts                     #       认证状态管理
│       │   │   └── useUpload.ts                   #       文件上传 Hook
│       │   ├── lib/                               #     🔧 工具库
│       │   │   ├── api.ts                         #       API 请求封装（自动附带 JWT Token）
│       │   │   ├── auth.ts                        #       Token 存储/刷新/过期处理
│       │   │   ├── article-api.ts                 #       文章、分类、标签相关的 API 请求统一封装
│       │   │   └── comments-api.ts                #       评论、审核、快捷回复相关的 API 请求统一封装
│       │   └── types/                             #     📐 TypeScript 类型定义（与 blog-client 共享结构）
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── eslint.config.mjs
│       ├── package.json
│       └── .gitignore
│
└── backend/                                        # ⚙️【后端】Spring Boot 3.2 + Maven 多模块 + JPA + PostgreSQL
    │
    ├── pom.xml                                     #   Maven 父工程 POM（统一依赖版本管理、模块聚合）
    ├── migration-v0.2.sql                          #   数据库迁移脚本 (v0.2 版本)
    ├── uploads/                                    #   📁 静态资源上传映射物理目录（本地测试图片存储）
    │   └── sprites/                                #     透明 PNG 热区悬浮物品切片存储目录
    │
    ├── blog-common/                                #   📦 通用基础模块（无业务依赖，被所有模块引用）
    │   ├── pom.xml                                 #     Maven 子模块 POM
    │   └── src/main/java/com/butvan/blog/common/
    │       ├── config/                             #       通用配置
    │       │   └── WebMvcConfig.java               #         MVC 配置（CORS、拦截器、消息转换器）
    │       ├── constant/                           #       常量定义
    │       │   └── Constants.java                  #         全局常量（日期格式、默认分页大小等）
    │       ├── exception/                          #       异常定义
    │       │   ├── BaseException.java              #         全局业务异常基类（code + msg）
    │       │   └── BusinessException.java          #         具体业务异常（文章不存在、权限不足等）
    │       ├── handler/                            #       全局处理器
    │       │   └── GlobalExceptionHandler.java     #         REST 异常统一拦截（业务异常 + 参数校验异常）
    │       ├── result/                             #       统一响应体
    │       │   ├── Result.java                     #         统一 JSON 返回包装器（code + msg + data）
    │       │   └── PageResult.java                 #         分页响应体（total + page + size + records）
    │       └── utils/                              #       通用工具类
    │           └── SlugUtils.java                  #         中文/英文转 URL Slug 工具
    │
    ├── blog-pojo/                                  #   📦 数据模型模块（Entity / DTO / VO）
    │   ├── pom.xml                                 #     Maven 子模块 POM（依赖 JPA + Lombok + Jackson）
    │   └── src/main/java/com/butvan/blog/pojo/
    │       ├── entity/                             #       数据库实体（JPA @Entity，19 张表一一映射）
    │       │   ├── Scene.java                      #         blog_homepage_scene — 首页场景
    │       │   ├── Hotspot.java                    #         blog_homepage_hotspot — 交互热区/物品
    │       │   ├── User.java                       #         blog_user — 用户
    │       │   ├── Category.java                   #         blog_category — 分类
    │       │   ├── Tag.java                        #         blog_tag — 标签
    │       │   ├── Article.java                    #         blog_article — 文章
    │       │   ├── ArticleVersion.java             #         blog_article_version — 文章版本历史
    │       │   ├── Series.java                     #         blog_series — 文章系列/专题
    │       │   ├── Comment.java                    #         blog_comment — 评论
    │       │   ├── Media.java                      #         blog_media — 媒体资源
    │       │   ├── Page.java                       #         blog_page — 独立页面
    │       │   ├── Navigation.java                 #         blog_navigation — 导航菜单
    │       │   ├── SiteConfig.java                 #         blog_site_config — 站点配置
    │       │   ├── FriendLink.java                 #         blog_friend_link — 友链
    │       │   ├── Subscriber.java                 #         blog_subscriber — 邮件订阅
    │       │   ├── OperationLog.java               #         blog_operation_log — 操作日志
    │       │   └── VisitLog.java                   #         blog_visit_log — 访问日志
    │       ├── dto/                                #       数据传输对象（接收前端请求体）
    │       │   ├── article/                        #         文章相关：ArticleCreateDTO, ArticleUpdateDTO, ArticleQueryDTO
    │       │   ├── comment/                        #         评论相关：CommentCreateDTO, CommentAuditDTO
    │       │   ├── auth/                           #         认证相关：LoginDTO, RegisterDTO, PasswordResetDTO
    │       │   ├── scene/                          #         场景相关：SceneSaveDTO, HotspotSaveDTO
    │       │   ├── page/                           #         独立页相关：PageSaveDTO
    │       │   └── common/                         #         通用：PageQueryDTO, BatchDeleteDTO
    │       └── vo/                                 #       视图对象（返回前端展示）
    │           ├── article/                        #         文章相关：ArticleDetailVO, ArticleListVO
    │           ├── home/                           #         首页相关：HomeSceneVO, HotspotVO
    │           ├── comment/                        #         评论相关：CommentVO
    │           └── common/                         #         通用：PageVO, StatisticsVO
    │
    └── blog-service/                               #   📦 主业务服务模块（启动入口 + 业务逻辑）
        ├── pom.xml                                 #     Maven 子模块 POM（依赖 blog-common + blog-pojo + Spring Boot Starter）
        └── src/
            ├── main/
            │   ├── java/com/butvan/blog/service/
            │   │   ├── BlogApplication.java        #       🚀 Spring Boot 启动类（多包扫描 + JPA 审计启用）
            │   │   ├── config/                     #       服务层配置
            │   │   │   ├── CorsConfig.java         #         CORS 跨域配置（允许前端 dev 端口）
            │   │   │   └── SwaggerConfig.java      #         Swagger/OpenAPI 文档配置
            │   │   ├── controller/                 #       🌐 控制器层（REST API，仅做参数校验与路由）
            │   │   │   ├── SceneController.java    #         场景与热区 CRUD 接口（GET/POST/PUT/DELETE）
            │   │   │   ├── ArticleController.java  #         文章 CRUD + 状态变更 + 搜索接口
            │   │   │   ├── CategoryController.java #         分类管理接口
            │   │   │   ├── TagController.java      #         标签管理接口
            │   │   │   ├── CommentController.java  #         评论提交/审核/删除接口
            │   │   │   ├── MediaController.java    #         文件上传/删除接口
            │   │   │   ├── PageController.java     #         独立页面管理接口
            │   │   │   ├── NavigationController.java #       导航菜单管理接口
            │   │   │   ├── SeriesController.java   #         系列/专题管理接口
            │   │   │   ├── AuthController.java      #         登录/登出/Token 刷新接口
            │   │   │   ├── SiteConfigController.java #       站点配置管理接口
            │   │   │   ├── FriendLinkController.java #       友链管理接口
            │   │   │   └── SubscriberController.java #      订阅管理接口
            │   │   ├── repository/                 #       🗄️ 数据访问层（JPA Repository 接口）
            │   │   │   ├── SceneRepository.java    #         场景 Repository（查询启用场景）
            │   │   │   ├── HotspotRepository.java  #         热区 Repository（按场景查询+排序）
            │   │   │   ├── UserRepository.java     #         用户 Repository（按用户名/邮箱查询）
            │   │   │   ├── ArticleRepository.java  #         文章 Repository（按状态/分类/标签/关键字查询）
            │   │   │   ├── ArticleVersionRepository.java #   文章版本 Repository
            │   │   │   ├── CategoryRepository.java #         分类 Repository
            │   │   │   ├── TagRepository.java      #         标签 Repository
            │   │   │   ├── SeriesRepository.java   #         系列 Repository
            │   │   │   ├── CommentRepository.java  #         评论 Repository（按文章+状态查询）
            │   │   │   ├── MediaRepository.java    #         媒体 Repository
            │   │   │   ├── PageRepository.java     #         独立页 Repository（按 slug 查询）
            │   │   │   ├── NavigationRepository.java #       导航 Repository（按位置查询树形菜单）
            │   │   │   ├── SiteConfigRepository.java #       配置 Repository（按 key 查询）
            │   │   │   ├── FriendLinkRepository.java #      友链 Repository
            │   │   │   ├── SubscriberRepository.java #      订阅 Repository
            │   │   │   ├── OperationLogRepository.java #    操作日志 Repository
            │   │   │   └── VisitLogRepository.java  #       访问日志 Repository
            │   │   ├── service/                    #       💼 业务逻辑层（接口定义）
            │   │   │   ├── SceneService.java       #         场景业务接口
            │   │   │   ├── ArticleService.java     #         文章业务接口
            │   │   │   ├── CategoryService.java    #         分类业务接口
            │   │   │   ├── TagService.java         #         标签业务接口
            │   │   │   ├── CommentService.java     #         评论业务接口
            │   │   │   ├── MediaService.java       #         媒体业务接口
            │   │   │   ├── PageService.java        #         独立页业务接口
            │   │   │   ├── NavigationService.java  #         导航业务接口
            │   │   │   ├── SeriesService.java      #         系列业务接口
            │   │   │   ├── AuthService.java         #         认证业务接口
            │   │   │   ├── SiteConfigService.java  #         配置业务接口
            │   │   │   ├── FriendLinkService.java  #         友链业务接口
            │   │   │   ├── SubscriberService.java  #         订阅业务接口
            │   │   │   └── impl/                   #         业务逻辑实现层（@Service + @Transactional）
            │   │   │       ├── SceneServiceImpl.java
            │   │   │       ├── ArticleServiceImpl.java
            │   │   │       ├── CategoryServiceImpl.java
            │   │   │       ├── TagServiceImpl.java
            │   │   │       ├── CommentServiceImpl.java
            │   │   │       ├── MediaServiceImpl.java
            │   │   │       ├── PageServiceImpl.java
            │   │   │       ├── NavigationServiceImpl.java
            │   │   │       ├── SeriesServiceImpl.java
            │   │   │       ├── AuthServiceImpl.java
            │   │   │       ├── SiteConfigServiceImpl.java
            │   │   │       ├── FriendLinkServiceImpl.java
            │   │   │       └── SubscriberServiceImpl.java
            │   │   └── security/                   #       🔒 安全模块
            │   │       ├── JwtAuthFilter.java      #         JWT 认证过滤器（每次请求校验 Token）
            │   │       ├── JwtUtil.java            #         JWT 工具类（签发、解析、校验 Token）
            │   │       └── SecurityConfig.java     #         Spring Security 配置（放行白名单、权限规则）
            │   └── resources/
            │       ├── application.yml             #         主配置文件（导入 database 与 routes 配置文件）
            │       ├── application-database.yml    #         数据库、JPA及JWT安全证书配置文件
            │       └── application-routes.yml      #         前台页面客户端路由映射配置文件
            └── test/
                └── java/com/butvan/blog/service/   #       🧪 单元测试与集成测试
```

---

## 分层架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        blog-client (用户展示端)                       │
│  app/ → components/ → hooks/ → lib/api.ts → 后端 REST API           │
│  路由层    组件层      逻辑层     请求层                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       blog-admin (管理后台端)                         │
│  app/ → components/ → hooks/ → lib/api.ts → 后端 REST API           │
│  路由层   表单/编辑器   认证逻辑   JWT 请求层                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     blog-service (Spring Boot 主业务)                 │
│                                                                      │
│  Controller ──→ Service(接口) ──→ ServiceImpl(实现) ──→ Repository   │
│   (REST API)     (业务接口)        (@Transactional)      (JPA 数据层) │
│       │                │                  │                   │      │
│       │                └──────────────────┘                   │      │
│       │                     使用 DTO/VO 传输数据                │      │
│       │                                                       │      │
│       └───────────────────────────────────────────────────────┘      │
│                     blog-pojo (Entity / DTO / VO)                    │
│                     blog-common (异常、统一响应、工具类)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心文件说明

| 文件/目录 | 层级 | 说明 |
|-----------|------|------|
| `AGENTS.md` | 根目录 | AI 开发助手指引（技术栈、规范、工作流） |
| `PRODUCT.md` | 根目录 | 产品定义及版本计划需求文档 |
| `DATA_MODEL.md` | 根目录 | 数据库模型完整设计（10 模块 19 张表、ER 图、索引） |
| `design-system/butvan-blog/MASTER.md` | 设计系统 | 静谧深海色彩规范、排版规则、发光/动效参数 |
| `docx/database/schema.sql` | 数据库 | PostgreSQL 完整 DDL（19 张表，含注释与索引） |
| `docx/database/migration-v0.3.sql` | 数据库 | PostgreSQL v0.3 迁移脚本（添加 height_percent 高度百分比字段） |
| `docx/database/migration-v0.5.sql` | 数据库 | PostgreSQL v0.5 迁移脚本（文章分类标签建表与初始数据） |
| `docx/database/migration-v0.6.sql` | 数据库 | PostgreSQL v0.6 迁移脚本（安全插入后台评论管理侧边栏菜单） |
| `fronted/blog-admin/src/lib/article-api.ts` | 后台-工具 | 统一封装文章、分类、标签相关 API 请求方法 |
| `fronted/blog-client/src/app/page.tsx` | 前台-首页 | 房间场景：从 API 获取激活场景，PNG 图层叠层绝对百分比渲染、hover 物理悬空、发光避光阴影及缩放过渡 |
| `fronted/blog-client/src/components/home/RoomScene.tsx` | 前台-组件 | 多图层渲染容器，背景图+PNG物品百分比定位叠加 |
| `fronted/blog-client/src/components/common/HtmlRenderer.tsx` | 前台-组件 | 通用 HTML 虚拟 DOM 解析拦截器（回退 SSR 渲染） |
| `fronted/blog-client/src/components/common/MarkdownCodeBlock.tsx` | 前台-组件 | 通用定制化 macOS 风格代码块（复制/折叠/自适应亮暗高亮） |
| `fronted/blog-client/src/app/articles/[slug]/page.tsx` | 前台-文章 | 文章详情页（Markdown渲染、评论区、系列导航） |
| `fronted/blog-admin/src/app/(dashboard)/articles/new/page.tsx` | 后台-文章 | Markdown 编辑器 + 分类/标签/SEO 设置 |
| `fronted/blog-admin/src/app/(dashboard)/scenes/[id]/page.tsx` | 后台-场景 | 可视化热区编辑器（拖拽框选、百分比换算） |
| `fronted/blog-admin/src/components/editor/SceneCanvas.tsx` | 后台-组件 | 可视化场景编辑画布，支持拖拽移动/拉伸缩放/框选裁剪 |
| `fronted/blog-admin/src/components/editor/HotspotPropertiesPanel.tsx` | 后台-组件 | 选定热区后，展示其物品名称、坐标、跳转路径、悬浮文案等配置表单 |
| `fronted/blog-admin/src/components/editor/SceneToolbar.tsx` | 后台-组件 | 场景编辑器顶部工具栏，控制模式切换与手动物品上传 |
| `backend/blog-service/.../BlogApplication.java` | 后端-入口 | Spring Boot 启动类，JPA 多包扫描 |
| `backend/blog-common/.../GlobalExceptionHandler.java` | 后端-通用 | 全局异常统一拦截，映射为标准 Result 结构 |
| `backend/blog-common/.../Result.java` | 后端-通用 | 统一 JSON 响应体 `{code, msg, data}` |
| `backend/blog-pojo/.../entity/` | 后端-模型 | 19 个 JPA 实体类，与数据库表一一对应 |
| `backend/blog-service/.../security/JwtAuthFilter.java` | 后端-安全 | JWT 认证过滤器，每次请求校验 Token |
| `backend/blog-service/.../security/SecurityConfig.java` | 后端-安全 | Spring Security 配置，白名单与权限规则 |

> **注意**：
> - 目录结构严格遵循大厂开发规范，前端按业务领域分组组件，后端按三层分层架构组织
> - 非核心文件/目录（如 `node_modules`、`.next`、`.idea`、`target` 等）已在 Git 中忽略
> - `src/` 下标记 `...` 的目录表示有更多同类文件，未逐一列出

---

*最后更新：2026-06-18*
