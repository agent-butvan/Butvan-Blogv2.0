import { NextRequest, NextResponse } from 'next/server'

/**
 * 图像中转代理路由 (基于路径参数 Base64 编码)
 * 
 * 解决在 HTTPS 网页下加载不安全（HTTP）第三方或对象存储（如 MinIO）图片时
 * 浏览器报 Mixed Content 拦截的问题，并完全避开了 Next.js 对本地图片查询参数的安全限制。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  // 适配 Next.js 15+ 中 params 可以是 Promise 的情况
  const resolvedParams = await params;
  const { code } = resolvedParams;

  if (!code) {
    return new NextResponse('Missing image code', { status: 400 })
  }

  let imageUrl = ''
  try {
    // 对 Base64 字符进行还原解码
    imageUrl = decodeURIComponent(Buffer.from(code, 'base64').toString('utf-8'))
  } catch (err) {
    return new NextResponse('Invalid base64 encoding', { status: 400 })
  }

  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return new NextResponse('Invalid URL protocol', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
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
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('[Proxy Image Error]:', error)
    return new NextResponse('Error proxying image', { status: 500 })
  }
}
