package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.dto.navigation.NavigationSaveDTO;
import com.butvan.blog.pojo.entity.Navigation;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.repository.NavigationRepository;
import com.butvan.blog.service.service.NavigationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 导航菜单业务逻辑层实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NavigationServiceImpl implements NavigationService {

    private final NavigationRepository navigationRepository;

    /**
     * 根据菜单展示位置构筑并获取树状级联导航菜单列表（仅可见菜单）
     */
    @Override
    public List<NavigationVO> getNavigationTree(String position) {
        List<Navigation> flatNavs = navigationRepository.findVisibleNavigations(position);
        return buildTree(flatNavs);
    }

    /**
     * 根据菜单展示位置获取全部菜单的树状结构（含隐藏项，供管理后台使用）
     */
    @Override
    public List<NavigationVO> getNavigationTreeForAdmin(String position) {
        List<Navigation> flatNavs = navigationRepository.findByPositionOrderBySortOrderAsc(position);
        return buildTree(flatNavs);
    }

    /**
     * 创建新的导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO createNavigation(NavigationSaveDTO dto) {
        log.info("创建新导航菜单项: title={}, position={}, parentId={}", dto.getTitle(), dto.getPosition(), dto.getParentId());

        // 若父级ID有值，验证其存在性
        if (dto.getParentId() != null) {
            navigationRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("指定的父级菜单不存在，ID: " + dto.getParentId()));
        }

        Navigation entity = Navigation.builder()
                .title(dto.getTitle())
                .parentId(dto.getParentId())
                .linkType(dto.getLinkType())
                .linkTargetId(dto.getLinkTargetId())
                .linkUrl(dto.getLinkUrl())
                .icon(dto.getIcon())
                .position(dto.getPosition())
                .sortOrder(dto.getSortOrder())
                .isVisible(dto.getIsVisible())
                .isOpenNewTab(dto.getIsOpenNewTab())
                .build();

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项创建成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 更新指定导航菜单项
     */
    @Override
    @Transactional
    public NavigationVO updateNavigation(Long id, NavigationSaveDTO dto) {
        log.info("更新导航菜单项: id={}, title={}", id, dto.getTitle());

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要更新的菜单项不存在，ID: " + id));

        // 防止将菜单项的父级设为自己，造成循环引用
        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new IllegalArgumentException("菜单项的父级不能是它自己");
        }

        entity.setTitle(dto.getTitle());
        entity.setParentId(dto.getParentId());
        entity.setLinkType(dto.getLinkType());
        entity.setLinkTargetId(dto.getLinkTargetId());
        entity.setLinkUrl(dto.getLinkUrl());
        entity.setIcon(dto.getIcon());
        entity.setPosition(dto.getPosition());
        entity.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : entity.getSortOrder());
        entity.setIsVisible(dto.getIsVisible() != null ? dto.getIsVisible() : entity.getIsVisible());
        entity.setIsOpenNewTab(dto.getIsOpenNewTab() != null ? dto.getIsOpenNewTab() : entity.getIsOpenNewTab());

        Navigation saved = navigationRepository.save(entity);
        log.info("导航菜单项更新成功，ID: {}", saved.getId());
        return entityToVO(saved);
    }

    /**
     * 删除指定导航菜单项并递归清理其所有子孙节点
     */
    @Override
    @Transactional
    public void deleteNavigation(Long id) {
        log.info("删除导航菜单项及其子节点: id={}", id);

        Navigation entity = navigationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("要删除的菜单项不存在，ID: " + id));

        // 递归删除所有子孙节点
        deleteRecursively(entity);

        log.info("导航菜单项及其子孙节点已全部删除，根ID: {}", id);
    }

    /**
     * 递归删除菜单及其所有子菜单
     */
    private void deleteRecursively(Navigation parent) {
        // 查找所有直接子节点
        List<Navigation> children = navigationRepository.findAll().stream()
                .filter(n -> parent.getId().equals(n.getParentId()))
                .collect(Collectors.toList());

        // 先递归删除子节点
        for (Navigation child : children) {
            deleteRecursively(child);
        }

        // 最后删除自身
        navigationRepository.delete(parent);
    }

    // ==================== 内部工具方法 ====================

    /**
     * 将平铺的 Entity 列表构筑成树状 VO 结构
     */
    private List<NavigationVO> buildTree(List<Navigation> flatNavs) {
        if (flatNavs == null || flatNavs.isEmpty()) {
            return new ArrayList<>();
        }

        // 1. 将 Entity 转换为 VO
        List<NavigationVO> voList = flatNavs.stream()
                .map(this::entityToVO)
                .collect(Collectors.toList());

        // 2. 构建 ID → VO 映射
        Map<Long, NavigationVO> voMap = voList.stream()
                .collect(Collectors.toMap(NavigationVO::getId, vo -> vo));

        // 3. 组装树状结构
        List<NavigationVO> rootTree = new ArrayList<>();
        for (NavigationVO vo : voList) {
            Long parentId = vo.getParentId();
            if (parentId == null) {
                rootTree.add(vo);
            } else {
                NavigationVO parentVO = voMap.get(parentId);
                if (parentVO != null) {
                    parentVO.getChildren().add(vo);
                } else {
                    // 父节点缺失时，防御性提升为根节点
                    rootTree.add(vo);
                }
            }
        }

        return rootTree;
    }

    /**
     * 将 Entity 转换为 VO（不含 children）
     */
    private NavigationVO entityToVO(Navigation entity) {
        return NavigationVO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .parentId(entity.getParentId())
                .linkType(entity.getLinkType())
                .linkTargetId(entity.getLinkTargetId())
                .linkUrl(entity.getLinkUrl())
                .icon(entity.getIcon())
                .position(entity.getPosition())
                .sortOrder(entity.getSortOrder())
                .isVisible(entity.getIsVisible())
                .isOpenNewTab(entity.getIsOpenNewTab())
                .build();
    }
}
