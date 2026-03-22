package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.NoticeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {
    List<NoticeComment> findByNoticeIdOrderByCreatedAtAsc(Long noticeId);
}
