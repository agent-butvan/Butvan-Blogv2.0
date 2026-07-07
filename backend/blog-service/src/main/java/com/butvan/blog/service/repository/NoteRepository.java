package com.butvan.blog.service.repository;

import com.butvan.blog.pojo.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

/**
 * 手记数据访问层 Repository
 * 继承 JpaSpecificationExecutor 以支持动态条件分页查询
 */
public interface NoteRepository extends JpaRepository<Note, Long>, JpaSpecificationExecutor<Note> {

    /**
     * 根据 URL 友好标识 slug 查找手记（含已逻辑删除项需通过 @SQLRestriction 自动过滤）
     *
     * @param slug URL 短标识
     * @return 手记实体 Optional
     */
    Optional<Note> findBySlug(String slug);
}
