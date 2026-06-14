"use client";

/**
 * 全局 Provider 包装器
 * HeroUI v3 基于 React Aria Components，无需全局 Provider
 * 此组件保留作为未来扩展点（如 React Query、主题等）
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
