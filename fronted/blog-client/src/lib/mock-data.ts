/**
 * 全局前台高保真 Mock 数据源
 * 实现了双通道降级机制下的备用离线数据加载，包含长文本 HTML 详情渲染
 */

export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string          // HTML 富文本正文
  coverImageUrl: string
  publishedAt: string
  viewCount: number
  isPinned: boolean
  isFeatured: boolean
  categoryId: number
  categoryName: string
  tags?: Array<{ id: number; name: string }>
  wordCount: number        // 字数
  readTime: number         // 预计阅读时间（分钟）
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '前端开发', slug: 'frontend' },
  { id: 2, name: '后端架构', slug: 'backend' },
  { id: 3, name: 'AI与算法', slug: 'ai-ml' },
  { id: 4, name: '随笔杂谈', slug: 'life' },
]

export const MOCK_TAGS: Tag[] = [
  { id: 1, name: 'Next.js', slug: 'nextjs' },
  { id: 2, name: 'Spring Boot', slug: 'springboot' },
  { id: 3, name: 'PostgreSQL', slug: 'postgresql' },
  { id: 4, name: 'TypeScript', slug: 'typescript' },
  { id: 5, name: 'CSS 魔法', slug: 'css-magic' },
]

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: '基于 Next.js 16 与 React 19 的个人博客 2.0 视觉重构实战',
    slug: 'nextjs-blog-visual-refactor',
    summary: '本文详细记录了如何利用 Next.js 极速渲染、React 19 的新特性以及透明 PNG 切片，物理重构一个具有沉浸式玻璃拟态效果的个人空间，分享关于镜头缩放与布局抖动优化的经验。',
    coverImageUrl: '/images/mock-cover-1.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    viewCount: 1540,
    isPinned: true,
    isFeatured: true,
    categoryId: 1,
    categoryName: '前端开发',
    tags: [
      { id: 1, name: 'Next.js' },
      { id: 4, name: 'TypeScript' }
    ],
    wordCount: 1980,
    readTime: 6,
    content: `
      <p>随着 React 19 的正式发布以及 Next.js 16 编译器（Turbopack / React Server Components）的彻底稳定，我开启了个人博客系统的 2.0 视觉与动效物理重构计划。这一次重构不仅是简单的 UI 升级，而是一次从内核加载、渲染策略到微交互动画的全面颠覆。</p>
      
      <h2 id="toc-0">一、 视觉设计系统的“去卡片化”与静谧深海美学</h2>
      <p>在 1.0 版本中，我们大量使用了圆角卡片、粗描边以及厚重的磨砂玻璃块，整个界面看起来略显局促且信息噪音大。在 2.0 的设计系统中，我确立了<strong>“静谧深海”</strong>设计语境：</p>
      <blockquote>
        “高级的设计往往需要剥离多余的容器，让文字和留白自己对话。留白不是空白，而是页面呼吸的轨道。”
      </blockquote>
      <p>我们调整了排版，采用纵向单栏人文流动排版，限制最大宽度为 <code>max-w-3xl</code>。所有列表卡片均取消了厚重的背景色，仅以柔和的极细边线分割。这不仅使阅读视线更加聚焦，还从视觉源头上给用户减负。</p>
      
      <h2 id="toc-1">二、 解决 React 19 / Next.js 16 的布局抖动问题</h2>
      <p>在使用客户端组件和 GSAP 错落动画时，最常见的痛点就是 <em>Hydration (水合) 过程中的布局闪烁与抖动</em>。为了解决页面二次加载导致滑块和目录突然跳跃的问题，我们实施了以下几点优化策略：</p>
      <h3 id="toc-2">1. 限制首入动画触发时机</h3>
      <p>页面的页头与过滤器仅在组件首次挂载（空依赖数组 <code>[]</code>）时由 GSAP 播放一次淡入动画，绝不随 'loading' 改变而反复触发清理（'ctx.revert()'），确保静止元素不受异步加载态干扰。</p>
      
      <h3 id="toc-3">2. 配合 transition-all 缓和过渡态</h3>
      <p>在切换分类和标签拉取数据时，我们不再用粗暴的中央大 Spinner 替代已有列表，而是给列表容器赋予 <code>transition-all duration-300</code> 样式。加载时将透明度降低至 <code>opacity-35</code> 伴随极轻微的模糊，让数据更新过程丝滑衔接。</p>
      
      <h2 id="toc-4">三、 高保真交互动效：GSAP 粒子与流体背景跟随</h2>
      <p>为了让极简的列表页更具活力，我们引入了<strong>流体背景跟随器 (Fluid Hover Effect)</strong>。其核心逻辑是通过 React 状态与 CSS Transition 打造一个跟随鼠标滚动的柔性背景：</p>
      
      <pre><code class="language-typescript">
// Fluid Hover State 定义
const [hoverStyle, setHoverStyle] = useState({ top: 0, height: 0, opacity: 0 });

const handleMouseEnter = (e: React.MouseEvent&lt;HTMLDivElement&gt;) => {
  const containerRect = containerRef.current.getBoundingClientRect();
  const targetRect = e.currentTarget.getBoundingClientRect();
  setHoverStyle({
    top: targetRect.top - containerRect.top,
    height: targetRect.height,
    opacity: 1
  });
};
      </code></pre>
      <p>配合 HSL 动态调色板以及 <code>cubic-bezier</code> 动画曲线，背景高亮滑块在不同文章高度间滑动时表现得如水流般轻盈灵动，给扁平的页面增添了十足的物理空间质感。</p>
    `
  },
  {
    id: 2,
    title: 'Spring Boot 3.2.5 多环境 YML 配置文件优雅拆解与规范',
    slug: 'springboot-yml-split-standard',
    summary: '随着项目模块的不断增多，单一的 application.yml 会变得越来越臃肿。本文教你如何运用 spring.config.import 将配置优雅地解耦成数据库、安全组件和客户端路由三个独立文件，确保核心结构一目了然。',
    coverImageUrl: '/images/mock-cover-2.jpg',
    publishedAt: '2026-06-14T08:30:00Z',
    viewCount: 890,
    isPinned: false,
    isFeatured: true,
    categoryId: 2,
    categoryName: '后端架构',
    tags: [
      { id: 2, name: 'Spring Boot' }
    ],
    wordCount: 1450,
    readTime: 5,
    content: `
      <p>在企业级微服务开发中，随着项目架构和第三方组件的逐步丰富，默认的 <code>application.yml</code> 很容易变得庞大无序，多达几百上千行。这不仅极大地增加了合并冲突的几率，也让新加入团队的开发者难以理清核心的配置层次。</p>
      
      <h2 id="toc-0">一、 配置臃肿的弊端与解耦思路</h2>
      <p>一个标准的 Spring Boot 工程通常包含数据库、缓存(Redis)、网关、安全框架(Spring Security / JWT)以及各类第三方推送等服务。如果在同一个配置文件中编写所有环境（dev、test、prod）的配置，代码的可读性和安全性将大打折扣。</p>
      <blockquote>
        大厂规范的核心是：职责单一、结构解耦。配置文件作为系统运行的底座，应当按模块物理分割，并按运行环境进行逻辑隔离。
      </blockquote>
      
      <h2 id="toc-1">二、 运用 Spring Boot 3.x 配置导入新特性</h2>
      <p>从 Spring Boot 2.4+ 开始，Spring 官方引入了全新的 <code>spring.config.import</code> 功能，它允许我们在核心配置文件中声明式导入其他任意位置的配置文件。这为我们的优雅拆解提供了坚实基础：</p>
      
      <pre><code class="language-yaml">
# application.yml 核心文件
spring:
  profiles:
    active: dev
  config:
    import:
      - optional:classpath:application-database.yml
      - optional:classpath:application-security.yml
      - optional:classpath:application-routes.yml
      </code></pre>
      
      <h2 id="toc-2">三、 路由表配置的热加载实践</h2>
      <p>我们将前端管理系统的树状路由配置清单解耦到了 <code>application-routes.yml</code> 中。系统可以通过以下 @ConfigurationProperties 完美映射到 Java VO 对象中，做到修改路由表无需修改任何 Java 实体代码：</p>
      <pre><code class="language-java">
@Configuration
@ConfigurationProperties(prefix = "blog")
@Data
public class BlogRouteProperties {
    private List&lt;RouteItem&gt; clientRoutes;
}
      </code></pre>
      <p>这样的设计不仅方便了运营端根据菜单栏动态跳转进行热区修正，也极大地提升了系统的易维护性。</p>
    `
  },
  {
    id: 3,
    title: 'PostgreSQL 16 高性能索引优化与 JSONB 复杂查询指南',
    slug: 'postgresql-jsonb-index-performance',
    summary: '结合个人书房系统的操作日志与热区配置扩展字段，深入解析 PostgreSQL 在 JSONB 高频读写及多路关联查询场景下的 GIN 索引设计与优化调优经验。',
    coverImageUrl: '',
    publishedAt: '2026-06-12T15:20:00Z',
    viewCount: 650,
    isPinned: false,
    isFeatured: false,
    categoryId: 2,
    categoryName: '后端架构',
    tags: [
      { id: 3, name: 'PostgreSQL' },
      { id: 4, name: 'TypeScript' }
    ],
    wordCount: 1720,
    readTime: 6,
    content: `
      <p>在现代关系型数据库中，JSON / JSONB 格式由于其极其自由的非结构化扩展能力，被广泛用于存储操作日志、变更快照、前端卡片热区等复杂字段。然而，许多工程师直接将 JSONB 当作普通文本进行存储，而忽略了 PostgreSQL 对半结构化数据提供的强力索引支持，导致查询效率低下。</p>
      
      <h2 id="toc-0">一、 JSONB 与 JSON 的本质区别</h2>
      <p>PostgreSQL 同时支持 <code>json</code> 和 <code>jsonb</code> 两种类型。简单来说：</p>
      <ul>
        <li><strong>json</strong>：以纯文本格式存储，插入快，但每次查询解析时都需要重新反序列化，读取慢。</li>
        <li><strong>jsonb</strong>：以二进制格式进行预解析存储，插入时有微弱开销，但支持在该字段上创建各类索引，读取与查找速度呈数量级提升。</li>
      </ul>
      
      <h2 id="toc-1">二、 针对复杂 JSONB 字段的 GIN 索引优化</h2>
      <p>当我们的数据库表中包含高频过滤 JSONB 属性的需求时（例如查找 <code>meta_data->'status' = 'ACTIVE'</code>），如果使用普通的 B-Tree 索引，是无法深入到 JSON 二进制结构内部的。我们必须选用 <strong>GIN (Generalized Inverted Index) 通用倒排索引</strong>：</p>
      
      <pre><code class="language-sql">
-- 为全表创建默认的 GIN 倒排索引
CREATE INDEX idx_scene_metadata_gin ON tb_scene USING gin (meta_data);

-- 仅对 JSONB 内部特定路径下的属性创建快速路径 GIN 索引（更省空间）
CREATE INDEX idx_scene_metadata_status ON tb_scene USING gin ((meta_data -> 'status'));
      </code></pre>
      
      <h2 id="toc-2">三、 执行计划分析与基准调优</h2>
      <p>通过执行 <code>EXPLAIN ANALYZE</code> 命令，我们可以确认数据库是进行全表扫描（Seq Scan）还是走我们刚刚创建的索引扫描（Bitmap Index Scan）。通过精确设计单路和复合索引，能够将百万级数据下的 JSON 嵌套关联检索时间从 500ms 级别直接压缩至 2ms 以内。</p>
    `
  },
  {
    id: 4,
    title: 'Vanilla CSS 配合 CSS 变量实现高级的发光阴影与微动画特效',
    slug: 'vanilla-css-glowing-effect-guide',
    summary: '在大厂规范的 UI 设计中，微动画与色彩系统是用户体验的核心。本文教你如何利用纯 Vanilla CSS 结合 HSL 动态调色板，打造极具呼吸感的按钮发光与卡片边缘悬停微动效。',
    coverImageUrl: '/images/mock-cover-3.jpg',
    publishedAt: '2026-06-10T11:45:00Z',
    viewCount: 1280,
    isPinned: false,
    isFeatured: false,
    categoryId: 1,
    categoryName: '前端开发',
    tags: [
      { id: 5, name: 'CSS 魔法' }
    ],
    wordCount: 1510,
    readTime: 5,
    content: `
      <p>在 TailwindCSS 和各类组件库大行其道的今天，许多前端开发者渐渐失去了手写原生 CSS 的能力。然而，在设计极具独创性、要求物理光影拟真的交互界面时，使用原生的 <strong>Vanilla CSS</strong> 配合 CSS 自定义属性（Variables）才能发挥出最极致的性能和设计张力。</p>
      
      <h2 id="toc-0">一、 HSL 色彩空间与阴影发光的物理常识</h2>
      <p>在设计有发光阴影效果的按钮或卡片时，很多人会直接使用硬编码的 RGB 或者十六进制颜色（例如 <code>box-shadow: 0 0 10px #727bba</code>）。这种发光看起来苍白无力，缺乏光影层次。</p>
      <blockquote>
        真正的发光阴影应该是“发散且富有羽化感”的。我们需要多层 box-shadow 相互叠加，且使用 HSL 调节颜色的饱和度和亮度，来模拟现实中的漫反射现象。
      </blockquote>
      
      <h2 id="toc-1">二、 CSS 变量（CSS Custom Properties）的魔力</h2>
      <p>使用 CSS 变量，我们可以将交互状态（Hover、Focus）直接与颜色通道解耦。例如，在 CSS 中定义核心发光色相：</p>
      
      <pre><code class="language-css">
:root {
  --glow-hue: 235;
  --glow-saturation: 35%;
  --glow-lightness: 59%;
  
  /* 基础发光颜色 */
  --color-primary: hsl(var(--glow-hue), var(--glow-saturation), var(--glow-lightness));
}

.glowing-button {
  background: var(--color-primary);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 0 20px hsl(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0.2),
    0 0 40px hsl(var(--glow-hue), var(--glow-saturation), var(--glow-lightness), 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
      </code></pre>
      
      <h2 id="toc-2">三、 悬停下的呼吸发光微动效</h2>
      <p>通过在 <code>:hover</code> 状态下，使用 CSS 微调 <code>--glow-lightness</code> 和 <code>--glow-saturation</code> 变量，我们可以令按钮在鼠标移入时瞬间绽放出温柔的泛光，而不是机械地改变背景色。这能给页面带来极强的生动感与艺术气息。</p>
    `
  },
  {
    id: 5,
    title: '探秘 Transformer 注意力机制：写给前端工程师的 AI 极简通识',
    slug: 'transformer-attention-mechanism-frontend',
    summary: '用最直观的可视化图表与前端开发熟悉的 JavaScript 代码片段，拆解大模型背后的核心 Self-Attention 机制，帮助开发者扫盲 AI 基础认知。',
    coverImageUrl: '',
    publishedAt: '2026-06-08T09:00:00Z',
    viewCount: 420,
    isPinned: false,
    isFeatured: false,
    categoryId: 3,
    categoryName: 'AI与算法',
    tags: [
      { id: 4, name: 'TypeScript' }
    ],
    wordCount: 1840,
    readTime: 6,
    content: `
      <p>作为当今人工智能大模型（如 ChatGPT、Gemini 等）的核心引擎，Transformer 架构及其中的<strong>自注意力机制 (Self-Attention)</strong> 绝对是现代计算机科学中最具智慧的发明之一。对于前端研发人员来说，撕开 AI 的神秘面纱并不需要精通高深的微积分，我们可以用熟悉的 JS / TS 代码去具象化理解它的核心逻辑。</p>
      
      <h2 id="toc-0">一、 为什么要用“注意力”？</h2>
      <p>在传统的序列模型（如 RNN / LSTM）中，计算机阅读一段文字是“挨个字往后读”的。这就带来了一个问题：当一句话非常长时，读到结尾时它就容易把开头的信息遗忘掉。而 Transformer 采用并行化处理，它允许每个词同时“注视”整句话中的所有词，并计算出词与词之间的关联权重。</p>
      
      <h2 id="toc-1">二、 Q、K、V 的直观比喻与矩阵运算</h2>
      <p>自注意力机制最经典的概念莫过于 <strong>Query (查询)</strong>、<strong>Key (键)</strong> 和 <strong>Value (值)</strong>：</p>
      <ul>
        <li><strong>Query</strong>：我想找什么（我的当前特征）。</li>
        <li><strong>Key</strong>：我是谁，有什么特点（用于被匹配）。</li>
        <li><strong>Value</strong>：我的核心实质内容是什么（如果匹配上，要把我身上的这些信息传过去）。</li>
      </ul>
      <p>下面是用 TypeScript 简单还原的自注意力权重计算的逻辑片段：</p>
      
      <pre><code class="language-typescript">
// 伪代码：自注意力计算权重
function computeAttention(queries: number[][], keys: number[][], values: number[][]): number[][] {
  // 1. 点积计算查询与键的相似度得分 (Scores)
  const scores = matMul(queries, transpose(keys));
  
  // 2. 缩放缩小子弹大小，防止梯度消失
  const dk = keys[0].length;
  const scaledScores = scores.map(row => row.map(val => val / Math.sqrt(dk)));
  
  // 3. 经过 Softmax 激活函数进行归一化权重分配
  const weights = softmax(scaledScores);
  
  // 4. 将权重加权赋予真实信息 Value 并求和
  return matMul(weights, values);
}
      </code></pre>
      
      <h2 id="toc-2">三、 多头注意力机制（Multi-Head Attention）带来的多维思考</h2>
      <p>正如人类看一幅画时，可以同时注意它的颜色、构图和故事性，Transformer 通过划分出多个“头”（Heads），每个头独立进行注意力权重分配，从而在一句话里同时捕捉多种句法结构（例如指代关系、主谓宾结构等），达到了惊人的文本理解上限。</p>
    `
  }
]
