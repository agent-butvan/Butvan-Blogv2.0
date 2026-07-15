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
      <div className="h-44 w-full flex items-center justify-center animate-pulse bg-zinc-50/20 dark:bg-zinc-900/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">正在加载数据统计图表...</span>
        </div>
      </div>
    );
  }

  // 1. 查找最大 PV，作为 Y 轴高度分母，兜底防止分母为 0
  const maxPv = Math.max(...data.map(d => d.pv), 10);
  
  // 2. 映射 600 * 130 SVG 画布下的坐标点 (X: 0~600, Y: 20~110)
  // 我们给顶部和底部留出更多的呼吸空间（20px ~ 110px）
  const points = data.map((item, i) => {
    const x = i * 100;
    const y = 110 - (item.pv / maxPv) * 85; 
    return { x, y, date: item.date, pv: item.pv };
  });

  // 3. 构建平滑的三次贝塞尔样条连接曲线路径
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
  const fillPath = `${linePath} L 600 135 L 0 135 Z`;

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
    const tooltipX = (targetPoint.x / 600) * rect.width;
    // Y 轴百分比映射到实际像素，并网上偏移 42px 避开折线与高亮点
    const tooltipY = (targetPoint.y / 135) * rect.height - 42;
    
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

  // 获取当前 Hover 到的具体节点
  const activeNode = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      {/* 动态 Tooltip 悬浮卡片 (超高颜值极简毛玻璃卡片) */}
      {activeNode && (
        <div
          className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out flex flex-col items-center"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          {/* 高质感悬浮气泡，采用超细描边与弥散阴影 */}
          <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-left flex flex-col gap-1 min-w-[90px]">
            <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[8px] font-bold tracking-widest uppercase">
              {activeNode.date}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" />
              <span className="text-zinc-900 dark:text-zinc-150 text-xs font-mono font-black">
                {activeNode.pv} <span className="text-[9px] font-normal text-zinc-400 font-sans">PV</span>
              </span>
            </div>
          </div>
          {/* 气泡指向小尖角 */}
          <div className="w-0 h-0 border-[4px] border-transparent border-t-white/90 dark:border-t-zinc-950/90 mt-[-0.5px]" />
        </div>
      )}

      {/* 图表容器 */}
      <div
        ref={containerRef}
        className="h-40 w-full relative select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox="0 0 600 135" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            {/* 折线图下方阴影渐变：从高亮紫色过渡到透明 */}
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="url(#lineGradient)" stopOpacity="0.16"/>
              <stop offset="100%" stopColor="url(#lineGradient)" stopOpacity="0.00"/>
            </linearGradient>
            
            {/* 主折线渐变：从蓝靛色过渡到靛紫色，色彩极其通透现代 */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="50%" stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>

            {/* 垂直参考线渐变 */}
            <linearGradient id="vlineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0"/>
            </linearGradient>

            {/* 折线外发光阴影滤镜，产生微弱的立体发光质感 */}
            <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.25"/>
            </filter>
          </defs>

          {/* 极其轻微、克制的背景网格横线，融入背景中不显生硬 */}
          <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-zinc-100/50 dark:text-zinc-900/20" strokeWidth="1" />
          <line x1="0" y1="65" x2="600" y2="65" stroke="currentColor" className="text-zinc-100/50 dark:text-zinc-900/20" strokeWidth="1" />
          <line x1="0" y1="110" x2="600" y2="110" stroke="currentColor" className="text-zinc-100/50 dark:text-zinc-900/20" strokeWidth="1" />

          {/* 渐变面积填充层 */}
          <path d={fillPath} fill="url(#trendGradient)" />
          
          {/* 主折线：使用双色渐变与立体外发光滤镜 */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            filter="url(#lineGlow)"
          />

          {/* 鼠标移入时的垂直导向线：采用渐变淡出，极富科技质感 */}
          {activeNode && (
            <line
              x1={activeNode.x}
              y1="10"
              x2={activeNode.x}
              y2="135"
              stroke="url(#vlineGradient)"
              strokeWidth="1.2"
            />
          )}

          {/* 数据高亮点：平时不渲染，只在 Hover 对应的 X 轴区间时，在折线上弹现高级的双层同心圆高亮点 */}
          {points.map((pt, idx) => {
            const isActive = hoverIdx === idx;
            if (!isActive) return null;
            return (
              <g key={idx}>
                {/* 最外层：大范围柔和光晕圈 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="#6366F1"
                  fillOpacity="0.18"
                  className="animate-ping"
                />
                {/* 第二层：主色扩散外环 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6.5"
                  fill="#6366F1"
                  fillOpacity="0.3"
                />
                {/* 第三层：主色高亮环 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#6366F1"
                />
                {/* 最内层：实体白色焦点小点 */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2.2"
                  fill="#FFFFFF"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 日期底标 */}
      <div className="flex justify-between items-center text-[9px] text-zinc-400 dark:text-zinc-550 font-mono mt-1 px-0.5 select-none">
        <span>{data[0]?.date || "06-09"}</span>
        <span>{data[2]?.date || "06-11"}</span>
        <span>{data[4]?.date || "06-13"}</span>
        <span className="text-zinc-500 font-bold">今天 ({data[6]?.date || "06-15"})</span>
      </div>
    </div>
  );
}
