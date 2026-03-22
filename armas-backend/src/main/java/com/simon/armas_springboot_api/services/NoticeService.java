package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.NoticeAttachmentDTO;
import com.simon.armas_springboot_api.dto.NoticeCommentDTO;
import com.simon.armas_springboot_api.dto.NoticeDTO;
import com.simon.armas_springboot_api.models.NoticeCommentReaction;
import com.simon.armas_springboot_api.models.Notice;
import com.simon.armas_springboot_api.models.NoticeAttachment;
import com.simon.armas_springboot_api.models.NoticeCategory;
import com.simon.armas_springboot_api.models.NoticeComment;
import com.simon.armas_springboot_api.models.NoticeReaction;
import com.simon.armas_springboot_api.models.ReactionType;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.NoticeAttachmentRepository;
import com.simon.armas_springboot_api.repositories.NoticeCategoryRepository;
import com.simon.armas_springboot_api.repositories.NoticeCommentReactionRepository;
import com.simon.armas_springboot_api.repositories.NoticeCommentRepository;
import com.simon.armas_springboot_api.repositories.NoticeReactionRepository;
import com.simon.armas_springboot_api.repositories.NoticeRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeCommentRepository noticeCommentRepository;
    private final NoticeAttachmentRepository noticeAttachmentRepository;
    private final NoticeCategoryRepository noticeCategoryRepository;
    private final NoticeReactionRepository noticeReactionRepository;
    private final NoticeCommentReactionRepository noticeCommentReactionRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public NoticeService(
            NoticeRepository noticeRepository,
            NoticeCommentRepository noticeCommentRepository,
            NoticeAttachmentRepository noticeAttachmentRepository,
            NoticeCategoryRepository noticeCategoryRepository,
            NoticeReactionRepository noticeReactionRepository,
            NoticeCommentReactionRepository noticeCommentReactionRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.noticeRepository = noticeRepository;
        this.noticeCommentRepository = noticeCommentRepository;
        this.noticeAttachmentRepository = noticeAttachmentRepository;
        this.noticeCategoryRepository = noticeCategoryRepository;
        this.noticeReactionRepository = noticeReactionRepository;
        this.noticeCommentReactionRepository = noticeCommentReactionRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<NoticeDTO> getPublicNotices() {
        return getPublicNotices(null);
    }

    @Transactional(readOnly = true)
    public List<NoticeDTO> getPublicNotices(String username) {
        return noticeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(notice -> toDto(notice, username))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NoticeDTO> getManageNotices(String username) {
        User actor = getUser(username);
        boolean isAdmin = actor.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getDescription()));

        return noticeRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(notice -> isAdmin || (notice.getPostedBy() != null && Objects.equals(notice.getPostedBy().getId(), actor.getId())))
                .map(notice -> toDto(notice, username))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoticeAttachment getAttachment(Long attachmentId) {
        return noticeAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Notice attachment not found: " + attachmentId));
    }

    public NoticeDTO createNotice(List<String> categories, String title, String description, MultipartFile[] attachments, String username)
            throws IOException {
        User postedBy = getUser(username);
        Notice notice = new Notice();
        notice.setCategories(resolveCategories(categories));
        notice.setTitle(requireText(title, "Title"));
        notice.setDescription(requireText(description, "Description"));
        notice.setPostedBy(postedBy);

        Notice savedNotice = noticeRepository.save(notice);
        storeAttachments(savedNotice, attachments, username);
        return toDto(noticeRepository.save(savedNotice), username);
    }

    public NoticeDTO updateNotice(Long noticeId, List<String> categories, String title, String description,
            MultipartFile[] attachments, String username) throws IOException {
        Notice notice = getNotice(noticeId);
        assertCanManage(notice, username);
        notice.setCategories(resolveCategories(categories));
        notice.setTitle(requireText(title, "Title"));
        notice.setDescription(requireText(description, "Description"));
        notice.setUpdatedAt(LocalDateTime.now());

        storeAttachments(notice, attachments, username);
        return toDto(noticeRepository.save(notice), username);
    }

    public void deleteNotice(Long noticeId, String username) {
        Notice notice = getNotice(noticeId);
        assertCanManage(notice, username);
        noticeRepository.delete(notice);
    }

    public NoticeCommentDTO addComment(Long noticeId, String content, String username) {
        Notice notice = getNotice(noticeId);
        User author = getUser(username);

        NoticeComment comment = new NoticeComment();
        comment.setNotice(notice);
        comment.setAuthor(author);
        comment.setContent(requireText(content, "Comment"));

        NoticeComment savedComment = noticeCommentRepository.save(comment);
        return toCommentDto(savedComment, noticeCommentRepository.findByNoticeIdOrderByCreatedAtAsc(noticeId), username);
    }

    public NoticeCommentDTO addReply(Long parentCommentId, String content, String username) {
        NoticeComment parent = noticeCommentRepository.findById(parentCommentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + parentCommentId));
        User author = getUser(username);

        NoticeComment reply = new NoticeComment();
        reply.setNotice(parent.getNotice());
        reply.setParent(parent);
        reply.setAuthor(author);
        reply.setContent(requireText(content, "Reply"));

        NoticeComment savedReply = noticeCommentRepository.save(reply);
        return toCommentDto(savedReply, noticeCommentRepository.findByNoticeIdOrderByCreatedAtAsc(parent.getNotice().getId()), username);
    }

    public NoticeDTO reactToNotice(Long noticeId, String reactionType, String username) {
        Notice notice = getNotice(noticeId);
        User actor = getUser(username);
        ReactionType targetReaction = parseReactionType(reactionType);

        NoticeReaction existingReaction = noticeReactionRepository.findByNoticeIdAndUserId(noticeId, actor.getId()).orElse(null);
        if (existingReaction != null && existingReaction.getReactionType() == targetReaction) {
            noticeReactionRepository.delete(existingReaction);
        } else {
            if (existingReaction == null) {
                existingReaction = new NoticeReaction();
                existingReaction.setNotice(notice);
                existingReaction.setUser(actor);
            }
            existingReaction.setReactionType(targetReaction);
            existingReaction.setUpdatedAt(LocalDateTime.now());
            noticeReactionRepository.save(existingReaction);
        }

        return toDto(notice, username);
    }

    public NoticeCommentDTO reactToComment(Long commentId, String reactionType, String username) {
        NoticeComment comment = noticeCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));
        User actor = getUser(username);
        ReactionType targetReaction = parseReactionType(reactionType);

        NoticeCommentReaction existingReaction = noticeCommentReactionRepository.findByCommentIdAndUserId(commentId, actor.getId()).orElse(null);
        if (existingReaction != null && existingReaction.getReactionType() == targetReaction) {
            noticeCommentReactionRepository.delete(existingReaction);
        } else {
            if (existingReaction == null) {
                existingReaction = new NoticeCommentReaction();
                existingReaction.setComment(comment);
                existingReaction.setUser(actor);
            }
            existingReaction.setReactionType(targetReaction);
            existingReaction.setUpdatedAt(LocalDateTime.now());
            noticeCommentReactionRepository.save(existingReaction);
        }

        return toCommentDto(comment, noticeCommentRepository.findByNoticeIdOrderByCreatedAtAsc(comment.getNotice().getId()), username);
    }

    public void registerView(Long noticeId) {
        Notice notice = getNotice(noticeId);
        Long currentViews = notice.getViewCount() == null ? 0L : notice.getViewCount();
        notice.setViewCount(currentViews + 1);
        noticeRepository.save(notice);
    }

    private void storeAttachments(Notice notice, MultipartFile[] attachments, String username) throws IOException {
        if (attachments == null || attachments.length == 0) {
            return;
        }

        for (MultipartFile attachment : attachments) {
            if (attachment == null || attachment.isEmpty()) {
                continue;
            }

            NoticeAttachment noticeAttachment = new NoticeAttachment();
            noticeAttachment.setNotice(notice);
            noticeAttachment.setFileName(attachment.getOriginalFilename() != null ? attachment.getOriginalFilename() : "attachment");
            noticeAttachment.setContentType(attachment.getContentType());
            noticeAttachment.setFilePath(fileStorageService.storeNoticeAttachment(attachment, username, notice.getId()));
            notice.getAttachments().add(noticeAttachment);
        }
    }

    private Notice getNotice(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("Notice not found: " + noticeId));
    }

    private User getUser(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        return user;
    }

    private void assertCanManage(Notice notice, String username) {
        User actor = getUser(username);
        boolean isAdmin = actor.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getDescription()));
        boolean isApprover = actor.getRoles().stream().anyMatch(role -> "APPROVER".equals(role.getDescription()));
        boolean isOwner = notice.getPostedBy() != null && Objects.equals(notice.getPostedBy().getId(), actor.getId());

        if (!isAdmin && !(isApprover && isOwner)) {
            throw new IllegalArgumentException("You are not allowed to manage this notice.");
        }
    }

    private String requireText(String value, String fieldName) {
        if (StringUtils.isBlank(value)) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim();
    }

    private List<NoticeCategory> resolveCategories(List<String> categoryNames) {
        if (categoryNames == null || categoryNames.isEmpty()) {
            throw new IllegalArgumentException("At least one category is required");
        }

        List<NoticeCategory> resolved = new ArrayList<>();
        for (String rawName : categoryNames) {
            String normalizedName = requireText(rawName, "Category");
            boolean exists = resolved.stream().anyMatch(item -> item.getName().equalsIgnoreCase(normalizedName));
            if (exists) {
                continue;
            }

            NoticeCategory category = noticeCategoryRepository.findByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> {
                        NoticeCategory newCategory = new NoticeCategory();
                        newCategory.setName(normalizedName);
                        return noticeCategoryRepository.save(newCategory);
                    });
            resolved.add(category);
        }

        return resolved;
    }

    private NoticeDTO toDto(Notice notice, String username) {
        List<NoticeReaction> noticeReactions = noticeReactionRepository.findByNoticeId(notice.getId());
        List<NoticeComment> allComments = noticeCommentRepository.findByNoticeIdOrderByCreatedAtAsc(notice.getId());
        NoticeDTO dto = new NoticeDTO();
        dto.setId(notice.getId());
        dto.setCategories(notice.getCategories().stream()
                .map(NoticeCategory::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList()));
        dto.setTitle(notice.getTitle());
        dto.setDescription(notice.getDescription());
        dto.setCreatedAt(notice.getCreatedAt());
        dto.setUpdatedAt(notice.getUpdatedAt());
        dto.setPostedByUsername(notice.getPostedBy() != null ? notice.getPostedBy().getUsername() : null);
        dto.setPostedByDisplayName(getDisplayName(notice.getPostedBy()));
        dto.setViewCount(notice.getViewCount() == null ? 0L : notice.getViewCount());
        dto.setLikeCount(noticeReactions.stream().filter(reaction -> reaction.getReactionType() == ReactionType.LIKE).count());
        dto.setDislikeCount(noticeReactions.stream().filter(reaction -> reaction.getReactionType() == ReactionType.DISLIKE).count());
        dto.setCurrentUserReaction(resolveCurrentUserNoticeReaction(noticeReactions, username));
        dto.setAttachments(notice.getAttachments().stream()
                .sorted(Comparator.comparing(NoticeAttachment::getUploadedAt))
                .map(this::toAttachmentDto)
                .collect(Collectors.toList()));
        dto.setComments(allComments.stream()
                .filter(comment -> comment.getParent() == null)
                .map(comment -> toCommentDto(comment, allComments, username))
                .collect(Collectors.toList()));
        return dto;
    }

    private NoticeAttachmentDTO toAttachmentDto(NoticeAttachment attachment) {
        NoticeAttachmentDTO dto = new NoticeAttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setContentType(attachment.getContentType());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }

    private NoticeCommentDTO toCommentDto(NoticeComment comment, List<NoticeComment> allComments, String username) {
        List<Long> commentIds = allComments.stream().map(NoticeComment::getId).collect(Collectors.toList());
        List<NoticeCommentReaction> commentReactions = commentIds.isEmpty()
                ? List.of()
                : noticeCommentReactionRepository.findByCommentIdIn(commentIds);
        NoticeCommentDTO dto = new NoticeCommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthorUsername(comment.getAuthor() != null ? comment.getAuthor().getUsername() : null);
        dto.setAuthorDisplayName(getDisplayName(comment.getAuthor()));
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setLikeCount(commentReactions.stream()
                .filter(reaction -> Objects.equals(reaction.getComment().getId(), comment.getId()) && reaction.getReactionType() == ReactionType.LIKE)
                .count());
        dto.setDislikeCount(commentReactions.stream()
                .filter(reaction -> Objects.equals(reaction.getComment().getId(), comment.getId()) && reaction.getReactionType() == ReactionType.DISLIKE)
                .count());
        dto.setCurrentUserReaction(resolveCurrentUserCommentReaction(commentReactions, comment.getId(), username));
        dto.setReplies(allComments.stream()
                .filter(item -> item.getParent() != null && Objects.equals(item.getParent().getId(), comment.getId()))
                .map(item -> toCommentDto(item, allComments, username))
                .collect(Collectors.toList()));
        return dto;
    }

    private ReactionType parseReactionType(String reactionType) {
        try {
            return ReactionType.valueOf(requireText(reactionType, "Reaction type").toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Reaction type must be LIKE or DISLIKE");
        }
    }

    private String resolveCurrentUserNoticeReaction(List<NoticeReaction> reactions, String username) {
        if (StringUtils.isBlank(username)) {
            return null;
        }
        return reactions.stream()
                .filter(reaction -> reaction.getUser() != null && username.equals(reaction.getUser().getUsername()))
                .map(reaction -> reaction.getReactionType().name())
                .findFirst()
                .orElse(null);
    }

    private String resolveCurrentUserCommentReaction(List<NoticeCommentReaction> reactions, Long commentId, String username) {
        if (StringUtils.isBlank(username)) {
            return null;
        }
        return reactions.stream()
                .filter(reaction -> reaction.getUser() != null
                        && reaction.getComment() != null
                        && Objects.equals(reaction.getComment().getId(), commentId)
                        && username.equals(reaction.getUser().getUsername()))
                .map(reaction -> reaction.getReactionType().name())
                .findFirst()
                .orElse(null);
    }

    private String getDisplayName(User user) {
        if (user == null) {
            return "Unknown";
        }
        String firstName = StringUtils.trimToEmpty(user.getFirstName());
        String lastName = StringUtils.trimToEmpty(user.getLastName());
        String combined = (firstName + " " + lastName).trim();
        return combined.isEmpty() ? user.getUsername() : combined;
    }
}
