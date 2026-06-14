## 项目目录详细说明

```
Butvan Blog2.0/                           # 项目根目录
│
├── AGENTS.md                             # 项目 AI 开发指引文档
│                                          #   定义技术栈、开发规范、架构约束、工作流程
│
├── DIRECTORY.md                          # 项目目录结构说明文档（本文件）
│                                          #   随项目目录变化同步更新，记录每个文件/目录的用途
│
├── PRODUCT.md                            # 产品开发迭代需求文档 (v0.1)
│
├── fWdgJuAOF.jpeg                        # Cozy Room 场景默认高清背景图
│
├── design-system/                        # 统一 UI/UX 风格设计系统（静谧深海）
│
├── docx/                                 # 各种想法沉淀与配色文档 (THINKING.md / COLORS.md)
│
├── fronted/                              # 【前端】Next.js 16 + HeroUI v3 + Tailwind v4
│   ├── blog-client/                      #   用户展示端：沉浸式热区发光与镜头拉近跳转动画首页
│   └── blog-admin/                       #   管理后台：可视化热区框选及坐标计算器
│
└── backend/                              # 【后端】Spring Boot 3.2 + JPA + PostgreSQL Multi-Module
    ├── pom.xml                           #   Maven 多模块父级 POM 依赖管理
    ├── schema.sql                        #   PostgreSQL 数据库结构与初始化数据脚本
    ├── blog-common/                      #   通用工具层：Result封装、业务异常定义、全局异常处理器
    ├── blog-pojo/                        #   数据模型层：Scene/Hotspot 实体类及持久化 VO
    └── blog-service/                     #   主业务服务：启动入口、持久化仓储层、业务层、控制器接口
```

### 文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `AGENTS.md` | AI 开发助手指引，定义技术栈（Next.js + SpringBoot + PostgreSQL）、开发规范与工作流程 |
| `DIRECTORY.md` | 项目目录结构文档，随目录变化同步更新 |
| `PRODUCT.md` | 产品定义及版本计划需求文档 |
| `docx/` | 存储产品最初想法 `THINKING.md` 及配色方案 `COLORS.md` |
| `design-system/` | `ui-ux-pro-max` 针对博客项目持久化生成的 `MASTER.md` 页面设计规范 |
| `fronted/blog-client/` | 用户前台，Next.js App Router 架构，实现热区发光与 cubic-bezier 缓动拉近跳转动画 |
| `fronted/blog-admin/` | 后台管理，支持鼠标按压拖拽生成百分比坐标与表单参数编辑的热区编辑器 |
| `backend/blog-common/` | 基础包模块，统一 API 响应结果与 RestAdvice 全局异常映射处理 |
| `backend/blog-pojo/` | 实体类模型包，支持 PostgreSQL 的 JSONB 类型映射不规则图形顶点坐标 |
| `backend/blog-service/` | 核心实现与 Controller 控制入口，含跨域支持 (`@CrossOrigin`) |

> **注意**：目录结构遵循大厂开发规范，保持严格约束。

---

*最后更新：2026-06-14*

