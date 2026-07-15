"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface TrafficTrendChartProps {
  data: Array<{ date: string; pv: number }>;
  loading?: boolean;
}

export default function TrafficTrendChart({ data = [], loading = false }: TrafficTrendChartProps) {
  if (loading || data.length === 0) {
    return (
      <div className="h-40 w-full flex items-center justify-center animate-pulse bg-zinc-50/20 dark:bg-zinc-900/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-400 font-mono tracking-wider">正在加载数据统计图表...</span>
        </div>
      </div>
    );
  }

  // 自定义高颜值毛玻璃数据悬浮窗 (SaaS 精细排版风格)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const activeNode = payload[0].payload;
      return (
        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 px-2.5 py-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-left flex flex-col gap-0.5 min-w-[90px] outline-none">
          <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[8px] font-bold tracking-widest uppercase">
            {activeNode.date}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse" />
            <span className="text-zinc-900 dark:text-zinc-100 text-xs font-mono font-black">
              {activeNode.pv} <span className="text-[9px] font-normal text-zinc-400 font-sans">PV</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            {/* 渐变面积图颜色 */}
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.00} />
            </linearGradient>
            
            {/* 靛紫色主渐变线，色泽更显生动 */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="50%" stopColor="#6366F1"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
          
          {/* 极淡的横向背景参考格栅 */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="currentColor" 
            className="text-zinc-150/40 dark:text-zinc-900/10" 
          />
          
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            dy={8}
            className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 select-none"
          />
          
          {/* 悬停虚线定位轨 */}
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: "#6366F1", strokeWidth: 1.2, strokeDasharray: "4 4" }} 
          />
          
          <Area
            type="monotone"
            dataKey="pv"
            stroke="url(#lineGrad)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#chartAreaGradient)"
            activeDot={{
              r: 4.5,
              stroke: "#6366F1",
              strokeWidth: 2.2,
              fill: "#FFFFFF"
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
