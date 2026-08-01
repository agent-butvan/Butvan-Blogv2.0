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

    const isTransitionAbortError = (reason: any) => {
      if (!reason) return false
      const msg = typeof reason === 'string' ? reason : (reason.message || '')
      const name = reason.name || ''
      const digest = reason.digest || ''
      return (
        name === 'AbortError' ||
        name === 'InvalidStateError' ||
        msg.includes('Transition was skipped') ||
        msg.includes('Transition was aborted') ||
        msg.includes('invalid state') ||
        digest.includes('NEXT_REDIRECT')
      )
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isTransitionAbortError(event.reason)) {
        event.preventDefault()
      }
    }

    const handleError = (event: ErrorEvent) => {
      if (isTransitionAbortError(event.error) || isTransitionAbortError(event.message)) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)
    return () => {
      observer.disconnect()
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
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
