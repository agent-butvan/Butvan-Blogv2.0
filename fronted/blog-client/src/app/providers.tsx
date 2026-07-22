'use client'

import React, { useEffect } from 'react'
import { ToastProvider } from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      // 拦截并过滤浏览器原生 View Transitions / Modal 动画在组件卸载或快速切换时抛出的预期 AbortError 与 InvalidStateError
      if (
        reason &&
        (reason.name === 'AbortError' || reason.name === 'InvalidStateError') &&
        typeof reason.message === 'string' &&
        (reason.message.includes('Transition was skipped') ||
         reason.message.includes('Transition was aborted') ||
         reason.message.includes('invalid state'))
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <AuthProvider>
      {children}
      <ToastProvider
        placement="top"
        maxVisibleToasts={3}
      />
    </AuthProvider>
  )
}
