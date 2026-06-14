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

/** 裁剪二次校准结果 */
export interface TrimResult {
  /** 裁剪及羽化平滑后的透明 PNG Blob */
  blob: Blob
  /** 相对于原裁剪图的 X 轴偏移量（像素） */
  dx: number
  /** 相对于原裁剪图的 Y 轴偏移量（像素） */
  dy: number
  /** 裁剪后物品的实际宽度（像素） */
  dw: number
  /** 裁剪后物品的实际高度（像素） */
  dh: number
}

/**
 * 扫描并裁剪掉背景移除图（透明 PNG）的多余透明边缘，同时对边缘进行 Alpha 通道平滑（羽化）处理
 *
 * @param imgBlob AI 抠图后带有透明背景的原始 Blob
 * @returns 经过紧贴裁剪和边缘平滑后的图像及其偏移尺寸
 */
export async function trimAndSmoothCutout(imgBlob: Blob): Promise<TrimResult> {
  // 1. 将 Blob 加载为 HTMLImageElement
  const img = await loadImageFromBlob(imgBlob)
  const width = img.width
  const height = img.height

  // 2. 绘制到离屏 Canvas 获取像素数据
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建 Canvas 2D 上下文进行抠图精细化处理')
  }
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  // 3. 扫描像素确定实际物体的边界范围（Alpha 阀值大于 8）
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const alpha = data[idx + 3]
      if (alpha > 8) { // 略过微弱的噪点像素
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // 若图像完全透明，直接返回原图
  if (maxX < minX || maxY < minY) {
    return {
      blob: imgBlob,
      dx: 0,
      dy: 0,
      dw: width,
      dh: height,
    }
  }

  // 计算物体所在的紧贴矩形
  const dx = minX
  const dy = minY
  const dw = maxX - minX + 1
  const dh = maxY - minY + 1

  // 4. 创建紧贴物品尺寸的 Canvas
  const trimmedCanvas = document.createElement('canvas')
  trimmedCanvas.width = dw
  trimmedCanvas.height = dh
  const trimmedCtx = trimmedCanvas.getContext('2d')
  if (!trimmedCtx) {
    throw new Error('无法创建 Trim 离屏 Canvas 上下文')
  }

  // 仅将物体区域绘制过来
  trimmedCtx.drawImage(canvas, dx, dy, dw, dh, 0, 0, dw, dh)

  // 获取裁剪后画布的像素数据进行平滑处理
  const trimmedImageData = trimmedCtx.getImageData(0, 0, dw, dh)
  const tData = trimmedImageData.data

  // 5. 对半透明边缘进行 3x3 盒模糊，使 AI 抠图边缘更平滑羽化
  const alphaCopy = new Uint8ClampedArray(dw * dh)
  for (let i = 0; i < alphaCopy.length; i++) {
    alphaCopy[i] = tData[i * 4 + 3]
  }

  const getAlpha = (x: number, y: number): number => {
    if (x < 0 || x >= dw || y < 0 || y >= dh) return 0
    return alphaCopy[y * dw + x]
  }

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const idx = (y * dw + x) * 4
      const currentAlpha = alphaCopy[y * dw + x]

      // 仅对半透明的边缘像素（羽化带）进行过渡平滑处理
      if (currentAlpha > 0 && currentAlpha < 255) {
        let sum = 0
        let count = 0
        for (let filterY = -1; filterY <= 1; filterY++) {
          for (let filterX = -1; filterX <= 1; filterX++) {
            sum += getAlpha(x + filterX, y + filterY)
            count++
          }
        }
        tData[idx + 3] = Math.round(sum / count)
      }
    }
  }

  trimmedCtx.putImageData(trimmedImageData, 0, 0)

  // 6. 导出为新 PNG Blob
  const trimmedBlob = await new Promise<Blob>((resolve, reject) => {
    trimmedCanvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('裁边 Canvas 导出 Blob 失败'))
    }, 'image/png')
  })

  return {
    blob: trimmedBlob,
    dx,
    dy,
    dw,
    dh,
  }
}

/**
 * 将 Blob 加载为 HTMLImageElement
 */
function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

