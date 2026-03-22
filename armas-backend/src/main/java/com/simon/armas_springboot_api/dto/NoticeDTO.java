package com.simon.armas_springboot_api.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class NoticeDTO {
    private Long id;
    private List<String> categories = new ArrayList<>();
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String postedByUsername;
    private String postedByDisplayName;
    private Long viewCount;
    private Long likeCount;
    private Long dislikeCount;
    private String currentUserReaction;
    private List<NoticeAttachmentDTO> attachments = new ArrayList<>();
    private List<NoticeCommentDTO> comments = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getPostedByUsername() { return postedByUsername; }
    public void setPostedByUsername(String postedByUsername) { this.postedByUsername = postedByUsername; }
    public String getPostedByDisplayName() { return postedByDisplayName; }
    public void setPostedByDisplayName(String postedByDisplayName) { this.postedByDisplayName = postedByDisplayName; }
    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
    public Long getLikeCount() { return likeCount; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }
    public Long getDislikeCount() { return dislikeCount; }
    public void setDislikeCount(Long dislikeCount) { this.dislikeCount = dislikeCount; }
    public String getCurrentUserReaction() { return currentUserReaction; }
    public void setCurrentUserReaction(String currentUserReaction) { this.currentUserReaction = currentUserReaction; }
    public List<NoticeAttachmentDTO> getAttachments() { return attachments; }
    public void setAttachments(List<NoticeAttachmentDTO> attachments) { this.attachments = attachments; }
    public List<NoticeCommentDTO> getComments() { return comments; }
    public void setComments(List<NoticeCommentDTO> comments) { this.comments = comments; }
}
