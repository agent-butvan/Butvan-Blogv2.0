'use client'

import React from 'react'

/**
 * 流体动画背景
 *
 * 使用多个半透明渐变圆球 + 大模糊 + mix-blend-mode 叠加，
 * 形成流动渐变背景效果。纯 CSS 实现，不依赖 Canvas/WebGL。
 *
 * 3 个 Blob 球体各自以不同速度、不同路径浮动，
 * 产生有机的流体视觉感受。
 */
export default function FluidBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blob 1 — 主色调，慢速大圈 */}
      <div
        className="absolute w-[60vw] h-[60vw] rounded-full opacity-40 blur-3xl mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, #727BBA 0%, #9BADCF 40%, transparent 70%)',
          animation: 'floatBlob1 18s ease-in-out infinite',
          left: '-10%',
          top: '-20%',
        }}
      />

      {/* Blob 2 — 强调色，中速 */}
      <div
        className="absolute w-[50vw] h-[50vw] rounded-full opacity-35 blur-3xl mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 60% 50%, #CDBDE8 0%, #9BADCF 30%, transparent 70%)',
          animation: 'floatBlob2 22s ease-in-out infinite',
          right: '-5%',
          bottom: '-15%',
        }}
      />

      {/* Blob 3 — 暖色点缀，快速 */}
      <div
        className="absolute w-[35vw] h-[35vw] rounded-full opacity-30 blur-3xl mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, #727BBA 0%, #CDBDE8 50%, transparent 70%)',
          animation: 'floatBlob3 14s ease-in-out infinite',
          left: '30%',
          top: '50%',
        }}
      />

      {/* 细微的颗粒噪点纹理覆盖 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
