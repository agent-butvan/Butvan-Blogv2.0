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
import { cn } from "@heroui/react";

interface TrafficTrendChartProps {
  data: Array<{ date: string; pv: number }>;
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
      <div className="h-[148px] w-full flex items-center justify-center bg-zinc-50/20 dark:bg-zinc-900/5 border border-zinc-200/40 dark:border-zinc-800/40 border-dashed rounded-xl select-none">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">正在加载数据统计图表...</span>
        </div>
      </div>
    );
  }

  // 2. 自定义 Tooltip (NextUI Pro 风格悬浮毛玻璃气泡)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const node = payload[0].payload;
      return (
        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 px-3 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-left flex flex-col gap-0.5 min-w-[90px]">
          <span className="text-zinc-400 dark:text-zinc-550 font-mono text-[8px] font-bold tracking-widest uppercase leading-none">
            {node.date}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] animate-pulse" />
            <span className="text-zinc-900 dark:text-zinc-150 text-xs font-mono font-black">
              {node.pv} <span className="text-[9px] font-normal text-zinc-400 font-sans">PV</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-40 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            {/* NextUI 渐变 Area 填充 */}
            <linearGradient id="nextUiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0070F3" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0070F3" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* 极淡的横向参考虚线网格，隐藏纵向网格线 */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-900/50"
          />

          {/* X 轴配置：隐藏轴线 tickLine/axisLine */}
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 9, fontFamily: "monospace" }}
            className="text-zinc-400 dark:text-zinc-550"
            dy={8}
          />

          {/* Y 轴配置：隐藏轴线，刻度居中对齐 */}
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 9, fontFamily: "monospace" }}
            className="text-zinc-400 dark:text-zinc-550"
            dx={-5}
          />

          {/* Tooltip 悬停浮层 */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(0, 112, 243, 0.25)", strokeWidth: 1.5 }}
          />

          {/* NextUI 蓝色折线 Area：平滑插值连接 (type="monotone") */}
          <Area
            type="monotone"
            dataKey="pv"
            stroke="#0070F3"
            strokeWidth={3}
            fill="url(#nextUiGradient)"
            activeDot={{
              r: 6,
              stroke: "#0070F3",
              strokeWidth: 2,
              fill: "#FFFFFF"
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
