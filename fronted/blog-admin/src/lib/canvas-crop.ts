/**
 * Canvas 自动裁剪工具
 *
 * 从背景大图中，按百分比坐标裁剪矩形子区域，产出 PNG Blob，
 * 用于「框选物品 → 自动裁剪上传」工作流。
 */

/** 裁剪结果 */
export interface CropResult {
  /** PNG 格式的 Blob */
  blob: Blob
  /** 裁剪源图像的自然宽度（像素） */
  naturalWidth: number
  /** 裁剪源图像的自然高度（像素） */
  naturalHeight: number
}

/**
 * 从背景图中裁剪指定矩形区域
 *
 * @param bgImageUrl 背景图的完整 URL（需 CORS 可访问）
 * @param xPercent 矩形左边界百分比 (0~100)
 * @param yPercent 矩形上边界百分比 (0~100)
 * @param widthPercent 矩形宽度百分比 (0~100)
 * @param heightPercent 矩形高度百分比 (0~100)
 * @returns 裁剪结果，含 PNG Blob 供上传
 */
export async function cropImageFromBackground(
  bgImageUrl: string,
  xPercent: number,
  yPercent: number,
  widthPercent: number,
  heightPercent: number
): Promise<CropResult> {
  // 1. 加载背景图
  const img = await loadImage(bgImageUrl)

  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight

  // 2. 百分比 → 自然像素坐标
  const sx = Math.round((xPercent / 100) * naturalWidth)
  const sy = Math.round((yPercent / 100) * naturalHeight)
  const sw = Math.round((widthPercent / 100) * naturalWidth)
  const sh = Math.round((heightPercent / 100) * naturalHeight)

  // 3. 边界保护（最小 10px）
  const cropW = Math.max(10, Math.min(sw, naturalWidth - sx))
  const cropH = Math.max(10, Math.min(sh, naturalHeight - sy))

  // 4. 离屏 Canvas 裁剪
  const canvas = document.createElement('canvas')
  canvas.width = cropW
  canvas.height = cropH

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建 Canvas 2D 上下文')
  }

  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, cropW, cropH)

  // 5. 导出为 PNG Blob
  return new Promise<CropResult>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas toBlob 失败，可能是跨域或图片格式问题'))
        return
      }
      resolve({ blob, naturalWidth, naturalHeight })
    }, 'image/png')
  })
}

/**
 * 加载图片并处理跨域
 *
 * @param url 图片完整 URL
 * @returns 加载完成的 HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 设置跨域匿名模式，以防止 Canvas 被「tainted」导致 toBlob 失败
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`背景图加载失败：${url}`))
    img.src = url
  })
}
