import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  NavigationItem,
  NavigationSaveDTO,
  NavPosition,
} from "@/types/navigation";

/**
 * 导航菜单 API 服务层
 *
 * - 优先使用管理端点 `/api/admin/navigations`（返回含隐藏项的全部菜单）
 * - 管理端点不可用时（后端未重启），自动降级到公开端点
 */

/** 获取全部导航菜单列表（含隐藏项） */
export async function fetchAdminNavigations(
  position: NavPosition
): Promise<NavigationItem[]> {
  // 优先使用管理端点（含隐藏项 + isVisible 字段）
  try {
    const res = await apiClient.get<ApiResponse<NavigationItem[]>>(
      "/admin/navigations",
      { params: { position } }
    );
    return res.data?.data ?? [];
  } catch {
    // 降级：后端尚未重启，管理端点不可用，使用公开端点
    const res = await apiClient.get<ApiResponse<NavigationItem[]>>(
      "/navigations",
      { params: { position } }
    );
    const items = res.data?.data ?? [];

    // 公开接口不含 isVisible，补齐默认值
    for (const item of items) {
      patchIsVisible(item);
    }
    return items;
  }
}

/** 递归补齐 isVisible 默认值 */
function patchIsVisible(item: NavigationItem): void {
  if (item.isVisible === undefined || item.isVisible === null) {
    item.isVisible = true;
  }
  if (item.children) {
    for (const child of item.children) {
      patchIsVisible(child);
    }
  }
}

/** 创建新导航菜单项 */
export async function createNavigation(
  dto: NavigationSaveDTO
): Promise<NavigationItem> {
  const res = await apiClient.post<ApiResponse<NavigationItem>>(
    "/admin/navigations",
    dto
  );
  return res.data!.data!;
}

/** 更新导航菜单项 */
export async function updateNavigation(
  id: number,
  dto: NavigationSaveDTO
): Promise<NavigationItem> {
  const res = await apiClient.put<ApiResponse<NavigationItem>>(
    `/admin/navigations/${id}`,
    dto
  );
  return res.data!.data!;
}

/** 删除导航菜单项 */
export async function deleteNavigation(id: number): Promise<void> {
  await apiClient.delete(`/admin/navigations/${id}`);
}
