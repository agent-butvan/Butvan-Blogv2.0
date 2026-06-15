"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

/**
 * Portal 组件
 * - 用于将子组件渲染到 document.body 下，脱离父级堆叠上下文（Stacking Context）
 * - 主要解决 fixed 弹窗在局部 z-index 容器中被遮盖、或者背景无法覆盖整屏的问题
 */
export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  // 在组件挂载（Hydration 完成）后更新状态，确保只在客户端进行 Portal 渲染，避免 SSR 报错
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
