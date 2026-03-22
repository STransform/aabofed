package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.NoticeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NoticeCategoryRepository extends JpaRepository<NoticeCategory, Long> {
    Optional<NoticeCategory> findByNameIgnoreCase(String name);
}
