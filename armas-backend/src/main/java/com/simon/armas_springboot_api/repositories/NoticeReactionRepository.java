package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.NoticeReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeReactionRepository extends JpaRepository<NoticeReaction, Long> {
    List<NoticeReaction> findByNoticeId(Long noticeId);
    Optional<NoticeReaction> findByNoticeIdAndUserId(Long noticeId, Long userId);
}
