# 变更日志 (CHANGELOG)

本文档记录 **Butvan Blog 2.0** 的全部版本更新明细与发版履历，遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/) 版本规范。

## v2.0.1

- **发布日期 (UTC)**：2026-07-24
- **对比基线**：v2.0.0...v2.0.1
- **发布通道**：Stable

针对低配置服务器（2C2G）进行容器内存配额控制与 JVM/Node 堆内存优化，根治生产环境服务器容易因物理内存耗尽（OOM）引发系统假死、SSH 断连及 MinIO / 网站不可访问的严重问题。

### 性能优化与生产部署

- **JVM 堆内存限制**：在 `backend/Dockerfile` 中显式指定 `-Xms256m -Xmx384m` 参数，防止 Java 21 无约束挤占宿主机物理内存。
- **Node.js 运行限制**：在前后台 Dockerfile 中注入 `NODE_OPTIONS="--max-old-space-size=256"` 环境变量，将前后台独立 SSR 渲染进程的最大旧生代内存限制为 256MB。
- **Docker 容器内存限制**：在 `docker-compose.yml` 中为 PostgreSQL (256M)、Redis (64M)、SpringBoot (512M) 及前后台容器 (256M) 配置显式 `mem_limit` 保护配额。

### Commits

- perf(deploy): 优化容器与JVM内存限制防止服务器假死 ( 766a245 )

---

## v2.0.0

- **发布日期 (UTC)**：2026-07-24
- **对比基线**：Initial Milestone (v2.0.0)
- **发布通道**：Stable

v2.0.0 是 Butvan Blog 2.0 个人博客系统的首个正式发布版本。系统基于 Next.js 16 + HeroUI v3 + Spring Boot 3.2 + PostgreSQL 打造，具备极具视觉吸引力的沉浸式房间场景、Markdown 富文本编辑器、全站响应式与工业级 CI/CD 发布体系。

### 核心功能与阅读体验

- **沉浸式场景空间**：前台首页支持 PNG 图层物理悬浮交互、镜头聚焦缩放与「Cozy Room」场景体验。
- **正文排版与阅读**：采用人文排版系统，行高优化至 1.72，精细化缩紧段落与标题间距；消除了 `>` 引用块底部留白拉长问题。
- **全站行内代码高亮**：前后台实现 100% 高保真浅紫微边框行内代码配色对齐。

### 管理控制台与富文本编辑器

- **Tiptap 富文本编辑器**：支持 Slash (/) 快捷指令、Markdown 无缝解析、代码高亮、任务清单及全套快捷键。
- **图片交互与管理**：图片悬浮显示编辑图标，支持点击 Modal 弹窗配置 URL 地址、描述及删除；图片加载失败呈现友好警告卡片与替换操作；支持粘贴网络图片 URL 自动渲染。
- **富文本/代码调色盘**：内置 6 组精致预设色彩（玫瑰红、翡翠绿、宝石蓝、雅致紫、琥珀黄、石墨灰）与自定义 Hex 字色/高亮背景选择器。

### 工程规范与版本控制

- 建立基于语义化版本（SemVer）的全项目版本管理体系，引入 `CHANGELOG.md` 与 `.github/workflows/release.yml` 自动化发布流。
- 数据库引入 Flyway 版本控制规范，Docker Compose 与 GitHub Actions CI/CD 流水线支持。

### 升级说明

- 本版本为 **v2.0.0 首次正式发布版本**，适合全新部署或初始化运行。

### Commits

- docs(agents): 补充 AI 全项目版本号计算与规范化 CHANGELOG 维护约束规则 ( ea6e1ce )
- feat(version): 建立全项目统一版本管理体系、CHANGELOG与自动生成GitHub Release工作流 ( df51442 )
- style(ui): 统一前台文章正文及评论区行内代码默认配色与后台保持100%一致 ( b0d5856 )
- style(ui): 优化前台文章正文阅读排版，调整行高与段落标题边距至紧凑舒适水准 ( 681ff16 )
- fix(ui): 修复前台文章详情页 blockquote 引用下方留白拉长问题 ( 56dafa8 )
- feat(editor): 优化编辑器图片交互，增加 Hover 悬浮编辑图标与 Modal 配置图片 URL 及删除弹窗 ( 046c6c2 )
- feat(editor): 支持图片无法显示时的提示卡片、替换链接与粘贴图片URL渲染 ( 827d69e )
- feat(editor): 增加富文本与行内代码调色盘支持，允许自由设置字色与高亮背景色 ( 4af4a19 )
- style(editor): 调整后台编辑器行内代码默认渲染配色 ( ee15760 )
