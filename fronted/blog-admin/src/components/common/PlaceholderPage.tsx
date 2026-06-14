import type { LucideIcon } from "lucide-react";

/**
 * 模块占位组件 — 展示模块名称 + 即将上线提示
 * 用于尚未实现的管理模块页面
 */
export default function PlaceholderPage({
  icon: Icon,
  title,
  description = "该模块正在开发中，即将上线",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Icon size={28} className="text-primary" />
      </div>
      <h1 className="font-heading text-xl font-bold text-neutral-dark mb-2">
        {title}
      </h1>
      <p className="text-sm text-zinc-400 max-w-sm">{description}</p>
    </div>
  );
}
