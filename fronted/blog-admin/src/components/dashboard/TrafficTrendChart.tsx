"use client";

import React, { useRef, useState } from "react";
import { cn } from "@heroui/react";

interface TrafficTrendChartProps {
  data: Array<{ date: string; pv: number }>;
  loading?: boolean;
}

export default function TrafficTrendChart({ data = [], loading = false }: TrafficTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 鼠标交互状态
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (loading || data.length === 0) {
    return (
      <div className="h-40 w-full flex items-center justify-center animate-pulse bg-zinc-50/30 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-400 font-mono">加载实时流量数据中...</span>
        </div>
      </div>
    );
  }

  // 1. 查找最大 PV，作为 Y 轴高度分母
  const maxPv = Math.max(...data.map(d => d.pv), 10);
  
  // 2. 映射 600 * 130 SVG 画布下的坐标点 (X: 0~600, Y: 15~115)
  const points = data.map((item, i) => {
    const x = i * 100;
    const y = 115 - (item.pv / maxPv) * 95;
    return { x, y, date: item.date, pv: item.pv };
  });

  // 3. 构建三次贝塞尔平滑连接曲线路径
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + 50;
    const cp1y = curr.y;
    const cp2x = next.x - 50;
    const cp2y = next.y;
    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  const fillPath = `${linePath} L 600 130 L 0 130 Z`;

  // 4. 处理鼠标在容器上移动的感知
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // 鼠标在容器内的相对比例 [0.0, 1.0]
    let percent = (e.clientX - rect.left) / rect.width;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    
    // 计算最近的数据节点索引
    const idx = Math.round(percent * (data.length - 1));
    setHoverIdx(idx);

    // 计算 Tooltip 在页面容器内的相对定位像素
    const targetPoint = points[idx];
    // X 轴百分比映射到实际像素
    const tooltipX = (targetPoint.x / 600) * rect.width;
    // Y 轴百分比映射到实际像素，并网上偏移 35px 避开折线
    const tooltipY = (targetPoint.y / 130) * rect.height - 35;
    
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  // 获取当前 Hover 到的具体节点
  const activeNode = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      {/* 动态 Tooltip 悬浮卡片 (高颜值毛玻璃气泡) */}
      {activeNode && (
        <div
          className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out flex flex-col items-center"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1.5 rounded-lg shadow-xl text-[10px] font-sans font-extrabold flex flex-col gap-0.5 leading-none shrink-0 w-max text-center">
            <span className="text-zinc-400 dark:text-zinc-550 font-mono text-[9px] font-bold uppercase tracking-wider">{activeNode.date}</span>
            <span className="text-primary text-[11px] font-mono font-black mt-0.5">PV: {activeNode.pv}</span>
          </div>
          {/* Tooltip 指向小尖角 */}
          <div className="w-0 h-0 border-[4px] border-transparent border-t-white/85 dark:border-t-zinc-950/85 filter drop-shadow-xs mt-px" />
        </div>
      )}

      {/* 图表容器 */}
      <div
        ref={containerRef}
        className="h-40 w-full relative pt-2 cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox="0 0 600 130" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9B8AFB" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#9B8AFB" stopOpacity="0.01"/>
            </linearGradient>
          </defs>

          {/* 刻度辅助线 */}
          <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />
          <line x1="0" y1="65" x2="600" y2="65" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" className="text-zinc-100 dark:text-zinc-900/40" strokeDasharray="3 3" />

          {/* 走势阴影填充 */}
          <path d={fillPath} fill="url(#trendGradient)" className="transition-all duration-300" />
          
          {/* 走势主曲线 */}
          <path d={linePath} fill="none" stroke="#9B8AFB" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300" />

          {/* 鼠标移动时的虚拟竖直切准线 */}
          {activeNode && (
            <line
              x1={activeNode.x}
              y1="10"
              x2={activeNode.x}
              y2="120"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* 数据圆环点 */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoverIdx === idx ? "5" : "3.5"}
              fill={hoverIdx === idx ? "#9B8AFB" : "var(--chart-dot-fill, #fff)"}
              stroke="#9B8AFB"
              strokeWidth={hoverIdx === idx ? "2.5" : "1.8"}
              className={cn(
                "transition-all duration-150 ease-out cursor-pointer style-dot dark:style-dot-dark",
                hoverIdx === idx ? "filter drop-shadow-md" : ""
              )}
              style={{
                "--chart-dot-fill": hoverIdx === idx ? "#9B8AFB" : "transparent"
              } as React.CSSProperties}
            />
          ))}
        </svg>
      </div>

      {/* 日期底标 */}
      <div className="flex justify-between items-center text-[9px] text-zinc-400 dark:text-zinc-550 font-mono mt-1 px-0.5 select-none">
        <span>{data[0]?.date || "06-09"}</span>
        <span>{data[2]?.date || "06-11"}</span>
        <span>{data[4]?.date || "06-13"}</span>
        <span>今天 ({data[6]?.date || "06-15"})</span>
      </div>
    </div>
  );
}
