/**
 * 相册页面骨架屏组件
 * 用于加载中状态显示，模拟编辑式网格的占位效果
 */
export function AlbumGridSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* 超大分类水印骨架 */}
      <div className="h-16 w-32 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-8" />

      {/* 非对称网格骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse overflow-hidden ${
              i === 1 ? 'md:col-span-2 md:row-span-2' : ''
            } ${i === 4 ? 'md:col-span-2' : ''}`}
            style={{ aspectRatio: i === 1 ? '16/9' : i % 2 === 0 ? '4/5' : '3/2' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 相册详情页骨架屏
 */
export function AlbumDetailSkeleton() {
  return (
    <div className="w-full">
      {/* 横幅骨架 */}
      <div className="relative w-full h-[40vh] min-h-[320px] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />

      {/* 照片网格骨架 */}
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse overflow-hidden"
              style={{
                aspectRatio: i % 3 === 0 ? '4/5' : i % 3 === 1 ? '3/2' : '1/1',
                animationDelay: `${i * 100}ms`,
                gridColumn: i === 0 ? 'span 2' : undefined,
                gridRow: i === 0 ? 'span 2' : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
