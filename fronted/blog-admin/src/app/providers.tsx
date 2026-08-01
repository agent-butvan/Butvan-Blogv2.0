"use client";

import React, { useEffect } from "react";
import { ToastContainer } from "@/components/common/Toast";

/**
 * 全局 Provider 包装器
 * HeroUI v3 基于 React Aria Components，无需全局 Provider
 * 此组件保留作为未来扩展点（如 React Query、主题等）
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isTransitionAbortError = (reason: any) => {
      if (!reason) return false;
      const msg = typeof reason === "string" ? reason : (reason.message || "");
      const name = reason.name || "";
      const digest = reason.digest || "";
      return (
        name === "AbortError" ||
        name === "InvalidStateError" ||
        msg.includes("Transition was skipped") ||
        msg.includes("Transition was aborted") ||
        msg.includes("invalid state") ||
        digest.includes("NEXT_REDIRECT")
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isTransitionAbortError(event.reason)) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (isTransitionAbortError(event.error) || isTransitionAbortError(event.message)) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
