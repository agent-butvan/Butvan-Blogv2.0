import { NextRequest, NextResponse } from 'next/server'

/**
 * 图像中转代理路由
 * 
 * 解决在 HTTPS 安全上下文网页下加载不安全（HTTP）第三方或对象存储（如 MinIO）图片时
 * 浏览器报 Mixed Content 拦截的问题，同时避开直接访问 IP 的跨域限制。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // 简单验证，防止任意未授权的恶意代理
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return new NextResponse('Invalid URL protocol', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      // 避免某些内网证书问题导致 fetch 失败（如果后续用到自签 https）
      // @ts-ignore
      rejectUnauthorized: false,
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        // 允许缓存以提升性能
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[Proxy Image Error]:', error)
    return new NextResponse('Error proxying image', { status: 500 })
  }
}
