package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SceneRepository extends JpaRepository<Scene, Long> {
    // Find the current active scene
    Optional<Scene> findByIsActiveTrue();
}
