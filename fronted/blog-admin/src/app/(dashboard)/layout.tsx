"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { isAuthenticated } from "@/lib/auth";
import { Spinner } from "@heroui/react";

/**
 * Dashboard 路由组布局
 * - 未登录 → 跳转 /login
 * - 已登录 → 渲染管理后台布局壳
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      // 登录页面无需检查
      if (pathname === "/login") {
        setReady(true);
        return;
      }

      // 未登录则跳转登录页
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      setReady(true);
    }, 0);
  }, [pathname, router]);

  // 加载中显示 Spinner
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-light">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
