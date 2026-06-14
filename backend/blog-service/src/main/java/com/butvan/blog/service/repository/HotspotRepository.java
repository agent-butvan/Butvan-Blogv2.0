package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {
    // Find all hotspots belonging to a scene, ordered by sortOrder
    List<Hotspot> findBySceneIdOrderBySortOrderAsc(Long sceneId);
}
