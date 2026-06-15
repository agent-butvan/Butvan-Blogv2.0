/**
 * 智能背景移除（AI 抠图）模块
 *
 * 基于 @imgly/background-removal 库，在浏览器端使用 WebAssembly / WebGPU
 * 运行 AI 模型对裁剪出的物品图进行背景移除。
 *
 * ## 使用前提
 *
 * 需要安装依赖：
 * ```bash
 * pnpm add @imgly/background-removal
 * ```
 *
 * 未安装时，`removeImageBackground` 会抛出错误，
 * 调用方（场景编辑器）已有 try/catch 兜底，将回退到矩形裁剪图。
 *
 * 模型文件会从 CDN 动态下载并缓存，首次使用约需 5-15 秒（视网络而定），
 * 建议在编辑器页面挂载时调用 `preloadRemovalModel()` 提前预热。
 */

// ==================== 模型加载状态 ====================

let modelPreloaded = false
let preloadPromise: Promise<void> | null = null

// ==================== 公共 API ====================

/**
 * 预加载智能抠图 AI 模型（后台静默下载，不阻塞 UI）
 *
 * 应在场景编辑器页面挂载时调用（useEffect 空依赖），
 * 这样用户首次框选物品时无需等待模型下载。
 *
 * 重复调用安全——已加载或正在加载时为空操作。
 */
export function preloadRemovalModel(): void {
  // 已加载完成，无需重复
  if (modelPreloaded) return

  // 正在加载中，复用同一个 Promise
  if (preloadPromise) return

  preloadPromise = (async () => {
    try {
      // 动态导入，避免未安装时阻塞模块解析
      const bgRemoval = await import('@imgly/background-removal')
      // 触发模型下载（不实际处理图片，仅预热模型缓存）
      // 用一个 1x1 透明像素初始化模型管道
      const tinyCanvas = document.createElement('canvas')
      tinyCanvas.width = 1
      tinyCanvas.height = 1
      const tinyBlob = await new Promise<Blob>((resolve, reject) =>
        tinyCanvas.toBlob((b) => (b ? resolve(b) : reject()), 'image/png')
      )
      await bgRemoval.removeBackground(tinyBlob)
      modelPreloaded = true
    } catch (err) {
      // 包未安装、网络不通、浏览器不支持等场景静默失败
      // 调用方 removeImageBackground 中也会再次尝试，届时提供降级路径
      console.warn('智能抠图模型预加载失败（可忽略，将使用矩形裁剪图）', err)
    }
  })()
}

/**
 * 移除图片背景，提取主体物品
 *
 * @param blob - 原始图片（通常是框选裁剪的矩形 PNG）
 * @param onProgress - 进度回调（0–1），用于 UI 显示加载状态
 * @returns 包含透明背景的 PNG Blob 及元数据
 * @throws 加载失败或包未安装时抛出，调用方应 catch 降级
 */
export async function removeImageBackground(
  blob: Blob,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob }> {
  // 动态导入：包未安装时 import() 失败，调用方 catch 降级
  const bgRemoval = await import('@imgly/background-removal')

  // 将进度（0–1）转发为百分比整数，方便 UI 展示
  const config: Record<string, unknown> = {
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        onProgress(Math.round((current / total) * 100))
      }
    },
  }

  const resultBlob = await bgRemoval.removeBackground(blob, config)
  return { blob: resultBlob }
}
