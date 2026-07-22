'use client'

import React from 'react'
import type { ProfileVO } from '@/types/profile'
import Footer from '@/components/common/Footer'

/**
 * 首页底部页脚 (重构包装兼容 Footer)
 */
export default function FeaturesSection({ profile }: { profile?: ProfileVO | null }) {
  return <Footer />
}
