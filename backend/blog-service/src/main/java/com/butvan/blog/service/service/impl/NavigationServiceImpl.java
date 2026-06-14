package com.butvan.blog.service.service.impl;

import com.butvan.blog.pojo.entity.Navigation;
import com.butvan.blog.pojo.vo.navigation.NavigationVO;
import com.butvan.blog.service.repository.NavigationRepository;
import com.butvan.blog.service.service.NavigationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
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
     * 根据菜单展示位置构筑并获取树状级联导航菜单列表
     *
     * @param position 菜单显示位置
     * @return 组装好的 NavigationVO 树形根列表
     */
    @Override
    public List<NavigationVO> getNavigationTree(String position) {
        log.info("开始获取并构筑展示位置 [{}] 的导航菜单树", position);

        // 1. 查询该位置下所有启用并且可见的扁平菜单列表
        List<Navigation> flatNavs = navigationRepository.findVisibleNavigations(position);
        if (flatNavs == null || flatNavs.isEmpty()) {
            log.info("该展示位置 [{}] 未配置可见菜单，返回空列表", position);
            return new ArrayList<>();
        }

        // 2. 将扁平 Entity 转换为 VO 对象
        List<NavigationVO> voList = flatNavs.stream()
                .map(nav -> NavigationVO.builder()
                        .id(nav.getId())
                        .title(nav.getTitle())
                        .parentId(nav.getParentId())
                        .linkType(nav.getLinkType())
                        .linkTargetId(nav.getLinkTargetId())
                        .linkUrl(nav.getLinkUrl())
                        .icon(nav.getIcon())
                        .position(nav.getPosition())
                        .sortOrder(nav.getSortOrder())
                        .isOpenNewTab(nav.getIsOpenNewTab())
                        .build())
                .collect(Collectors.toList());

        // 3. 构建以 ID 为 Key 的 Map 结构映射以优化层级检索
        Map<Long, NavigationVO> voMap = voList.stream()
                .collect(Collectors.toMap(NavigationVO::getId, vo -> vo));

        // 4. 遍历 VO 树节点归类装配父子级联树状结构
        List<NavigationVO> rootTree = new ArrayList<>();
        for (NavigationVO vo : voList) {
            Long parentId = vo.getParentId();
            if (parentId == null) {
                // 没有父导航，直接视作一级顶级根节点
                rootTree.add(vo);
            } else {
                // 寻找父导航节点并将当前节点挂载到父节点的 children 下
                NavigationVO parentVO = voMap.get(parentId);
                if (parentVO != null) {
                    parentVO.getChildren().add(vo);
                } else {
                    // 如果虽然有 parentId，但父级在该 position 中并不是可见节点或已被过滤，则作为顶级根节点防御展示
                    rootTree.add(vo);
                }
            }
        }

        log.info("导航菜单树组装完毕，顶级根菜单数目: {}", rootTree.size());
        return rootTree;
    }
}
