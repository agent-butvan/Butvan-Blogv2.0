"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface TrafficTrendChartProps {
  data: Array<{ date: string; pv: number; uv: number }>;
  loading?: boolean;
}

export default function TrafficTrendChart({ data = [], loading = false }: TrafficTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Loading 骨架屏占位
  if (loading || data.length === 0 || !mounted) {
    return (
      <div className="h-[176px] w-full flex items-center justify-center bg-zinc-50/20 dark:bg-zinc-900/5 border border-zinc-200/40 dark:border-zinc-800/40 border-dashed rounded-xl select-none">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">正在加载数据统计图表...</span>
        </div>
      </div>
    );
  }

  // 2. 自定义 Tooltip (NextUI Pro 风格悬浮毛玻璃气泡，双指标支持)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const node = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 px-3.5 py-2.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-left flex flex-col gap-1.5 min-w-[120px]">
          <span className="text-zinc-400 dark:text-zinc-550 font-mono text-[8px] font-bold tracking-widest uppercase leading-none border-b border-zinc-100 dark:border-zinc-900 pb-1.5 mb-0.5">
            {node.date}
          </span>
          <div className="flex items-center justify-between gap-4 leading-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] shrink-0" />
              <span className="text-[10px] text-zinc-500 font-medium">访问量 (PV)</span>
            </span>
            <span className="text-zinc-900 dark:text-zinc-150 text-xs font-mono font-black">
              {node.pv}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 leading-none">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7928CA] shrink-0" />
              <span className="text-[10px] text-zinc-500 font-medium">访客数 (UV)</span>
            </span>
            <span className="text-zinc-900 dark:text-zinc-150 text-xs font-mono font-black">
              {node.uv}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-44 select-none flex flex-col justify-between">
      {/* 极简 Legend 图例 */}
      <div className="flex items-center justify-end gap-4 px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0070F3]" />
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">访问量 (PV)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7928CA]" />
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">独立访客 (UV)</span>
        </div>
      </div>
      
      <div className="w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: -25, left: -25, bottom: 0 }}
          >
            <defs>
              {/* NextUI 蓝色渐变 (PV) */}
              <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0070F3" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0070F3" stopOpacity={0.0} />
              </linearGradient>
              {/* NextUI 紫色渐变 (UV) */}
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7928CA" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#7928CA" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* 极淡的横向参考虚线网格 */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-900/50"
            />

            {/* X 轴配置 */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 9, fontFamily: "monospace" }}
              className="text-zinc-400 dark:text-zinc-550"
              dy={8}
            />

            {/* 左侧 Y 轴配置 (PV) */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 9, fontFamily: "monospace" }}
              className="text-zinc-400 dark:text-zinc-550"
              dx={-5}
            />

            {/* 右侧 Y 轴配置 (UV) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 9, fontFamily: "monospace" }}
              className="text-zinc-400 dark:text-zinc-550"
              dx={5}
            />

            {/* Tooltip 悬停浮层 */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(0, 112, 243, 0.15)", strokeWidth: 1.5 }}
            />

            {/* PV 蓝色面积线 (绑定左轴) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="pv"
              stroke="#0070F3"
              strokeWidth={2.5}
              fill="url(#pvGradient)"
              activeDot={{
                r: 5,
                stroke: "#0070F3",
                strokeWidth: 1.5,
                fill: "#FFFFFF"
              }}
            />
            
            {/* UV 紫色面积线 (绑定右轴) */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="uv"
              stroke="#7928CA"
              strokeWidth={2.5}
              fill="url(#uvGradient)"
              activeDot={{
                r: 5,
                stroke: "#7928CA",
                strokeWidth: 1.5,
                fill: "#FFFFFF"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
