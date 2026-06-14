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
├── fronted/                              # 【前端】Next.js 15 + HeroUI (Next UI)
│
├── backend/                              # 【后端】Spring Boot 3.x（Java 21+）
```

### 文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `AGENTS.md` | AI 开发助手指引，定义技术栈（Next.js + SpringBoot + PostgreSQL）、开发规范与工作流程 |
| `DIRECTORY.md` | 项目目录结构文档，随目录变化同步更新 |
| `fronted/` | 前端项目根目录，基于 Next.js 15 + HeroUI，使用 pnpm 管理依赖 |
| `backend/` | 后端项目根目录，基于 Spring Boot 3.x + PostgreSQL，遵循三层分层架构 |

> **注意**：带 `...` 的目录表示后续按需扩展，目录结构遵循大厂开发规范，保持严格约束。

---

*最后更新：2026-06-14*
