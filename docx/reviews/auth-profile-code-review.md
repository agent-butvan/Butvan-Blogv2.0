# Code Review：后台个人中心（feat/auth）

> **审查提交**：`73a0190` — `feat(auth): 新增后台个人中心，支持当前账号资料维护与密码修改`  
> **审查日期**：2026-06-19  
> **审查范围**：15 个文件（后端 Auth 接口、前端个人中心页、布局入口组件）

---

## 一、变更概览

### 1.1 后端

| 模块 | 变更内容 |
|------|----------|
| DTO/VO | 新增 `CurrentUserUpdateDTO`、`PasswordChangeDTO`、`CurrentUserVO`；`LoginVO` 增加 `email` 字段 |
| Controller | `AuthController` 新增 `GET /api/auth/me`、`PUT /api/auth/me/profile`、`PUT /api/auth/me/password` |
| Service | `AuthServiceImpl` 实现资料查询/更新、密码修改；登录时写入 `lastLoginAt` |

### 1.2 前端

| 模块 | 变更内容 |
|------|----------|
| 页面 | 新增 `/profile` 个人中心（资料、安全、绑定三个 Tab） |
| 组件 | 新增 `AccountSummary` 侧边栏账号摘要；`TopBar` / `MobileRightPanel` 入口调整 |
| API | 新增 `account-api.ts`；扩展 `auth.ts` 中 `AuthUser` 类型 |

### 1.3 鉴权设计（合理）

- `/api/auth/register`、`/api/auth/login` 为公开接口
- `/api/auth/me*` 由 `SecurityConfig` 的 `anyRequest().authenticated()` 保护，需携带有效 JWT
- `findActiveUser` 对 `DISABLED` 账号返回 403，与登录拦截逻辑一致

---

## 二、问题清单（按优先级）

### 🔴 高优先级

#### 2.1 两套「邮箱」字段，存在数据不一致风险

项目中存在两个不同的邮箱概念：

| 入口 | API | 存储位置 | 用途 |
|------|-----|----------|------|
| 个人中心 → 账号绑定 | `PUT /api/auth/me/profile` | `blog_user.email` | 账号绑定邮箱 |
| 系统设置 → 博主公开名片 | `PUT /api/admin/profile` | `socialLinks.email`（JSONB） | 前台公开展示邮箱 |

同时，`nickname` / `avatarUrl` / `bio` 也可在 `/profile` 与 `/settings` 两处修改，均写入 `blog_user` 表，但邮箱走不同字段。用户可能在两处看到不同邮箱，改一处不会同步另一处。

**建议**：

- UI 明确区分「登录绑定邮箱」与「公开展示邮箱」
- 或统一数据源并建立同步策略

---

#### 2.2 布局组件资料更新后不会刷新

`AccountSummary`、`TopBar`、`MobileRightPanel` 仅在组件挂载时从 `localStorage` 读取一次用户信息。个人中心保存后虽调用 `setUser(updatedUser)` 更新了本地存储，但上述组件不会重新读取，侧边栏/顶栏的头像、昵称、邮箱会保持旧值，直到整页刷新。

**涉及文件**：

- `fronted/blog-admin/src/components/layout/AccountSummary.tsx`
- `fronted/blog-admin/src/components/layout/TopBar.tsx`
- `fronted/blog-admin/src/components/layout/MobileRightPanel.tsx`

**建议**：使用 Context、自定义事件，或在路由/存储变更时触发重新 `getUser()`。

---

#### 2.3 改密后旧 JWT 仍然有效

`changePassword` 仅更新数据库中的密码哈希，不使已有 Token 失效。若 Token 曾泄露，改密无法立即阻断访问。前端已在安全设置 Tab 提示该行为，但安全风险仍存在。

**建议**：

- 引入 `tokenVersion` 字段或 Token 黑名单机制
- 至少在前端改密成功后强制清除 Token 并跳转登录页

---

### 🟡 中优先级

#### 2.4 头像 URL 硬编码 `localhost:8080`

`AccountSummary.tsx` 与 `profile/page.tsx` 中的 `resolveAvatarUrl` 对相对路径拼接了固定地址：

```ts
return avatarUrl.startsWith("/") ? `http://localhost:8080${avatarUrl}` : avatarUrl;
```

生产环境若 API 不在 `localhost:8080`，相对路径头像会加载失败。项目已有 `NEXT_PUBLIC_API_BASE_URL`，应复用同一配置。

---

#### 2.5 新接口缺少测试覆盖

`AuthControllerTest` 仅覆盖 `register` / `login`，未覆盖：

- `GET /api/auth/me`
- `PUT /api/auth/me/profile`（邮箱唯一性、昵称校验、清空邮箱）
- `PUT /api/auth/me/password`（当前密码错误、新旧相同）

**建议**：至少补充集成测试，覆盖鉴权、校验失败与成功路径。

---

#### 2.6 邮箱唯一性存在竞态，可能返回 500

业务层通过 `findByEmail` 做唯一性检查，但数据库 `blog_user.email` 有唯一约束。并发绑定同一邮箱时，可能抛出 `DataIntegrityViolationException`，被全局异常处理器当作未知异常返回 500，而非友好的 400 提示。

---

#### 2.7 拉取资料失败时页面仍可操作

`fetchCurrentUser` 失败时仅 toast 提示，`currentUser` 为 `null`，页面仍渲染空表单，用户可能误以为可以保存。

**建议**：展示错误态 + 重试按钮，或重定向至登录页。

---

#### 2.8 `/settings` 与 `/profile` 职责重叠

| 页面 | 路径 | 主要能力 |
|------|------|----------|
| 个人中心 | `/profile` | 账号资料、改密、绑定状态 |
| 系统设置 | `/settings` | 博主公开名片、社交链接、页脚信息 |

两者均可修改昵称、头像、简介，长期易造成用户认知混乱（与 2.1 相关）。

---

### 🟢 低优先级

| # | 问题 | 说明 |
|---|------|------|
| 2.9 | 顶栏/移动端入口行为变化 | 原「个人设置」跳转 `/settings`，现改为 `/profile`；系统设置入口仅剩侧边栏导航与首页快捷入口 |
| 2.10 | 前后端校验不一致 | 后端 `nickname` 要求 2–50 字符，前端只校验非空 |
| 2.11 | `avatarUrl` 缺少服务端格式校验 | 可写入任意字符串，存在异常资源加载隐患 |
| 2.12 | 改密接口无速率限制 | `PUT /api/auth/me/password` 可被暴力尝试当前密码 |
| 2.13 | 代码重复 | `resolveAvatarUrl` 在两处各有一份，可抽到 `lib` 复用 |

---

## 三、做得好的地方

- `/api/auth/me*` 鉴权设计合理，未误加入 `permitAll`
- 邮箱唯一性、密码校验、空白字段规整等业务逻辑较完整
- 登录时更新 `lastLoginAt`，个人中心可展示最近登录时间
- 前端 dirty 状态、密码确认、头像上传流程完整
- `DIRECTORY.md` 已同步更新目录结构

---

## 四、测试缺口汇总

| 场景 | 状态 |
|------|------|
| 未登录访问 `/me` | ❌ 未测 |
| 资料更新成功 / 校验失败 | ❌ 未测 |
| 邮箱冲突 | ❌ 未测 |
| 改密成功 / 当前密码错误 | ❌ 未测 |
| 保存后侧边栏资料同步 | ❌ 未测（当前存在 bug） |
| 非 localhost 环境头像显示 | ❌ 未测 |

---

## 五、修复建议优先级

| 优先级 | 建议动作 |
|--------|----------|
| P0 | 澄清双邮箱/双入口数据模型，避免用户困惑与数据分叉 |
| P0 | 修复布局组件（侧边栏/顶栏）资料不同步问题 |
| P1 | 头像 URL 改用环境变量，去除 `localhost` 硬编码 |
| P1 | 补充 `/me` 系列接口集成测试 |
| P2 | 改密后 Token 失效策略 |
| P2 | 资料加载失败时的错误态处理 |
| P3 | 前后端校验对齐、改密限流、`resolveAvatarUrl` 抽取复用 |

---

## 六、相关文件索引

### 后端

```
backend/blog-pojo/src/main/java/com/butvan/blog/pojo/dto/auth/CurrentUserUpdateDTO.java
backend/blog-pojo/src/main/java/com/butvan/blog/pojo/dto/auth/PasswordChangeDTO.java
backend/blog-pojo/src/main/java/com/butvan/blog/pojo/vo/auth/CurrentUserVO.java
backend/blog-pojo/src/main/java/com/butvan/blog/pojo/vo/auth/LoginVO.java
backend/blog-service/src/main/java/com/butvan/blog/service/controller/AuthController.java
backend/blog-service/src/main/java/com/butvan/blog/service/service/AuthService.java
backend/blog-service/src/main/java/com/butvan/blog/service/service/impl/AuthServiceImpl.java
backend/blog-service/src/test/java/com/butvan/blog/service/controller/AuthControllerTest.java
```

### 前端

```
fronted/blog-admin/src/app/(dashboard)/profile/page.tsx
fronted/blog-admin/src/components/layout/AccountSummary.tsx
fronted/blog-admin/src/components/layout/MobileRightPanel.tsx
fronted/blog-admin/src/components/layout/Sidebar.tsx
fronted/blog-admin/src/components/layout/TopBar.tsx
fronted/blog-admin/src/lib/account-api.ts
fronted/blog-admin/src/lib/auth.ts
```

### 关联（职责重叠）

```
fronted/blog-admin/src/app/(dashboard)/settings/page.tsx
backend/blog-service/src/main/java/com/butvan/blog/service/controller/ProfileController.java
backend/blog-service/src/main/java/com/butvan/blog/service/service/impl/ProfileServiceImpl.java
```

---

## 七、总结

个人中心功能主干可用，鉴权与核心业务校验基本到位。上线前建议优先处理：**双邮箱/双入口数据模型澄清**、**布局组件资料不同步**、**头像 URL 环境硬编码**，并补充 `/me` 系列接口测试。安全方面，改密后 Token 不失效是当前最明显的缺口。
