## 项目目录详细说明

```
Butvan Blog2.0/                           # 项目根目录
│
├── AGENTS.md                             # 项目 AI 开发指引文档（技术栈、规范、工作流）
├── DIRECTORY.md                          # 项目目录结构说明文档（本文件）
├── PRODUCT.md                            # 产品开发迭代需求文档 (v0.1)
├── fWdgJuAOF.jpeg                        # Cozy Room 场景默认高清背景图
│
├── design-system/                        # 统一 UI/UX 风格设计系统
│   └── butvan-blog/
│       └── MASTER.md                     # 统一规范：静谧深海（Quiet Deep Sea）色彩、排版、效果规则
│
├── docx/                                 # 配色与沉淀文档
│   ├── COLORS.md                         # 配色参考方案（9种冷暖主题色）
│   └── THINKING.md                       # 产品最初构想与沉浸式房间跳转逻辑
│
├── fronted/                              # 【前端】Next.js 16 + HeroUI v3 + Tailwind v4
│   │
│   ├── blog-client/                      # 用户展示端项目
│   │   └── src/app/
│   │       ├── globals.css               # 全局样式：引入Google高级字体、静谧深海色彩与发光阴影定义
│   │       ├── layout.tsx                # 根布局：配置Archivo/Space Grotesk字体，消除水合 mismatch 警告
│   │       ├── page.tsx                  # 前台首页：响应式SVG百分比热区、镜头平滑拉近动效与展示面板
│   │       └── providers.tsx             # 兼容包装器（配合无Provider化的HeroUI v3）
│   │
│   └── blog-admin/                       # 管理后台项目
│       └── src/app/
│           ├── globals.css               # 全局样式与自定义配色定义
│           ├── layout.tsx                # 根布局配置与水合警告消除
│           ├── page.tsx                  # 热区编辑器：鼠标拖拽框选、百分比换算、属性编辑面板与JSON预览
│           └── providers.tsx             # 兼容包装器
│
└── backend/                              # 【后端】Spring Boot 3.2 + JPA + PostgreSQL
    ├── pom.xml                           # Maven 多模块父工程 POM
    ├── schema.sql                        # PostgreSQL 数据库表结构及演示数据初始化脚本
    │
    ├── blog-common/                      # 通用工具子模块
    │   └── src/main/java/com/butvan/blog/common/
    │       ├── exception/
    │       │   └── BaseException.java    # 自定义全局业务异常基类
    │       ├── handler/
    │       │   └── GlobalExceptionHandler.java # REST接口全局异常拦截处理（支持业务异常与入参校验异常）
    │       └── result/
    │           └── Result.java           # 统一 JSON 返回对象包装器（code, msg, data）
    │
    ├── blog-pojo/                        # 数据模型子模块
    │   └── src/main/java/com/butvan/blog/pojo/
    │       ├── entity/
    │       │   ├── Scene.java            # 首页场景数据库映射实体（表：blog_homepage_scene）
    │       │   └── Hotspot.java          # 场景交互热区映射实体（表：blog_homepage_hotspot，JSONB存坐标）
    │       └── vo/
    │           └── SceneDetailVO.java    # 场景明细展示VO（聚合背景图和其名下的热区列表）
    │
    └── blog-service/                     # 主业务服务子模块
        └── src/main/java/com/butvan/blog/service/
            ├── BlogApplication.java      # 主启动类（开启多包扫描、Entity与Repository扫描）
            ├── controller/
            │   └── SceneController.java  # 场景与热区 RESTful CRUD 控制层接口（跨域支持）
            ├── repository/
            │   ├── SceneRepository.java  # 场景数据库 JPA 仓储接口
            │   └── HotspotRepository.java # 热区数据库 JPA 仓储接口
            └── service/
                ├── SceneService.java     # 首页场景业务抽象接口
                └── impl/
                    └── SceneServiceImpl.java # 首页场景与热区 CRUD 核心逻辑实现（事务管理）
```

---

### 核心文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `AGENTS.md` | AI 助手规范指引，记录开发流程、规范与约束 |
| `PRODUCT.md` | 产品定义及版本计划需求文档 |
| `docx/` | 存储最初的想法文档与颜色配色选择方案 |
| `design-system/` | 存储项目的 UI/UX MASTER 规范细节 |
| `fronted/blog-client/src/app/page.tsx` | 前台主页组件，包含 SVG 热区高亮发光、光标跟随 Tooltip 及镜头拉近动效 |
| `fronted/blog-admin/src/app/page.tsx` | 热区编辑组件，支持鼠标框选生成百分比热区、热区管理和参数修改表单 |
| `backend/schema.sql` | 包含完整表创建（DDL）、外键级联以及演示测试场景热区初始化数据 |
| `backend/blog-common/.../GlobalExceptionHandler.java` | 全局捕获异常并映射为统一 Result 结构，输出清晰的报错日志 |
| `backend/blog-pojo/.../Hotspot.java` | 热区实体模型，采用 Hibernate 6 的 `@JdbcTypeCode(SqlTypes.JSON)` 映射 JSONB 热区定位 |
| `backend/blog-service/.../BlogApplication.java` | 启动入口类，显式指定 JPA 扫描包，支持加载独立 Pojo 模块中的数据库实体 |
| `backend/blog-service/.../SceneController.java` | 提供针对场景与热区的所有操作 API 接口，并添加跨域支持方便前后端联调 |

> **注意**：目录结构遵循大厂开发规范，非核心文件/目录（如 `node_modules`、`.idea`、`target` 等）已进行忽略。

---

*最后更新：2026-06-14*
