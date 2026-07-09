'use client'

import React from 'react'
import { ToastProvider } from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
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
