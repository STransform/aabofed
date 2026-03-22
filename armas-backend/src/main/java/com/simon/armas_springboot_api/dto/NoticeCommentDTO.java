package com.simon.armas_springboot_api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NoticeCommentDTO {
    private Long id;
    private String content;
    private String authorUsername;
    private String authorDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long likeCount;
    private Long dislikeCount;
    private String currentUserReaction;
    private List<NoticeCommentDTO> replies = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public String getAuthorDisplayName() { return authorDisplayName; }
    public void setAuthorDisplayName(String authorDisplayName) { this.authorDisplayName = authorDisplayName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getLikeCount() { return likeCount; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }
    public Long getDislikeCount() { return dislikeCount; }
    public void setDislikeCount(Long dislikeCount) { this.dislikeCount = dislikeCount; }
    public String getCurrentUserReaction() { return currentUserReaction; }
    public void setCurrentUserReaction(String currentUserReaction) { this.currentUserReaction = currentUserReaction; }
    public List<NoticeCommentDTO> getReplies() { return replies; }
    public void setReplies(List<NoticeCommentDTO> replies) { this.replies = replies; }
}
