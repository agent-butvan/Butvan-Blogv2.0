'use client'

import React, { useEffect } from 'react'
import { ToastProvider } from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 强制全站时刻保持明亮模式
    const enforceLight = () => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark')
      }
      if (!document.documentElement.classList.contains('light')) {
        document.documentElement.classList.add('light')
      }
    }
    enforceLight()

    const observer = new MutationObserver(enforceLight)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

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
      observer.disconnect()
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
