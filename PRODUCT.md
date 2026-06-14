## v0.1
- 先搭建起整个项目的架子，然后规划好项目目录结构的设计
- 初始化git仓库
- 后端需要使用三个模块，service：主业务层，common：通用层，pojo：数据模型层
- 前端需要初始化好俩个端的项目，用户端、管理端
- 设计，前端ui ux风格，我的要求：简约、高级、大厂风格、颜色干净
- 实现图片物品编辑，和在用户端展示

## v0.2
### 核心交互升级：抠图切片悬浮法 (PNG Sprite Overlay)
v0.2 放弃原先单纯的多边形轮廓发光，转为实现**物理上真正的物品悬浮/漂浮效果**。通过将可交互物品做透明抠图（PNG），重叠在房间背景图上方。当鼠标 hover 时，该物品会脱离背景微微浮起，产生逼真的空间立体交互感。

#### 1. 前端展示端 (`blog-client`) 升级
- **多图层渲染架构**：
  - 容器设为 `relative`，底层为去除了可交互物品（或虚化）的房间背景底图。
  - 上层通过绝对定位（百分比坐标）叠放各物品的透明背景 `.png` 切片元素。
- **物理悬浮动效**：
  - 鼠标悬浮在物品 PNG 上时，应用 CSS 变换：`transform: translateY(-8px) scale(1.03)`（配合 `cubic-bezier(0.25, 0.8, 0.25, 1)` 曲线）。
  - 应用多重滤镜：`filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.45)) drop-shadow(0 0 10px rgba(114, 123, 186, 0.6))`。下层产生真实避光投影，边缘亮起静谧深海色彩微光。
- **拉近过渡动画**：
  - 点击物品后，整个容器进行缩放和平移（`scale` 和 `translate`），且 PNG 物品与背景图必须保持 100% 对齐。

#### 2. 后端模型扩展 (`backend`)
- **热区表 `blog_homepage_hotspot` 字段扩充**：
  - `item_image_url VARCHAR(255)`: 存储抠图后的透明 PNG 物品文件地址。
  - `width_percent DECIMAL(5, 2)`: 该 PNG 物品在背景图中的百分比宽度。
  - `x_percent DECIMAL(5, 2)`: 在背景图中的百分比 X 起点坐标。
  - `y_percent DECIMAL(5, 2)`: 在背景图中的百分比 Y 起点坐标。

#### 3. 后台管理端 (`blog-admin`) 升级
- **场景底图上传**：支持上传主背景底图。
- **可视化物品拼贴器 (Sprite Placer)**：
  - 配置热区时，管理员除了配置文案和跳转链接，还可以直接上传物品抠图 PNG。
  - 支持在背景图画布上，通过鼠标**拖拽移动**和**拉伸缩放**将该 PNG 贴图精准放置到背景图中的相应位置。
  - 自动换算 PNG 图层的位置及大小为 `{x_percent, y_percent, width_percent}`，保存到后端数据库中。
## v0.3
### 场景编辑器重构：框选自动裁剪工作流 (Box-Select & Auto-Crop)

v0.3 重构管理端的场景物品配置流程，从「先抠图再拖放」升级为「**先框选自动裁剪，可选替换手动抠图**」的混合方案。

#### 核心思路
- 管理端在背景图上**拖拽框选物品区域** → 松开鼠标后，浏览器 Canvas API **自动裁剪**该区域 → 裁剪图作为 PNG 自动上传 → 自动创建热区物品记录
- 裁剪出的是矩形图片（非透明抠图），但放在原位时与背景**像素级完美融合**；hover 浮起时产生自然的空间深度效果
- 如需更纯净的悬浮效果，管理员可随时上传**手工抠好的透明 PNG** 替换自动裁剪图

#### 1. 管理端场景编辑器重构 (blog-admin)
- **新增编辑器组件** (components/editor/)：
  - SceneToolbar：模式切换工具栏。「选择编辑」模式（选中/拖拽/缩放已有热区）+ 「框选物品」模式（拖拽绘制矩形框选区）+ 「上传物品图」按钮（手动上传透明 PNG）
  - SceneCanvas：可视化画布。五层渲染：背景图 → 暗化遮罩 → 网格辅助线（绘制模式）→ 已保存热区（虚线框+物品图+缩放把手）→ 绘制中的蓝色虚线矩形（实时坐标标签）
  - HotspotPropertiesPanel：右侧属性面板。未选中时显示引导卡片；选中后展示物品图预览缩略图（含替换入口）、坐标编辑、跳转类型/目标、悬浮提示、缩放倍率、z-index、可见性、保存/删除
- **新增裁剪工具** (lib/canvas-crop.ts)：
  - cropImageFromBackground() 纯函数：百分比坐标 → 自然像素 → 离屏 Canvas drawImage → toBlob('image/png') → 返回 Blob 供上传
  - 自动处理跨域（crossOrigin='anonymous'）、最小裁剪尺寸保护
- **编辑器页面重构** (scenes/[id]/page.tsx)：
  - 编排框选工作流：handleDrawingComplete → 裁剪 → FormData 上传 → POST /admin/scenes/hotspots 创建热区 → 自动选中新热区 → 切回选择模式
  - 保留拖拽移动 / 拉伸缩放 / 保存 / 删除逻辑
  - 删除操作使用 ConfirmModal 二次确认弹窗
- **场景列表页改进** (scenes/page.tsx)：
  - 新增删除场景按钮 + ConfirmModal 确认弹窗 → DELETE /api/admin/scenes/{id}
  - 骨架屏加载占位（3 个脉冲卡片）替代纯 spinner
  - 优化空状态引导文案
- **新增动画** (globals.css)：
  - dashMove：虚线流动（marching ants，绘制矩形边框）
  - cropFlash：裁剪完成闪烁
  - drawPulse：框选模式按钮脉冲提示
  - skeletonPulse：骨架屏卡片呼吸

#### 2. 后端改动 (backend)
- **新增 DELETE /api/admin/scenes/{id}** 场景删除接口：
  - SceneController.deleteScene() 端点
  - SceneService 接口 + SceneServiceImpl 实现
  - HotspotRepository 新增 deleteBySceneId() 级联删除热区
  - @Transactional 保证原子性
- **数据模型零变更**：现有 Scene / Hotspot 表、DTO、VO 完全兼容新工作流
- **复用现有接口**：POST /api/admin/media/upload（裁剪 Blob 当普通文件上传）、POST /api/admin/scenes/hotspots（创建热区）

#### 3. 用户端 (blog-client)
- **无需改动**。现有首页 page.tsx 已用百分比绝对定位渲染热区，hover 浮起 + 投影发光 + 点击缩放覆盖层
- 自动裁剪的矩形物品：原位时与背景像素级吻合完美融合；hover 浮起 + scale(1.03) + 投影产生自然深度感
- 需更纯净悬浮效果时，管理员上传透明 PNG 即可无缝切换
