# 友链页面功能设计文档

## 1. 设计理念

### 1.1 核心概念
- **创意来源**：将传统友链列表转化为「友链大树」的视觉呈现
- **视觉隐喻**：大树象征博客生态，枝叶代表各位博主，根系相连
- **交互体验**：用户可以「种树」、「浇水」（互动），让友链生态更加生动

### 1.2 页面风格
- 保持与现有用户端一致的「静谧深海」视觉风格
- 融入自然元素：树叶纹理、阳光光斑、风吹摇曳动画
- 保持高信息密度，避免过度留白

---

## 2. 页面结构

### 2.1 路由配置
```
/friend          → 友链大树页面（主入口）
/friend/apply   → 申请友链页面
```

### 2.2 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  Navbar (固定顶部)                                       │
├─────────────────────────────────────────────────────────┤
│  Hero 区域                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🌳 友链大树                                      │   │
│  │  "在这里，与志同道合的朋友相遇"                    │   │
│  │  向下滚动探索更多友链 ↓                           │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  大树可视化区域                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │        🍃        🍃        🍃                    │   │
│  │     ┌───┐    ┌───┐    ┌───┐                     │   │
│  │     │友链│    │友链│    │友链│   ← 友链卡片      │   │
│  │     └───┘    └───┘    └───┘      (作为树叶)     │   │
│  │                                                  │   │
│  │           ╱╲      ╱╲      ╱╲                      │   │
│  │          ╱  ╲    ╱  ╲    ╱  ╲                     │   │
│  │         ╱    ╲  ╱    ╲  ╱    ╲   ← 树干/树枝     │   │
│  │        ╱      ╲╱      ╲╱      ╲                   │   │
│  │              🌳 大树主体                          │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  友链分类筛选                                            │
│  [全部] [技术博客] [设计创意] [生活记录] [个人站点]       │
├─────────────────────────────────────────────────────────┤
│  申请友链按钮                                            │
│  ┌─────────────────────┐                                │
│  │  🌱 申请加入友链大家庭  │  → 跳转 /friend/apply      │
│  └─────────────────────┘                                │
├─────────────────────────────────────────────────────────┤
│  Footer                                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 功能模块

### 3.1 友链展示（核心功能）

#### 大树可视化
- **树干**：SVG 绘制的艺术化树干，作为页面视觉中心
- **树枝**：从树干延伸出的枝条，作为友链分类的视觉分区
- **树叶**：每个友链以「树叶」形态呈现，悬挂在枝条上
- **树叶动画**：
  - 轻微风吹摇曳效果（CSS animation）
  - Hover 时放大并显示详细信息
  - 点击跳转到对方博客

#### 友链卡片（树叶形态）
```
┌────────────────────────┐
│   🖼️ 头像/图标          │
│   博客名称             │
│   简介文字...          │
│   ─────────────       │
│   🔗 访问博客          │
└────────────────────────┘
```

### 3.2 友链分类
- 预设分类：技术博客、设计创意、生活记录、个人站点
- 点击分类筛选，大树高亮对应区域的友链
- 分类使用标签样式，平铺在页面中

### 3.3 申请友链（/friend/apply）

#### 申请表单字段
| 字段 | 类型 | 说明 |
|------|------|------|
| 博客名称 | 必填 | 对方博客的名称 |
| 博客地址 | 必填 | URL |
| 头像URL | 选填 | 对方头像图片地址 |
| 简介 | 必填 | 一句话介绍 |
| 分类 | 必选 | 所属分类 |
| 邮箱 | 必填 | 联系方式（不公开） |
| 备注 | 选填 | 留言 |

#### 申请流程
1. 用户填写申请表单
2. 提交后进入「待审核」状态
3. 后台管理员审核通过后，前台显示

### 3.4 后台管理

#### 管理页面
- 路径：`/admin/friends` 或 `/admin/links`
- 功能：
  - 查看所有友链申请
  - 审核通过/拒绝
  - 编辑友链信息
  - 调整展示顺序（拖拽排序）
  - 删除友链

---

## 4. 数据库设计

### 4.1 友链表 (blog_friend_link)

```sql
CREATE TABLE IF NOT EXISTS blog_friend_link (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,        -- 博客名称
    url             VARCHAR(500)    NOT NULL,        -- 博客地址
    avatar_url      VARCHAR(500),                    -- 头像URL
    description     VARCHAR(255),                    -- 简介描述
    category        VARCHAR(50)     NOT NULL,        -- 分类: TECH|DESIGN|LIFE|PERSONAL
    email           VARCHAR(100),                    -- 邮箱（不公开）
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING|APPROVED|REJECTED
    sort_order      INTEGER         DEFAULT 0,       -- 排序
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP                       -- 软删除
);

COMMENT ON TABLE blog_friend_link IS '友链表 — 存储友链信息';
```

### 4.2 分类枚举
| 值 | 说明 |
|----|------|
| TECH | 技术博客 |
| DESIGN | 设计创意 |
| LIFE | 生活记录 |
| PERSONAL | 个人站点 |

---

## 5. API 设计

### 5.1 前台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/friends | 获取已批准的友链列表 |
| GET | /api/friends/:id | 获取单个友链详情 |
| POST | /api/friends/apply | 申请友链 |

### 5.2 后台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/friends | 获取所有友链（含待审核） |
| PUT | /api/admin/friends/:id | 更新友链信息 |
| PATCH | /api/admin/friends/:id/status | 审核通过/拒绝 |
| DELETE | /api/admin/friends/:id | 删除友链 |

---

## 6. 前端组件设计

### 6.1 页面组件
- `FriendPage` - 友链大树主页
- `FriendApplyPage` - 申请友链页面

### 6.2 业务组件
- `FriendTree` - 大树可视化组件
- `FriendLeaf` - 友链卡片（树叶形态）
- `FriendCategoryFilter` - 分类筛选组件
- `FriendApplyForm` - 申请表单组件

### 6.3 组件层级
```
FriendPage
├── Navbar
├── HeroSection (友链标题)
├── FriendTree (大树可视化)
│   ├── TreeTrunk (树干 SVG)
│   ├── TreeBranch (树枝)
│   └── FriendLeaf[] (友链卡片)
├── FriendCategoryFilter (分类筛选)
├── ApplyButton (申请按钮)
└── Footer
```

---

## 7. 视觉设计细节

### 7.1 色彩方案
- 主色调：保持与现有页面一致的 `#09B38A` (品牌绿)
- 树干：深棕色 `#5D4037` → `#8D6E63`
- 树叶：根据分类使用不同绿色渐变
  - 技术博客： `#4CAF50` → `#81C784`
  - 设计创意： `#009688` → `#4DB6AC`
  - 生活记录： `#8BC34A` → `#AED581`
  - 个人站点： `#FF9800` → `#FFB74D`

### 7.2 动画效果
- **风吹树叶**：使用 CSS `transform: rotate()` 配合 `animation` 实现轻微摇摆
- **Hover 放大**：`scale(1.1)` + `transition: all 0.3s ease`
- **页面加载**：树叶依次淡入 (`fadeInUp`)，模拟生长过程
- **点击涟漪**：点击时产生涟漪扩散效果

### 7.3 响应式适配
- **桌面端**：大树居中，友链均匀分布在树枝两侧
- **平板端**：大树缩小，友链纵向排列
- **手机端**：改为列表式展示（保留树叶形态作为列表项图标）

---

## 8. 实现优先级

### Phase 1：核心功能
1. 数据库表创建
2. 后台友链管理 CRUD
3. 前台友链列表展示（列表形式）
4. 申请友链表单

### Phase 2：视觉升级
1. 大树可视化组件
2. 友链卡片改为树叶形态
3. 分类筛选功能
4. 动画效果

### Phase 3：优化完善
1. 响应式适配
2. 性能优化
3. SEO 优化

---

## 9. 待确认事项

1. **友链数量预期**：预计会有多少友链？（影响大树展示方式）
2. **是否需要审核**：申请后是否需要后台审核？
3. **是否开放自助管理**：博主是否可以自行修改友链信息？
4. **是否需要交换链接检测**：自动检测对方是否已链接本站？

---

## 10. 技术栈

- **前端**：Next.js 14 + React + Tailwind CSS + GSAP 动画
- **后端**：Spring Boot 3.x + JPA
- **数据库**：PostgreSQL
- **图标**：Lucide React
- **动画**：GSAP + CSS Animation

---

## 11. SVG 大树动画详细设计

### 11.1 大树结构 SVG

```svg
<svg viewBox="0 0 800 600" className="friend-tree">
  <defs>
    <!-- 渐变定义 -->
    <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#5D4037" />
      <stop offset="50%" style="stop-color:#8D6E63" />
      <stop offset="100%" style="stop-color:#5D4037" />
    </linearGradient>
    
    <!-- 树叶发光滤镜 -->
    <filter id="leafGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 根系（装饰性） -->
  <g className="tree-roots">
    <path d="M400,550 Q350,580 300,570" stroke="#8D6E63" stroke-width="8" fill="none" className="root-line"/>
    <path d="M400,550 Q450,580 500,570" stroke="#8D6E63" stroke-width="8" fill="none" className="root-line"/>
  </g>

  <!-- 树干 -->
  <g className="tree-trunk">
    <path d="M380,550 Q360,450 370,350 Q380,250 400,200 Q420,250 430,350 Q440,450 420,550 Z" 
          fill="url(#trunkGradient)" className="trunk"/>
  </g>

  <!-- 树枝（左侧） -->
  <g className="tree-branch-left">
    <path d="M380,300 Q300,280 200,250" stroke="#6D4C41" stroke-width="12" fill="none" className="branch"/>
    <path d="M380,350 Q320,330 250,320" stroke="#6D4C41" stroke-width="10" fill="none" className="branch"/>
  </g>

  <!-- 树枝（右侧） -->
  <g className="tree-branch-right">
    <path d="M420,300 Q500,280 600,250" stroke="#6D4C41" stroke-width="12" fill="none" className="branch"/>
    <path d="M420,350 Q480,330 550,320" stroke="#6D4C41" stroke-width="10" fill="none" className="branch"/>
  </g>

  <!-- 友链卡片（树叶形态）- 动态挂载 -->
  <g className="friend-leaves">
    <!-- 友链 A -->
    <g className="friend-leaf" transform="translate(180, 230)">
      <path d="M0,0 Q15,-20 30,0 Q15,20 0,0" fill="#4CAF50" filter="url(#leafGlow)"/>
    </g>
    <!-- 更多友链... -->
  </g>

  <!-- 落叶粒子 -->
  <g className="falling-leaves">
    <path className="leaf-particle" d="M0,0 Q5,-5 10,0 Q5,5 0,0" fill="#81C784">
      <animateTransform attributeName="transform" type="translate" 
        from="100,-20" to="100,650" dur="8s" repeatCount="indefinite"/>
    </path>
  </g>
</svg>
```

### 11.2 动画效果实现

#### 11.2.1 风吹树叶摇摆
```css
/* 树叶摇摆动画 */
.friend-leaf {
  transform-origin: center bottom;
  animation: leafSway 3s ease-in-out infinite;
  animation-delay: var(--sway-delay, 0s);
}

@keyframes leafSway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* 随机延迟，制造自然感 */
.friend-leaf:nth-child(1) { --sway-delay: 0s; }
.friend-leaf:nth-child(2) { --sway-delay: 0.3s; }
.friend-leaf:nth-child(3) { --sway-delay: 0.6s; }
```

#### 11.2.2 树干轻微摇摆
```css
.tree-trunk, .tree-branch-left, .tree-branch-right {
  transform-origin: bottom center;
  animation: trunkSway 5s ease-in-out infinite;
}

@keyframes trunkSway {
  0%, 100% { transform: rotate(-0.5deg); }
  50% { transform: rotate(0.5deg); }
}
```

#### 11.2.3 落叶飘落效果
```css
.leaf-particle {
  opacity: 0;
  animation: leafFall 10s linear infinite;
}

@keyframes leafFall {
  0% {
    transform: translate(0, -20px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--fall-x, 50px), 650px) rotate(720deg);
    opacity: 0;
  }
}

/* 多片叶子，不同轨迹 */
.leaf-particle:nth-child(1) {
  animation-delay: 0s;
  --fall-x: 30px;
}
.leaf-particle:nth-child(2) {
  animation-delay: 3s;
  --fall-x: -20px;
}
.leaf-particle:nth-child(3) {
  animation-delay: 6s;
  --fall-x: 50px;
}
```

#### 11.2.4 阳光光斑效果
```css
.sun-ray {
  animation: sunPulse 4s ease-in-out infinite;
}

@keyframes sunPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
```

#### 11.2.5 页面加载生长动画
```javascript
// GSAP 动画
import gsap from 'gsap'

// 树干生长
gsap.from('.tree-trunk path', {
  scaleY: 0,
  transformOrigin: 'bottom center',
  duration: 1.5,
  ease: 'power2.out'
})

// 树枝展开
gsap.from('.branch', {
  strokeDasharray: 500,
  strokeDashoffset: 500,
  duration: 1,
  delay: 0.5,
  ease: 'power2.out'
})

// 友链树叶依次出现
gsap.from('.friend-leaf', {
  scale: 0,
  opacity: 0,
  duration: 0.5,
  stagger: 0.1,
  delay: 1,
  ease: 'back.out(1.7)'
})
```

### 11.3 交互效果

#### 11.3.1 Hover 放大效果
```css
.friend-leaf {
  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}

.friend-leaf:hover {
  transform: scale(1.3) rotate(5deg);
  filter: url(#leafGlow) brightness(1.2);
}
```

#### 11.3.2 点击涟漪效果
```tsx
const handleLeafClick = (friend: FriendLink) => {
  // 创建涟漪元素
  const ripple = document.createElement('div')
  ripple.className = 'leaf-ripple'
  document.body.appendChild(ripple)
  
  // 动画后移除
  setTimeout(() => ripple.remove(), 1000)
  
  // 跳转
  window.open(friend.url, '_blank')
}
```

### 11.4 季节主题切换（扩展功能）

```css
/* 春季 - 嫩绿 */
.season-spring .friend-leaf { fill: #81C784; }

/* 夏季 - 深绿 */
.season-summer .friend-leaf { fill: #4CAF50; }

/* 秋季 - 金黄 */
.season-autumn .friend-leaf { fill: #FFB74D; }

/* 冬季 - 简约 */
.season-winter .friend-leaf { fill: #BDBDBD; }
```

### 11.5 性能优化

| 优化项 | 方案 |
|--------|------|
| SVG 渲染 | 使用 `will-change: transform` 开启 GPU 加速 |
| 动画数量 | 限制同时动画元素不超过 20 个 |
| 落叶效果 | 使用 CSS 动画而非 JS，减少重排 |
| 懒加载 | 友链数据使用 IntersectionObserver 懒加载 |
| 移动端 | 减少动画复杂度，关闭落叶效果 |

---

## 12. 实现检查清单

### 后端
- [ ] 创建 `blog_friend_link` 数据库表
- [ ] 创建 FriendLink 实体类
- [ ] 创建 FriendLinkRepository
- [ ] 创建 FriendLinkService + FriendLinkServiceImpl
- [ ] 创建 FriendLinkController (前台 API)
- [ ] 创建 AdminFriendLinkController (后台 API)
- [ ] 配置 SecurityConfig 放行前台友链接口

### 前台
- [ ] 创建 `/friend/page.tsx` 友链主页
- [ ] 创建 `/friend/apply/page.tsx` 申请页面
- [ ] 创建 `FriendTree.tsx` 大树 SVG 组件
- [ ] 创建 `FriendLeaf.tsx` 友链卡片组件
- [ ] 实现分类筛选功能
- [ ] 实现申请表单
- [ ] 添加动画效果
- [ ] 响应式适配

### 后台
- [ ] 创建 `/admin/friends/page.tsx` 管理页面
- [ ] 实现友链 CRUD
- [ ] 实现审核功能
- [ ] 实现拖拽排序