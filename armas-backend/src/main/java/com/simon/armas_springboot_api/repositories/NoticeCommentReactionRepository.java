package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.NoticeCommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeCommentReactionRepository extends JpaRepository<NoticeCommentReaction, Long> {
    List<NoticeCommentReaction> findByCommentIdIn(List<Long> commentIds);
    Optional<NoticeCommentReaction> findByCommentIdAndUserId(Long commentId, Long userId);
}
