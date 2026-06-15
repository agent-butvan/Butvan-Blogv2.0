'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Code2, Palette, Database, Coffee } from 'lucide-react'

/**
 * 技能/兴趣卡片区（首页第二屏）
 *
 * 使用 framer-motion `whileInView` 实现滚动触发动画。
 * 每张卡片带毛玻璃效果 + hover 时上浮。
 */

interface SkillCard {
  icon: React.ElementType
  title: string
  desc: string
}

const SKILLS: SkillCard[] = [
  { icon: Code2, title: '全栈开发', desc: 'TypeScript · React · Next.js · Spring Boot · PostgreSQL' },
  { icon: Palette, title: 'UI/UX 设计', desc: 'Figma · Tailwind CSS · 流体动效 · 沉浸式交互' },
  { icon: Database, title: '系统架构', desc: '微服务 · RESTful API · JWT 鉴权 · 数据建模' },
  { icon: Coffee, title: '开源贡献', desc: 'GitHub 活跃开发者 · 技术博客写作 · 知识分享' },
]

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16"
    >
      <motion.h2
        className="text-xl font-heading font-bold text-zinc-800 dark:text-zinc-100 text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        ✦ 技术栈 & 兴趣 ✦
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SKILLS.map((skill, i) => {
          const Icon = skill.icon
          return (
            <motion.div
              key={skill.title}
              className="group relative p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xs hover:bg-white dark:hover:bg-zinc-900/60 hover:border-primary/40 dark:hover:border-primary/40 shadow-xs hover:shadow-sm transition-all duration-300 cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              {/* 卡片顶部渐变线条 */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <Icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-sm font-heading font-semibold text-zinc-800 dark:text-zinc-100 mb-1.5">
                {skill.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-body">
                {skill.desc}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
