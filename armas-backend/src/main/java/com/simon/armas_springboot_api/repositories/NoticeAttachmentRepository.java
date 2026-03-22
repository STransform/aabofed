package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.NoticeAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeAttachmentRepository extends JpaRepository<NoticeAttachment, Long> {
}
