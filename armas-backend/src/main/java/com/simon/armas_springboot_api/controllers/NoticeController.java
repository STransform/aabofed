package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.dto.NoticeCommentDTO;
import com.simon.armas_springboot_api.dto.NoticeCommentRequest;
import com.simon.armas_springboot_api.dto.NoticeDTO;
import com.simon.armas_springboot_api.dto.NoticeReactionRequest;
import com.simon.armas_springboot_api.models.NoticeAttachment;
import com.simon.armas_springboot_api.services.NoticeService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notices")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" }, methods = { RequestMethod.GET,
        RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
        RequestMethod.OPTIONS }, allowedHeaders = { "Authorization", "Content-Type", "*" }, allowCredentials = "true")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping("/public")
    public ResponseEntity<List<NoticeDTO>> getPublicNotices(Principal principal) {
        return ResponseEntity.ok(noticeService.getPublicNotices(principal != null ? principal.getName() : null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('APPROVER','ADMIN')")
    public ResponseEntity<List<NoticeDTO>> getManageNotices(Principal principal) {
        return ResponseEntity.ok(noticeService.getManageNotices(principal.getName()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<?> createNotice(
            @RequestParam List<String> categories,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments,
            Principal principal) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(noticeService.createNotice(categories, title, description, attachments, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{noticeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('APPROVER','ADMIN')")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long noticeId,
            @RequestParam List<String> categories,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments,
            Principal principal) {
        try {
            return ResponseEntity.ok(noticeService.updateNotice(noticeId, categories, title, description, attachments, principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{noticeId}")
    @PreAuthorize("hasAnyRole('APPROVER','ADMIN')")
    public ResponseEntity<?> deleteNotice(@PathVariable Long noticeId, Principal principal) {
        try {
            noticeService.deleteNotice(noticeId, principal.getName());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{noticeId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addComment(@PathVariable Long noticeId, @RequestBody NoticeCommentRequest request, Principal principal) {
        try {
            NoticeCommentDTO comment = noticeService.addComment(noticeId, request.getContent(), principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/replies")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addReply(@PathVariable Long commentId, @RequestBody NoticeCommentRequest request, Principal principal) {
        try {
            NoticeCommentDTO reply = noticeService.addReply(commentId, request.getContent(), principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(reply);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{noticeId}/reactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reactToNotice(@PathVariable Long noticeId, @RequestBody NoticeReactionRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(noticeService.reactToNotice(noticeId, request.getReactionType(), principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/comments/{commentId}/reactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> reactToComment(@PathVariable Long commentId, @RequestBody NoticeReactionRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(noticeService.reactToComment(commentId, request.getReactionType(), principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{noticeId}/view")
    public ResponseEntity<?> registerView(@PathVariable Long noticeId) {
        try {
            noticeService.registerView(noticeId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attachments/{attachmentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) throws IOException {
        NoticeAttachment attachment = noticeService.getAttachment(attachmentId);
        Path path = Paths.get(attachment.getFilePath());
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(path.toUri());
        String contentType = attachment.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = Files.probeContentType(path);
        }
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }
}
